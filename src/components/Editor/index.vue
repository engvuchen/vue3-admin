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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { loadCodeEditor } from './index.js';

/**
 * <editor id="editor" v-model="editorValue" :config=""></editor>
 * const config = ref({ disabled: true })
 */

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
const options = computed(() => {
  return Object.assign(
    {
      width: 645,
      height: 400,
      disabled: false,
      language: 'json',
    },
    props.config,
  );
});

const editorOptions = computed(() => {
  const { width, height, ...restOptions } = options.value;
  return restOptions;
});

/**
 * 1. 用户输入 -> valueChange -> update modelValue
 * 2. modelValue.value === 'xxx' -> valueChange -> update modelValue
 */

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    console.log('🔎 ~ newValue:', newValue);
    updateEditor(props.id, newValue);
  },
);
watch(
  editorOptions,
  (newOptions) => {
    console.log('newOptions', newOptions);

    updateEditor(props.id, getEditorValue(), newOptions);
  },
  {
    deep: true,
  },
);

const emit = defineEmits(['update:modelValue', 'change']);

const editor = null;

onMounted(async () => {
  editor = await initEditor(props.id, props.modelValue, editorOptions.value);
  onEditorValueChange();
});
onUnmounted(() => {
  editor?.dispose?.();
  removeStyle();
});

/**
 * 初始化普通编辑器；
 * 防呆设计，先卸载后注册
 * @returns { getValue, setValue }
 */
async function initEditor(eleId = '', value = '', options = { readOnly: false, language: 'protobuf' }) {
  appendStyle();
  return await loadCodeEditor(eleId, value, options);
}
/** 更新普通编辑器的值、选项 */
async function updateEditor(eleId = '', newValue, options) {
  if (!editor) {
    console.error(`[Not Found] Try initEditor('${eleId}')`);
    return;
  }

  const current = editor.getValue();

  if (current !== newValue) {
    editor.setValue(newValue);
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
/** 获取普通编辑器的值 */
function getEditorValue() {
  if (!editor) return '';
  return editor.getValue();
}
function valueChange() {
  const newValue = getEditorValue();

  console.log('🔎 ~ valueChange ~ newValue !== props.modelValue:', newValue, props.modelValue);

  if (newValue !== props.modelValue) {
    emit('change', newValue);
    emit('update:modelValue', newValue);
  }
}

const style = ref(null);
function appendStyle() {
  if (style.value) return;

  const styleEl = document.createElement('style');
  styleEl.id = 'monaco-editor-mixin-style';
  styleEl.textContent = `.editor {
    .button {
        padding: 0 !important;
        min-width: auto !important;
        border: none;
    }
    .input {
        border: none;
        padding: 2px 4px;
        font-size: 13px;
    }
    textarea {
        padding: 0;
        overflow: hidden;
    }
    .mirror {
        position: absolute;
        display: inline-block;
        width: 100%;
        top: 0;
        left: 0;
        box-sizing: border-box;
        white-space: pre-wrap;
        visibility: hidden;
        word-wrap: break-word;
    }
}`;
  document.head.appendChild(styleEl);
  style.value = styleEl;
}
function removeStyle() {
  if (style.value) style.value.remove();
}
function debounce(fn, delay = 200) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
</script>
