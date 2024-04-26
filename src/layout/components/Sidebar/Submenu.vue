<template>
  <!-- 非嵌套路由 -->
  <el-menu-item v-if="!menu.children" :index="menu.url">
    <item :icon="menu.icon" :title="menu.title" />
  </el-menu-item>
  <!-- 嵌套路由 -->
  <el-sub-menu v-else :index="menu.url">
    <template #title>
      <item :icon="menu.icon" :title="menu.title" />
    </template>
    <submenu v-for="submenu in menu.children" :key="submenu.url" :is-nest="true" :menu="submenu" />
  </el-sub-menu>
</template>
<script setup>
import Item from './Item.vue';

/**
 * 嵌套菜单结构：
 *
 * el-sub-menu >
 *  el-menu-item-group 可选 >
 *    el-menu-item
 */

defineProps({
  menu: {
    type: Object,
    required: true,
  },
  isNest: {
    type: Boolean,
    default: false,
  },
});
</script>
