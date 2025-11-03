<template>
  <t-form
    ref="formRef"
    :data="formData"
    :layout="mergedConfig.layout"
    :label-width="mergedConfig.labelWidth"
    :label-align="mergedConfig.labelAlign"
    :colon="mergedConfig.colon"
    :rules="formRules"
    class="form"
    :class="[
      {
        'form--grid': mergedConfig.fields.length >= 4,
        'form--vertical': mergedConfig.layout === 'vertical',
      },
      mergedConfig.class,
    ]"
    :style="mergedConfig.style"
  >
    <template v-for="field in visibleFields">
      <div style="display: flex; flex-direction: column">
        <!-- 上置装饰（支持单个装饰器或装饰器数组） -->
        <template v-if="field.topDecorator">
          <component
            v-for="(decorator, index) in normalizeDecorators(field.topDecorator)"
            :key="`top-${index}`"
            :is="
              renderDecorator({
                decorator,
                fieldValue: formData[field.key],
                fieldKey: field.key,
                position: 'top',
                index,
              })
            "
          />
        </template>

        <div style="display: flex">
          <!-- 前置装饰（支持单个装饰器或装饰器数组） -->
          <template v-if="field.beforeDecorator">
            <component
              v-for="(decorator, index) in normalizeDecorators(field.beforeDecorator)"
              :key="`before-${index}`"
              :is="
                renderDecorator({
                  decorator,
                  fieldValue: formData[field.key],
                  fieldKey: field.key,
                  position: 'before',
                  index,
                })
              "
            />
          </template>

          <!-- form-item、普通组件都有 help（有状态着色）、可重置 -->
          <!-- 表单字段 -->
          <t-form-item
            :name="field.key"
            :label="field.label"
            :help="parseHelpContent(field.help, formData[field.key])"
            v-bind="field.formItemProps || {}"
          >
            <!-- 表单字段组件 -->
            <component
              :is="getFieldComponent(field.type)"
              v-model="formData[field.key]"
              :placeholder="field.placeholder"
              :disabled="disabledFields[field.key]"
              v-bind="field.props"
              @change="(value) => handleFieldChange(field.key, value)"
            >
              <!-- 选项类组件的选项渲染 -->
              <template v-if="['select', 'radio', 'checkbox'].includes(field.type)">
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
          <!-- 后置装饰（支持单个装饰器或装饰器数组） -->
          <template v-if="field.afterDecorator">
            <component
              v-for="(decorator, index) in normalizeDecorators(field.afterDecorator)"
              :key="`after-${index}`"
              :is="
                renderDecorator({
                  decorator,
                  fieldValue: formData[field.key],
                  fieldKey: field.key,
                  position: 'after',
                  index,
                })
              "
            />
          </template>
        </div>

        <!-- 下置装饰（支持单个装饰器或装饰器数组） -->
        <template v-if="field.bottomDecorator">
          <component
            v-for="(decorator, index) in normalizeDecorators(field.bottomDecorator)"
            :key="`bottom-${index}`"
            :is="
              renderDecorator({
                decorator,
                fieldValue: formData[field.key],
                fieldKey: field.key,
                position: 'bottom',
                index,
              })
            "
          />
        </template>
      </div>
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
  </t-form>
</template>

<script setup>
import { h } from 'vue';
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
    class: '', // 自定义类名
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

// 隐藏的字段映射 - { [key]: true }
const hiddenFields = ref({});
// 禁用的字段映射 - { [key]: true }
const disabledFields = ref({});
// 动态选项映射
const dynamicOptions = ref({});
// 装饰器状态映射 - 用于存储动态装饰器的props和状态
const decoratorStates = ref({});
// 联动索引 - watchField -> linkage[] 的映射，用于快速查找联动逻辑
const linkageIndex = ref({});

