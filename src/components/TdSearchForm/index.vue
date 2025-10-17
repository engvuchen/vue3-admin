<template>
  <div class="td-search-form" :class="config.className" :style="config.style">
    <t-form
      ref="formRef"
      :data="formData"
      :layout="config.layout || 'inline'"
      :label-width="config.labelWidth || 'auto'"
      :rules="formRules"
      :label-align="config.labelAlign || 'left'"
      :colon="config.colon"
    >
      <t-row :gutter="fieldSpacing">
        <t-col v-for="field in visibleFields" :key="field.key" :span="field.span || 24" :offset="field.offset || 0">
          <!-- 上置装饰 -->
          <component
            v-if="field.topDecorator"
            :is="renderDecorator(field.topDecorator, formData[field.key], field.key, 'top')"
            :class="['field-decorator', 'field-decorator--top', field.topDecorator.className]"
            :style="field.topDecorator.style"
            v-bind="field.topDecorator.type !== 'component' ? field.topDecorator.props || {} : {}"
          ></component>

          <!-- 前置装饰 -->
          <component
            v-if="field.beforeDecorator"
            :is="renderDecorator(field.beforeDecorator, formData[field.key], field.key, 'before')"
            :class="['field-decorator', 'field-decorator--before', field.beforeDecorator.className]"
            :style="field.beforeDecorator.style"
            v-bind="field.beforeDecorator.type !== 'component' ? field.beforeDecorator.props || {} : {}"
          ></component>

          <!-- 表单字段 -->
          <t-form-item :name="field.key" :label="field.label" :help="field.help">
            <!-- 表单字段组件 -->
            <component
              :is="getFieldComponent(field.type)"
              v-model="formData[field.key]"
              :placeholder="field.placeholder"
              :disabled="disabledFields.has(field.key)"
              :loading="loadingFields.has(field.key)"
              v-bind="field.props"
              v-on="getFieldEvents(field)"
            >
              <!-- 选项类组件的选项渲染 -->
              <template v-if="field.options && ['select', 'radio', 'checkbox'].includes(field.type)">
                <component
                  v-for="option in getFieldOptions(field)"
                  :key="option.value"
                  :is="getOptionComponent(field.type)"
                  :value="option.value"
                  :disabled="option.disabled"
                  :label="option.label"
                >
                  {{ option.label }}
                </component>
              </template>
            </component>
          </t-form-item>

          <!-- 后置装饰 -->
          <component
            v-if="field.afterDecorator"
            :is="renderDecorator(field.afterDecorator, formData[field.key], field.key, 'after')"
            :class="['field-decorator', 'field-decorator--after', field.afterDecorator.className]"
            :style="field.afterDecorator.style"
            v-bind="field.afterDecorator.type !== 'component' ? field.afterDecorator.props || {} : {}"
          ></component>

          <!-- 下置装饰 -->
          <component
            v-if="field.bottomDecorator"
            :is="renderDecorator(field.bottomDecorator, formData[field.key], field.key, 'bottom')"
            :class="['field-decorator', 'field-decorator--bottom', field.bottomDecorator.className]"
            :style="field.bottomDecorator.style"
            v-bind="field.bottomDecorator.type !== 'component' ? field.bottomDecorator.props || {} : {}"
          ></component>
        </t-col>
      </t-row>

      <!-- 搜索表单操作按钮 -->
      <t-form-item class="search-actions">
        <t-space>
          <!-- 重置按钮 -->
          <t-button 
            v-if="config.showReset !== false" 
            theme="default" 
            @click="handleReset"
            :loading="resetLoading"
          >
            {{ config.resetText || '重置' }}
          </t-button>
          
          <!-- 查询按钮 -->
          <t-button 
            v-if="config.showSubmit !== false" 
            theme="primary" 
            @click="handleSubmit"
            :loading="submitLoading"
          >
            {{ config.submitText || '查询' }}
          </t-button>

          <!-- 自定义按钮 -->
          <template v-for="button in customButtons" :key="button.key">
            <t-button
              :theme="button.theme || 'default'"
              :variant="button.variant || 'base'"
              :size="button.size || 'medium'"
              :loading="button.loading"
              :disabled="button.disabled"
              @click="handleCustomButtonClick(button)"
            >
              {{ button.text }}
            </t-button>
          </template>
        </t-space>
      </t-form-item>
    </t-form>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, onMounted, provide } from 'vue';
