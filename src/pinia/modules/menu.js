import router from '@/router';
import { ref } from 'vue';
import { defineStore } from 'pinia';
// import errmap from '@/common/errcode';
import { fixedRoutes, asyncRoutes } from '@/router';
import { apiGetSelfResource } from '@/api/resource';
// import { flattenTree } from '@/utils';

export const useMenus = defineStore('menu', () => {
  /**
   * todo 支持判断相对路由。父路由是 /user, 子路由是 list，子路由完整路径是 /user/list
   * 递归遍历项目载入的所有路由，匹配远程的 path 列表，匹配上的才被收集
   * @param {Array} targetRoutes [ { path, name, children } ]
   * @param {Array} ajaxRoutes [ 'path1', 'path2' ] 接口配置的路径
   * @param {Array} filterRoutes
   * @returns [routeObj, ...]
   */
  const getFilterRoutes = (targetRoutes = [], ajaxRoutes = [], filterRoutes = []) => {
    targetRoutes.forEach((curr) => {
      // 用 startsWith 匹配。精准匹配，要求父目录都要配，当子路由嵌套过多，往往很麻烦
      if (ajaxRoutes.find((item) => item.startsWith(curr.path))) {
        let { children = [], ...rest } = curr;
        filterRoutes.push(rest);

        if (children.length) {
          rest.children = getFilterRoutes(children, ajaxRoutes);
        }
      }
    });

    return filterRoutes;

    // ajaxRoutes.forEach((item) => {
    //   const target = targetRoutes.find((target) => target.name === item.name);

    //   if (target) {
    //     const { children: targetChildren, ...rest } = target;
    //     const route = {
    //       ...rest,
    //     };

    //     if (item.children) {
    //       route.children = getFilterRoutes(targetChildren, item.children);
    //     }

    //     filterRoutes.push(route);
    //   }
    // });
  };
  const generateUrl = (path = '', parentPath = '') => {
    if (path.startsWith('/')) return path;
    if (path) return `${parentPath}/${path}`;
    return parentPath;
  };
  const getFilterMenus = (arr, parentPath = '') => {
    const menus = [];

    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];

      let { path = '', meta: { title = '' } = {}, icon = '', hidden, children = [] } = item;

      if (hidden || !title) continue;

      const menu = {
        url: generateUrl(path, parentPath),
        title,
        icon,
      };

      if (children?.length) {
        // 特殊处理：若只有一个不隐藏的子项目，生成 url 不隐藏，认为这个子项目的 path 应该和父路由合并
        if (item.children.filter((child) => !child.hidden).length <= 1) {
          menu.url = generateUrl(item.children[0].path, menu.url); // ？？？ 就算他是 level1/level2 格式的路由，children 不要了？
        } else {
          menu.children = getFilterMenus(item.children, menu.url);
        }
      }

      menus.push(menu);
    }

    return menus;
  };

  const menus = ref([]);
  const setMenus = (data) => {
    menus.value = data;
  };
  const generateMenus = async () => {
    // // 方式一：只有固定菜单
    // const menus = getFilterMenus(fixedRoutes)
    // commit('SET_MENUS', menus)

    // 方式二：有动态菜单
    //  [{ id: '', name: '', resource: [ { id: '', name: '', access: [], cgi: [] } ], ... }, ...]
    const { code, data } = await apiGetSelfResource(); // todo 从接口获取当前用户的权限
    if (code !== 0) return;

    // 添加路由之前先删除所有动态路由。todo 需要 name，adm 方案只是隐藏
    asyncRoutes.forEach((item) => {
      router.removeRoute(item.name);
    });
    // 过滤出需要添加的动态路由

    let remoteResource = Array.from(
      new Set(
        data.list[0].resource.reduce((list, curr) => {
          list.push(...curr.access);
          return list;
        }, []),
      ),
    );
    const filterRoutes = getFilterRoutes(asyncRoutes, remoteResource);

    filterRoutes.forEach((route) => router.addRoute(route));
    console.log('🔎 ~ generateMenus ~ filterRoutes:', filterRoutes);

    // 生成菜单
    const menus = getFilterMenus([...fixedRoutes, ...filterRoutes]);

    setMenus(menus);
  };

  return {
    menus,
    setMenus,
    generateMenus,
  };
});
