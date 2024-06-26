<template>
  <div class="tags-container" :class="{ hide: !isTagsbarShow }">
    <!-- <el-scrollbar ref="scrollContainer" :vertical="false" class="scroll-container" @wheel.prevent="onScroll"> -->
    <el-scrollbar ref="scrollContainer" :vertical="false" class="scroll-container" @wheel="onScroll">
      <router-link
        v-for="(tag, i) in tagList"
        :key="tag.fullPath"
        :to="tag"
        :ref="(el) => setItemRef(i, el)"
        custom
        v-slot="{ navigate, isExactActive }"
      >
        <div
          class="tags-item"
          :class="isExactActive ? 'active' : ''"
          @click="navigate"
          @click.middle="closeTag(tag)"
          @contextmenu.prevent="openMenu(tag, $event)"
        >
          <span class="title">{{ $t(tag.title) }}</span>
          <el-icon v-if="!isAffix(tag)" class="el-icon-close" @click.prevent.stop="closeTag(tag)">
            <Close />
          </el-icon>
        </div>
      </router-link>
    </el-scrollbar>
  </div>
  <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
    <li @click="refreshSelectedTag(selectedTag)">{{ $t('tags.refresh') }}</li>
    <li v-if="!isAffix(selectedTag)" @click="closeTag(selectedTag)">
      {{ $t('tags.close') }}
    </li>
    <li @click="closeOtherTags">{{ $t('tags.other') }}</li>
    <li @click="closeLeftTags">{{ $t('tags.left') }}</li>
    <li @click="closeRightTags">{{ $t('tags.right') }}</li>
    <li @click="closeAllTags">{{ $t('tags.all') }}</li>
  </ul>
</template>

<script setup>
import { ref, computed, getCurrentInstance, onMounted } from 'vue';
import { useBusinessTags, isAffix } from './hooks/useBusinessTags';
import { useContextMenu } from './hooks/useContextMenu';
import { useLayoutsettings } from '@/pinia/modules/layoutSettings';

const defaultSettings = useLayoutsettings();
const isTagsbarShow = computed(() => defaultSettings.tagsbar.isShow);

const scrollContainer = ref(null);

let useBusinessTagsStore = useBusinessTags(scrollContainer); // moveToTarget, handleScroll
let tagList = useBusinessTagsStore.tagList;
const { setItemRef } = useBusinessTagsStore;

const {
  visible,
  top,
  left,
  selectedTag,
  openMenu,
  closeMenu,
  refreshSelectedTag,
  closeTag,
  closeOtherTags,
  closeLeftTags,
  closeRightTags,
  // closeSomeTags,
  closeAllTags,
} = useContextMenu(tagList);

const onScroll = (e) => {
  // handleScroll(e); // 没有替换浏览器 scroll 事件的必要
  closeMenu.value();
};

onMounted(() => {
  const instance = getCurrentInstance();
  instance.appContext.config.globalProperties.$refreshSelectedTag = refreshSelectedTag;
});
</script>

<style lang="scss" scoped>
.tags-container {
  height: 32px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #e0e4ef;
  &.hide {
    display: none;
  }
  .scroll-container {
    white-space: nowrap;
    overflow: hidden;
    ::v-deep(.el-scrollbar__bar) {
      bottom: 0px;
    }
  }

  .tags-item {
    display: inline-block;
    height: 32px;
    line-height: 32px;
    box-sizing: border-box;
    border-left: 1px solid #e6e6e6;
    border-right: 1px solid #e6e6e6;
    color: #5c5c5c;
    background: #fff;
    padding: 0 8px;
    font-size: 12px;
    margin-left: -1px;
    vertical-align: bottom;
    cursor: pointer;
    &:first-of-type {
      margin-left: 15px;
    }
    &:last-of-type {
      margin-right: 15px;
    }
    &.active {
      color: #303133;
      background: #f5f5f5;
    }
    .title {
      display: inline-block;
      vertical-align: top;
      max-width: 200px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .el-icon-close {
      color: #5c5c5c;
      margin-left: 8px;
      width: 16px;
      height: 16px;
      vertical-align: -2px;
      border-radius: 50%;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(0.8);
        display: inline-block;
        vertical-align: -2px;
      }
      &:hover {
        background-color: #333;
        color: #fff;
      }
    }
  }
}
.contextmenu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: fixed;
  list-style-type: none;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  li {
    margin: 0;
    padding: 8px 16px;
    cursor: pointer;
    &:hover {
      background: #eee;
    }
  }
}
</style>
