import { watch, computed, nextTick, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
// import { storeToRefs } from 'pinia';
import { useTags as useTagsbar } from '@/pinia/modules/tags';
import { useScrollbar } from './useScrollbar';

// 标签固定，没有删除 icon。tag 和 route 差不多
export const isAffix = (tag) => {
  return tag?.meta?.affix;
};

export const useTags = (scrollContainer) => {
  const router = useRouter();
  const route = router.currentRoute;
  const routes = computed(() => router.getRoutes());

  const tagStore = useTagsbar();
  let tagList = tagStore.tagList; // pinia 的导出本身是响应式，不需要 `.value` 访问
  const { addTag, delTag, saveActivePosition } = tagStore;

  let tagsItem = []; // 获取 router-link 的 DOM 节点，方便 el-scroll 组件定位
  const scrollbar = useScrollbar(tagsItem, scrollContainer); // { handleScroll, moveToTarget }

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
  const addTagList = () => {
    const tag = route.value;
    // 关联 keep-alive 判断： cacheList 里面是 tag（类似路由项），而 keep-alive 是根据组件的 name 判断；要求 路由项的 name 、组件的 name 相同
    if (tag.name) addTag(tag);
  };
  const saveTagPosition = (tag) => {
    const index = tagList.findIndex((item) => item.fullPath === tag.fullPath);
    saveActivePosition(Math.max(0, index));
  };
  const moveToCurrentTag = () => {
    nextTick(() => {
      // to 是此 router-link 使用的路由对象 { fullPath, meta, name, path, title }
      let found = tagsItem.find((item) => item?.to?.path === route.value.path);
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
    addTagList();
    moveToCurrentTag();
  });
  // 路由变化，saveTagPosition、addTagList（自定义对象加入到 tagList）、moveToCurrentTag
  watch(route, (newRoute, oldRoute) => {
    saveTagPosition(oldRoute); // 保存标签的位置
    addTagList();
    moveToCurrentTag();
  });

  watch(
    () => tagList.length,
    () => {
      tagsItem = []; // tagList.length 变化就清空，因为 setItemRef 只有索引替换，方便管理
    },
  );

  // router-link 的 ref
  const setItemRef = (i, el) => {
    // el 是对 router-link 的 ref 引用 { activeClass, ariaCurrentValue, custom, exactActiveClass, replace, to }
    tagsItem[i] = el;
  };

  // tagList, setItemRef, handleScroll, moveToTarget
  return {
    tagList, // pinia 导进来，再导出，没问题；但导入不能解构
    setItemRef,
    isAffix,
    ...scrollbar,
  };
};