import {
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  Textarea as TTextarea,
  Select as TSelect,
  Option as TOption,
  Radio as TRadio,
  RadioGroup as TRadioGroup,
  Checkbox as TCheckbox,
  CheckboxGroup as TCheckboxGroup,
  Switch as TSwitch,
  DatePicker as TDatePicker,
  TimePicker as TTimePicker,
  Upload as TUpload,
  InputNumber as TInputNumber,
  Slider as TSlider,
  Button as TButton,
  Tag as TTag,
  Row as TRow,
  Col as TCol,
  Space as TSpace,
} from 'tdesign-vue-next';

import { getCustomComponent } from '../TdProForm/componentMap';

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
const emit = defineEmits(['submit', 'reset', 'change', 'error', 'buttonClick']);

// 表单引用
const formRef = ref();

// 表单数据
const formData = reactive({});

// 加载状态
const submitLoading = ref(false);
const resetLoading = ref(false);

// 隐藏的字段集合
const hiddenFields = ref(new Set());

// 禁用的字段集合
const disabledFields = ref(new Set());

// 动态选项映射
const dynamicOptions = reactive({});

// 加载状态映射
const loadingFields = ref(new Set());

// 装饰器状态映射
const decoratorStates = reactive({});

// 自定义按钮
const customButtons = computed(() => {
  return props.config.customButtons || [];
});

// 初始化表单数据
const initFormData = () => {
  // 重置状态
  hiddenFields.value.clear();
  disabledFields.value.clear();
  Object.keys(dynamicOptions).forEach((key) => delete dynamicOptions[key]);

  // 设置初始状态
  props.config.fields.forEach((field) => {
    if (field.visible === false) {
      hiddenFields.value.add(field.key);
    }
    if (field.disabled === true) {
      disabledFields.value.add(field.key);
    }
  });

  // 先设置默认值
  props.config.fields.forEach((field) => {
    if (field.defaultValue !== undefined) {
      formData[field.key] = field.defaultValue;
    }
  });

  // 然后执行所有字段的联动逻辑
  Promise.all(
    props.config.fields.map(async (field) => {
      const fieldValue = formData[field.key];
      await handleLinkage(field.key, fieldValue);
    }),
  );
};

// 计算可见字段
const visibleFields = computed(() => {
  return props.config.fields.filter((field) => {
    return !hiddenFields.value.has(field.key);
  });
});

// 计算表单项间距
const fieldSpacing = computed(() => {
  const config = props.config;
  const spacing = config.fieldSpacing || {};
  
  return [
    parseInt(spacing.horizontal) || 0,
    parseInt(spacing.vertical) || 24
  ];
});

// 生成表单校验规则
const formRules = computed(() => {
  const rules = {};

  props.config.fields.forEach((field) => {
    if (field.rules && field.rules.length > 0) {
      rules[field.key] = field.rules.map((rule) => ({
        ...rule,
        message: rule.message || generateDefaultMessage(field, rule),
      }));
    }
  });

  return rules;
});

// 生成默认错误消息
const generateDefaultMessage = (field, rule) => {
  if (rule.required) {
    return `请输入${field.label}`;
  }
  if (rule.min) {
    return `${field.label}最少${rule.min}个字符`;
  }
  if (rule.max) {
    return `${field.label}最多${rule.max}个字符`;
  }
  return `${field.label}格式不正确`;
};

// 获取字段组件
const getFieldComponent = (type) => {
  const baseComponentMap = {
    input: TInput,
    textarea: TTextarea,
    select: TSelect,
    radio: TRadioGroup,
    checkbox: TCheckboxGroup,
    switch: TSwitch,
    'date-picker': TDatePicker,
    'time-picker': TTimePicker,
    upload: TUpload,
    number: TInputNumber,
    slider: TSlider,
  };

  if (baseComponentMap[type]) {
    return baseComponentMap[type];
  }

  const customComponent = getCustomComponent(type);
  if (customComponent) {
    return customComponent;
  }

  return TInput;
};

// 获取选项组件
const getOptionComponent = (type) => {
  const optionMap = {
    select: TOption,
    radio: TRadio,
    checkbox: TCheckbox,
  };
  return optionMap[type];
};

