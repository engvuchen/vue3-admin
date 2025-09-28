<template>
  <div class="left" :class="{ collapse: collapse, mobile: device === 'mobile' }">
    <logo />
    <menus :collapse="collapse" />
  </div>
  <div class="mask" @click="closeSidebar"></div>
</template>

<script setup>
import { useApp } from '@/pinia/modules/app';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import Logo from './Logo.vue';
import Menus from './Menus.vue';

const appStore = useApp();
const { sidebar, device } = storeToRefs(appStore);
const { setCollapse } = appStore;
const collapse = computed(() => sidebar.value.collapse);

const closeSidebar = () => {
  setCollapse(true);
};
</script>

<style lang="scss" scoped>
.left {
  width: 210px;
  background: var(--menu-bg);
  transition: all 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  &.collapse {
    width: 64px;
    ::v-deep(.brand .title) {
      display: none;
    }
  }
  &.mobile {
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 10;
    & + .mask {
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 9;
    }
    &.collapse {
      transform: translateX(-100%);
      & + .mask {
        display: none;
      }
    }
  }
}
</style>
