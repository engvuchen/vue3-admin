<template>
  <div class="td-form-demo">
    <h1>TDesign Primary Form 演示</h1>

    <div class="demo-tabs">
      <t-tabs v-model="activeTab">
        <t-tab-panel value="basic" label="基础功能">
          <div class="demo-section">
            <h2>基础表单示例</h2>
            <PrimaryForm
              ref="basicFormRef"
              :config="basicFormConfig"
              @submit="handleBasicSubmit"
              @change="handleBasicChange"
            />
          </div>

          <div class="demo-section">
            <h2>高级表单示例（包含联动和装饰）</h2>
            <PrimaryForm
              ref="advancedFormRef"
              :config="advancedFormConfig"
              @submit="handleAdvancedSubmit"
              @change="handleAdvancedChange"
            />
          </div>

          <div class="demo-section">
            <h2>表单操作</h2>
            <t-space>
              <t-button @click="getBasicFormValues">获取基础表单值</t-button>
              <t-button @click="setBasicFormValues">设置基础表单值</t-button>
              <t-button @click="validateBasicForm">校验基础表单</t-button>
              <t-button @click="resetBasicForm">重置基础表单</t-button>
            </t-space>
          </div>

          <div class="demo-section">
            <h2>表单数据</h2>
            <pre>{{ JSON.stringify(formValues, null, 2) }}</pre>
          </div>
        </t-tab-panel>

        <t-tab-panel value="decorators" label="装饰器功能">
          <div class="demo-section">
            <h2>装饰器示例（支持上下左右四个位置）</h2>
            <PrimaryForm
              ref="decoratorFormRef"
              :config="decoratorFormConfig"
              @submit="handleDecoratorSubmit"
              @change="handleDecoratorChange"
            />
          </div>

          <div class="demo-section">
            <h2>装饰器操作</h2>
            <t-space>
              <t-button @click="getDecoratorFormValues">获取表单值</t-button>
              <t-button @click="setDecoratorFormValues">设置表单值</t-button>
              <t-button @click="validateDecoratorForm">校验表单</t-button>
              <t-button @click="resetDecoratorForm">重置表单</t-button>
            </t-space>
          </div>

          <div class="demo-section">
            <h2>表单数据</h2>
            <pre>{{ JSON.stringify(decoratorFormValues, null, 2) }}</pre>
          </div>
        </t-tab-panel>

        <t-tab-panel value="quill" label="富文本编辑器">
          <div class="demo-section">
            <h2>Quill 富文本编辑器示例</h2>
            <PrimaryForm
              ref="quillFormRef"
              :config="quillFormConfig"
              @submit="handleQuillSubmit"
              @change="handleQuillChange"
            />
          </div>

          <div class="demo-section">
            <h2>编辑器操作</h2>
            <t-space>
              <t-button @click="getQuillFormValues">获取富文本内容</t-button>
              <t-button @click="setQuillFormValues">设置富文本内容</t-button>
              <t-button @click="validateQuillForm">校验表单</t-button>
              <t-button @click="resetQuillForm">重置表单</t-button>
            </t-space>
          </div>

          <div class="demo-section">
            <h2>富文本内容预览</h2>
            <div class="content-preview">
              <h4>HTML 内容：</h4>
              <pre>{{ quillFormValues.content || '暂无内容' }}</pre>

              <h4>渲染效果：</h4>
              <div class="rendered-content" v-html="quillFormValues.content || '暂无内容'"></div>
            </div>
          </div>
        </t-tab-panel>
      </t-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import {
  Button as TButton,
  Space as TSpace,
  MessagePlugin,
  Tabs as TTabs,
  TabPanel as TTabPanel,
} from 'tdesign-vue-next';
import PrimaryForm from '@/components/TdProForm/index.vue';

// 表单引用
const basicFormRef = ref();
const advancedFormRef = ref();
const decoratorFormRef = ref();
const quillFormRef = ref();

// 表单数据
const formValues = reactive({});
const decoratorFormValues = reactive({});
const quillFormValues = reactive({});

// 当前激活的tab
const activeTab = ref('basic');

