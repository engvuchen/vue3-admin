<template>
  <div
    :id="id"
    class="editor"
    style="border: 1px solid #ccc"
    :style="{
      display: !options.hide ? 'block' : 'none',
      width: `${options.width}px`,
      height: `${options.height}px`,
    }"
  ></div>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { loadCodeEditor } from './index.js';

const props = defineProps({
  modelValue: { type: String, default: '' },
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
 * 1. 用户输入 -> 组件 valueChange -> 触发 change：update modelValue（触发 2）
 * 2. modelValue.value === 'xxx' -> 组件 valueChange -> update modelValue（2 者值一致，不变更）
 */
watch(
  () => props.modelValue,
  (newValue) => {
    updateEditor(props.id, newValue);
  },
);
watch(
  () => editorOptions.value,
  (newOptions) => {
    updateEditor(props.id, getEditorValue(), newOptions);
  },
  {
    deep: true,
  },
);

const emit = defineEmits(['update:modelValue', 'change']);

let editor = null;
onMounted(async () => {
  editor = await initEditor(props.id, props.modelValue, editorOptions.value);
  onEditorValueChange();
});
onUnmounted(() => {
  editor?.dispose?.();
});

async function initEditor(eleId = '', value = '', options = { readOnly: false, language: 'json' }) {
  return await loadCodeEditor(eleId, value, options);
}
async function updateEditor(eleId = '', newValue, options) {
  if (!editor) {
    console.error(`[Not Found] Try initEditor('${eleId}')`);
    return;
  }

  const current = editor.getValue();
  if (current !== newValue) {
    editor.setValue(newValue); // todo
  }
  if (options) editor.updateOptions(options);
  if (options && options.language) {
    window.monaco.editor.setModelLanguage(editor.getModel(), options.language);
  }
}

function onEditorValueChange() {
  if (!editor) return;

  editor.onDidChangeModelContent(
    debounce(() => {
      valueChange();
    }),
  );
}
function getEditorValue() {
  if (!editor) return '';
  return editor.getValue();
}
function valueChange() {
  const newValue = getEditorValue();

  emit('change', newValue);
  emit('update:modelValue', newValue);
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
