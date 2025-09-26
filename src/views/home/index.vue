<template>
  <!-- <div id="editor" style="height: 100px; border: 1px solid #eee"></div> -->
  home111
  <div style="margin-bottom: 40px">
    <div style="margin-bottom: 20px">
      <el-button @click="editorVisible = !editorVisible">切换显示/隐藏</el-button>
      <el-button @click="editorConfig.readOnly = !editorConfig.readOnly">切换禁用/可用</el-button>
      <el-button @click="editorValue = JSON.stringify({ name: 'update' })">更新普通编辑器</el-button>
      <el-button @click="console.log('editorValue', editorValue)">获取普通编辑器的值</el-button>
      <el-button @click="switchLanguage">切换语言（proto/json）</el-button>
    </div>
    <Editor
      id="jsonEditor"
      v-if="editorVisible"
      v-model="editorValue"
      :config="editorConfig"
      @change="onValueChange"
    ></Editor>
  </div>
  <div style="margin-bottom: 40px">
    <div style="margin-bottom: 20px">
      <el-button @click="diffEditorVisible = !diffEditorVisible">切换显示/隐藏</el-button>
      <el-button @click="diffEditorConfig.readOnly = !diffEditorConfig.readOnly">切换禁用/可用</el-button>
      <el-button @click="diffEditorValue = [JSON.stringify({ name: 'oxxxx' }), JSON.stringify({ name: 'rrr' })]"
        >更新普通编辑器</el-button
      >
      <el-button @click="console.log('diffEditorValue', toRaw(diffEditorValue))">获取普通编辑器的值</el-button>
      <el-button @click="switchDiffLanguage">切换语言（proto/json）</el-button>
    </div>
    <DiffEditor
      id="diffEditor"
      v-if="diffEditorVisible"
      v-model="diffEditorValue"
      :config="diffEditorConfig"
      @change="onDiffValueChange"
    ></DiffEditor>
  </div>
</template>
<script setup lang="js">
import { ref, toRaw } from 'vue';
import Editor from '@/components/Editor/index.vue';
import DiffEditor from '@/components/Editor/diff.vue';

const editorVisible = ref(true);
const editorValue = ref(JSON.stringify({ name: 'zqian' }));
const editorConfig = ref({
  readOnly: false,
  language: 'json',
});
function switchLanguage() {
  editorConfig.value.language = editorConfig.value.language === 'json' ? 'proto' : 'json';

  if (editorConfig.value.language === 'json') {
    editorValue.value = JSON.stringify({ name: 'language json' });
  } else {
    editorValue.value = `message Test {
    optional string name = 1; // proto
}`;
  }
}
function onValueChange() {
  console.log('normal onValueChange', editorValue.value);
}

const diffEditorVisible = ref(false);
const diffEditorValue = ref([JSON.stringify({ name: 'origin' }), JSON.stringify({ name: 'new' })]);
const diffEditorConfig = ref({
  width: 1000,
  readOnly: false,
  language: 'json',
});
function switchDiffLanguage() {
  diffEditorConfig.value.language = diffEditorConfig.value.language === 'json' ? 'proto' : 'json';

  if (diffEditorConfig.value.language === 'json') {
    diffEditorValue.value = [
      JSON.stringify({ name: 'switch language diff1' }),
      JSON.stringify({ name: 'switch language diff2' }),
    ];
  } else {
    diffEditorValue.value = [
      `message Test1 {
    optional string name1 = 1; // proto
}`,
      `message Test2 {
    optional string name2 = 1; // proto
}`,
    ];
  }
}

function onDiffValueChange(data) {
  console.log('❗️ ~ parent ~ data:', data);
}
</script>
