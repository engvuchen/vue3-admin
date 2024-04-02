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
      <!-- remote-show-suffix -->
      <el-select
        clearable
        value-key="value"
        v-else-if="item.component === 'select'"
        v-model="formModal[item.name]"
        :filterable="!!item?.attributes?.filterable"
        :multiple="!!item?.attributes?.multiple"
        :placeholder="item.label"
        :style="{ width: config.inputWidth, ...item?.attributes?.style }"
        :remote="item?.attributes?.remote"
        :remote-method="(query) => wrapperSelectRemoteMethod(item, query)"
        :loading="item?.attributes?.loading"
      >
        <el-option
          v-for="option in item?.items"
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
      <!-- upload -->
      <template v-else-if="item.component === 'upload'">
        <el-upload
          :action="item?.attributes?.action || '#'"
          :show-file-list="Boolean(item?.attributes?.showFileList)"
          :before-upload="getBeforeUpload(item)"
          :http-request="getUploadImg(formModal, item.name)"
          :on-error="onUploadError"
          class="uploader"
        >
          <img v-if="formModal[item.name]" :src="formModal[item.name]" class="preview" />
          <el-icon v-else class="uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div v-html="item.attributes.help" class="help mr-top--10"></div>
      </template>
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
import { defineProps, defineEmits, ref, toRaw } from 'vue';
import axios from 'axios';
import { HexMD5, b64hamcsha1 } from '@/utils/hash';
import tips from '@/utils/tips';

const props = defineProps({
  /**
   * todo 用到哪个，才抽象到哪个
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
          validity: [ required ]
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
/** 生成 modal，rules */
const walkConfig = (config) => {
  let modal = {};
  let rules = {};

  // hide 的表单项，添加到 modal。视图不渲染
  config.fields = config.fields.filter((curr) => {
    if (curr?.attributes?.hide) {
      modal[curr.name] = curr.value || '';
      return false;
    }
    return true;
  });
  let { fields } = config;
  fields.forEach((item, index) => {
    // 填充空 value, attributes, validity，防止初始化报错
    fields[index] = { attributes: {}, validity: {}, ...item };

    // 处理特殊组件的 value
    switch (item.component) {
      case 'checkbox':
      case 'checkbox-button':
        modal[item.name] = [];
        break;
      default:
        break;
    }
    if (item.value !== undefined) {
      modal[item.name] = item.value;

      // 日期范围和时间范围真实变量默认值
      if (
        (item.component === 'daterange' || item.component === 'datetimerange') &&
        !!item.trueNames &&
        Array.isArray(item.value)
      ) {
        item.value.forEach((val, index) => {
          modal[item.trueNames[index]] = val;
        });
      }
    }

    // 生成 rules
    let { name = '', validity = [] } = item;
    if (!name) return;
    Object.assign((rules[name] = []), [], validity);
  });

  return { modal, rules };
};
const form = ref(null);
const { modal, rules } = walkConfig(toRaw(props.config)); // config 的变化，不再影响 modal
const formModal = ref(modal);
const formRules = ref(rules);

const onCancel = () => {
  resetFields();
  emit('cancel');
};
const onSubmit = () => {
  form.value.validate((valid) => {
    if (!valid) return;

    emit('submit', toRaw(formModal.value));
  });
};
const resetFields = () => {
  form.value.resetFields();
  form.value.clearValidate();
};

const wrapperSelectRemoteMethod = async (item, query) => {
  let hasLoading = item.attributes.loading !== undefined;
  if (hasLoading) item.attributes.loading = true;

  let fn = item?.events?.['remote-method'];

  try {
    let items = await fn(query);
    item.items = items;
  } catch (error) {}

  if (hasLoading) item.attributes.loading = false;
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

/** 校验图片尺寸、大小 */
const getBeforeUpload = (config) => {
  let attrs = toRaw(config)?.attributes || {};
  return (rawFile) => {
    if (!rawFile) return;

    let [, type] = rawFile.type.split('/');
    let { accept = [], size = 0 } = attrs || {};
    if (accept.length && !accept.find((format) => format === type)) {
      tips.error(`Format must be ${accept.join(', ')}`);
      return false;
    }
    if (size && rawFile.size / 1024 / 1024 > size) {
      tips.error(`Size can not exceed ${size}MB!`);
      return false;
    }

    return true;
  };
};
const getUploadImg = (modal, name) => {
  return async (options) => {
    const file = options.file;

    const uploadData = new FormData();

    uploadData.append('file', file);

    // https://help.upyun.com/knowledge-base/form_api/
    const params = {
      bucket: 'engvu-blog-upload',
      username: 'test1',
      password: 'If7wTOZPcD1aXSjWMrsb6aRYwSb7BqBJ',
      path: '/img',
      host: 'http://upload2.engvu.tech',

      // bucket: 'xiaoli-test',
      // username: 'test',
      // password: '0LjHlUNs8n0RWbEPi3c0BB3dOJBkfhwd',
      // path: '/img',
      // testCdnUrl: 'http://xiaoli-test.test.upcdn.net',
      // imgLocalUrl: '',
    };
    /* 计算policy */
    const policyObj = {
      bucket: params.bucket,
      'save-key': `${params.path}/{filename}{.suffix}`,
      expiration: new Date().getTime() + 600 /* 过期时间，在当前时间+10分钟 */,
    };
    const policy = btoa(JSON.stringify(policyObj));

    /* 计算 Authorization */
    const passwordMd5 = HexMD5.MD5(params.password).toString(HexMD5.enc.Hex);
    const authorization = `UPYUN ${params.username}:${b64hamcsha1(passwordMd5, ['POST', `/${params.bucket}`, policy].join('&'))}`; /* [Method-请求方法, URI-请求路径, policy] */

    uploadData.append('policy', policy);
    uploadData.append('authorization', authorization);

    // http://upload2.engvu.tech/img/126x84.png
    let res = await axios({ method: 'POST', url: `https://v0.api.upyun.com/${params.bucket}`, data: uploadData }).catch(
      (e) => {
        tips.error('Upload Error');
        console.error(e);
      },
    );

    if (res?.data?.url) {
      console.log(555, params.host + res.data.url); // todo

      modal[name] = params.host + res.data.url;
    }
  };
};
const onUploadError = async (error) => {
  console.log('🔎 ~ onUploadError ~ error:', error);
};

defineExpose({
  formModal,
  resetFields,
});
</script>

<style lang="scss" scoped>
.form {
  width: 100%;
  min-width: 600px;
  box-sizing: border-box;
  padding: 10px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  flex-wrap: wrap;
  background: #fff;
  margin-bottom: 40px;

  .mr-top--10 {
    margin-top: -10px;
  }

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

  .help {
    color: #a9abb2;
    // flex: 1;
    flex-basis: 100%;
  }

  .uploader {
    .preview {
      width: 198px;
    }

    :deep(.el-upload) {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }
  }

  .el-icon.uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 198px;
    height: 198px;
    text-align: center;
  }
}
</style>
