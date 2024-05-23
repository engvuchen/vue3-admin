import { watch, computed, nextTick, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useTags as useTagsbar } from '@/pinia/modules/tags';
import { useScrollbar } from './useScrollbar';

// 标签固定，没有删除 icon。tag 和 route 差不多
export const isAffix = (tag) => {
  return tag?.meta?.affix;
};

export const useBusinessTags = (scrollContainer) => {
  const router = useRouter();
  const route = router.currentRoute;
  const routes = computed(() => router.getRoutes());

  const tagStore = useTagsbar();
  let tagList = tagStore.tagList; // pinia 的导出本身是响应式，不需要 `.value` 访问
  const { addTag, delTag, saveActivePosition } = tagStore;

  let tagItems = []; // 获取 router-link 的 DOM 节点，方便 el-scroll 组件定位
  const scrollbar = useScrollbar(tagItems, scrollContainer); // { handleScroll, moveToTarget }

  // 添加固定标签、删除不在路由配置中的标签 - 失效标签
  const initTags = () => {
    // 添加固定标签
    routes.value.forEach((route) => {
      if (route.name && route?.meta?.affix) {
        addTag(route);
      }
    });
    // 删除不在路由配置中的标签 - 失效标签
    const noUseTags = tagList.filter((tag) => routes.value.every((route) => route.name !== tag.name));
    noUseTags.forEach((tag) => {
      delTag(tag);
    });
  };
  /** 将当前路由加入到标签 */
  const addToTagList = () => {
    const tag = route.value;
    // 关联 keep-alive 判断： cacheList 里面是 tag（类似路由项），而 keep-alive 是根据组件的 name 判断；要求 路由项的 name 、组件的 name 相同
    if (tag.name) addTag(tag); // 路由没有 name，标签不显示
  };
  /** 保存激活标签的索引 */
  const saveTagPosition = (tag) => {
    const index = tagList.findIndex((item) => item.fullPath === tag.fullPath);
    saveActivePosition(Math.max(0, index));
  };
  const moveToCurrentTag = () => {
    nextTick(() => {
      // to 是此 router-link 使用的路由对象 { fullPath, meta, name, path, title }
      let found = tagItems.find((item) => item?.to?.path === route.value.path);
      if (!found) return;

      scrollbar.moveToTarget(found);

      // path 相等，fullPath 不等，没有实际遇到
      // if (item.to.fullPath !== route.value.fullPath) {
      //   updateTagList(route.value);
      // }
    });
  };
  onBeforeMount(() => {
    initTags();
    addToTagList();
    moveToCurrentTag();
  });
  // 路由变化，保存激活标签索引、route 加入到 tagList、滚动轴尝试滚动到新标签
  watch(route, (newRoute, oldRoute) => {
    saveTagPosition(oldRoute);
    addToTagList();
    moveToCurrentTag();
  });
  // 标签变化，清空 tagItems，方便管理
  watch(
    () => tagList.length,
    () => {
      tagItems = []; // tagList.length 变化就清空，因为 setItemRef 只有索引替换，方便管理
    },
  );

  // router-link 的 ref
  const setItemRef = (i, el) => {
    console.log('🔎 ~ setItemRef ~ el:', el);
    // el 是对 router-link 的 ref 引用 { activeClass, ariaCurrentValue, custom, exactActiveClass, replace, to }

    tagItems[i] = el;
  };
  // tagList, setItemRef, handleScroll, moveToTarget
  return {
    tagList,
    setItemRef,
    isAffix,
    ...scrollbar,
  };
};