// 构建联动索引 - 将 watchField -> linkage[] 的映射预先建立好
const buildLinkageIndex = () => {
  linkageIndex.value = {};
  const positions = ['topDecorator', 'beforeDecorator', 'afterDecorator', 'bottomDecorator'];

  mergedConfig.value.fields.forEach((field) => {
    // 处理字段联动
    if (field.linkage) {
      field.linkage.forEach((linkage) => {
        const watchField = linkage.watchField;
        if (!watchField) return;

        if (!linkageIndex.value[watchField]) {
          linkageIndex.value[watchField] = [];
        }
        linkageIndex.value[watchField].push({
          linkage,
          fieldKey: field.key,
          errorPrefix: '联动',
          type: 'field',
        });
      });
    }

    // 处理装饰器联动（支持数组）
    positions.forEach((pos) => {
      const decoratorConfig = field[pos];
      if (!decoratorConfig) return;

      const decorators = Array.isArray(decoratorConfig) ? decoratorConfig : [decoratorConfig];
      decorators.forEach((decorator, index) => {
        if (!decorator?.linkage) return;

        decorator.linkage.forEach((linkage) => {
          const watchField = linkage.watchField;
          if (!watchField) return;

          if (!linkageIndex.value[watchField]) {
            linkageIndex.value[watchField] = [];
          }
          linkageIndex.value[watchField].push({
            linkage,
            fieldKey: field.key,
            errorPrefix: '装饰器联动',
            type: 'decorator',
            position: pos,
            index,
          });
        });
      });
    });
  });
};

// 初始化表单数据
const initFormData = () => {
  // 重置状态
  hiddenFields.value = {};
  disabledFields.value = {};
  Object.keys(dynamicOptions.value).forEach((key) => delete dynamicOptions.value[key]);

  // 构建联动索引（优先执行，因为后续会用到）
  buildLinkageIndex();

  // 单次遍历：初始化隐藏/禁用、默认值与装饰器状态
  const positions = ['topDecorator', 'beforeDecorator', 'afterDecorator', 'bottomDecorator'];
  mergedConfig.value.fields.forEach((field) => {
    // 隐藏/禁用
    if (field.visible === false) hiddenFields.value[field.key] = true;
    if (field.disabled === true) disabledFields.value[field.key] = true;

    // 默认值
    if (field.value !== undefined) {
      formData[field.key] = field.value;
    }

    // 装饰器状态初始化（仅组件型，支持数组）
    positions.forEach((pos) => {
      const decorator = field[pos];
      if (!decorator) return;

      // 支持单个装饰器或装饰器数组
      const decorators = Array.isArray(decorator) ? decorator : [decorator];
      decorators.forEach((dec, index) => {
        const { type = 'html', props: decoratorProps = {} } = dec;
        const decoratorId = `${field.key}_${pos.replace('Decorator', '')}_${index}`;
        if (!decoratorStates.value[decoratorId]) {
          decoratorStates.value[decoratorId] = {
            props: { ...decoratorProps },
            visible: true,
            type,
          };
        }
      });
    });
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
  const fields = mergedConfig.value.fields.filter((field) => {
    return !hiddenFields.value[field.key];
  });

  return fields;
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
  return dynamicOptions.value[field.key] || field.options || [];
};

// 规范化装饰器：将单个装饰器或装饰器数组统一转换为数组
const normalizeDecorators = (decorator) => {
  if (!decorator) return [];
  return Array.isArray(decorator) ? decorator : [decorator];
};

// 渲染装饰器（支持文本、HTML 和组件三种类型）
const renderDecorator = ({ decorator, fieldValue, fieldKey, position, index = 0 }) => {
  if (!decorator) return;

  const { type = 'html', value, props: decoratorProps = {} } = decorator;
  const decoratorId = `${fieldKey}_${position}_${index}`;

  // 按 HTML 渲染：无 type、text 或 html
  if (['html', 'text'].includes(type)) {
    // 使用 h() 函数创建组件（函数式组件），透传 decorator.props
    // component is 文档提到直接 引入组件，直接打印一个组件，显示有 render、setup；
    // h 返回的是虚拟 dom 定义，也能用

    return () => {
      // 每次渲染时解析内容，以支持动态字段值
      const parsedContent = parseDecoratorContent(value, fieldValue);

      // 统一通过 props 传递所有属性（包括 class 和 style）
      const baseProps = { ...decoratorProps };

      // HTML 类型：使用 innerHTML 渲染 HTML 字符串
      if (type === 'html') {
        return h('div', { ...baseProps, innerHTML: parsedContent });
      }

      // 文本类型：直接渲染文本内容
      return h('div', baseProps, parsedContent);
    };
  }

  // 渲染组件型装饰器：装饰器状态已在配置遍历阶段初始化
  const component = getCustomComponent(type) || getFieldComponent(type) || 'div';
  return () => {
    const decoratorState = decoratorStates.value[decoratorId];
    if (!decoratorState || !decoratorState.visible) return;

    // 直接使用初始化时已合并好的 props
    return h(component, decoratorState.props);
  };
};
// 解析装饰器 value 中的模板变量
const parseDecoratorContent = (content, fieldValue) => {
  if (!content) return content;
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key === 'value') {
      return fieldValue !== undefined ? String(fieldValue) : '';
    }
    return match;
  });
};

