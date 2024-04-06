<template>
  <el-icon :size="20" class="fold-btn" :class="{ collapse: collapse }" @click="handleToggleMenu">
    <Fold />
  </el-icon>
</template>
<script setup>
import { useApp } from '@/pinia/modules/app';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const appStore = useApp();
const { sidebar } = storeToRefs(appStore);
const { setCollapse } = appStore;
const collapse = computed(() => sidebar.value.collapse);
const handleToggleMenu = () => {
  setCollapse(!sidebar.value.collapse);
};
</script>
<style lang="scss" scoped>
.fold-btn {
  line-height: 48px;
  padding: 0 10px;
  cursor: pointer;
  &.collapse {
    transform: scale(-1, 1);
  }
}
</style>