// 获取字段选项
const getFieldOptions = (field) => {
  return dynamicOptions[field.key] || field.options || [];
};

// 获取字段事件
const getFieldEvents = (field) => {
  return {
    change: (value) => handleFieldChange(field.key, value),
  };
};

// 渲染装饰器
const renderDecorator = (decorator, value, fieldKey, position) => {
  if (!decorator) return null;

  const { type, content } = decorator;
  const decoratorId = `${fieldKey}_${position}`;

  if (type === 'component') {
    return createComponentDecorator(decorator, value, decoratorId);
  } else if (type === 'html') {
    return {
      template: `<div v-html="parsedContent"></div>`,
      computed: {
        parsedContent() {
          return parseDecoratorContent(content, value);
        },
      },
    };
  } else {
    return {
      template: `<div>{{ parsedContent }}</div>`,
      computed: {
        parsedContent() {
          return parseDecoratorContent(content, value);
        },
      },
    };
  }
};

// 创建组件装饰器
const createComponentDecorator = (decorator, _value, decoratorId) => {
  const { content, props: initialProps = {} } = decorator;

  if (!decoratorStates[decoratorId]) {
    decoratorStates[decoratorId] = {
      props: { ...initialProps },
      visible: true,
      content: content,
    };
  }

  let component = getCustomComponent(content);
  if (!component) {
    component = getFieldComponent(content);
  }
  if (!component && typeof content === 'string') {
    const tdesignComponentMap = {
      TButton: TButton,
      TTag: TTag,
    };
    component = tdesignComponentMap[content];
  }

  return {
    setup() {
      return {
        decoratorState: decoratorStates[decoratorId],
        actualComponent: component || 'div',
      };
    },
    template: `
            <component 
                v-if="decoratorState.visible"
                :is="actualComponent" 
                v-bind="decoratorState.props"
            >
                {{ decoratorState.content === 'TTag' ? '标签' : '' }}
                {{ decoratorState.content === 'TButton' ? '按钮' : '' }}
            </component>
        `,
  };
};

// 解析装饰器内容
const parseDecoratorContent = (content, value) => {
  if (!content) return content;
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key === 'value') {
      return value !== undefined ? String(value) : '';
    }
    return match;
  });
};

// API调用函数
const callApi = async (apiConfig, params) => {
  const { url, transform } = apiConfig;

  try {
    if (url.includes('mock-api.example.com')) {
      if (window.getMockData) {
        const data = await window.getMockData(url, params || {});
        return transform ? transform(data) : data;
      } else {
        throw new Error('模拟数据函数未初始化，请确保已调用 initMockData()');
      }
    }

    const { method = 'GET', headers = {} } = apiConfig;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    let finalUrl = url;

    if (method === 'GET' && params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      finalUrl += `?${searchParams.toString()}`;
    } else if (method !== 'GET' && params) {
      options.body = JSON.stringify(params);
    }

    const response = await fetch(finalUrl, options);

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return transform ? transform(data) : data;
  } catch (error) {
    console.error('❌ API调用错误:', error);
    throw error;
  }
};

// 处理字段变化
const handleFieldChange = (key, value) => {
  formData[key] = value;
  emit('change', key, value, { ...formData });
  handleLinkage(key, value);
};

// 创建表单操作上下文
const createFormContext = () => ({
  formData: formData,
  showField: (fieldKey) => {
    hiddenFields.value.delete(fieldKey);
  },
  hideField: (fieldKey) => {
    hiddenFields.value.add(fieldKey);
  },
  enableField: (fieldKey) => {
    disabledFields.value.delete(fieldKey);
  },
  disableField: (fieldKey) => {
    disabledFields.value.add(fieldKey);
  },
  setFieldValue: (fieldKey, value) => {
    formData[fieldKey] = value;
  },
  setFieldOptions: (fieldKey, options) => {
    dynamicOptions[fieldKey] = options;
  },
  callApi: async (apiConfig, params) => {
    return await callApi(apiConfig, params);
  },
  updateDecoratorProps: (fieldKey, position, props) => {
    const decoratorId = `${fieldKey}_${position}`;
    if (decoratorStates[decoratorId]) {
      Object.assign(decoratorStates[decoratorId].props, props);
    }
  },
  showDecorator: (fieldKey, position) => {
    const decoratorId = `${fieldKey}_${position}`;
    if (decoratorStates[decoratorId]) {
      decoratorStates[decoratorId].visible = true;
    }
  },
  hideDecorator: (fieldKey, position) => {
    const decoratorId = `${fieldKey}_${position}`;
    if (decoratorStates[decoratorId]) {
      decoratorStates[decoratorId].visible = false;
    }
  },
});

