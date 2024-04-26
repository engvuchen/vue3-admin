<template>
  <div class="wrapper" :class="{ fluid: isFluid }">
    <!-- #左侧菜单 -->
    <sidebar v-if="isMenusShow && !isHorizontalMenu" />
    <!-- #右侧面板 -->
    <div class="right" :class="{ flex: isTopbarFixed }">
      <!-- #上部分功能栏 -->
      <div class="top">
        <!-- 头像 -->
        <topbar />
        <!-- 横向菜单 -->
        <menus mode="horizontal" v-if="isMenusShow && isHorizontalMenu" />
        <!-- 标签栏 -->
        <tagsbar />
        <!-- 面包屑导航 -->
        <breadcrumbs v-if="isBreadcrumbsShow" @on-breadcrumbs-change="handleBreadcrumbsChange" />
      </div>
      <!-- #页面主题 -->
      <div class="main" :class="{ pt0: isBreadcrumbsShow && paddingFlag }">
        <Content />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import Sidebar from './components/Sidebar/index.vue';
import Topbar from './components/Topbar/index.vue';
import Menus from './components/Sidebar/Menus.vue';
import Tagsbar from './components/Tagsbar/index.vue';
import Breadcrumbs from './components/Topbar/Breadcrumbs.vue';
import Content from './components/Content/index.vue';
import { useResizeHandler } from './hooks/useResizeHandler';
import { useLayoutsettings } from '@/pinia/modules/layoutSettings';

useResizeHandler();
const defaultSettings = useLayoutsettings();
const isFluid = defaultSettings.layout.isFluid;
const isTopbarFixed = defaultSettings.topbar.isFixed;
const isMenusShow = defaultSettings.menus.isShow;
const isHorizontalMenu = defaultSettings.menus.mode === 'horizontal';
const isBreadcrumbsShow = computed(() => isHorizontalMenu && defaultSettings.breadcrumbs.isShow);
const paddingFlag = ref(true);

/** @params {Boolean} boo */
const handleBreadcrumbsChange = (boo) => {
  paddingFlag.value = boo;
};
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  margin: 0 auto;
  width: 1440px;
  height: 100%;
  &.fluid {
    width: 100%;
  }

  .right {
    flex: 1;
    overflow: auto;
    &.flex {
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .top {
      background: #fff;
    }
    .main {
      flex: 1;
      background: #f5f5f5;
      padding: 16px;
      overflow: auto;
      &.pt0 {
        padding-top: 0;
      }
    }
  }
}
</style>
