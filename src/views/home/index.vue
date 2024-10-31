<template>
  <div id="editor" style="height: 100px; border: 1px solid #eee"></div>
  home
</template>
<script setup lang="js">
import { onMounted } from 'vue';
import * as monaco from 'monaco-editor';
onMounted(() => {
  // 正常使用右键菜单的部分功能；JSON高亮；查找；样式正常
  monaco.editor.create(document.getElementById('editor'), {
    value: '{ "name": "test" }',
    language: 'json',
  });
});
</script>
