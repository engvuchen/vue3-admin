<template>
  <div class="form" :class="mergedConfig.className" :style="mergedConfig.style">
    <t-form
      ref="formRef"
      :data="formData"
      :layout="mergedConfig.layout"
      :label-width="mergedConfig.labelWidth"
      :label-align="mergedConfig.labelAlign"
      :colon="mergedConfig.colon"
      :rules="formRules"
      style="width: 100%"
    >
      <div class="form-item" :class="{ 'form-item--grid': mergedConfig.fields.length >= 3 }">
        <template v-for="field in visibleFields">
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
              :options="getFieldOptions(field)"
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
                  v-bind="option.props || {}"
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
        </template>

        <!-- 默认按钮 -->
        <slot name="submitBtnGroup">
          <t-form-item v-if="mergedConfig.showSubmit || mergedConfig.showReset">
            <t-space>
              <t-button v-if="mergedConfig.showReset" theme="default" @click="handleReset">
                {{ mergedConfig.resetText }}
              </t-button>
              <t-button v-if="mergedConfig.showSubmit" theme="primary" @click="handleSubmit">
                {{ mergedConfig.submitText }}
              </t-button>
            </t-space>
          </t-form-item>
        </slot>
      </div>
    </t-form>
  </div>
</template>

<script setup>
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

// 合并配置（使用默认值）
const mergedConfig = computed(() => {
  const config = {
    layout: 'vertical', // 表单布局：vertical | inline
    labelWidth: '120px', // 标签宽度
    labelAlign: 'right', // 标签对齐方式：left | right | top
    colon: true, // 是否显示冒号

    // 样式配置
    className: '', // 自定义类名
    style: {}, // 自定义样式

    // 按钮配置
    showSubmit: true, // 是否显示提交按钮
    showReset: true, // 是否显示重置按钮
    submitText: '提交', // 提交按钮文本
    resetText: '重置', // 重置按钮文本

    // 字段配置
    fields: [], // 表单字段配置数组

    ...props.config,
  };

  return config;
});

// 表单引用
const formRef = ref();
const formData = reactive({});
// 立即设置默认值（在模板渲染前）
const initDefaultValues = () => {
  props?.config?.fields?.forEach?.((field) => {
    if (field.value !== undefined) {
      formData[field.key] = field.value;
    } else {
      // 为特定组件类型设置默认值
      if (field.type === 'date-range-picker') {
        formData[field.key] = [];
      } else if (field.type === 'checkbox') {
        formData[field.key] = [];
      } else if (field.type === 'transfer') {
        formData[field.key] = [];
      } else if (field.type === 'tag-input') {
        formData[field.key] = [];
      } else if (field.type === 'range-input') {
        formData[field.key] = [];
      }
    }
  });
};
initDefaultValues();

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
  mergedConfig.value.fields.forEach((field) => {
    if (field.visible === false) {
      hiddenFields.value.add(field.key);
    }
    if (field.disabled === true) {
      disabledFields.value.add(field.key);
    }
  });

  // 重新设置字段值（覆盖之前的默认值）
  mergedConfig.value.fields.forEach((field) => {
    if (field.value !== undefined) {
      formData[field.key] = field.value;
    }
  });

  // 然后执行所有字段的联动逻辑（包括没有默认值的字段）
  Promise.all(
    mergedConfig.value.fields.map(async (field) => {
      const fieldValue = formData[field.key];
      await handleLinkage(field.key, fieldValue);
    }),
  );
};

// 计算可见字段
const visibleFields = computed(() => {
  return mergedConfig.value.fields.filter((field) => {
    // 只检查动态隐藏状态，不检查初始 visible 配置
    // 因为初始 visible 状态已经在 initFormData 中处理过了
    return !hiddenFields.value.has(field.key);
  });
});

// 生成表单校验规则
const formRules = computed(() => {
  const rules = {};

  mergedConfig.value.fields.forEach((field) => {
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
    'date-range-picker': TDateRangePicker,
    'time-picker': TTimePicker,
    upload: TUpload,
    number: TInputNumber,
    slider: TSlider,
    rate: TRate,
    cascader: TCascader,
    'tree-select': TTreeSelect,
    transfer: TTransfer,
    'auto-complete': TAutoComplete,
    'color-picker': TColorPicker,
    'tag-input': TTagInput,
    'range-input': TRangeInput,
  };

  return baseComponentMap[type] || getCustomComponent(type) || TInput;
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
    return createComponentDecorator(decorator, value, decoratorId);
  }

  // 文本和HTML装饰器使用相同的解析逻辑
  const template = type === 'html' ? '<div v-html="parsedContent"></div>' : '<div>{{ parsedContent }}</div>';
  return {
    template,
    computed: {
      parsedContent() {
        return parseDecoratorContent(content, value);
      },
    },
  };
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
  const component = getFieldComponent(content) || content;

  // 返回响应式组件包装器
  return {
    setup() {
      return {
        decoratorState: decoratorStates[decoratorId],
        actualComponent: component || 'div',
      };
    },
    template: `<component v-if="decoratorState.visible" :is="actualComponent" v-bind="decoratorState.props" />`,
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
  formData,
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

// 处理联动逻辑
const handleLinkage = async (changedKey, changedValue) => {
  const context = createFormContext();

  // 执行联动逻辑的通用函数
  const executeLinkage = async (linkages, fieldKey, errorPrefix) => {
    for (const linkage of linkages) {
      if (linkage.watchField !== changedKey) continue;

      try {
        if (typeof linkage.action !== 'function') {
          throw new Error(`${errorPrefix} action 不是函数: ${typeof linkage.action}`);
        }
        await linkage.action(changedValue, context);
      } catch (error) {
        console.error(`❌ ${errorPrefix}执行失败: ${fieldKey}`, error);
        emit('error', { field: fieldKey, error });
      }
    }
  };

  // 处理字段和装饰器的联动
  for (const field of mergedConfig.value.fields) {
    if (field.linkage) {
      await executeLinkage(field.linkage, field.key, '联动');
    }

    // 处理装饰器联动
    const decorators = [field.topDecorator, field.beforeDecorator, field.afterDecorator, field.bottomDecorator];
    for (const decorator of decorators) {
      if (decorator?.linkage) {
        await executeLinkage(decorator.linkage, field.key, '装饰器联动');
      }
    }
  }
};

// 表单提交
const handleSubmit = async (e) => {
  let res = await formRef.value.validate(); // 校验通过返回 true；不通过，返回对象，例如 { name: [ { result: false, message: 'xxx' } ] }
  if (res === true) {
    emit('submit', { ...formData }); // 只有 formData 是被代理的，展开之后没有响应性了
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
  mergedConfig.value.fields.forEach((field) => {
    if (field.visible === false) {
      hiddenFields.value.add(field.key);
    }
    if (field.disabled === true) {
      disabledFields.value.add(field.key);
    }
  });

  // 按字段顺序恢复数据，支持多级联动
  for (const field of mergedConfig.value.fields) {
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
  validate: () => formRef.value?.validate(),
  resetFields: handleReset,
  getFieldsValue: () => ({ ...formData }),
  setFieldsValue: (values) => Object.assign(formData, values),
  getFieldValue: (key) => formData[key],
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
  () => mergedConfig.value,
  () => {
    initFormData();
  },
  { deep: true },
);
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