// 基础表单配置 - 包含所有表单项类型示例
const basicFormConfig = {
  // 使用默认配置，只需要指定必要的字段
  fields: [
    // 基础输入框
    {
      key: 'username',
      label: '用户名',
      type: 'input',
      placeholder: '请输入用户名',
      help: '请输入3-20个字符的用户名',
      rules: [
        { required: true, message: '用户名不能为空' },
        { min: 3, max: 20, message: '用户名长度在3-20个字符之间' },
      ],
    },
    {
      key: 'password',
      label: '密码',
      type: 'input',
      placeholder: '请输入密码',
      props: { type: 'password' },
      rules: [
        { required: true, message: '密码不能为空' },
        { min: 6, message: '密码至少6个字符' },
      ],
    },
    {
      key: 'email',
      label: '邮箱',
      type: 'input',
      placeholder: '请输入邮箱',
      rules: [
        { required: true, message: '邮箱不能为空' },
        {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: '邮箱格式不正确',
        },
      ],
    },
    {
      key: 'phone',
      label: '手机号',
      type: 'input',
      placeholder: '请输入手机号',
      props: { type: 'tel' },
      rules: [
        { required: true, message: '手机号不能为空' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' },
      ],
    },
    // 数字输入框
    {
      key: 'age',
      label: '年龄',
      type: 'number',
      placeholder: '请输入年龄',
      props: { min: 1, max: 120, step: 1 },
      help: '请输入1-120之间的年龄',
      rules: [{ required: true, message: '年龄不能为空' }],
    },
    {
      key: 'salary',
      label: '薪资',
      type: 'number',
      placeholder: '请输入薪资',
      props: { min: 0, step: 100, suffix: '元' },
      rules: [{ required: true, message: '薪资不能为空' }],
    },
    // 选择器
    {
      key: 'city',
      label: '所在城市',
      type: 'select',
      placeholder: '请选择城市',
      options: [
        { label: '北京', value: 'beijing' },
        { label: '上海', value: 'shanghai' },
        { label: '广州', value: 'guangzhou' },
        { label: '深圳', value: 'shenzhen' },
        { label: '杭州', value: 'hangzhou' },
      ],
      rules: [{ required: true, message: '请选择所在城市' }],
    },
    {
      key: 'department',
      label: '部门',
      type: 'select',
      placeholder: '请选择部门',
      options: [
        { label: '技术部', value: 'tech' },
        { label: '产品部', value: 'product' },
        { label: '设计部', value: 'design' },
        { label: '运营部', value: 'operation' },
        { label: '市场部', value: 'marketing' },
      ],
      rules: [{ required: true, message: '请选择部门' }],
    },
    // 单选框
    {
      key: 'gender',
      label: '性别',
      type: 'radio',
      defaultValue: 'male',
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '其他', value: 'other' },
      ],
      rules: [{ required: true, message: '请选择性别' }],
    },
    {
      key: 'education',
      label: '学历',
      type: 'radio',
      options: [
        { label: '高中', value: 'high-school' },
        { label: '大专', value: 'college' },
        { label: '本科', value: 'bachelor' },
        { label: '硕士', value: 'master' },
        { label: '博士', value: 'phd' },
      ],
      rules: [{ required: true, message: '请选择学历' }],
    },
    // 多选框
    {
      key: 'hobbies',
      label: '爱好',
      type: 'checkbox',
      options: [
        { label: '读书', value: 'reading' },
        { label: '运动', value: 'sports' },
        { label: '音乐', value: 'music' },
        { label: '旅行', value: 'travel' },
        { label: '摄影', value: 'photography' },
        { label: '烹饪', value: 'cooking' },
      ],
    },
    {
      key: 'skills',
      label: '技能',
      type: 'checkbox',
      options: [
        { label: 'JavaScript', value: 'js' },
        { label: 'Vue.js', value: 'vue' },
        { label: 'React', value: 'react' },
        { label: 'Node.js', value: 'node' },
        { label: 'Python', value: 'python' },
        { label: 'Java', value: 'java' },
      ],
    },
    // 开关
    {
      key: 'notifications',
      label: '接收通知',
      type: 'switch',
      defaultValue: true,
      afterDecorator: {
        type: 'text',
        value: '开启后将通过邮件接收重要通知',
        className: 'help-text',
      },
    },
    {
      key: 'publicProfile',
      label: '公开资料',
      type: 'switch',
      defaultValue: false,
      afterDecorator: {
        type: 'text',
        value: '其他用户可以查看您的公开资料',
        className: 'help-text',
      },
    },
    // 滑块
    {
      key: 'experience',
      label: '工作经验',
      type: 'slider',
      defaultValue: 3,
      props: {
        min: 0,
        max: 20,
        step: 1,
        marks: {
          0: '0年',
          5: '5年',
          10: '10年',
          15: '15年',
          20: '20年',
        },
      },
      afterDecorator: {
        type: 'text',
        value: '当前选择: {{value}}年',
        className: 'slider-decorator',
      },
    },
    {
      key: 'satisfaction',
      label: '满意度评分',
      type: 'slider',
      defaultValue: 8,
      props: {
        min: 1,
        max: 10,
        step: 1,
        marks: { 1: '1分', 5: '5分', 10: '10分' },
      },
      afterDecorator: {
        type: 'text',
        value: '当前评分: {{value}}分',
        className: 'slider-decorator',
      },
    },
    // 日期选择器
    {
      key: 'birthDate',
      label: '出生日期',
      type: 'date-picker',
      placeholder: '请选择出生日期',
      props: {
        mode: 'date',
        format: 'YYYY-MM-DD',
        enableTimePicker: true,
      },
      rules: [{ required: true, message: '请选择出生日期' }],
    },
    {
      key: 'joinDate',
      label: '入职日期',
      type: 'date-picker',
      placeholder: '请选择入职日期',
      props: {
        mode: 'date',
        format: 'YYYY-MM-DD',
        enableTimePicker: false,
      },
      rules: [{ required: true, message: '请选择入职日期' }],
    },
    // 时间选择器
    {
      key: 'workStartTime',
      label: '上班时间',
      type: 'time-picker',
      placeholder: '请选择上班时间',
      props: {
        format: 'HH:mm',
        steps: { minute: 15 },
      },
      rules: [{ required: true, message: '请选择上班时间' }],
    },
    {
      key: 'workEndTime',
      label: '下班时间',
      type: 'time-picker',
      placeholder: '请选择下班时间',
      props: {
        format: 'HH:mm',
        steps: { minute: 15 },
      },
      rules: [{ required: true, message: '请选择下班时间' }],
    },
    // 文件上传
    {
      key: 'avatar',
      label: '头像',
      type: 'upload',
      props: {
        action: '/api/upload',
        accept: 'image/*',
        max: 1,
        multiple: false,
        theme: 'image',
        tips: '支持 jpg/png 格式，文件大小不超过 2MB',
      },
    },
    {
      key: 'resume',
      label: '简历附件',
      type: 'upload',
      props: {
        action: '/api/upload',
        accept: '.pdf,.doc,.docx',
        max: 3,
        multiple: true,
        theme: 'file',
        tips: '支持 PDF、Word 格式，单个文件不超过 10MB',
      },
      help: '支持 PDF、Word 格式，单个文件不超过 10MB',
    },
    // 多行文本
    {
      key: 'description',
      label: '个人描述',
      type: 'textarea',
      placeholder: '请输入个人描述，包括工作经历、技能特长等',
      props: {
        rows: 4,
        maxlength: 500,
        showLimit: true,
      },
      afterDecorator: {
        type: 'text',
        value: '请详细描述您的个人情况和优势',
        className: 'help-text',
      },
    },
    // 地址信息
    {
      key: 'address',
      label: '详细地址',
      type: 'textarea',
      placeholder: '请输入详细地址',
      props: {
        rows: 3,
        maxlength: 200,
      },
    },
  ],
};

