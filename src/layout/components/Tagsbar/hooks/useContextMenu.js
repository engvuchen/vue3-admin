import { useTags } from '@/pinia/modules/tags';
import { onMounted, onBeforeUnmount, reactive, toRefs, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isAffix } from './useTags';

export const useContextMenu = (tagList) => {
  const router = useRouter();
  const route = useRoute();

  const tagsStore = useTags();

  const state = reactive({
    visible: false,
    top: 0,
    left: 0,
    selectedTag: {},
    // 开启右键菜单
    openMenu(tag, e) {
      state.visible = true;
      state.left = e.clientX;
      state.top = e.clientY;
      state.selectedTag = tag;
    },
    // 关闭右键菜单
    closeMenu() {
      // ?
      state.visible = false;
    },
    // 刷新
    refreshSelectedTag(tag = state.selectedTag) {
      tagsStore.deCacheList(tag);
      nextTick(() => {
        router.replace(tag);
      });
    },
    // 关闭
    closeTag(tag) {
      if (isAffix(tag)) return;

      const closedTagIndex = tagList.value.findIndex((item) => item.fullPath === tag.fullPath);
      tagsStore.delTag(tag);
      if (isActive(tag)) {
        toLastTag(closedTagIndex - 1);
      }
    },
    closeOtherTags() {
      tagsStore.delOtherTags(state.selectedTag);
      router.push(state.selectedTag);
    },
    closeLeftTags() {
      state.closeSomeTags('left');
    },
    closeRightTags() {
      state.closeSomeTags('right');
    },
    closeSomeTags(direction) {
      const index = tagList.value.findIndex((item) => item.fullPath === state.selectedTag.fullPath);

      if ((direction === 'left' && index <= 0) || (direction === 'right' && index >= tagList.value.length - 1)) {
        return;
      }

      const needToClose = direction === 'left' ? tagList.value.slice(0, index) : tagList.value.slice(index + 1);
      tagsStore.delSomeTags(needToClose);
      router.push(state.selectedTag);
    },
    closeAllTags() {
      tagsStore.delAllTags();
      router.push('/');
    },
  });

  const isActive = (tag) => {
    return tag.fullPath === route.fullPath;
  };

  // 尝试跳转到上一个标签，否则返回首页
  const toLastTag = (lastTagIndex) => {
    const lastTag = tagList.value[lastTagIndex];
    if (lastTag) {
      router.push(lastTag.fullPath);
    } else {
      router.push('/');
    }
  };

  // todo click 关闭
  onMounted(() => {
    document.addEventListener('click', state.closeMenu);
  });
  onBeforeUnmount(() => {
    document.removeEventListener('click', state.closeMenu);
  });

  return toRefs(state);
};
