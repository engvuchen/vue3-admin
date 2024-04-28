<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="cacheList">
      <component :is="Component" :key="key" />
    </keep-alive>
  </router-view>
</template>
<script setup>
// https://cn.vuejs.org/guide/built-ins/suspense.html#combining-with-other-components
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useTags } from '@/pinia/modules/tags';

const route = useRoute();
const { cacheList } = storeToRefs(useTags());
const key = computed(() => route.fullPath);
</script>
