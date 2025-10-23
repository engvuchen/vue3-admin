<template>
  <div class="td-pro-form-extended-demo">
    <h2>TdProForm 扩展组件演示</h2>
    <p>展示所有新增的表单组件</p>

    <TdProForm ref="formRef" :config="formConfig" @submit="handleSubmit" @reset="handleReset" @change="handleChange" />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const formRef = ref();

// 表单配置
const formConfig = ref({
  layout: 'vertical',
  labelWidth: '120px',
  labelAlign: 'right',
  colon: true,
  showSubmit: true,
  showReset: true,
  submitText: '提交',
  resetText: '重置',
  fields: [
    {
      key: 'rate',
      type: 'rate',
      label: '评分',
      placeholder: '请选择评分',
      props: {
        allowHalf: true,
        max: 5,
        showText: true,
      },
    },
    {
      key: 'cascader',
      type: 'cascader',
      label: '级联选择',
      placeholder: '请选择地区',
      options: [
        {
          value: 'zhejiang',
          label: '浙江',
          children: [
            {
              value: 'hangzhou',
              label: '杭州',
              children: [
                { value: 'xihu', label: '西湖' },
                { value: 'yuhang', label: '余杭' },
              ],
            },
            {
              value: 'ningbo',
              label: '宁波',
              children: [
                { value: 'jiangbei', label: '江北' },
                { value: 'jiangdong', label: '江东' },
              ],
            },
          ],
        },
        {
          value: 'jiangsu',
          label: '江苏',
          children: [
            {
              value: 'nanjing',
              label: '南京',
              children: [
                { value: 'xuanwu', label: '玄武' },
                { value: 'qinhuai', label: '秦淮' },
              ],
            },
          ],
        },
      ],
    },
    {
      key: 'treeSelect',
      type: 'tree-select',
      label: '树形选择',
      placeholder: '请选择部门',
      props: {
        data: [
          {
            value: 'company',
            label: '公司',
            children: [
              {
                value: 'tech',
                label: '技术部',
                children: [
                  { value: 'frontend', label: '前端组' },
                  { value: 'backend', label: '后端组' },
                ],
              },
              {
                value: 'product',
                label: '产品部',
                children: [
                  { value: 'design', label: '设计组' },
                  { value: 'pm', label: '产品组' },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      key: 'transfer1',
      type: 'transfer',
      label: '权限分配',
      placeholder: '请选择权限',
      value: ['user:read'], // modalValue
      props: {
        // value: [],
        data: [
          { value: 'user:read', label: '用户查看' },
          { value: 'user:write', label: '用户编辑' },
          { value: 'role:read', label: '角色查看' },
          { value: 'role:write', label: '角色编辑' },
          { value: 'system:config', label: '系统配置' },
        ],
        // filterValues: [],
      },
    },
    {
      key: 'autoComplete',
      type: 'auto-complete',
      label: '自动完成',
      placeholder: '请输入关键词',
      props: {
        options: [
          { label: 'Vue.js', value: 'vue' },
          { label: 'React', value: 'react' },
          { label: 'Angular', value: 'angular' },
          { label: 'TDesign', value: 'tdesign' },
        ],
        filterable: true,
      },
    },
    {
      key: 'colorPicker',
      type: 'color-picker',
      label: '主题颜色',
      placeholder: '请选择颜色',
      props: {
        showPrimaryColorPreview: true,
        format: 'hex',
      },
    },
    {
      key: 'tagInput',
      type: 'tag-input',
      label: '标签输入',
      placeholder: '请输入标签',
      props: {
        clearable: true,
        max: 5,
        minCollapsedNum: 2,
      },
    },
    {
      key: 'rangeInput',
      type: 'range-input',
      label: '价格区间',
      placeholder: ['最低价', '最高价'],
      props: {
        type: 'number',
        clearable: true,
      },
    },
  ],
});

// 事件处理
const handleSubmit = (formData) => {
  console.log('表单提交:', formData);
  alert('表单提交成功！请查看控制台输出');
};

const handleReset = () => {
  console.log('表单重置');
};

const handleChange = (fieldKey, value) => {
  console.log(`字段 ${fieldKey} 值变化:`, value);
};
</script>

<style scoped>
.td-pro-form-extended-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  color: #333;
  margin-bottom: 10px;
}

p {
  color: #666;
  margin-bottom: 30px;
}
</style>