// 高级表单配置（包含联动和装饰）
const advancedFormConfig = {
  // 覆盖部分默认配置
  layout: 'horizontal',
  fieldSpacing: 24,
  fields: [
    {
      key: 'userType',
      label: '用户类型',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: '普通用户', value: 'normal' },
        { label: 'VIP用户', value: 'vip' },
        { label: '企业用户', value: 'enterprise' },
      ],
      help: '当前选择：{{value}}，不同类型将显示不同的表单字段',
      beforeDecorator: {
        type: 'text',
        value: '💡 选择不同用户类型会显示不同的表单字段',
        className: 'tip-decorator',
      },
    },
    {
      key: 'vipLevel',
      label: 'VIP等级',
      type: 'select',
      options: [
        { label: '银卡', value: 'silver' },
        { label: '金卡', value: 'gold' },
        { label: '钻石卡', value: 'diamond' },
      ],
      visible: false,
      linkage: [
        {
          watchField: 'userType',
          action: (value, { showField, hideField }) => {
            if (value === 'vip') {
              showField('vipLevel');
            } else {
              hideField('vipLevel');
            }
          },
        },
      ],
    },
    {
      key: 'companyName',
      label: '公司名称',
      type: 'input',
      placeholder: '请输入公司名称',
      visible: false,
      rules: [{ required: true, message: '公司名称不能为空' }],
      linkage: [
        {
          watchField: 'userType',
          action: (value, { showField, hideField }) => {
            if (value === 'enterprise') {
              showField('companyName');
            } else {
              hideField('companyName');
            }
          },
        },
      ],
    },
    {
      key: 'companySize',
      label: '公司规模',
      type: 'select',
      options: [
        { label: '1-10人', value: 'small' },
        { label: '11-50人', value: 'medium' },
        { label: '51-200人', value: 'large' },
        { label: '200人以上', value: 'xlarge' },
      ],
      visible: false,
      linkage: [
        {
          watchField: 'userType',
          action: (value, { showField, hideField }) => {
            if (value === 'enterprise') {
              showField('companySize');
            } else {
              hideField('companySize');
            }
          },
        },
      ],
    },
    {
      key: 'discount',
      label: '折扣比例',
      type: 'slider',
      defaultValue: 100,
      props: { min: 50, max: 100, step: 5 },
      afterDecorator: {
        type: 'text',
        value: '当前折扣: {{value}}%',
        className: 'discount-decorator',
      },
      linkage: [
        {
          watchField: 'userType',
          action: (value, { setFieldValue }) => {
            switch (value) {
              case 'vip':
                setFieldValue('discount', 85);
                break;
              case 'enterprise':
                setFieldValue('discount', 75);
                break;
              default:
                setFieldValue('discount', 100);
                break;
            }
          },
        },
      ],
    },
    {
      key: 'notifications',
      label: '接收通知',
      type: 'switch',
      defaultValue: true,
      afterDecorator: {
        type: 'text',
        value: '开启后将通过邮件接收重要通知',
        className: 'help-text',
      },
    },
  ],
};

