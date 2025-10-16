import router from '@/router';
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { fixedRoutes, asyncRoutes } from '@/router';
import { apiGetSelfResource } from '@/api/resource';

export const useMenus = defineStore('menu', () => {
  /**
   * 递归遍历项目载入的所有路由，匹配远程的 path 列表，匹配上的才被收集
   *
   * @param {Array} targetRoutes [ { path, name, children } ]
   * @param {Array} ajaxRoutes [ 'path1', 'path2' ] 管理端配置的路径
   * @param {Array} result
   * @returns {Array} [routeObj, ...]
   */
  const getAccessibleRoutes = (targetRoutes = [], ajaxRoutes = [], result = []) => {
    targetRoutes.forEach((curr) => {
      /**
       * 通过的情况：
       * 1. 远程路径 匹配自身
       * 2. 远程路径的 父级路径
       *
       * 是为了方便配置的，例如：远程仅有 /test/add
       * /test、/test/add 都能被添加到新路由
       */
      if (!ajaxRoutes.find((item) => item.startsWith(curr.path))) return;

      let { children = [], ...rest } = curr;
      result.push(rest);

      if (!children?.length) return;
      rest.children = getAccessibleRoutes(children, ajaxRoutes);
    });

    return result;
  };
  const transformRouteToMenuItem = (routes) => {
    const menus = [];

    for (let i = 0; i < routes.length; i++) {
      let { path = '', icon = '', hide, meta: { title = '' } = {}, children = [] } = routes[i];
      if (hide) continue;

      const menu = {
        url: path,
        title,
        icon,
        // children: [], // children 存在，即被解析为存在嵌套，干扰正常解析
      };
      if (children?.length) {
        menu.children = transformRouteToMenuItem(children);
      }

      menus.push(menu);
    }

    return menus;
  };
  // 获取完整路由 path
  const getFullPath = (path = '', parentPath = '') => {
    if (path.startsWith('/')) return path;
    if (path) return `${parentPath}/${path}`;
    return parentPath;
  };
  const paddingFullPath = (routes, parentPath) => {
    for (let i = 0; i < routes.length; i++) {
      let { path, children = [] } = routes[i];
      routes[i].path = getFullPath(path, parentPath);

      if (children?.length) paddingFullPath(children, routes[i].path);
    }
  };

  const menus = ref([]);
  const cgis = ref([]);
  const setMenus = (data) => {
    menus.value = data;
  };
  const setCgis = (data) => {
    cgis.value = data;
  };

  // 生成动态菜单
  const generateMenusAndCgis = async () => {
    //  [{ id: '', name: '', resource: [ { id: '', name: '', access: [], cgi: [] } ], ... }, ...]
    const { code, data } = await apiGetSelfResource(); // 从接口获取当前用户的权限
    if (code !== 0) return;

    // 补全子路由 path。父路由 path='/user'，子路由 path='list'，子路由补全为 /user/list
    paddingFullPath([...fixedRoutes, ...asyncRoutes]);

    // 获取远程路由、cgi
    let resources = [];
    let cgis = [];
    if (data.list && data.list.length > 0) {
      data.list[0].resource.forEach((curr) => {
        resources.push(...curr.access);
        cgis.push(...curr.cgi);
      });
    }
    let remoteResources = Array.from(new Set(resources));
    let remoteCgis = Array.from(new Set(cgis));

    const accessibleRoutes = getAccessibleRoutes(asyncRoutes, remoteResources); // remoteResources ['/user/resource', '/user/list']
    accessibleRoutes.forEach((route) => router.addRoute(route));

    console.log('accessibleRoutes', accessibleRoutes);

    const menus = transformRouteToMenuItem([...fixedRoutes, ...accessibleRoutes]);

    setMenus(menus);
    setCgis(remoteCgis);
  };

  return {
    menus,
    cgis,
    setMenus,
    setCgis,
    generateMenusAndCgis,
  };
});
