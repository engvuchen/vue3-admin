<template>
  <t-tooltip
    :content="tooltipContent"
    :disabled="!showTooltip"
    :placement="placement"
    :theme="theme"
    :show-arrow="showArrow"
    :max-width="maxTooltipWidth"
    :z-index="zIndex"
    @show="handleTooltipShow"
    @hide="handleTooltipHide"
  >
    <t-text ref="textRef" :class="textClass" :style="textStyle" v-bind="$attrs">
      <slot />
    </t-text>
  </t-tooltip>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';

const props = defineProps({
  // 文本相关属性
  maxWidth: {
    type: [Number, String],
    default: 200,
  },
  ellipsis: {
    type: Boolean,
    default: true,
  },

  // Tooltip 相关属性
  tooltipContent: {
    type: String,
    default: '',
  },
  placement: {
    type: String,
    default: 'top',
  },
  theme: {
    type: String,
    default: 'default',
  },
  showArrow: {
    type: Boolean,
    default: true,
  },
  maxTooltipWidth: {
    type: Number,
    default: 300,
  },
  zIndex: {
    type: Number,
    default: 99,
  },

  // 其他属性
  className: {
    type: String,
    default: '',
  },
  style: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['overflow', 'tooltipShow', 'tooltipHide']);

const textRef = ref();
const isOverflow = ref(false);
const showTooltip = ref(false);
const tooltipContent = ref('');

// 计算文本样式
const textStyle = computed(() => {
  const style = { ...props.style };

  if (props.ellipsis) {
    style.overflow = 'hidden';
    style.textOverflow = 'ellipsis';
    style.whiteSpace = 'nowrap';
  }

  if (props.maxWidth) {
    style.maxWidth = typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth;
  }

  return style;
});

// 计算文本类名
const textClass = computed(() => {
  const classes = ['text-with-tooltip'];

  if (props.className) {
    classes.push(props.className);
  }

  if (isOverflow.value) {
    classes.push('text-with-tooltip--overflow');
  }

  return classes;
});

// 检查文本是否超出容器
const checkOverflow = async () => {
  if (!textRef.value) return;

  await nextTick();

  /**
   * element.scrollWidth // = 200px (只有内容)，当发生溢出，元素本身的 scrollWidth 肯定大于 clientWidth
   * element.clientWidth // = 240px (内容 + 内边距)
   */
  const element = textRef.value;
  const isTextOverflow = element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight; // todo

  const wasOverflow = isOverflow.value;
  isOverflow.value = isTextOverflow;

  // 只有在文本超出时才显示 tooltip
  showTooltip.value = isTextOverflow && !!tooltipContent.value;

  // 如果溢出状态发生变化，触发事件
  if (wasOverflow !== isTextOverflow) {
    emit('overflow', isTextOverflow);
  }
};

// 更新 tooltip 内容
const updateTooltipContent = () => {
  if (props.tooltipContent) {
    tooltipContent.value = props.tooltipContent;
  } else if (textRef.value) {
    tooltipContent.value = textRef.value.textContent || '';
  } else {
    tooltipContent.value = '';
  }
};

// 监听文本内容变化
watch(
  () => textRef.value?.textContent,
  () => {
    checkOverflow();
    updateTooltipContent();
  },
  { flush: 'post' },
);

// 监听 props.tooltipContent 变化
watch(
  () => props.tooltipContent,
  () => {
    updateTooltipContent();
  },
);

// 监听窗口大小变化
const handleResize = () => {
  checkOverflow();
};

// 监听 tooltip 显示/隐藏事件
const handleTooltipShow = () => {
  emit('tooltipShow');
};

const handleTooltipHide = () => {
  emit('tooltipHide');
};

onMounted(() => {
  checkOverflow();
  updateTooltipContent();
  window.addEventListener('resize', handleResize);
});

// 暴露方法给父组件
defineExpose({
  checkOverflow,
  isOverflow: () => isOverflow.value,
  showTooltip: () => showTooltip.value,
});
</script>

<style scoped>
.text-with-tooltip {
  display: inline-block;
  position: relative;
}

.text-with-tooltip--overflow {
  cursor: pointer;
}
:deep(.t-popup__content) {
  background-color: rgba(27, 33, 41, 0.9) !important;
  color: #ffffff !important;
  border: 1px solid rgba(27, 33, 41, 0.9) !important;
}
</style>
