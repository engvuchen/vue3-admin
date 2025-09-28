<template>
  <span ref="textRef" class="typography-text" :class="textClass" :style="textStyle" @click="handleClick">
    <!-- 可编辑状态 -->
    <template v-if="isEditing">
      <t-input
        ref="inputRef"
        v-model="editingText"
        :auto-focus="true"
        :size="size"
        @blur="handleEditConfirm"
        @keydown.enter="handleEditConfirm"
        @keydown.escape="handleEditCancel"
        class="typography-text__input"
      />
    </template>

    <!-- 正常显示状态 -->
    <template v-else>
      <!-- 截断文本 -->
      <span
        v-if="ellipsis && !expanded"
        class="typography-text__content typography-text__content--ellipsis"
        :title="showTooltip ? fullText : undefined"
      >
        <slot></slot>
      </span>

      <!-- 完整文本 -->
      <span v-else class="typography-text__content">
        <slot></slot>
      </span>

      <!-- 展开/收起按钮 -->
      <t-button
        v-if="ellipsis && showExpandButton"
        type="text"
        size="small"
        class="typography-text__expand-btn"
        @click="handleToggleExpand"
      >
        {{ expanded ? '收起' : '展开' }}
      </t-button>

      <!-- 复制按钮 -->
      <t-button v-if="copyable" type="text" size="small" class="typography-text__copy-btn" @click="handleCopy">
        {{ copied ? '已复制' : '复制' }}
      </t-button>

      <!-- 编辑按钮 -->
      <t-button
        v-if="editable && !isEditing"
        type="text"
        size="small"
        class="typography-text__edit-btn"
        @click="handleStartEdit"
      >
        编辑
      </t-button>
    </template>
  </span>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

const props = defineProps({
  code: {
    type: Boolean,
    default: false,
  },
  copyable: {
    type: [Boolean, Object],
    default: false,
  },
  delete: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: [Boolean, Object],
    default: false,
  },
  ellipsis: {
    type: [Boolean, Object],
    default: false,
  },
  mark: {
    type: Boolean,
    default: false,
  },
  keyboard: {
    type: Boolean,
    default: false,
  },
  underline: {
    type: Boolean,
    default: false,
  },
  strong: {
    type: Boolean,
    default: false,
  },
  italic: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: undefined,
  },
  className: {
    type: String,
    default: '',
  },
  style: {
    type: Object,
    default: () => ({}),
  },
  size: {
    type: String,
    default: 'medium',
  },
});

const emit = defineEmits(['copy', 'edit', 'expand']);

const textRef = ref();
const inputRef = ref();
const editingText = ref('');
const isEditing = ref(false);
const expanded = ref(false);
const copied = ref(false);
const displayText = ref('');
const fullText = ref('');

// 计算样式类
const textClass = computed(() => {
  const classes = ['typography-text'];

  if (props.code) classes.push('typography-text--code');
  if (props.delete) classes.push('typography-text--delete');
  if (props.disabled) classes.push('typography-text--disabled');
  if (props.mark) classes.push('typography-text--mark');
  if (props.keyboard) classes.push('typography-text--keyboard');
  if (props.underline) classes.push('typography-text--underline');
  if (props.strong) classes.push('typography-text--strong');
  if (props.italic) classes.push('typography-text--italic');
  if (props.type) classes.push(`typography-text--${props.type}`);
  if (props.className) classes.push(props.className);

  return classes;
});

// 计算样式
const textStyle = computed(() => {
  const style = { ...props.style };

  if (props.ellipsis && !expanded.value) {
    style.overflow = 'hidden';
    style.textOverflow = 'ellipsis';
    style.whiteSpace = 'nowrap';
  }

  return style;
});

// 是否显示展开按钮
const showExpandButton = computed(() => {
  if (typeof props.ellipsis === 'object') {
    return props.ellipsis.expandable !== false;
  }
  return true;
});

// 是否显示 tooltip
const showTooltip = computed(() => {
  if (typeof props.ellipsis === 'object') {
    return props.ellipsis.tooltip !== false;
  }
  return true;
});

