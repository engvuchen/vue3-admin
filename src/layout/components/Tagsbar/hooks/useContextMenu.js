import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTags } from '@/pinia/modules/tags';
import { isAffix } from './useBusinessTags';

export const useContextMenu = (tagList) => {
  const router = useRouter();
  const route = useRoute();
  const tagsStore = useTags();

  // 判断标签是否为当前路由
  const isActive = (tag) => {
    return tag.fullPath === route.fullPath;
  };
  // 接受一个索引，尝试跳转到上一个标签，否则返回首页
  const toLastTag = (lastTagIndex) => {
    const lastTag = tagList[lastTagIndex];
    if (lastTag) {
      router.push(lastTag.fullPath);
    } else {
      router.push('/');
    }
  };

  const visible = ref(false);
  const top = ref(0);
  const left = ref(0);
  const selectedTag = ref({});

  // 开启右键菜单
  const openMenu = (tag, e) => {
    visible.value = true;
    left.value = e.clientX;
    top.value = e.clientY;
    selectedTag.value = tag;
  };
  // 关闭右键菜单
  const closeMenu = () => {
    visible.value = false;
  };
  // 刷新
  const refreshSelectedTag = (tag = selectedTag) => {
    tagsStore.deCacheList(tag);
    nextTick(() => {
      router.replace({
        path: `/redirect${tag.fullPath}`,
      });
    });
  };
  // 关闭当前标签
  const closeTag = (tag) => {
    if (isAffix(tag)) return;

    const closedTagIndex = tagList.findIndex((item) => item.fullPath === tag.fullPath);
    // 关闭的标签是当前路由 - 关闭的是当前页面，页面显示为上一级
    if (isActive(tag)) toLastTag(closedTagIndex - 1);

    tagsStore.delTag(tag);
  };
  const closeOtherTags = () => {
    tagsStore.delOtherTags(selectedTag.value);
    router.push(selectedTag.value);
  };
  const closeSomeTags = (direction) => {
    const index = tagList.findIndex((item) => item.fullPath === selectedTag.value.fullPath);
    if ((direction === 'left' && index <= 0) || (direction === 'right' && index >= tagList.length - 1)) {
      return;
    }

    const needToClose = direction === 'left' ? tagList.slice(0, index) : tagList.slice(index + 1);
    tagsStore.delSomeTags(needToClose);
    router.push(selectedTag.value);
  };

  const closeAllTags = () => {
    tagsStore.delAllTags();
    router.push('/');
  };
  const closeLeftTags = () => {
    closeSomeTags('left');
  };
  const closeRightTags = () => {
    closeSomeTags('right');
  };

  // 任意 click，关闭右键菜单
  onMounted(() => {
    document.addEventListener('click', closeMenu);
  });
  onBeforeUnmount(() => {
    document.removeEventListener('click', closeMenu);
  });

  return {
    visible,
    top,
    left,
    selectedTag,
    openMenu,
    closeMenu,
    refreshSelectedTag,
    closeTag,
    closeOtherTags,
    closeSomeTags,
    closeAllTags,
    closeLeftTags,
    closeRightTags,
  };
};