// Quill 富文本编辑器表单配置
const quillFormConfig = {
  // 使用默认配置
  fields: [
    {
      key: 'title',
      label: '文章标题',
      type: 'input',
      placeholder: '请输入文章标题',
      rules: [
        { required: true, message: '文章标题不能为空' },
        { min: 2, max: 100, message: '标题长度在2-100个字符之间' },
      ],
    },
    {
      key: 'author',
      label: '作者',
      type: 'input',
      placeholder: '请输入作者姓名',
      rules: [{ required: true, message: '作者不能为空' }],
    },
    {
      key: 'category',
      label: '文章分类',
      type: 'select',
      placeholder: '请选择文章分类',
      options: [
        { label: '技术文档', value: 'tech' },
        { label: '产品介绍', value: 'product' },
        { label: '用户指南', value: 'guide' },
        { label: '新闻公告', value: 'news' },
        { label: '其他', value: 'other' },
      ],
      rules: [{ required: true, message: '请选择文章分类' }],
    },
    {
      key: 'tags',
      label: '文章标签',
      type: 'checkbox',
      options: [
        { label: 'Vue.js', value: 'vue' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'TypeScript', value: 'typescript' },
        { label: 'TDesign', value: 'tdesign' },
        { label: '前端开发', value: 'frontend' },
        { label: '组件库', value: 'component' },
      ],
    },
    {
      key: 'content',
      label: '文章内容',
      type: 'quill',
      placeholder: '请输入文章内容...',
      props: {
        theme: 'snow',
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ header: 1 }, { header: 2 }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ['clean'],
          ['link'],
        ],
      },
      rules: [
        { required: true, message: '文章内容不能为空' },
        { min: 10, message: '文章内容至少10个字符' },
      ],
      help: '支持富文本编辑，包括粗体、斜体、列表、链接等格式',
    },
    {
      key: 'summary',
      label: '文章摘要',
      type: 'textarea',
      placeholder: '请输入文章摘要（可选）',
      props: {
        rows: 3,
        maxlength: 200,
        showLimit: true,
      },
      afterDecorator: {
        type: 'text',
        value: '摘要将显示在文章列表中，建议控制在200字以内',
        className: 'help-text',
      },
    },
    {
      key: 'publishNow',
      label: '立即发布',
      type: 'switch',
      defaultValue: false,
      afterDecorator: {
        type: 'text',
        value: '开启后文章将立即发布，关闭则保存为草稿',
        className: 'help-text',
      },
    },
    {
      key: 'allowComments',
      label: '允许评论',
      type: 'switch',
      defaultValue: true,
      afterDecorator: {
        type: 'text',
        value: '是否允许读者对文章进行评论',
        className: 'help-text',
      },
    },
  ],
};

