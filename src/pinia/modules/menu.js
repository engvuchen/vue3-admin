import router from '@/router';
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { fixedRoutes, asyncRoutes } from '@/router';
import { apiGetSelfResource } from '@/api/resource';

export const useMenus = defineStore('menu', () => {
  /**
   * 递归遍历项目载入的所有路由，匹配远程的 path 列表，匹配上的才被收集
   *
   * path = '' 的处理：
   * 1. 值在子路由。配置 `/user`，父路由 `/user`，子路由 `path=''`。`/user` 父路由匹配成功，子路由空串也能匹配成功。
   * 2. 值在父路由。也能匹配成功，但这个路由没有什么作用。
   *
   * @param {Array} targetRoutes [ { path, name, children } ]
   * @param {Array} ajaxRoutes [ 'path1', 'path2' ] 管理端配置的路径
   * @param {Array} result
   * @returns {Array} [routeObj, ...]
   */
  const getAccessibleRoutes = (targetRoutes = [], ajaxRoutes = [], result = []) => {
    targetRoutes.forEach((curr) => {
      // 找不到 相等 或 父集 => 不相等 或 不是父集。
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
      let { path = '', meta: { title = '' } = {}, icon = '', hidden, children = [] } = routes[i];
      if (hidden || !title) continue;

      const menu = {
        url: path,
        title,
        icon,
        // children: [], // children 存在，即被解析为存在嵌套，干扰正常解析
      };
      if (children?.length) {
        menu.children = transformRouteToMenuItem(children, menu.url);
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

    // 添加路由前，先删除所有动态路由。需要 name 删除, adm 方案只是隐藏，路径输入正确即可打开页面
    asyncRoutes.forEach((item) => router.removeRoute(item.name));

    paddingFullPath([...fixedRoutes, ...asyncRoutes]); // 补全路由 path

    // 获取远程路由、cgi
    let resources = [];
    let cgis = [];
    data.list[0].resource.forEach((curr) => {
      resources.push(...curr.access);
      cgis.push(...curr.cgi);
    });
    let remoteResources = Array.from(new Set(resources));
    let remoteCgis = Array.from(new Set(cgis));

    const accessibleRoutes = getAccessibleRoutes(asyncRoutes, remoteResources);
    accessibleRoutes.forEach((route) => router.addRoute(route));

    const menus = transformRouteToMenuItem([...fixedRoutes, ...accessibleRoutes]);

    setMenus(menus);
    setCgis(remoteCgis);
  };

  return {
    menus,
    cgis,
    setMenus,
    generateMenusAndCgis,
  };
});
