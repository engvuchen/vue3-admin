# 设计思路

## 功能

1. 支持 普通编辑器、Diff 编辑器；
2. 极简的打包体积；
3. 支持响应式更新；
4. 提供编辑器默认配置（options）
5. 扁平化编辑器配置（width、height、编辑器配置）
6. 合理处理赋值、编辑器更新
    1. watch modalValue，对比 modalValue 和编辑器实际的值
    2. 阻断：用户输入 -> onEditorValueChange - update modelValue -> watch modelValue
        1. 防止调用 updateEditor，导致编辑器闪烁
7. 防呆设计：组件卸载，也卸载编辑器

## 涉及的 API

**普通编辑器：**

1. 创建编辑器：`window.monaco.editor.create(document.getElementById(elId), options})`
2. 设置/更新 language：`window.monaco.editor.setModelLanguage(editor.getModel(), options.language)`
3. 赋值：`editor.setValue(newValue)`
4. 更新 options：`editor.updateOptions(options)`

**Diff 编辑器：**

1. 创建编辑器：`window.monaco.editor.createDiffEditor(document.getElementById(elId), options})`

2. 初始赋值编辑器、language：

```js
editor.setModel({
    original: window.monaco.editor.createModel(originalCode, editorOptions.language),
    modified: window.monaco.editor.createModel(modifiedCode, editorOptions.language),
});
```

3. 更新编辑器（注意是区分左右的）

```js
if (oriValue !== undefined) {
    editor.getOriginalEditor().setValue(oriValue);
}
if (newValue !== undefined) {
    editor.getModifiedEditor().setValue(newValue);
}
```

4. 更新 options：

```js
editor.getOriginalEditor().updateOptions(options);
editor.getModifiedEditor().updateOptions(options);
```

5. 更新 language:

```js
const model = editor.getModel();
window.monaco.editor.setModelLanguage(model.original, options.language);
window.monaco.editor.setModelLanguage(model.modified, options.language);
```

## 使用

### 普通编辑器

```vue
<template>
    <Editor
        id="jsonEditor"
        v-if="editorVisible"
        v-model="editorValue"
        :config="editorConfig"
        @change="onValueChange"
    ></Editor>
</template>

<script setup>
function onValueChange() {
  console.log('normal onValueChange', editorValue.value);
}
</script>
```

### Diff 编辑器

```vue
<template>
    <DiffEditor
        id="diffEditor"
        v-if="diffEditorVisible"
        v-model="diffEditorValue"
        :config="diffEditorConfig"
        @change="onDiffValueChange"
    ></DiffEditor>
</template>

<script setup>
function onDiffValueChange(data) {
  console.log('❗️ ~ parent ~ data:', data);
}
</script>
```