// 装饰器功能演示表单配置
const decoratorFormConfig = {
  // 使用默认配置
  fields: [
    {
      key: 'decoratorExample',
      label: '装饰器示例',
      type: 'input',
      placeholder: '输入内容查看装饰器效果',
      defaultValue: 'Hello World',
      topDecorator: {
        type: 'text',
        value: '⬆️ 这是上置装饰器（文本型）',
        className: 'decorator-top',
        style: { color: '#1890ff', fontWeight: 'bold' },
      },
      beforeDecorator: {
        type: 'html',
        value: '<span style="color: #52c41a;">⬅️ 前置装饰器（HTML）：当前值是 <strong>{{value}}</strong></span>',
        className: 'decorator-before',
      },
      afterDecorator: {
        type: 'TButton',
        props: {
          theme: 'primary',
          size: 'small',
          variant: 'outline',
        },
        className: 'decorator-after',
        style: { marginLeft: '8px' },
      },
      bottomDecorator: {
        type: 'html',
        value: '<div style="color: #f5222d;">⬇️ 下置装饰器（HTML型）：字符长度 <span id="length">0</span></div>',
        className: 'decorator-bottom',
        linkage: [
          {
            watchField: 'decoratorExample',
            action: (value) => {
              setTimeout(() => {
                const lengthSpan = document.getElementById('length');
                if (lengthSpan) {
                  lengthSpan.textContent = String(value?.length || 0);
                }
              }, 0);
            },
          },
        ],
      },
    },
    {
      key: 'componentDecorator',
      label: '组件装饰器示例',
      type: 'select',
      placeholder: '选择一个选项',
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
        { label: '选项3', value: 'option3' },
      ],
      beforeDecorator: {
        type: 'TTag',
        props: {
          theme: 'success',
          variant: 'light',
        },
        className: 'decorator-tag',
      },
    },
    {
      key: 'linkageExample',
      label: '联动装饰器示例',
      type: 'radio',
      defaultValue: 'red',
      options: [
        { label: '红色', value: 'red' },
        { label: '绿色', value: 'green' },
        { label: '蓝色', value: 'blue' },
      ],
      topDecorator: {
        type: 'html',
        value: '<div style="color: red; font-weight: bold;">🔴 当前选择的颜色主题</div>',
        linkage: [
          {
            watchField: 'linkageExample',
            action: (value) => {
              setTimeout(() => {
                const decoratorEl = document.querySelector('.field-decorator--top div');
                if (decoratorEl) {
                  const colorMap = {
                    red: { color: '#f5222d', emoji: '🔴' },
                    green: { color: '#52c41a', emoji: '🟢' },
                    blue: { color: '#1890ff', emoji: '🔵' },
                  };
                  const theme = colorMap[value] || colorMap.red;
                  decoratorEl.style.color = theme.color;
                  decoratorEl.innerHTML = `${theme.emoji} 当前选择的颜色主题`;
                }
              }, 0);
            },
          },
        ],
      },
    },
  ],
};

