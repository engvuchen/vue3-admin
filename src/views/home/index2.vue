<template>
  <!-- <div id="editor" style="height: 100px; border: 1px solid #eee"></div> -->
  home111
</template>
<script setup lang="js">
import { onMounted } from 'vue';

// import { loadCodeEditor } from '@/components/Editor/index';

// 使用 webpack monaco 插件正确分包
import * as monaco from 'monaco-editor';

// 手动导入
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
// import 'monaco-editor/esm/vs/base/browser/ui/codicons/codiconStyles.js'; // 从 node_modules\monaco-editor\esm\vs\editor\editor.all.js 取出

onMounted(() => {
  // 正常使用右键菜单的部分功能；JSON高亮；查找；样式正常
  monaco.editor.create(document.getElementById('editor'), {
    value: '{ "name": "test" }',
    language: 'json',
  });
  // loadCodeEditor(
  //   'editor',
  //   JSON.stringify({
  //     value: '13',
  //     age: 333,
  //   }),
  //   {
  //     language: 'json',
  //   },
  // );
});
</script>
