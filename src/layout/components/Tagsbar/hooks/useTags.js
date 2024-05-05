import { storeToRefs } from 'pinia';
import { useTags as useTagsbar } from '@/pinia/modules/tags';
import { useScrollbar } from './useScrollbar';
import { watch, computed, ref, nextTick, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

// 页面固定，没有删除 icon
export const isAffix = (tag) => {
  return !!tag.meta && !!tag.meta.affix;
};

export const useTags = (scrollContainer) => {
  const tagStore = useTagsbar();
  const { tagList } = storeToRefs(tagStore);

  const { addTag, delTag, saveActivePosition, updateTagList } = tagStore;
  const router = useRouter();
  const route = router.currentRoute;
  const routes = computed(() => router.getRoutes());

  const tagsItem = ref([]);

  const setItemRef = (i, el) => {
    tagsItem.value[i] = el;
  };

  const scrollbar = useScrollbar(tagsItem, scrollContainer); // {, handleScroll, moveToTarget }
  watch(
    () => tagList.value.length,
    () => {
      tagsItem.value = [];
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
    console.log('🔎 ~ addTagList ~ tag:', tag); // todo 看起来是根据 router item.name 判断；keep-alive 是根据组件的 name 判断

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
          scrollbar.moveToTarget(tag);

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
  return {
    tagList,
    setItemRef,
    // isAffix,
    ...scrollbar,
  };
};