// 处理基础表单提交
const handleBasicSubmit = (values) => {
  console.log('基础表单提交:', values);
  MessagePlugin.success('基础表单提交成功！');
  Object.assign(formValues, { basic: values });
};

// 处理基础表单变化
const handleBasicChange = (key, value, values) => {
  console.log('基础表单字段变化:', { key, value, values });
};

// 处理高级表单提交
const handleAdvancedSubmit = (values) => {
  console.log('高级表单提交:', values);
  MessagePlugin.success('高级表单提交成功！');
  Object.assign(formValues, { advanced: values });
};

// 处理高级表单变化
const handleAdvancedChange = (key, value, values) => {
  console.log('高级表单字段变化:', { key, value, values });
};

// 获取基础表单值
const getBasicFormValues = () => {
  const values = basicFormRef.value?.getFieldsValue();
  console.log('基础表单当前值:', values);
  MessagePlugin.info(`基础表单值: ${JSON.stringify(values)}`);
};

// 设置基础表单值
const setBasicFormValues = () => {
  const testValues = {
    username: 'testuser',
    email: 'test@example.com',
    age: 25,
    gender: 'female',
    hobbies: ['reading', 'music'],
  };
  basicFormRef.value?.setFieldsValue(testValues);
  MessagePlugin.success('基础表单值设置成功！');
};

// 校验基础表单
const validateBasicForm = async () => {
  try {
    const isValid = await basicFormRef.value?.validate();
    if (isValid) {
      MessagePlugin.success('基础表单校验通过！');
    } else {
      MessagePlugin.error('基础表单校验失败！');
    }
  } catch (error) {
    MessagePlugin.error('基础表单校验出错！');
  }
};

// 重置基础表单
const resetBasicForm = () => {
  basicFormRef.value?.resetFields();
  MessagePlugin.success('基础表单重置成功！');
};

// 处理Quill表单提交
const handleQuillSubmit = (values) => {
  console.log('富文本表单提交:', values);
  MessagePlugin.success('文章保存成功！');
  Object.assign(quillFormValues, values);
};

// 处理Quill表单变化
const handleQuillChange = (key, value, values) => {
  console.log('富文本表单字段变化:', { key, value, values });
  Object.assign(quillFormValues, values);
};

// 获取Quill表单值
const getQuillFormValues = () => {
  const values = quillFormRef.value?.getFieldsValue();
  console.log('富文本表单当前值:', values);
  MessagePlugin.info(`文章内容长度: ${values?.content?.length || 0} 字符`);
};

// 设置Quill表单值
const setQuillFormValues = () => {
  const testValues = {
    title: '示例文章标题',
    author: '张三',
    category: 'tech',
    tags: ['vue', 'javascript'],
    content: `
            <h2>这是一个示例文章</h2>
            <p>这里是文章的正文内容，支持<strong>粗体</strong>、<em>斜体</em>等格式。</p>
            <ul>
                <li>支持无序列表</li>
                <li>支持有序列表</li>
                <li>支持代码块</li>
            </ul>
            <blockquote>这是一个引用块示例</blockquote>
            <p>你可以在编辑器中添加链接、图片等内容。</p>
        `,
    summary: '这是一篇关于Vue.js和JavaScript的技术文章示例',
    publishNow: true,
    allowComments: true,
  };
  quillFormRef.value?.setFieldsValue(testValues);
  Object.assign(quillFormValues, testValues);
  MessagePlugin.success('示例内容设置成功！');
};

// 校验Quill表单
const validateQuillForm = async () => {
  try {
    const isValid = await quillFormRef.value?.validate();
    if (isValid) {
      MessagePlugin.success('表单校验通过！');
    } else {
      MessagePlugin.error('表单校验失败！');
    }
  } catch (error) {
    MessagePlugin.error('表单校验出错！');
  }
};

// 重置Quill表单
const resetQuillForm = () => {
  quillFormRef.value?.resetFields();
  Object.keys(quillFormValues).forEach((key) => {
    delete quillFormValues[key];
  });
  MessagePlugin.success('表单重置成功！');
};

