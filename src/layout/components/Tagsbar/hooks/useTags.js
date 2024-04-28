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
    // tag.matched[0].components.default.name - 选项式 匹配 name
    // tag.matched[0].components.default.__file => setup 匹配文件路径
    // let startPointComponent = tag.matched[0].components.default // 线上只有 { setup, __name, __scopeId }
    // let routeStartsWithLayoutComponent =
    //   startPointComponent?.name === 'layout' || startPointComponent?.__file?.endsWith('/layout/index.vue');

    // 路由必须被 Layout 包裹，否则不会出 router-view
    const tag = route.value;
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
