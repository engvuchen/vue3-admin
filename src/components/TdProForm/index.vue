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
    <template v-for="field in visibleFields" :key="field.name">
      <div style="display: flex; flex-direction: column">
        <!-- 上置装饰（支持单个装饰器或装饰器数组） -->
        <template v-if="field.topDecorator">
          <component
            v-for="(decorator, index) in field.topDecorator"
            :key="`top-${index}`"
            :is="
              renderDecorator({
                decorator,
                fieldValue: formData[field.name],
                fieldName: field.name,
                position: 'top',
                index,
              })
            "
          />
        </template>

        <div style="display: flex">
          <!-- 左置装饰（支持单个装饰器或装饰器数组） -->
          <template v-if="field.leftDecorator">
            <component
              v-for="(decorator, index) in field.leftDecorator"
              :key="`left-${index}`"
              :is="
                renderDecorator({
                  decorator,
                  fieldValue: formData[field.name],
                  fieldName: field.name,
                  position: 'left',
                  index,
                })
              "
            />
          </template>

          <!-- 表单字段 -->
          <t-form-item
            :name="field.name"
            :label="field.label"
            :help="parseHelpContent(field.help, formData[field.name])"
            v-bind="field.formItemProps || {}"
          >
            <!-- 表单字段组件 -->
            <component
              :is="getFieldComponent(field.component)"
              v-model="formData[field.name]"
              :placeholder="field.placeholder"
              :disabled="disabledFields[field.name]"
              :class="field.class"
              :style="field.style"
              :options="getFieldOptions(field)"
              v-bind="field.componentProps"
              @change="
                (value) => {
                  handleFieldChange(field.name, value);
                }
              "
              :key="`field-${field.name}`"
            />
          </t-form-item>
          <!-- 右置装饰（支持单个装饰器或装饰器数组） -->
          <template v-if="field.rightDecorator">
            <component
              v-for="(decorator, index) in field.rightDecorator"
              :key="`right-${index}`"
              :is="
                renderDecorator({
                  decorator,
                  fieldValue: formData[field.name],
                  fieldName: field.name,
                  position: 'right',
                  index,
                })
              "
            />
          </template>
        </div>

        <!-- 下置装饰（支持单个装饰器或装饰器数组） -->
        <template v-if="field.bottomDecorator">
          <component
            v-for="(decorator, index) in field.bottomDecorator"
            :key="`bottom-${index}`"
            :is="
              renderDecorator({
                decorator,
                fieldValue: formData[field.name],
                fieldName: field.name,
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
      <t-form-item class="btn-group" v-if="mergedConfig.showSubmit || mergedConfig.showReset">
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
import { getCustomComponent } from './componentMap';
import { clsItemToField } from './translateFromCls';

// Props
const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
});
// Emits
const emit = defineEmits(['submit', 'reset', 'change', 'error']);

// cls -> mergedConfig -> ui 表现、数据

// 实际表单配置 （CLS 外部 → 内部统一结构）
const mergedConfig = computed(() => {
  // 字段层 items → fields
  const fields = (props.config.items || []).map(clsItemToField);
  return {
    layout: 'vertical',
    labelWidth: '120px',
    labelAlign: 'right',
    colon: true,
    class: '',
    style: {},
    showSubmit: true,
    showReset: true,
    submitText: '提交',
    resetText: '重置',
    ...(props.config.attributes || {}),
    fields,
  };
});

// 1. ui 表现
const disabledFields = ref({}); // 禁用的字段
const hiddenFields = ref({}); // 隐藏的字段
const visibleFields = computed(() =>
  mergedConfig.value.fields.filter((field) => {
    return !hiddenFields.value[field.name];
  }),
);

// 2. 表单默认值
const formRef = ref();
const formData = reactive({});
const initFormData = () => {
  mergedConfig?.value?.fields?.forEach?.((field) => {
    if (field.value !== undefined) {
      formData[field.name] = field.value;
    } else {
      // 为特定组件类型设置默认值（数组类型组件）
      const arrayComponentTypes = ['date-range-picker', 'checkbox', 'transfer', 'tag-input', 'range-input'];
      if (arrayComponentTypes.includes(field.component)) {
        formData[field.name] = [];
      }
    }
  });
};
initFormData();

