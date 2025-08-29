<template>
  <!-- <div id="editor" style="height: 100px; border: 1px solid #eee"></div> -->
  home111
  <div style="margin-bottom: 20px;">
    <el-button @click="editorVisible = !editorVisible">切换显示/隐藏</el-button>
    <el-button @click="editorConfig.readOnly = !editorConfig.readOnly">切换禁用/可用</el-button>
    <el-button @click="editorValue = JSON.stringify({ name: 'update' })">更新普通编辑器</el-button>
    <el-button @click="console.log('editorValue', editorValue)">获取普通编辑器的值</el-button>
    <el-button @click="switchLanguage">切换语言（lua/json）</el-button>
  </div>
  <Editor
    id="jsonEditor"
    v-if="editorVisible"
    v-model="editorValue"
    :config="editorConfig"
    @change="onValueChange"
  ></Editor>
</template>
<script setup lang="js">
import { ref, onMounted } from 'vue';
import Editor from '@/components/Editor/index.vue';

const editorVisible = ref(true);

const editorValue = ref(JSON.stringify({ name: 'zqian' }));
const editorConfig = ref({
  readOnly: false,
  language: 'json',
});

// import { loadCodeEditor } from '@/utils/editor/index';

// # 完全导入
// import * as monaco from 'monaco-editor'; // 可被插件正确分包
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
// import 'monaco-editor/esm/vs/base/browser/ui/codicons/codiconStyles.js'; // 从 node_modules\monaco-editor\esm\vs\editor\editor.all.js 取出

function switchLanguage() {
  editorConfig.value.language = editorConfig.value.language === 'json' ? 'protobuf' : 'json';

  if (editorConfig.value.language === 'json') {
    editorValue.value = JSON.stringify({ name: 'language json' });
  } else {
    editorValue.value = `message Test {
    optional string name = 1;
}`;
  }
}

function onValueChange(data) {
  console.log('❗️ ~ parent ~ data:', data);
}

onMounted(() => {
  // 正常使用右键菜单的部分功能；JSON高亮；查找；样式正常
  // monaco.editor.create(document.getElementById('editor'), {
  //   value: '{ "name": "test" }',
  //   language: 'json',
  // });
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
