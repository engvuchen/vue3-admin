<template>
  <div class="typography" :class="typographyClass">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue';

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
});

const typographyClass = computed(() => {
  const classes = ['typography'];

  if (props.code) classes.push('typography--code');
  if (props.delete) classes.push('typography--delete');
  if (props.disabled) classes.push('typography--disabled');
  if (props.mark) classes.push('typography--mark');
  if (props.keyboard) classes.push('typography--keyboard');
  if (props.underline) classes.push('typography--underline');
  if (props.strong) classes.push('typography--strong');
  if (props.italic) classes.push('typography--italic');
  if (props.type) classes.push(`typography--${props.type}`);
  if (props.className) classes.push(props.className);

  return classes;
});
</script>

<style scoped>
.typography {
  color: rgba(0, 0, 0, 0.88);
  font-size: 14px;
  line-height: 1.5714285714285714;
  word-break: break-word;
}

.typography--code {
  background: rgba(150, 150, 150, 0.1);
  border: 1px solid rgba(100, 100, 100, 0.2);
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.9em;
  margin: 0 1px;
  padding: 0.2em 0.4em;
}

.typography--delete {
  text-decoration: line-through;
}

.typography--disabled {
  color: rgba(0, 0, 0, 0.25);
  cursor: not-allowed;
  user-select: none;
}

.typography--mark {
  background-color: #ffe58f;
  padding: 0;
}

.typography--keyboard {
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-bottom-width: 2px;
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 #d9d9d9;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
}

.typography--underline {
  text-decoration: underline;
}

.typography--strong {
  font-weight: 600;
}

.typography--italic {
  font-style: italic;
}

.typography--secondary {
  color: rgba(0, 0, 0, 0.45);
}

.typography--success {
  color: #52c41a;
}

.typography--warning {
  color: #faad14;
}

.typography--danger {
  color: #ff4d4f;
}
</style>
