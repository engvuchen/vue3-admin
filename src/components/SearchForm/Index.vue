<template>
  <PrimaryForm
    ref="formRef"
    :config="config"
    @submit="handleSubmit"
    @reset="handleReset"
    @change="handleChange"
    @error="handleError"
  />
</template>
<script>
import PrimaryForm from '@/components/ProForm2/index.vue';

let props = defindProps({
  config: {
    type: Object,
    required: true,
  },
  searchCgi: {
    type: Function,
  },
});
const emit = defineEmits(['submit', 'reset', 'change', 'error']);

// 事件处理函数
const handleSubmit = (data) => {
  console.log('搜索表单提交:', data);
  emit('submit', data);
};

const handleReset = () => {
  console.log('搜索表单重置');
  emit('reset');
};

const handleChange = (data) => {
  console.log('搜索表单变化:', data);
  emit('change', data);
};

const handleError = (error) => {
  console.log('搜索表单错误:', error);
  emit('error', error);
};

// const config = {
//   labelWidth: '120px',
//   fieldSpacing: {
//     horizontal: 16, // 水平间距
//     vertical: 24, // 垂直间距
//   },
//   showReset: true,
//   fields: [
//     // 基础输入框
//     {
//       key: 'username',
//       label: '用户名',
//       type: 'input',
//       placeholder: '请输入用户名',
//       help: '请输入3-20个字符的用户名',
//       rules: [
//         { required: true, message: '用户名不能为空' },
//         { min: 3, max: 20, message: '用户名长度在3-20个字符之间' },
//       ],
//       span: 12,
//     },
//     {
//       key: 'password',
//       label: '密码',
//       type: 'input',
//       placeholder: '请输入密码',
//       props: { type: 'password' },
//       rules: [
//         { required: true, message: '密码不能为空' },
//         { min: 6, message: '密码至少6个字符' },
//       ],
//       span: 12,
//     },
//     {
//       key: 'email',
//       label: '邮箱',
//       type: 'input',
//       placeholder: '请输入邮箱',
//       rules: [
//         { required: true, message: '邮箱不能为空' },
//         {
//           pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//           message: '邮箱格式不正确',
//         },
//       ],
//       span: 12,
//     },
//     {
//       key: 'phone',
//       label: '手机号',
//       type: 'input',
//       placeholder: '请输入手机号',
//       props: { type: 'tel' },
//       rules: [
//         { required: true, message: '手机号不能为空' },
//         { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' },
//       ],
//       span: 12,
//     },
//     // 数字输入框
//     {
//       key: 'age',
//       label: '年龄',
//       type: 'number',
//       placeholder: '请输入年龄',
//       props: { min: 1, max: 120, step: 1 },
//       help: '请输入1-120之间的年龄',
//       rules: [{ required: true, message: '年龄不能为空' }],
//       span: 12,
//     },
//     {
//       key: 'salary',
//       label: '薪资',
//       type: 'number',
//       placeholder: '请输入薪资',
//       props: { min: 0, step: 100, suffix: '元' },
//       rules: [{ required: true, message: '薪资不能为空' }],
//       span: 12,
//     },
//     // 选择器
//     {
//       key: 'city',
//       label: '所在城市',
//       type: 'select',
//       placeholder: '请选择城市',
//       options: [
//         { label: '北京', value: 'beijing' },
//         { label: '上海', value: 'shanghai' },
//         { label: '广州', value: 'guangzhou' },
//         { label: '深圳', value: 'shenzhen' },
//         { label: '杭州', value: 'hangzhou' },
//       ],
//       rules: [{ required: true, message: '请选择所在城市' }],
//       span: 12,
//     },
//     {
//       key: 'department',
//       label: '部门',
//       type: 'select',
//       placeholder: '请选择部门',
//       options: [
//         { label: '技术部', value: 'tech' },
//         { label: '产品部', value: 'product' },
//         { label: '设计部', value: 'design' },
//         { label: '运营部', value: 'operation' },
//         { label: '市场部', value: 'marketing' },
//       ],
//       rules: [{ required: true, message: '请选择部门' }],
//       span: 12,
//     },
//     // 单选框
//     {
//       key: 'gender',
//       label: '性别',
//       type: 'radio',
//       defaultValue: 'male',
//       options: [
//         { label: '男', value: 'male' },
//         { label: '女', value: 'female' },
//         { label: '其他', value: 'other' },
//       ],
//       rules: [{ required: true, message: '请选择性别' }],
//       span: 12,
//     },
//     {
//       key: 'education',
//       label: '学历',
//       type: 'radio',
//       options: [
//         { label: '高中', value: 'high-school' },
//         { label: '大专', value: 'college' },
//         { label: '本科', value: 'bachelor' },
//         { label: '硕士', value: 'master' },
//         { label: '博士', value: 'phd' },
//       ],
//       rules: [{ required: true, message: '请选择学历' }],
//       span: 12,
//     },
//     // 多选框
//     {
//       key: 'hobbies',
//       label: '爱好',
//       type: 'checkbox',
//       options: [
//         { label: '读书', value: 'reading' },
//         { label: '运动', value: 'sports' },
//         { label: '音乐', value: 'music' },
//         { label: '旅行', value: 'travel' },
//         { label: '摄影', value: 'photography' },
//         { label: '烹饪', value: 'cooking' },
//       ],
//       span: 12,
//     },
//     {
//       key: 'skills',
//       label: '技能',
//       type: 'checkbox',
//       options: [
//         { label: 'JavaScript', value: 'js' },
//         { label: 'Vue.js', value: 'vue' },
//         { label: 'React', value: 'react' },
//         { label: 'Node.js', value: 'node' },
//         { label: 'Python', value: 'python' },
//         { label: 'Java', value: 'java' },
//       ],
//       span: 12,
//     },
//     // 开关
//     {
//       key: 'notifications',
//       label: '接收通知',
//       type: 'switch',
//       defaultValue: true,
//       afterDecorator: {
//         type: 'text',
//         content: '开启后将通过邮件接收重要通知',
//         className: 'help-text',
//       },
//       span: 12,
//     },
//     {
//       key: 'publicProfile',
//       label: '公开资料',
//       type: 'switch',
//       defaultValue: false,
//       afterDecorator: {
//         type: 'text',
//         content: '其他用户可以查看您的公开资料',
//         className: 'help-text',
//       },
//       span: 12,
//     },
//     // 滑块
//     {
//       key: 'experience',
//       label: '工作经验',
//       type: 'slider',
//       defaultValue: 3,
//       props: {
//         min: 0,
//         max: 20,
//         step: 1,
//         marks: {
//           0: '0年',
//           5: '5年',
//           10: '10年',
//           15: '15年',
//           20: '20年',
//         },
//       },
//       afterDecorator: {
//         type: 'text',
//         content: '当前选择: {{value}}年',
//         className: 'slider-decorator',
//       },
//       span: 12,
//     },
//     {
//       key: 'satisfaction',
//       label: '满意度评分',
//       type: 'slider',
//       defaultValue: 8,
//       props: {
//         min: 1,
//         max: 10,
//         step: 1,
//         marks: { 1: '1分', 5: '5分', 10: '10分' },
//       },
//       afterDecorator: {
//         type: 'text',
//         content: '当前评分: {{value}}分',
//         className: 'slider-decorator',
//       },
//       span: 12,
//     },
//     // 日期选择器
//     {
//       key: 'birthDate',
//       label: '出生日期',
//       type: 'date-picker',
//       placeholder: '请选择出生日期',
//       props: {
//         mode: 'date',
//         format: 'YYYY-MM-DD',
//         enableTimePicker: true,
//       },
//       rules: [{ required: true, message: '请选择出生日期' }],
//       span: 12,
//     },
//     {
//       key: 'joinDate',
//       label: '入职日期',
//       type: 'date-picker',
//       placeholder: '请选择入职日期',
//       props: {
//         mode: 'date',
//         format: 'YYYY-MM-DD',
//         enableTimePicker: false,
//       },
//       rules: [{ required: true, message: '请选择入职日期' }],
//       span: 12,
//     },
//     // 时间选择器
//     {
//       key: 'workStartTime',
//       label: '上班时间',
//       type: 'time-picker',
//       placeholder: '请选择上班时间',
//       props: {
//         format: 'HH:mm',
//         steps: { minute: 15 },
//       },
//       rules: [{ required: true, message: '请选择上班时间' }],
//       span: 12,
//     },
//     {
//       key: 'workEndTime',
//       label: '下班时间',
//       type: 'time-picker',
//       placeholder: '请选择下班时间',
//       props: {
//         format: 'HH:mm',
//         steps: { minute: 15 },
//       },
//       rules: [{ required: true, message: '请选择下班时间' }],
//       span: 12,
//     },
//     // 文件上传
//     {
//       key: 'avatar',
//       label: '头像',
//       type: 'upload',
//       props: {
//         action: '/api/upload',
//         accept: 'image/*',
//         max: 1,
//         multiple: false,
//         theme: 'image',
//         tips: '支持 jpg/png 格式，文件大小不超过 2MB',
//       },
//       span: 12,
//     },
//     {
//       key: 'resume',
//       label: '简历附件',
//       type: 'upload',
//       props: {
//         action: '/api/upload',
//         accept: '.pdf,.doc,.docx',
//         max: 3,
//         multiple: true,
//         theme: 'file',
//         tips: '支持 PDF、Word 格式，单个文件不超过 10MB',
//       },
//       help: '支持 PDF、Word 格式，单个文件不超过 10MB',
//       span: 12,
//     },
//     // 多行文本
//     {
//       key: 'description',
//       label: '个人描述',
//       type: 'textarea',
//       placeholder: '请输入个人描述，包括工作经历、技能特长等',
//       props: {
//         rows: 4,
//         maxlength: 500,
//         showLimit: true,
//       },
//       afterDecorator: {
//         type: 'text',
//         content: '请详细描述您的个人情况和优势',
//         className: 'help-text',
//       },
//       span: 24,
//     },
//     // 地址信息
//     {
//       key: 'address',
//       label: '详细地址',
//       type: 'textarea',
//       placeholder: '请输入详细地址',
//       props: {
//         rows: 3,
//         maxlength: 200,
//       },
//       span: 24,
//     },
//   ],
// };
</script>