// 联动
const linkageIndex = ref({}); // 联动索引 - watchField -> linkage[] 的映射，用于快速查找联动逻辑
const dynamicOptions = ref({}); // 联动动态选项
const decoratorStates = ref({}); // 装饰器状态 - 用于存储动态装饰器的props和状态
const nameToType = ref({}); // name 到类型的映射表 - 记录每个 name 是 'field' 还是 'decorator'

// 校验名称冲突（字段或装饰器），存在则抛错
const isNameUsed = (name, allNames) => {
  const existing = allNames.get(name);
  if (existing) {
    console.error(`❌ name 冲突: "${name}" 已被 ${existing.type === 'field' ? '表单项' : '装饰器'} 使用`);
    // throw new Error(`name 冲突: "${name}" 已被使用`);
    return true;
  }
};

// 初始化
onMounted(() => {
  init();
});
// 监听配置变化
watch(
  () => mergedConfig.value,
  () => {
    init();
  },
  { deep: true },
);

// 初始化：状态字段、表单数据、装饰器数据
const init = () => {
  // 初始化隐藏/禁用、默认值与装饰器状态

  hiddenFields.value = {};
  disabledFields.value = {};
  dynamicOptions.value = {};
  nameToType.value = {};
  decoratorStates.value = {};

  // 第一步：收集所有 name，检测冲突
  const allNames = new Map(); // name -> { type, fieldName, position, index }

  mergedConfig.value.fields.forEach((field) => {
    // 收集表单项 name
    if (isNameUsed(field.name, allNames)) return;
    allNames.set(field.name, { type: 'field', fieldName: field.name });

    // 收集装饰器 name
    const positions = ['topDecorator', 'leftDecorator', 'rightDecorator', 'bottomDecorator'];
    positions.forEach((pos) => {
      if (!field[pos]?.length) return;

      const positionKey = pos.replace('Decorator', ''); // 'top', 'left', 'right', 'bottom'
      field[pos].forEach((dec, index) => {
        const { name: decoratorName, type: decoratorType = 'html', props: decoratorProps = {} } = dec;

        const decoratorId = decoratorName || `${field.name}_${positionKey}_${index}`;

        // 检测装饰器 name 冲突
        if (isNameUsed(decoratorName, allNames)) return;
        allNames.set(decoratorName, {
          type: 'decorator',
          fieldName: field.name,
        });

        // 如果装饰器有 name，建立映射关系
        if (decoratorName) {
          nameToType.value[decoratorName] = 'decorator';
        }

        // 存储装饰器信息
        if (!decoratorStates.value[decoratorId]) {
          decoratorStates.value[decoratorId] = {
            props: { ...decoratorProps },
            visible: true,
            type: decoratorType,
          };
        }
      });
    });
  });

  // 第二步：建立表单项 name 映射
  mergedConfig.value.fields.forEach((field) => {
    nameToType.value[field.name] = 'field';

    // 隐藏/禁用
    if (field.hide === true) hiddenFields.value[field.name] = true;
    if (field.disabled === true) disabledFields.value[field.name] = true;

    // formData 默认值
    if (field.value !== undefined) formData[field.name] = field.value;
  });

  // 构建联动索引
  buildLinkageIndex();
  // 执行所有联动逻辑
  Promise.all(
    mergedConfig.value.fields.map(async (field) => {
      const fieldValue = formData[field.name];
      await handleLinkage(field.name, fieldValue);
    }),
  );
};
// 批量添加联动索引项（处理 linkage 数组）
const addLinkageIndexItems = ({ linkages, fieldName, errorPrefix }) => {
  if (!Array.isArray(linkages)) return;

  linkages.forEach((linkage) => {
    let watchField = linkage.watchField;
    if (watchField) {
      if (!linkageIndex.value[watchField]) linkageIndex.value[watchField] = [];

      linkageIndex.value[watchField].push({
        linkage,
        fieldName,
        errorPrefix,
      });
    }
  });
};
// 构建联动索引 - 将 watchField -> linkage[] 的映射预先建立
const buildLinkageIndex = () => {
  linkageIndex.value = {};

  mergedConfig.value.fields.forEach((field) => {
    // 处理字段的联动
    if (field?.linkage) {
      addLinkageIndexItems({ linkages: field.linkage, fieldName: field.name, errorPrefix: '联动' });
    }

    // 处理装饰器的联动
    // [ { linkage: [ ... ] } ]
    [field?.topDecorator, field?.leftDecorator, field?.rightDecorator, field?.bottomDecorator].forEach((decorators) => {
      decorators?.forEach((decorator) => {
        if (decorator?.linkage) {
          addLinkageIndexItems({
            linkages: decorator.linkage,
            fieldName: field.name,
            errorPrefix: '装饰器联动',
          });
        }
      });
    });
  });
};

