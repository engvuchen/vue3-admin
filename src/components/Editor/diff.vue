<template>
  <div
    :id="id"
    class="editor"
    style="border: 1px solid #ccc"
    :style="{
      width: `${options.width}px`,
      height: `${options.height}px`,
    }"
  ></div>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { loadDiffEditor } from './index.js';

const props = defineProps({
  modelValue: { type: Array, default: '' },
  id: {
    type: String,
    default: 'editor',
    required: true,
  },
  config: {
    type: Object,
    default: () => ({}),
  },
});
// props.config -> options / editorOptions
const options = computed(() => {
  return {
    width: 645,
    height: 400,
    readOnly: false,
    language: 'json',
    ...props.config,
  };
});
const editorOptions = computed(() => {
  // eslint-disable-next-line no-unused-vars
  const { width, height, ...restOptions } = options.value;
  return restOptions;
});

/**
 * 1. 用户输入(最新) -> onEditorValueChange - update modelValue -> watch modelValue （modelValue 和 editorValue 比较，防止 update 闪烁）
 * 2. modelValue.value = ['old', 'new']（最新） -> watch modelValue - updateEditor（同步到 editor 了） -> onEditorValueChange (阻断, modelValue 和 editoValue 比较) update modelValue
 */
watch(
  () => props.modelValue,
  (newValue) => {
    if (!diffModalValueAndEditorValue(newValue)) return;
    updateDiffEditor(props.id, newValue);
  },
  {
    deep: true,
  },
);
watch(
  () => editorOptions.value,
  (newOptions) => {
    updateDiffEditor(props.id, getDiffEditorValue(), newOptions);
  },
  {
    deep: true,
  },
);

const emit = defineEmits(['update:modelValue', 'change']);

let editor = null;
onMounted(async () => {
  editor = await initDiffEditor(props.id, props.modelValue, editorOptions.value);
  editor.getOriginalEditor().onDidChangeModelContent(debounce(onEditorValueChange));
  editor.getModifiedEditor().onDidChangeModelContent(debounce(onEditorValueChange));
});
onUnmounted(() => {
  editor?.dispose?.();
});

async function initDiffEditor(eleId = '', value = [], options = { readOnly: false, language: 'json' }) {
  return await loadDiffEditor(eleId, value[0], value[1], options);
}
async function updateDiffEditor(eleId = '', value = [], options) {
  if (!editor) {
    console.error(`[Not Found] Try this.initDiffEditor('${eleId}')`);
    return;
  }

  let [oriValue, newValue] = value;
  // getOriginalEditor 是左侧不可修改; getModifiedEditor 是右侧可修改;
  if (oriValue !== undefined) {
    editor.getOriginalEditor().setValue(oriValue);
  }
  if (newValue !== undefined) {
    editor.getModifiedEditor().setValue(newValue);
  }

  if (options) {
    editor.getOriginalEditor().updateOptions(options);
    editor.getModifiedEditor().updateOptions(options);

    if (options.language) {
      const model = editor.getModel();
      window.monaco.editor.setModelLanguage(model.original, options.language);
      window.monaco.editor.setModelLanguage(model.modified, options.language);
    }
  }
}

function getDiffEditorValue() {
  if (!editor) {
    console.error(`[Not Found] Try this.initDiffEditor('${props.id}')`);
    return;
  }

  return [editor.getOriginalEditor().getValue(), editor.getModifiedEditor().getValue()];
}
function onEditorValueChange() {
  let values = getDiffEditorValue();
  emit('change', values);

  if (!diffModalValueAndEditorValue()) return;
  emit('update:modelValue', values);
}
function diffModalValueAndEditorValue() {
  let editorValues = getDiffEditorValue();
  if (props.modelValue[0] === editorValues[0] && props.modelValue[1] === editorValues[1]) {
    return false;
  }
  return true;
}
function debounce(fn, delay = 200) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
</script>
