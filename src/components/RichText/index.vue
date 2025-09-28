<template>
  <div>
    <QuillEditor
      style="width: 100%"
      v-model:content="innerValue"
      :content-type="contentType"
      :theme="theme"
      :placeholder="placeholder"
      :toolbar="computedToolbarOptions"
      :disabled="disabled"
      :readOnly="readOnly"
      :formats="formats"
      :modules="modules"
      @textChange="handleTextChange"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '请输入内容...',
  },
  // 支持更多 QuillEditor 的配置选项
  theme: {
    type: String,
    default: 'snow',
  },
  toolbar: {
    type: Array,
    default: undefined,
  },
  contentType: {
    type: String,
    default: 'html',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  // 编辑器尺寸配置
  minHeight: {
    type: [String, Number],
    default: '150px',
  },
  maxHeight: {
    type: [String, Number],
    default: undefined,
  },
  // 其他通用属性
  formats: {
    type: Array,
    default: undefined,
  },
  modules: {
    type: Object,
    default: undefined,
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const innerValue = ref(props.modelValue || '');

// 默认工具栏配置
const defaultToolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ['clean'],
  ['link'],
];

// 计算工具栏配置 - 优先使用传入的 toolbar prop
const computedToolbarOptions = computed(() => {
  return props.toolbar || defaultToolbarOptions;
});

// 计算高度配置
const computedMinHeight = computed(() => {
  const height = props.minHeight;
  if (typeof height === 'number') {
    return `${height}px`;
  }
  return height || '150px';
});

const computedMaxHeight = computed(() => {
  const height = props.maxHeight;
  if (typeof height === 'number') {
    return `${height}px`;
  }
  return height || 'none';
});

// 处理文本变化
const handleTextChange = (_delta, _oldDelta, source) => {
  if (source === 'user') {
    emit('change', normalizeContent(innerValue.value));
  }
};

// 标准化内容 - 将空的段落标签转换为空字符串
const normalizeContent = (content) => {
  if (!content) return '';

  // 移除所有空白字符后检查是否只剩下空的段落标签
  const trimmed = content.replace(/\s/g, '');
  const emptyPatterns = ['<p><br></p>', '<p></p>', '<div><br></div>', '<div></div>', '<br>', ''];

  if (emptyPatterns.includes(trimmed)) {
    return '';
  }

  return content;
};

watch(
  () => props.modelValue,
  (val) => {
    if (val !== innerValue.value) {
      innerValue.value = val || '';
    }
  },
);

watch(
  () => innerValue.value,
  (val) => {
    const normalizedValue = normalizeContent(val);
    emit('update:modelValue', normalizedValue);
    emit('change', normalizedValue);
  },
);
</script>

<style scoped>
.quill-editor-wrapper {
  width: 100%;
}

/* 确保编辑器样式正确加载 */
:deep(.ql-editor) {
  min-height: v-bind(computedMinHeight);
  max-height: v-bind(computedMaxHeight);
  font-size: 14px;
  line-height: 1.6;
}
</style>
