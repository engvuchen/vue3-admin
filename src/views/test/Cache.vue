<template>
  <dl>
    <dt>页面缓存必须满足以下条件：</dt>
    <dd>1. 路由配置name属性</dd>
    <dd>2. 当前页面设置name属性，并且跟路由配置的name属性一致，否则无法缓存</dd>
  </dl>
</template>
<script setup>
import { onActivated } from 'vue';

onActivated(() => {
  console.log('onActivated');
});
</script>
