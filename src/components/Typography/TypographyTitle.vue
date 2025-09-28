<template>
  <component
    :is="headingTag"
    ref="titleRef"
    class="typography-title"
    :class="titleClass"
    :style="titleStyle"
    @click="handleClick"
  >
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
        class="typography-title__input"
      />
    </template>

    <!-- 正常显示状态 -->
    <template v-else>
      <!-- 截断文本 -->
      <span
        v-if="ellipsis && !expanded"
        class="typography-title__content typography-title__content--ellipsis"
        :title="showTooltip ? fullText : undefined"
      >
        <slot></slot>
      </span>

      <!-- 完整文本 -->
      <span v-else class="typography-title__content">
        <slot></slot>
      </span>

      <!-- 展开/收起按钮 -->
      <t-button
        v-if="ellipsis && showExpandButton"
        type="text"
        size="small"
        class="typography-title__expand-btn"
        @click="handleToggleExpand"
      >
        {{ expanded ? '收起' : '展开' }}
      </t-button>

      <!-- 复制按钮 -->
      <t-button v-if="copyable" type="text" size="small" class="typography-title__copy-btn" @click="handleCopy">
        {{ copied ? '已复制' : '复制' }}
      </t-button>

      <!-- 编辑按钮 -->
      <t-button
        v-if="editable && !isEditing"
        type="text"
        size="small"
        class="typography-title__edit-btn"
        @click="handleStartEdit"
      >
        编辑
      </t-button>
    </template>
  </component>
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
  level: {
    type: Number,
    default: 1,
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

const titleRef = ref();
const inputRef = ref();
const editingText = ref('');
const isEditing = ref(false);
const expanded = ref(false);
const copied = ref(false);
const displayText = ref('');
const fullText = ref('');

// 计算标题标签
const headingTag = computed(() => `h${props.level}`);

// 计算样式类
const titleClass = computed(() => {
  const classes = ['typography-title', `typography-title--level-${props.level}`];

  if (props.code) classes.push('typography-title--code');
  if (props.delete) classes.push('typography-title--delete');
  if (props.disabled) classes.push('typography-title--disabled');
  if (props.mark) classes.push('typography-title--mark');
  if (props.keyboard) classes.push('typography-title--keyboard');
  if (props.underline) classes.push('typography-title--underline');
  if (props.strong) classes.push('typography-title--strong');
  if (props.italic) classes.push('typography-title--italic');
  if (props.type) classes.push(`typography-title--${props.type}`);
  if (props.className) classes.push(props.className);

  return classes;
});

// 计算样式
const titleStyle = computed(() => {
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
    const contentElement = titleRef.value?.querySelector('.typography-title__content');
    const textContent = contentElement?.textContent || titleRef.value?.textContent || '';
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
.typography-title {
  margin: 0;
  color: rgba(0, 0, 0, 0.88);
  font-weight: 600;
  line-height: 1.2;
  word-break: break-word;
}

.typography-title--level-1 {
  font-size: 38px;
  margin-bottom: 0.5em;
}

.typography-title--level-2 {
  font-size: 30px;
  margin-bottom: 0.5em;
}

.typography-title--level-3 {
  font-size: 24px;
  margin-bottom: 0.5em;
}

.typography-title--level-4 {
  font-size: 20px;
  margin-bottom: 0.5em;
}

.typography-title--level-5 {
  font-size: 16px;
  margin-bottom: 0.5em;
}

.typography-title__content {
  display: inline;
}

.typography-title__content--ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: top;
}

.typography-title__input {
  min-width: 100px;
  max-width: 300px;
}

.typography-title__expand-btn,
.typography-title__copy-btn,
.typography-title__edit-btn {
  margin-left: 8px;
  padding: 0 4px;
  font-size: 12px;
  line-height: 1;
}

.typography-title--code {
  background: rgba(150, 150, 150, 0.1);
  border: 1px solid rgba(100, 100, 100, 0.2);
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.9em;
  margin: 0 1px;
  padding: 0.2em 0.4em;
}

.typography-title--delete {
  text-decoration: line-through;
}

.typography-title--disabled {
  color: rgba(0, 0, 0, 0.25);
  cursor: not-allowed;
  user-select: none;
}

.typography-title--mark {
  background-color: #ffe58f;
  padding: 0;
}

.typography-title--keyboard {
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-bottom-width: 2px;
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 #d9d9d9;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
}

.typography-title--underline {
  text-decoration: underline;
}

.typography-title--strong {
  font-weight: 600;
}

.typography-title--italic {
  font-style: italic;
}

.typography-title--secondary {
  color: rgba(0, 0, 0, 0.45);
}

.typography-title--success {
  color: #52c41a;
}

.typography-title--warning {
  color: #faad14;
}

.typography-title--danger {
  color: #ff4d4f;
}
</style>