// 处理装饰器表单提交
const handleDecoratorSubmit = (values) => {
  console.log('装饰器表单提交:', values);
  MessagePlugin.success('装饰器表单提交成功！');
  Object.assign(decoratorFormValues, values);
};

// 处理装饰器表单变化
const handleDecoratorChange = (key, value, values) => {
  console.log('装饰器表单字段变化:', { key, value, values });
  Object.assign(decoratorFormValues, values);
};

// 获取装饰器表单值
const getDecoratorFormValues = () => {
  const values = decoratorFormRef.value?.getFieldsValue();
  console.log('装饰器表单当前值:', values);
  MessagePlugin.info(`装饰器表单值获取成功`);
};

// 设置装饰器表单值
const setDecoratorFormValues = () => {
  const testValues = {
    decoratorExample: '这是测试内容',
    componentDecorator: 'option2',
    linkageExample: 'green',
  };
  decoratorFormRef.value?.setFieldsValue(testValues);
  Object.assign(decoratorFormValues, testValues);
  MessagePlugin.success('装饰器表单值设置成功！');
};

// 校验装饰器表单
const validateDecoratorForm = async () => {
  try {
    const isValid = await decoratorFormRef.value?.validate();
    if (isValid) {
      MessagePlugin.success('装饰器表单校验通过！');
    } else {
      MessagePlugin.error('装饰器表单校验失败！');
    }
  } catch (error) {
    console.error('装饰器表单校验出错:', error);
    MessagePlugin.error('装饰器表单校验出错！');
  }
};

// 重置装饰器表单
const resetDecoratorForm = () => {
  decoratorFormRef.value?.resetFields();
  Object.keys(decoratorFormValues).forEach((key) => {
    delete decoratorFormValues[key];
  });
  MessagePlugin.success('装饰器表单重置成功！');
};
</script>

<style scoped>
.td-form-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.demo-tabs {
  margin-top: 20px;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.demo-section h2 {
  margin-top: 0;
  color: #333;
}

pre {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

:deep(.tip-decorator) {
  color: #1890ff;
  font-size: 14px;
  margin-bottom: 8px;
}

:deep(.discount-decorator) {
  color: #52c41a;
  font-weight: bold;
  margin-top: 8px;
}

:deep(.help-text) {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

/* 装饰器样式 */
:deep(.decorator-top) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 12px;
}

:deep(.decorator-before) {
  padding: 6px 8px;
  background: rgba(82, 196, 26, 0.1);
  border-left: 3px solid #52c41a;
  border-radius: 2px;
}

:deep(.decorator-after) {
  display: inline-flex;
  align-items: center;
}

:deep(.decorator-bottom) {
  padding: 8px 12px;
  background: rgba(245, 34, 45, 0.1);
  border: 1px solid rgba(245, 34, 45, 0.3);
  border-radius: 4px;
  margin-top: 8px;
}

:deep(.decorator-tag) {
  margin-right: 8px;
}

/* Quill 编辑器相关样式 */
.content-preview {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.content-preview h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.content-preview pre {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 12px;
  margin: 0 0 20px 0;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.rendered-content {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  min-height: 100px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
}

.rendered-content h1,
.rendered-content h2,
.rendered-content h3,
.rendered-content h4,
.rendered-content h5,
.rendered-content h6 {
  margin: 0 0 12px 0;
  color: #333;
}

.rendered-content p {
  margin: 0 0 12px 0;
}

.rendered-content ul,
.rendered-content ol {
  margin: 0 0 12px 20px;
  padding-left: 20px;
}

.rendered-content blockquote {
  margin: 0 0 12px 0;
  padding: 8px 16px;
  border-left: 4px solid #1890ff;
  background: #f6f8ff;
  font-style: italic;
}

.rendered-content code {
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.rendered-content pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0 0 12px 0;
}

.rendered-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

/* Quill 编辑器自定义样式 */
:deep(.ql-editor) {
  min-height: 200px;
  font-size: 14px;
  line-height: 1.6;
}

:deep(.ql-toolbar) {
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-bottom: none;
}

:deep(.ql-container) {
  border-bottom: 1px solid #ccc;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-top: none;
}
</style>
