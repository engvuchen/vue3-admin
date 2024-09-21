<template>
  <svg class="icon" aria-hidden="true">
    <!-- <use :xlinkHref="symbolId" :href="symbolId" /> -->
    <use :href="symbolId" />
  </svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});

const symbolId = computed(() => `#${props.name}`);
</script>

<style lang="scss" scoped>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