// 处理联动逻辑
const handleLinkage = async (changedKey, changedValue) => {
  const context = createFormContext();

  for (const field of props.config.fields) {
    if (field.linkage) {
      for (const linkage of field.linkage) {
        if (linkage.watchField !== changedKey) continue;

        try {
          if (typeof linkage.action !== 'function') {
            throw new Error(`字段 ${field.key} 的联动配置中 action 不是函数: ${typeof linkage.action}`);
          }
          await linkage.action(changedValue, context);
        } catch (error) {
          console.error(`❌ 联动执行失败: ${field.key}`, error);
          emit('error', { field: field.key, error });
        }
      }
    }

    const decorators = [field.topDecorator, field.beforeDecorator, field.afterDecorator, field.bottomDecorator];
    for (const decorator of decorators) {
      if (!decorator?.linkage) continue;

      for (const linkage of decorator.linkage) {
        if (linkage.watchField !== changedKey) continue;
        try {
          if (typeof linkage.action !== 'function') {
            throw new Error(`字段 ${field.key} 的装饰器联动配置中 action 不是函数: ${typeof linkage.action}`);
          }
          await linkage.action(changedValue, context);
        } catch (error) {
          console.error(`❌ 装饰器联动执行失败: ${field.key}`, error);
          emit('error', { field: field.key, error });
        }
      }
    }
  }
};

// 表单提交
const handleSubmit = async () => {
  try {
    submitLoading.value = true;
    
    // 表单验证
    const validateResult = await formRef.value?.validate();
    if (validateResult !== true) {
      return;
    }

    // 如果有自定义请求方法，先调用
    if (props.request) {
      await props.request(formData);
    }

    emit('submit', { ...formData });
  } catch (error) {
    console.error('提交失败:', error);
    emit('error', error);
  } finally {
    submitLoading.value = false;
  }
};

// 表单重置
const handleReset = async () => {
  try {
    resetLoading.value = true;
    
    formRef.value?.reset();
    initFormData();
    
    emit('reset');
  } catch (error) {
    console.error('重置失败:', error);
    emit('error', error);
  } finally {
    resetLoading.value = false;
  }
};

// 自定义按钮点击
const handleCustomButtonClick = async (button) => {
  try {
    if (button.loading) {
      button.loading = true;
    }

    if (button.action && typeof button.action === 'function') {
      await button.action(formData, createFormContext());
    }

    emit('buttonClick', button, formData);
  } catch (error) {
    console.error('自定义按钮执行失败:', error);
    emit('error', error);
  } finally {
    if (button.loading) {
      button.loading = false;
    }
  }
};

// 表单实例方法
const formInstance = {
  validate: async () => {
    return await formRef.value?.validate();
  },
  resetFields: () => {
    handleReset();
  },
  getFieldsValue: () => {
    return { ...formData };
  },
  setFieldsValue: (values) => {
    Object.assign(formData, values);
  },
  getFieldValue: (key) => {
    return formData[key];
  },
  setFieldValue: (key, value) => {
    formData[key] = value;
  },
};

// 暴露表单实例
defineExpose(formInstance);

// 提供表单实例给子组件
provide('formInstance', formInstance);

// 初始化
onMounted(() => {
  initFormData();
});

// 监听配置变化
watch(
  () => props.config,
  () => {
    initFormData();
  },
  { deep: true },
);
</script>

<style scoped>
.td-search-form {
  width: 100%;
  padding: 20px;
  background: #fff;
  margin-bottom: 10px;
}

.field-decorator {
  margin: 8px 0;
}

.field-decorator--top {
  margin-bottom: 12px;
}

.field-decorator--before {
  margin-bottom: 8px;
}

.field-decorator--after {
  margin-top: 8px;
}

.field-decorator--bottom {
  margin-top: 12px;
}

.search-actions {
  margin-top: 16px;
}
</style>
