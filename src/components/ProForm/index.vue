<template>
  <el-form
    ref="form"
    class="form"
    label-position="left"
    :model="formModal"
    :rules="formRules"
    :inline="true"
    :label-width="config.labelWidth"
  >
    <el-form-item v-for="item in config.fields" :key="item.name" :label="item.label" :prop="item.name">
      <!-- custom -->
      <slot v-if="item.component === 'custom'" :name="item.slot" />
      <!-- select -->
      <el-select
        clearable
        value-key="value"
        v-else-if="item.component === 'select'"
        v-model="formModal[item.name]"
        :filterable="!!item?.attributes?.filterable"
        :multiple="!!item?.attributes?.multiple"
        :placeholder="item.label"
        :style="{ width: config.inputWidth, ...item?.attributes?.style }"
      >
        <!-- 远程不可能写死，但写死的配置又需要翻译。选项的翻译，业务处理 -->
        <el-option
          v-for="option of item.items"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        ></el-option>
      </el-select>
      <!-- radio -->
      <el-radio-group
        v-model="formModal[item.name]"
        v-else-if="item.component === 'radio'"
        :style="{ width: config.inputWidth, ...item?.attributes?.style }"
      >
        <el-radio v-for="option of item.items" :key="option.value" :label="option.value">
          {{ $t(option.label) }}
        </el-radio>
      </el-radio-group>
      <!-- radio-button -->
      <el-radio-group
        v-model="formModal[item.name]"
        v-else-if="item.component === 'radio-button'"
        :style="{ width: config.inputWidth, ...item?.attributes?.style }"
      >
        <el-radio-button v-for="option of item.items" :key="option.value" :label="option.value">
          {{ $t(option.label) }}
        </el-radio-button>
      </el-radio-group>
      <!-- checkbox -->
      <el-checkbox-group
        v-model="formModal[item.name]"
        v-else-if="item.component === 'checkbox'"
        :style="{ width: config.inputWidth, ...item?.attributes?.style }"
      >
        <el-checkbox v-for="option of item.items" :key="option.value" :label="option.value">
          {{ $t(option.label) }}
        </el-checkbox>
      </el-checkbox-group>
      <!-- checkbox-button -->
      <el-checkbox-group
        v-model="formModal[item.name]"
        v-else-if="item.component === 'checkbox-button'"
        :style="{ width: config.inputWidth, ...item?.attributes?.style }"
      >
        <el-checkbox-button v-for="option of item.items" :key="option.value" :label="option.value">
          {{ $t(option.label) }}
        </el-checkbox-button>
      </el-checkbox-group>
      <!-- date -->
      <el-date-picker
        v-else-if="item.component === 'date'"
        v-model="formModal[item.name]"
        type="date"
        format="YYYY-MM-DD"
        clearable
        @change="handleDateChange($event, item, 'YYYY-MM-DD')"
        :placeholder="$t(item.label)"
        :style="{ width: config.inputWidth, ...item?.attributes?.style }"
      ></el-date-picker>
      <!-- datatime -->
      <el-date-picker
        v-else-if="item.component === 'datetime'"
        v-model="formModal[item.name]"
        type="datetime"
        clearable
        @change="handleDateChange($event, item, 'YYYY-MM-DD HH:mm:ss')"
        format="YYYY-MM-DD HH:mm:ss"
        :placeholder="$t(item.label)"
        :style="{ width: config.inputWidth, ...item?.attributes?.style }"
      ></el-date-picker>
      <!-- daterange -->
      <el-date-picker
        v-else-if="item.component === 'daterange'"
        v-model="formModal[item.name]"
        type="daterange"
        format="YYYY-MM-DD"
        range-separator="-"
        :start-placeholder="$t('public.startdate')"
        :end-placeholder="$t('public.enddate')"
        clearable
        @change="handleRangeChange($event, item, 'YYYY-MM-DD')"
        :style="{ ...item?.attributes?.style }"
      ></el-date-picker>
      <!-- datatimerange -->
      <el-date-picker
        v-else-if="item.component === 'datetimerange'"
        v-model="formModal[item.name]"
        type="datetimerange"
        format="YYYY-MM-DD HH:mm:ss"
        range-separator="-"
        :start-placeholder="$t('public.starttime')"
        :end-placeholder="$t('public.endtime')"
        clearable
        @change="handleRangeChange($event, item, 'YYYY-MM-DD HH:mm:ss')"
        :style="{ ...item?.attributes?.style }"
      ></el-date-picker>
      <!-- number -->
      <el-input-number
        v-else-if="item.component === 'number'"
        v-model="formModal[item.name]"
        :placeholder="item.label"
        controls-position="right"
        :min="item.min"
        :max="item.max"
        :style="{ width: config.inputWidth, ...item?.attributes?.style }"
      />
      <!-- textarea -->
      <el-input
        v-else-if="item.component === 'textarea'"
        :maxlength="item.maxlength"
        type="textarea"
        clearable
        v-model="formModal[item.name]"
        :placeholder="item.label"
        :style="{ width: config.inputWidth, ...item?.attributes?.style }"
      >
      </el-input>
      <!-- input -->
      <el-input
        v-else
        :maxlength="item.maxlength"
        v-model="formModal[item.name]"
        clearable
        :placeholder="item.label"
        :style="{ width: config.inputWidth, ...item?.attributes?.style }"
      >
      </el-input>
    </el-form-item>
    <div class="btn-group">
      <el-button @click="onCancel">
        {{ $t('public.cancel') }}
      </el-button>
      <el-button type="primary" @click="onSubmit">
        {{ $t('public.confirm') }}
      </el-button>
    </div>
  </el-form>
