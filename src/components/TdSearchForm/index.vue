<template>
  <!-- 有必要吗？根标签可以直接加 -->
  <div class="td-search-form" :class="config.className" :style="config.style">
    <!-- 使用 TdProForm 组件 -->
    <td-pro-form
      ref="proFormRef"
      :config="proFormConfig"
      @submit="handleFormSubmit"
      @reset="handleFormReset"
      @change="handleFormChange"
      @error="handleFormError"
    >
      <template #submitBtnGroup>
        <t-space>
          <t-button theme="default" @click="handleFormReset">重置</t-button>
          <t-button theme="primary" @click="handleFormSubmit">查询</t-button>
        </t-space>
      </template>
    </td-pro-form>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import TdProForm from '../TdProForm/index.vue';

// Props
const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
  // 请求方法
  request: {
    type: Function,
    default: null,
  },
});

// Emits
const emit = defineEmits(['submit', 'reset', 'change', 'error']);

// 转换为 TdProForm 的配置
const proFormConfig = computed(() => {
  return {
    // 搜索表单的默认配置
    layout: 'inline',
    labelWidth: 'auto',
    labelAlign: 'left',
    colon: false,
    className: '',
    style: {},
    fields: [],

    // 用户配置覆盖默认配置
    ...props.config,
  };
});

// 事件处理方法
const handleFormSubmit = async (formData) => {
  try {
    // 如果有自定义请求方法，先调用
    if (props.request) {
      await props.request(formData);
    }
    emit('submit', formData);
  } catch (error) {
    console.error('提交失败:', error);
    emit('error', error);
  }
};

const handleFormReset = () => {
  emit('reset');
};
const handleFormChange = (key, value, formData) => {
  emit('change', key, value, formData);
};
const handleFormError = (error) => {
  emit('error', error);
};

// TdProForm 引用
const proFormRef = ref();
// 表单实例方法 - 代理到 TdProForm
const formInstance = {
  validate: async () => {
    return await proFormRef.value?.validate();
  },
  resetFields: () => {
    return proFormRef.value?.resetFields();
  },
  getFieldsValue: () => {
    return proFormRef.value?.getFieldsValue();
  },
  setFieldsValue: (values) => {
    return proFormRef.value?.setFieldsValue(values);
  },
  getFieldValue: (key) => {
    return proFormRef.value?.getFieldValue(key);
  },
  setFieldValue: (key, value) => {
    return proFormRef.value?.setFieldValue(key, value);
  },
  restoreData: (data) => {
    return proFormRef.value?.restoreData(data);
  },
};

// 暴露表单实例
defineExpose(formInstance);
</script>

<style scoped>
.td-search-form {
  width: 100%;
  padding: 20px;
  background: #fff;
  margin-bottom: 10px;
}
</style>
