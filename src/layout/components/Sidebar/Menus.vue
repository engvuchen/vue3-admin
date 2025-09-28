<template>
  <el-scrollbar class="scroll">
    <el-menu
      class="menu"
      :mode="mode"
      :collapse="collapse"
      :uniqueOpened="true"
      :router="true"
      :default-active="activePath"
      :background-color="variables.menuBg"
      :text-color="variables.menuTextColor"
      :active-text-color="variables.menuActiveTextColor"
    >
      <submenu v-for="menu in menus" :key="menu.url" :menu="menu" class="sub-menu" />
    </el-menu>
  </el-scrollbar>
</template>
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import Submenu from './Submenu.vue';
import { useMenus } from '@/pinia/modules/menu';

import config from './config/menu.module.scss';

console.log('config', config);

defineProps({
  collapse: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'vertical',
  },
});

const route = useRoute();
const { menus } = storeToRefs(useMenus());
const activePath = computed(() => route.path);
const variables = computed(() => config);
</script>
<style lang="scss">
// menu hover
.el-menu-item,
.el-sub-menu__title {
  &:hover {
    background-color: var(--menu-hover) !important;
  }
}

.el-sub-menu {
  .el-menu-item,
  .el-sub-menu .el-sub-menu__title {
    background-color: var(--sub-menu-bg) !important;

    &:hover {
      background-color: var(--sub-menu-hover) !important;
    }
  }
}
.el-menu-item.is-active {
  background-color: var(--menu-active-bg) !important;
  &:hover {
    background-color: var(--menu-active-bg) !important;
  }
}

.el-menu--collapse {
  .el-menu-item.is-active,
  .el-sub-menu.is-active > .el-sub-menu__title {
    position: relative;
    background-color: var(--collapse-menu-active-bg) !important;
    color: var(--collapse-menu-active-color) !important;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: var(--collapse-menu-active-border-width);
      height: 100%;
      background-color: var(--collapse-menu-active-border-color);
    }
  }
}

.el-sub-menu__title i {
  color: var(--arrow-color);
}

// 水平菜单
.el-menu--horizontal {
  .el-menu-item,
  .el-sub-menu .el-sub-menu__title {
    height: var(--horizontal-menu-height) !important;
    line-height: var(--horizontal-menu-height) !important;
    border-bottom: none;
  }

  .el-menu-item.is-active,
  .el-sub-menu.is-active .el-sub-menu__title {
    border: none;
  }
}
</style>

<style lang="scss" scoped>
.scroll {
  height: auto;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  height: var(--horizontal-menu-height) !important;

  .menu {
    border: none;
  }

  /**
    * 横向菜单，菜单折叠项在全局的 popover 容器内（el-popper-container），第三个是菜单 （退出登录 + 语言切换 + 第一个菜单 .. + 页码）；
    * 竖向菜单。菜单折叠项不在 popover 容器内，第三个是页码
    */
  // 写死第一个路由 hover 出现菜单的位置；目前不知道为什么它是 right-start，其他是 bottom-start
  // .el-popper.is-pure.is-light:nth-of-type(3) { //
  //   inset: 94px auto auto 0px !important;
  // }
}
</style>
