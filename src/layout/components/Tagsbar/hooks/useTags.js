import { watch, computed, ref, nextTick, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
// import { storeToRefs } from 'pinia';
import { useTags as useTagsbar } from '@/pinia/modules/tags';
import { useScrollbar } from './useScrollbar';

// 页面固定，没有删除 icon
export const isAffix = (tag) => {
  return !!tag.meta && !!tag.meta.affix;
};

export const useTags = (scrollContainer) => {
  const router = useRouter();
  const route = router.currentRoute;
  const routes = computed(() => router.getRoutes());

  const tagsItem = ref([]);
  const tagStore = useTagsbar();
  // const { tagList } = storeToRefs(tagStore);  // 解构出来，需要 storeToRefs 维持响应式，但也可以直接赋值
  let tagList = tagStore.tagList;
  const { addTag, delTag, saveActivePosition, updateTagList } = tagStore;

  const scrollbar = useScrollbar(tagsItem, scrollContainer); // { handleScroll, moveToTarget }
  watch(
    () => tagList.value.length,
    () => {
      tagsItem.value = []; // 一旦长度变化，为什么要清空？
    },
  );

  const initTags = () => {
    // 添加固定标签
    const affixTags = routes.value.filter((route) => isAffix(route));
    affixTags.forEach((tag) => {
      if (tag.name) addTag(tag);
    });
    // 不在路由中的所有标签，需要删除
    const noUseTags = tagList.value.filter((tag) => routes.value.every((route) => route.name !== tag.name));
    noUseTags.forEach((tag) => {
      delTag(tag);
    });
  };
  const addTagList = () => {
    // 路由必须被 Layout 包裹，否则不会出 router-view
    const tag = route.value;
    // 关联 keep-alive 判断： cacheList 里面是 tag（类似路由项），而 keep-alive 是根据组件的 name 判断；要求 路由项的 name 、组件的 name 相同
    if (tag.name) addTag(tag);
  };
  const saveTagPosition = (tag) => {
    const index = tagList.value.findIndex((item) => item.fullPath === tag.fullPath);

    saveActivePosition(Math.max(0, index));
  };
  const moveToCurrentTag = () => {
    nextTick(() => {
      for (const tag of tagsItem.value) {
        if (tag?.to?.path === route.value.path) {
          scrollbar.moveToTarget(tag); // 匹配

          // 不是当前路由，
          if (tag.to.fullPath !== route.value.fullPath) {
            updateTagList(route.value);
          }
          break;
        }
      }
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

  // tagList, setItemRef, handleScroll, moveToTarget
  // router-link 的 ref
  const setItemRef = (i, el) => {
    tagsItem.value[i] = el;
  };

  return {
    tagList,
    setItemRef,
    // isAffix,
    ...scrollbar,
  };
};