// 解析 help 内容（支持模板变量）
const parseHelpContent = (help, value) => {
  if (!help) return help;
  return help.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key === 'value') {
      return value !== undefined && value !== null && value !== '' ? String(value) : '未选择';
    }
    return match;
  });
};

// API调用函数 - 支持两种方式：
// 1. 直接传入 Promise 函数: callApi(() => request({ ... }))
// 2. 传入配置对象: callApi({ url, method, ... }, params) - 内部会调用项目封装的 request
const callApi = async (apiPromiseOrConfig, params) => {
  try {
    // 方式1: 如果传入的是函数，直接执行并返回 Promise
    if (typeof apiPromiseOrConfig === 'function') {
      const result = await apiPromiseOrConfig(params);
      return result;
    }

    // 方式2: 如果传入的是配置对象，使用项目封装的 request
    const { transform, ...requestConfig } = apiPromiseOrConfig;

    // 处理参数：根据请求方法决定使用 params 还是 data
    const method = requestConfig.method?.toLowerCase() || 'get';
    const config = {
      ...requestConfig,
      ...(method === 'get'
        ? { params: { ...requestConfig.params, ...params } }
        : { data: params || requestConfig.data }),
    };

    // 动态导入 request，避免循环依赖
    const request = (await import('@/utils/request')).default;
    const result = await request(config);

    // 如果有 transform 函数，对结果进行转换
    return transform ? transform(result) : result;
  } catch (error) {
    console.error('❌ API调用错误:', error);
    throw error;
  }
};
// 联动逻辑：提供表单操作方法，控制其他表单项的显示、隐藏
const createFormContext = () => ({
  formData,
  showField: (fieldKey) => {
    delete hiddenFields.value[fieldKey];
  },
  hideField: (fieldKey) => {
    hiddenFields.value[fieldKey] = true;
  },
  enableField: (fieldKey) => {
    delete disabledFields.value[fieldKey];
  },
  disableField: (fieldKey) => {
    disabledFields.value[fieldKey] = true;
  },
  setFieldValue: (fieldKey, value) => {
    formData[fieldKey] = value;
  },
  setFieldOptions: (fieldKey, options) => {
    dynamicOptions.value[fieldKey] = options;
  },
  callApi: async (apiConfig, params) => {
    return await callApi(apiConfig, params);
  },
  // 装饰器操作方法（支持数组形式装饰器，index 可选，默认为 0）
  updateDecoratorProps: (fieldKey, position, props, index = 0) => {
    const decoratorId = `${fieldKey}_${position}_${index}`;
    if (decoratorStates.value[decoratorId]) {
      // 创建新对象引用以确保 Vue 检测到变化并触发重新渲染
      decoratorStates.value[decoratorId].props = { ...decoratorStates.value[decoratorId].props, ...props };
    }
  },
  showDecorator: (fieldKey, position, index = 0) => {
    const decoratorId = `${fieldKey}_${position}_${index}`;
    if (decoratorStates.value[decoratorId]) {
      decoratorStates.value[decoratorId].visible = true;
    }
  },
  hideDecorator: (fieldKey, position, index = 0) => {
    const decoratorId = `${fieldKey}_${position}_${index}`;
    if (decoratorStates.value[decoratorId]) {
      decoratorStates.value[decoratorId].visible = false;
    }
  },
});
// 处理字段变化；同步值到 formData，且处理联动逻辑
const handleFieldChange = (key, value) => {
  formData[key] = value;
  emit('change', key, value, { ...formData });

  // 处理联动逻辑
  handleLinkage(key, value);
};
// 处理联动逻辑 - 使用预建的索引直接查找，避免遍历所有字段
const handleLinkage = async (changedKey, changedValue) => {
  const context = createFormContext();

  // 从索引中直接获取匹配的联动逻辑
  const matchedLinkages = linkageIndex.value[changedKey] || [];

  // 执行所有匹配的联动逻辑
  for (const { linkage, fieldKey, errorPrefix } of matchedLinkages) {
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
  hiddenFields.value = {};
  disabledFields.value = {};
  Object.keys(dynamicOptions.value).forEach((key) => delete dynamicOptions.value[key]);

  // 设置初始状态
  mergedConfig.value.fields.forEach((field) => {
    if (field.visible === false) hiddenFields.value[field.key] = true;
    if (field.disabled === true) disabledFields.value[field.key] = true;
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
