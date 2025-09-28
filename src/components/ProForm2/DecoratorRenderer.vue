<template>
  <div
    v-if="decorator"
    class="field-decorator"
    :class="[`field-decorator--${position}`, decorator.className]"
    :style="decorator.style"
  >
    <!-- 文本装饰 -->
    <template v-if="decorator.type === 'text'">
      {{ parseDecoratorContent(decorator.content, value) }}
    </template>

    <!-- HTML 装饰 -->
    <template v-else-if="decorator.type === 'html'">
      <div v-html="parseDecoratorContent(decorator.content, value)"></div>
    </template>

    <!-- 组件装饰 -->
    <component
      v-else-if="decorator.type === 'component'"
      :is="getCustomComponent(decorator.content)"
      v-bind="decorator.props"
      :value="value"
      :field="field"
      :fieldKey="field.key"
      :label="field.label"
    />
  </div>
</template>

<script setup>
import { getCustomComponent } from './componentMap';

defineProps({
  decorator: {
    type: Object,
    default: null,
  },
  value: {
    type: [String, Number, Boolean, Array, Object],
    default: undefined,
  },
  field: {
    type: Object,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
});

const parseDecoratorContent = (content, value) => {
  if (!content) return content;
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key === 'value') {
      return value !== undefined && value !== null ? String(value) : '';
    }
    return match;
  });
};
</script>
