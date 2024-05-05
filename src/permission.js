import { useAccount } from '@/pinia/modules/account';
import { TOKEN, useApp } from '@/pinia/modules/app';
import { useMenus } from '@/pinia/modules/menu';
import router from '@/router';
import { ElLoading } from 'element-plus';
import { nextTick } from 'vue';

let loadingInstance = null;
const routeWhiteList = ['login']; // 白名单，里面是路由对象的name

const getPageTitle = (title = '') => {
  const { title: appTitle } = useApp();
  if (title) return `${title} - ${appTitle}`;
  return appTitle;
};

/**
 * 全局路由守卫
 * vue-router4 的路由守卫不再是通过 next 放行，而是通过 return 返回 true 或 false 或者一个路由地址
 * 导航前，获取用户信息，可以获取，继续导航，否则让用户重新登陆。
 */
router.beforeEach(async (to, from) => {
  loadingInstance = ElLoading.service({
    lock: true,
    text: '加载数据中，请稍候~',
    background: 'rgba(0, 0, 0, 0.7)',
  });

  if (routeWhiteList.includes(to.name)) return true;

  // # 没有 token，跳转 login 页，让用户重新登陆
  if (!window.localStorage[TOKEN]) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath, // 登录之后，可以跳回到 redirect 指定的页面
      },
      replace: true,
    };
  }

  // # 尝试获取用户信息。若 token 校验返回到登陆页
  const userinfo = await useAccount().getUserInfo();
  if (!userinfo) {
    loadingInstance.close();
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
      replace: true,
    }; // token 验证失败，返回到登陆页
  }

  // login 成功，重新生成 menus
  const { menus, generateMenusAndCgis } = useMenus();
  if (!menus.length) {
    try {
      await generateMenusAndCgis();
      return to.fullPath; // 添加动态路由后，必须加这一句触发重定向，否则会404
    } catch (err) {
      console.log('err', err);
      loadingInstance.close();
      return false;
    }
  }

  return true;
});

router.afterEach((to) => {
  loadingInstance.close();
  nextTick(() => {
    document.title = getPageTitle(to.meta && to.meta.truetitle); // truetitle 是翻译之后的标题
  });
});
