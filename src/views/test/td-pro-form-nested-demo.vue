<template>
  <div class="nested-form-demo">
    <h2>TdProForm 嵌套字段演示</h2>

    <TdProForm ref="formRef" :config="formConfig" @submit="handleSubmit" />

    <div class="result-panel">
      <h3>表单数据结构：</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import TdProForm from '@/components/TdProForm/index.vue';

const formRef = ref();
const formData = reactive({});

const formConfig = {
  attributes: {
    layout: 'vertical',
    labelWidth: '120px',
  },
  items: [
    {
      label: '用户名',
      name: 'user.name',
      component: 'input',
      value: '张三',
      rules: [{ required: true, message: '请输入用户名' }],
    },
    {
      label: '用户邮箱',
      name: 'user.email',
      component: 'input',
      value: 'zhangsan@example.com',
      rules: [
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '请输入正确的邮箱格式' },
      ],
    },
    {
      label: '用户年龄',
      name: 'user.age',
      component: 'number',
      value: 25,
      componentProps: {
        min: 1,
        max: 150,
      },
    },
    {
      label: '公司名称',
      name: 'company.name',
      component: 'input',
      value: '某某科技有限公司',
    },
    {
      label: '公司地址',
      name: 'company.address',
      component: 'input',
      value: '北京市朝阳区',
    },
    {
      label: '配置项 - 主题',
      name: 'config.theme',
      component: 'select',
      value: 'light',
      items: [
        { label: '浅色', value: 'light' },
        { label: '深色', value: 'dark' },
        { label: '自动', value: 'auto' },
      ],
    },
    {
      label: '配置项 - 语言',
      name: 'config.language',
      component: 'select',
      value: 'zh-CN',
      items: [
        { label: '简体中文', value: 'zh-CN' },
        { label: 'English', value: 'en-US' },
      ],
    },
    {
      label: '配置项 - 启用通知',
      name: 'config.notification.enabled',
      component: 'switch',
      value: true,
    },
    {
      label: '配置项 - 通知方式',
      name: 'config.notification.type',
      component: 'checkbox',
      value: ['email', 'sms'],
      items: [
        { label: '邮件', value: 'email' },
        { label: '短信', value: 'sms' },
        { label: '推送', value: 'push' },
      ],
      linkage: [
        {
          watchField: 'config.notification.enabled',
          action: (value, { show, hide }) => {
            if (value) {
              show('config.notification.type');
            } else {
              hide('config.notification.type');
            }
          },
        },
      ],
    },
  ],
};

const handleSubmit = (data) => {
  console.log('提交的数据:', data);
  Object.assign(formData, data);
};
</script>

<style scoped>
.nested-form-demo {
  padding: 20px;
}

.result-panel {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.result-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.result-panel pre {
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
