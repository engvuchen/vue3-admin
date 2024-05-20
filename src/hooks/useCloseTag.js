import { useTags } from '@/pinia/modules/tags';
import { getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// 关闭当前标签
export default () => {
  const router = useRouter();
  const route = useRoute();
  const { delTag } = useTags();
  const instance = getCurrentInstance();

  /**
   * @param {String} fullPath 要跳转到那个页面的地址
   * @param {Boolean} reload 是否在跳转后重新渲染页面组件
   * @param {Boolean} f5 是否在跳转后刷新页面
   * @return {*}
   */
  function closeTag({ fullPath, reload, f5 } = {}) {
    delTag(route);

    fullPath ? router.push(fullPath) : router.back();

    if (reload) {
      setTimeout(() => {
        // const instance = getCurrentInstance(); // 不在外层获取，则为 null
        let refreshSelectedTag = instance.appContext.config.globalProperties?.$refreshSelectedTag;
        refreshSelectedTag.value(); // route 是 /test（列表），但 refreshSelectedTag 其实是 Add（新增） 上的
      }, 500);
    }
    if (f5) {
      setTimeout(() => window.location.reload(), 500);
    }
  }

  return { closeTag };
};