// 处理点击事件
const handleClick = () => {
  if (props.disabled) return;
};

// 处理复制
const handleCopy = async () => {
  try {
    const textToCopy = typeof props.copyable === 'object' && props.copyable.text ? props.copyable.text : fullText.value;

    await navigator.clipboard.writeText(textToCopy);
    copied.value = true;

    // 触发复制回调
    if (typeof props.copyable === 'object' && props.copyable.onCopy) {
      props.copyable.onCopy();
    }

    emit('copy', textToCopy);

    // 2秒后重置复制状态
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('复制失败:', error);
    MessagePlugin.error('复制失败');
  }
};

// 开始编辑
const handleStartEdit = () => {
  if (props.disabled) return;

  isEditing.value = true;
  editingText.value = fullText.value;

  if (typeof props.editable === 'object' && props.editable.onStart) {
    props.editable.onStart();
  }

  nextTick(() => {
    inputRef.value?.focus();
  });
};

// 确认编辑
const handleEditConfirm = () => {
  isEditing.value = false;
  fullText.value = editingText.value;
  displayText.value = editingText.value;

  if (typeof props.editable === 'object' && props.editable.onChange) {
    props.editable.onChange(editingText.value);
  }

  emit('edit', editingText.value);
};

// 取消编辑
const handleEditCancel = () => {
  isEditing.value = false;
  editingText.value = fullText.value;
};

// 切换展开状态
const handleToggleExpand = () => {
  expanded.value = !expanded.value;

  if (typeof props.ellipsis === 'object' && props.ellipsis.onExpand) {
    props.ellipsis.onExpand(new MouseEvent('click'), { expanded: expanded.value });
  }

  emit('expand', expanded.value);
};

// 初始化文本内容
const initText = () => {
  nextTick(() => {
    // 只获取插槽内容的文本，不包括按钮文本
    const contentElement = textRef.value?.querySelector('.typography-text__content');
    const textContent = contentElement?.textContent || textRef.value?.textContent || '';
    fullText.value = textContent;
    displayText.value = textContent;
  });
};

// 监听编辑状态变化
watch(
  () => props.editable,
  (newVal) => {
    if (typeof newVal === 'object' && newVal.editing !== undefined) {
      isEditing.value = newVal.editing;
    }
  },
  { immediate: true },
);

// 监听 ellipsis 变化
watch(
  () => props.ellipsis,
  (newVal) => {
    if (newVal) {
      expanded.value = false;
    }
  },
  { immediate: true },
);

onMounted(() => {
  initText();
});

// 暴露方法给父组件
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
});
</script>

<style scoped>
.typography-text {
  position: relative;
  display: inline;
}

.typography-text__content {
  display: inline;
}

.typography-text__content--ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: top;
}

.typography-text__input {
  min-width: 100px;
  max-width: 200px;
}

.typography-text__expand-btn,
.typography-text__copy-btn,
.typography-text__edit-btn {
  margin-left: 4px;
  padding: 0 4px;
  font-size: 12px;
  line-height: 1;
}

.typography-text--code {
  background: rgba(150, 150, 150, 0.1);
  border: 1px solid rgba(100, 100, 100, 0.2);
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.9em;
  margin: 0 1px;
  padding: 0.2em 0.4em;
}

.typography-text--delete {
  text-decoration: line-through;
}

.typography-text--disabled {
  color: rgba(0, 0, 0, 0.25);
  cursor: not-allowed;
  user-select: none;
}

.typography-text--mark {
  background-color: #ffe58f;
  padding: 0;
}

.typography-text--keyboard {
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-bottom-width: 2px;
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 #d9d9d9;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
}

.typography-text--underline {
  text-decoration: underline;
}

.typography-text--strong {
  font-weight: 600;
}

.typography-text--italic {
  font-style: italic;
}

.typography-text--secondary {
  color: rgba(0, 0, 0, 0.45);
}

.typography-text--success {
  color: #52c41a;
}

.typography-text--warning {
  color: #faad14;
}

.typography-text--danger {
  color: #ff4d4f;
}
</style>
