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
 * 1. 用户输入 -> valueChange -> update modelValue（触发 2）
 * 2. modelValue.value === 'xxx' -> watch modelValue（阻断 1->2 防止编辑器闪烁） -> updateEditor -> valueChange -> update modelValue （2者一致，阻断）
 */
watch(
  () => props.modelValue,
  (newValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(getDiffEditorValue())) {
      updateDiffEditor(props.id, newValue);
    }
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
  onEditorValueChange();
});
onUnmounted(() => {
  editor?.dispose?.();
});

async function initDiffEditor(eleId = '', value = [], options = { readOnly: false, language: 'json' }) {
  return await loadDiffEditor(eleId, value[0], value[1], options);
}
async function updateDiffEditor(eleId = '', value = [], options = { readOnly: false, language: 'json' }) {
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
  }
  if (options.language) {
    const model = editor.getModel();
    window.monaco.editor.setModelLanguage(model.original, options.language);
    window.monaco.editor.setModelLanguage(model.modified, options.language);
  }
}

function onEditorValueChange() {
  if (!editor) return;

  editor.getOriginalEditor().onDidChangeModelContent(debounce(valueChange.bind(null, 0)));
  editor.getModifiedEditor().onDidChangeModelContent(debounce(valueChange.bind(null, 1)));
}
function getDiffEditorValue() {
  if (!editor) {
    console.error(`[Not Found] Try this.initDiffEditor('${props.id}')`);
    return;
  }

  return [editor.getOriginalEditor().getValue(), editor.getModifiedEditor().getValue()];
}
function valueChange(index) {
  let values = getDiffEditorValue();
  const newValue = values[index];

  if (newValue !== props.modelValue[index]) {
    emit('change', values);
    emit('update:modelValue', values);
  }
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