</template>
<script setup>
import { defineProps, defineEmits, ref, reactive, toRaw } from 'vue';

const props = defineProps({
  /**
   * todo 用到哪个，抽象到哪个
 * {
      labelWidth: '90px',
      inputWidth: '200px',
      fields: [
        {
          type: 'text',
          label: 'user/resource.name',
          name: 'name',
          style,
          attributes: { filterable, multiple },
          validity: { required }
        },
      ],
    },
 */
  config: {
    type: Object,
    default: {},
  },
  submit: {
    type: String,
    default: '',
  },
});
const emit = defineEmits(['submit', 'cancel']);

const form = ref(null);
// 处理 field.validity
const initFormRules = (fields) => {
  let rules = {};

  fields.forEach((curr) => {
    let { name = '', validity = [] } = curr;
    if (!name) return;
    Object.assign((rules[name] = []), [], validity); //
  });

  return rules;
};
// 返回表单数据。对 checkbox、datarange 有特殊处理。剔除 fields 中 hide=true 的项。formModal 只是空对象，但有响应。。。
const initFormModel = (config) => {
  const formModal = {};

  // hide 的表单项，添加到 formModal
  config.fields = config.fields.filter((curr) => {
    if (curr.attributes.hide) {
      formModal[curr.name] = '';
      return false;
    }
    return true;
  });
  // 定制部分表单项的值，添加到 formModal
  config.fields?.forEach((item, index) => {
    switch (item.component) {
      case 'checkbox':
      case 'checkbox-button':
        formModal[item.name] = [];
        break;
      default:
        break;
    }

    if (item.value !== undefined) {
      formModal[item.name] = item.value;
      // 日期范围和时间范围真实变量默认值
      if (
        (item.component === 'daterange' || item.component === 'datetimerange') &&
        !!item.trueNames &&
        Array.isArray(item.value)
      ) {
        item.value.forEach((val, index) => {
          formModal[item.trueNames[index]] = val;
        });
      }
    }
  });

  return formModal;
};
// 填充空 value, attributes, validity，防止初始化报错
const paddDefaultValue = (config) => {
  let { fields } = config;
  fields.forEach((item, index) => {
    fields[index] = { attributes: {}, validity: {}, ...item };
  });
};

paddDefaultValue(props.config);
const formModal = reactive(initFormModel(props.config));
const formRules = reactive(initFormRules(props.config.fields));

const onCancel = () => {
  resetFields();

  emit('cancel');
};
const onSubmit = () => {
  form.value.validate((valid) => {
    if (!valid) return;

    emit('submit', toRaw(formModal));
  });
};
const resetFields = () => {
  form.value.resetFields();
  form.value.clearValidate();
};

// 日期范围
const handleDateChange = (date, item, format) => {
  formModal[item.name] = date ? formatDate(date, format) : '';
};
const handleRangeChange = (date, item, format) => {
  const arr = !!date && date.map((d) => formatDate(d, format));
  formModal[item.name] = arr ? arr : [];

  if (!item.trueNames) {
    return;
  }

  if (arr) {
    arr.forEach((val, index) => {
      formModal[item.trueNames[index]] = val;
    });
  } else {
    item.trueNames.forEach((key) => {
      delete formModal[key];
    });
  }
};
const formatDate = (date, format) => {
  let obj = {
    'M+': date.getMonth() + 1,
    'D+': date.getDate(),
    'H+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    'S+': date.getMilliseconds(),
  };
  if (/(y+)/i.test(format)) {
    format = format.replace(RegExp.$1, String(date.getFullYear()).substr(4 - RegExp.$1.length));
  }
  for (let k in obj) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? obj[k] : ('00' + obj[k]).substr(String(obj[k]).length),
      );
    }
  }
  return format;
};

defineExpose({
  formModal,
  resetFields,
});
</script>

<style lang="scss" scoped>
.form {
  width: 100%;
  max-width: 700px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  flex-wrap: wrap;
  padding: 10px 10px 0;
  background: #fff;
  margin-bottom: 40px;

  .el-form-item {
    margin-bottom: 30px;
  }

  .btn-group {
    margin-left: auto;
    margin-right: auto;
  }
  :deep(.el-input-number .el-input__inner) {
    text-align: left;
  }
  :deep(.el-range-editor.el-input__wrapper) {
    box-sizing: border-box;
  }
}
</style>