<template>
  <svg-icon v-if="isCustomSvg" :name="icon" class="icon" />
  <component v-else-if="!!icon" :is="icon" class="icon" />
  <span>{{ $t(title) }}</span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(['title', 'icon']);
const isCustomSvg = computed(() => props?.icon?.startsWith?.('icon-'));
</script>
<style lang="scss" scoped>
.icon {
  margin-right: 10px;
  width: 16px !important;
  height: 16px !important;
  font-size: 16px;
  text-align: center;
  color: currentColor;
}
</style>
