<template>
  <div class="primary-form" :class="config.className" :style="config.style">
    <t-form
      ref="formRef"
      :data="formData"
      :layout="config.layout || 'vertical'"
      :label-width="config.labelWidth"
      :rules="formRules"
      @submit="handleSubmit"
    >
      <t-row :gutter="[0, fieldSpacingValue]">
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

          <!-- form-item、普通组件都有 help（有状态着色）、可重置 -->
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

      <!-- 表单操作按钮 -->
      <t-form-item v-if="config.showSubmit !== false || config.showReset !== false">
        <t-space>
          <t-button v-if="config.showSubmit !== false" theme="primary" type="submit">
            {{ config.submitText || '提交' }}
          </t-button>
          <t-button v-if="config.showReset !== false" theme="default" variant="base" @click="handleReset">
            {{ config.resetText || '重置' }}
          </t-button>
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

import { getCustomComponent } from './componentMap';

// Props
const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
});

// Emits
const emit = defineEmits(['submit', 'reset', 'change', 'error']);

// 表单引用
const formRef = ref();

// 表单数据
const formData = reactive({});

// 隐藏的字段集合
const hiddenFields = ref(new Set());

// 禁用的字段集合
const disabledFields = ref(new Set());
// 动态选项映射
const dynamicOptions = reactive({});
// 加载状态映射
const loadingFields = ref(new Set());
// 装饰器状态映射 - 用于存储动态装饰器的props和状态
const decoratorStates = reactive({});

// 初始化表单数据
const initFormData = () => {
  // 重置状态
  hiddenFields.value.clear();
  disabledFields.value.clear();
  Object.keys(dynamicOptions).forEach((key) => delete dynamicOptions[key]);

  // 设置初始状态 - 根据字段配置设置隐藏字段
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

  // 然后执行所有字段的联动逻辑（包括没有默认值的字段）
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
    // 只检查动态隐藏状态，不检查初始 visible 配置
    // 因为初始 visible 状态已经在 initFormData 中处理过了
    return !hiddenFields.value.has(field.key);
  });
});

// 计算表单项间距
const fieldSpacingValue = computed(() => {
  const spacing = props.config.fieldSpacing ?? 24; // 默认24px
  return typeof spacing === 'number' ? spacing : parseInt(spacing, 10) || 24;
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
  // 基础组件映射
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

  // 先检查基础组件映射
  if (baseComponentMap[type]) {
    return baseComponentMap[type];
  }

  // 再检查自定义组件映射
  const customComponent = getCustomComponent(type);
  if (customComponent) {
    return customComponent;
  }

  // 默认返回输入框
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

// 渲染装饰器（支持文本、HTML 和组件三种类型）
const renderDecorator = (decorator, value, fieldKey, position) => {
  if (!decorator) return null;

  const { type, content } = decorator;
  const decoratorId = `${fieldKey}_${position}`;

  if (type === 'component') {
    // 组件型装饰器：创建响应式组件包装器
    return createComponentDecorator(decorator, value, decoratorId);
  } else if (type === 'html') {
    // HTML 型装饰器：创建一个支持 v-html 的 div 组件
    return {
      template: `<div v-html="parsedContent"></div>`,
      computed: {
        parsedContent() {
          return parseDecoratorContent(content, value);
        },
      },
    };
  } else {
    // 文本型装饰器：创建一个纯文本的 div 组件
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

// 创建组件装饰器（支持联动更新）
const createComponentDecorator = (decorator, _value, decoratorId) => {
  const { content, props: initialProps = {} } = decorator;

  // 初始化装饰器状态
  if (!decoratorStates[decoratorId]) {
    decoratorStates[decoratorId] = {
      props: { ...initialProps },
      visible: true,
      content: content,
    };
  }

  // 获取实际组件
  let component = getCustomComponent(content);
  if (!component) {
    component = getFieldComponent(content);
  }
  // 如果还没找到，可能是TDesign组件的字符串名称
  if (!component && typeof content === 'string') {
    // 处理 TDesign 组件的特殊映射
    const tdesignComponentMap = {
      TButton: TButton,
      TTag: TTag,
    };
    component = tdesignComponentMap[content];
  }

  // 返回响应式组件包装器
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

// 解析装饰器内容（支持模板变量）
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
    // 检查是否为演示用的 mock API - 直接返回模拟数据，不发起真实请求
    if (url.includes('mock-api.example.com')) {
      if (window.getMockData) {
        const data = await window.getMockData(url, params || {});

        return transform ? transform(data) : data;
      } else {
        throw new Error('模拟数据函数未初始化，请确保已调用 initMockData()');
      }
    }

    // 真实的 API 调用
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

// 处理字段变化；同步值到 formData，且处理联动逻辑
const handleFieldChange = (key, value) => {
  formData[key] = value;
  emit('change', key, value, { ...formData });

  // 处理联动逻辑
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
  // 装饰器操作方法
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

// 处理联动逻辑 - 超级简化版本
const handleLinkage = async (changedKey, changedValue) => {
  const context = createFormContext();

  // 遍历所有字段的联动配置
  for (const field of props.config.fields) {
    if (field.linkage) {
      for (const linkage of field.linkage) {
        if (linkage.watchField !== changedKey) continue;

        try {
          // 检查 action 是否是函数
          if (typeof linkage.action !== 'function') {
            throw new Error(`字段 ${field.key} 的联动配置中 action 不是函数: ${typeof linkage.action}`);
          }
          // 直接调用用户的 action 函数，让用户自己处理所有逻辑
          await linkage.action(changedValue, context);
        } catch (error) {
          console.error(`❌ 联动执行失败: ${field.key}`, error);
          emit('error', { field: field.key, error });
        }
      }
    }

    // 处理装饰器的联动配置
    const decorators = [field.topDecorator, field.beforeDecorator, field.afterDecorator, field.bottomDecorator];
    for (const decorator of decorators) {
      if (!decorator?.linkage) continue;

      for (const linkage of decorator.linkage) {
        if (linkage.watchField !== changedKey) continue;
        try {
          // 检查 action 是否是函数
          if (typeof linkage.action !== 'function') {
            throw new Error(`字段 ${field.key} 的装饰器联动配置中 action 不是函数: ${typeof linkage.action}`);
          }
          // 直接调用用户的 action 函数，让用户自己处理所有逻辑
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
const handleSubmit = async (e) => {
  if (e.validateResult === true) {
    emit('submit', { ...formData });
  }
};

// 表单重置
const handleReset = () => {
  formRef.value?.reset();
  initFormData();
  emit('reset');
};

// 数据恢复功能
const restoreData = async (data) => {
  // 先清空当前数据
  Object.keys(formData).forEach((key) => {
    formData[key] = undefined;
  });

  // 重置联动状态
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

  // 按字段顺序恢复数据，支持多级联动
  for (const field of props.config.fields) {
    if (data[field.key] !== undefined) {
      formData[field.key] = data[field.key];

      // 触发联动逻辑
      await new Promise((resolve) => {
        setTimeout(async () => {
          await handleLinkage(field.key, data[field.key]);
          resolve();
        }, 50); // 小延迟确保联动按顺序执行
      });
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
  restoreData,
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
.primary-form {
  width: 100%;
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
</style>
