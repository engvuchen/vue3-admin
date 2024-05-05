<template>
  <dl>
    <dt>有以下两种方式设置页面不缓存：</dt>
    <dd>- 当前页面不设置 name 属性</dd>
    <dd>- 或者路由配置的 meta 增加 noCache: true</dd>
  </dl>
</template>

<script setup>
console.log('nocache');
</script>

<script>
export default {
  name: 'test-no-cache', // 该 name 须跟路由配置的 name 一致，不一致或不设置 name，则不缓存
};
</script>