// 生成表单校验规则
const formRules = computed(() => {
  const rules = {};

  mergedConfig.value.fields.forEach((field) => {
    if (field.rules && field.rules.length > 0) {
      rules[field.name] = field.rules.map((rule) => ({
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
    button: TButton,
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
// 获取字段选项
const getFieldOptions = (field) => {
  return dynamicOptions.value[field.name] || field.items || [];
};

// 渲染装饰器（支持文本、HTML、组件）
const renderDecorator = ({ decorator, fieldValue, fieldName, position, index = 0 }) => {
  if (!decorator) return;

  const { name: decoratorName, type = 'html', value, props: decoratorProps = {} } = decorator;
  // 如果装饰器有 name，使用 name；否则使用自动生成的 ID（与初始化逻辑保持一致）
  const decoratorId = decoratorName || `${fieldName}_${position}_${index}`;

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

/**
 * 1. cls -> mergedConfig -> ui 表现、数据
 * 2. 表单项 name 不可重复的
 *
 * todo
 * 1. config 改变，是否改变 mergedConfig?
 *    1. 猜想：config.value 整个改就会，改里面的内容不会；
 *    2. 🟩 通过 form api 改？功能只有控制 decorator 的；语义上只想要 setValue、show、hide
 *    3. 开发的需求是啥？
 *        1. 控制项的 隐藏
 *        2. 修改 label ？
 *        3. 是否校验；直接隐藏就行
 *
 * 3. change 是用户输入，第一个派发点要完成所有联动任务
 *    1. 在 table-pro-table-demo 页，补充 查询指定用户指定角色的所有资源 的功能，接口在项目里；用 TdProForm 实现
 *
 * 4. callApi 是否有必要，可以直接从外部传入接口吗？直接传，去掉了
 * 
*  linkage: [
      {
        watchField: 'topic',
        action: (value, { updateDecoratorProps }) => {
          getRoleList() // demo 页的接口
        },
      },
    ],
 *
 * 5. restoreData 、init 合并多余内容
 *
 * 6. 验证联动逻辑
 */

// 联动逻辑：提供表单操作方法，控制其他表单项的显示、隐藏
const getItemType = (name) => {
  return nameToType.value[name] || null;
};

// 统一的表单操作方法（共享实现，避免重复代码）
const contextMethods = {
  // 显示：支持表单项和装饰器
  show: (name) => {
    const itemType = getItemType(name);
    if (itemType === 'decorator') {
      if (decoratorStates.value[name]) {
        decoratorStates.value[name].visible = true;
      }
    } else if (itemType === 'field') {
      delete hiddenFields.value[name];
    } else {
      console.warn(`未找到 name 为 "${name}" 的表单项或装饰器`);
    }
  },
  // 隐藏：支持表单项和装饰器
  hide: (name) => {
    const itemType = getItemType(name);
    if (itemType === 'decorator') {
      if (decoratorStates.value[name]) {
        decoratorStates.value[name].visible = false;
      }
    } else if (itemType === 'field') {
      hiddenFields.value[name] = true;
    } else {
      console.warn(`未找到 name 为 "${name}" 的表单项或装饰器`);
    }
  },
  // 启用：支持表单项和装饰器（装饰器通过显示来"启用"）
  enableItem: (name) => {
    const itemType = getItemType(name);
    if (itemType === 'decorator') {
      if (decoratorStates.value[name]) {
        decoratorStates.value[name].visible = true;
      }
    } else if (itemType === 'field') {
      delete disabledFields.value[name];
    } else {
      console.warn(`未找到 name 为 "${name}" 的表单项或装饰器`);
    }
  },
  // 禁用：支持表单项和装饰器（装饰器通过隐藏来"禁用"）
  disabledItem: (name) => {
    const itemType = getItemType(name);
    if (itemType === 'decorator') {
      if (decoratorStates.value[name]) {
        decoratorStates.value[name].visible = false;
      }
    } else if (itemType === 'field') {
      disabledFields.value[name] = true;
    } else {
      console.warn(`未找到 name 为 "${name}" 的表单项或装饰器`);
    }
  },
  // 更新：支持表单项和装饰器的属性更新
  updateItem: (name, updates) => {
    const itemType = getItemType(name);
    if (itemType === 'decorator') {
      if (decoratorStates.value[name]) {
        decoratorStates.value[name].props = {
          ...decoratorStates.value[name].props, // 这个是平铺的
          ...updates, // 会直接覆盖{ hide }
        };
      }
    } else if (itemType === 'field') {
      console.warn('表单项属性更新功能暂未实现');
    } else {
      console.warn(`未找到 name 为 "${name}" 的表单项或装饰器`);
    }
  },
  // 设置值：仅支持表单项
  setValue: (fieldKey, value) => {
    formData[fieldKey] = value;
  },
  // 设置选项：仅支持表单项
  setOptions: (fieldKey, options) => {
    dynamicOptions.value[fieldKey] = options;
  },
  // API 调用
  callApi: async (apiConfig, params) => {
    return await callApi(apiConfig, params);
  },
};

const createFormContext = () => ({
  formData,
  ...contextMethods,
});
// 处理字段变化；同步值到 formData，且处理联动逻辑
const handleFieldChange = (name, value) => {
  formData[name] = value;
  emit('change', name, value, { ...formData });

  handleLinkage(name, value);
};
// 处理联动逻辑 - 使用预建的索引直接查找，避免遍历所有字段
const handleLinkage = async (changedName, changedValue) => {
  const context = createFormContext();

  const matchedLinkages = linkageIndex.value[changedName] || [];
  for (const { linkage, fieldName, errorPrefix } of matchedLinkages) {
    try {
      if (typeof linkage.action !== 'function') {
        throw new Error(`${errorPrefix} action 不是函数: ${typeof linkage.action}`);
      }
      await linkage.action(changedValue, context);
    } catch (error) {
      console.error(`❌ ${errorPrefix}执行失败: ${fieldName}`, error);
      emit('error', { field: fieldName, error });
    }
  }
};

// 表单提交
const handleSubmit = async (e) => {
  let res = await formRef.value.validate(); // 校验通过返回 true；不通过，返回对象，例如 { name: [ { result: false, message: 'xxx' } ] }
  if (res === true) emit('submit', { ...formData }); // 只有 formData 是被代理的，展开之后没有响应性了
};
// 表单重置
const handleReset = () => {
  formRef.value?.reset();
  init();
  emit('reset');
};
// 数据恢复
const restoreData = async (data) => {
  // 先清空当前数据
  Object.keys(formData).forEach((key) => {
    formData[key] = undefined;
  });

  hiddenFields.value = {};
  disabledFields.value = {};
  dynamicOptions.value = {};
  mergedConfig.value.fields.forEach((field) => {
    if (field.hide === true) hiddenFields.value[field.name] = true;
    if (field.disabled === true) disabledFields.value[field.name] = true;
  });

  // 按字段顺序恢复数据，支持多级联动
  for (const field of mergedConfig.value.fields) {
    if (data[field.name] !== undefined) {
      formData[field.name] = data[field.name];

      // 触发联动逻辑
      await new Promise((resolve) => {
        setTimeout(async () => {
          await handleLinkage(field.name, data[field.name]);
          resolve();
        }, 50); // 小延迟确保联动按顺序执行
      });
    }
  }
};

// 表单实例方法
const formInstance = {
  // 核心表单能力
  validate: () => formRef.value?.validate(),
  resetFields: handleReset,
  getFieldsValue: () => ({ ...formData }),
  setFieldsValue: (values) => Object.assign(formData, values),
  getFieldValue: (key) => formData[key],
  setFieldValue: (key, value) => {
    formData[key] = value;
  },
  restoreData,

  // 与 createFormContext 对齐的统一 API（共享实现）
  ...contextMethods,
};
// 暴露表单实例
defineExpose(formInstance);
// 提供表单实例给子组件
provide('formInstance', formInstance);
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
