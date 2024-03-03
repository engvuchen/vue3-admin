import { useAccount } from '@/pinia/modules/account';
import { TOKEN, useApp } from '@/pinia/modules/app';
import { useMenus } from '@/pinia/modules/menu';
import router from '@/router';
import { ElLoading } from 'element-plus';
import { nextTick } from 'vue';

let loadingInstance = null;
const whiteList = ['login']; // 白名单，里面是路由对象的name

const getPageTitle = (title = '') => {
  const { title: appTitle } = useApp();
  if (title) return `${title} - ${appTitle}`;
  return appTitle;
};

// 全局路由控制行为

/**
 * vue-router4 的路由守卫不再是通过 next 放行，而是通过 return 返回 true 或 false 或者一个路由地址
 * 导航前，获取用户信息，可以获取，继续导航，否则让用户重新登陆。
 */
router.beforeEach(async (to, from) => {
  loadingInstance = ElLoading.service({
    lock: true,
    // text: '正在加载数据，请稍候~',
    background: 'rgba(0, 0, 0, 0.7)',
  });

  if (whiteList.includes(to.name)) return true;

  // 没有 token，跳转 login 页，让用户重新登陆
  if (!window.localStorage[TOKEN]) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath, // redirect 是指登录之后可以跳回到 redirect 指定的页面
      },
      replace: true,
    };
  }

  // 获取用户角色信息，根据角色判断权限。 - todo 是获取当前用户的所有资源路径，不是用户是否有身份
  const { userinfo, getUserinfo } = useAccount();

  if (!userinfo) {
    let res = await getUserinfo(); // 获取用户信息
    if (!res) {
      loadingInstance.close();
      return false;
    }

    return to.fullPath;
  }

  // login 成功 -> menus 没有生成过，动态生成路由
  const { menus, generateMenus } = useMenus(); // todo
  if (!menus.length) {
    try {
      await generateMenus();
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
  if (router.currentRoute.value.name === to.name) {
    nextTick(() => {
      document.title = getPageTitle(to.meta && to.meta.truetitle);
    });
  }
});
