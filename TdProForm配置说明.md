# TdProForm 配置说明

## 概述

TdProForm 组件现在支持完整的默认配置，所有配置项都有合理的默认值，使用更加简单。

## 配置结构

### 基础配置

```javascript
const config = {
  // 表单布局配置
  layout: 'vertical',        // 表单布局：vertical | horizontal | inline
  labelWidth: '120px',       // 标签宽度
  labelAlign: 'right',       // 标签对齐方式：left | right | top
  colon: true,              // 是否显示冒号
  
  // 样式配置
  className: '',            // 自定义类名
  style: {},               // 自定义样式
  
  // 按钮配置
  showSubmit: true,        // 是否显示提交按钮
  showReset: true,         // 是否显示重置按钮
  submitText: '提交',       // 提交按钮文本
  resetText: '重置',        // 重置按钮文本
  
  // 字段配置
  fields: [],              // 表单字段配置数组
}
```

## 使用示例

### 最简单的使用方式

```javascript
const config = {
  fields: [
    {
      key: 'username',
      label: '用户名',
      type: 'input',
      placeholder: '请输入用户名',
      rules: [{ required: true, message: '用户名不能为空' }]
    }
  ]
}
```

### 自定义部分配置

```javascript
const config = {
  layout: 'horizontal',     // 覆盖默认的 vertical
  labelWidth: '100px',      // 覆盖默认的 120px
  submitText: '保存',        // 覆盖默认的 '提交'
  fields: [
    // 字段配置...
  ]
}
```

### 搜索表单配置

```javascript
const searchConfig = {
  layout: 'inline',        // 搜索表单通常使用 inline 布局
  labelWidth: 'auto',       // 自动宽度
  colon: false,            // 搜索表单通常不显示冒号
  submitText: '查询',       // 搜索按钮文本
  fields: [
    // 搜索字段配置...
  ]
}
```

## 字段配置

每个字段支持以下配置：

```javascript
{
  key: 'fieldName',           // 字段唯一标识
  label: '字段标签',           // 字段显示标签
  type: 'input',             // 字段类型
  placeholder: '请输入...',   // 占位符
  defaultValue: '',          // 默认值
  visible: true,             // 是否可见
  disabled: false,            // 是否禁用
  help: '帮助文本',           // 帮助信息
  rules: [],                 // 校验规则
  props: {},                 // 传递给组件的属性
  options: [],               // 选项数据（select/radio/checkbox）
  
  // 装饰器配置
  topDecorator: {},          // 上置装饰器
  beforeDecorator: {},       // 前置装饰器
  afterDecorator: {},        // 后置装饰器
  bottomDecorator: {},       // 下置装饰器
  
  // 联动配置
  linkage: []                // 联动逻辑
}
```

## 支持的字段类型

- `input` - 输入框
- `textarea` - 多行文本
- `select` - 选择器
- `radio` - 单选框
- `checkbox` - 多选框
- `switch` - 开关
- `date-picker` - 日期选择器
- `date-range-picker` - 日期范围选择器
- `time-picker` - 时间选择器
- `upload` - 文件上传
- `number` - 数字输入框
- `slider` - 滑块
- `quill` - 富文本编辑器

## 装饰器类型

- `text` - 文本装饰器
- `html` - HTML装饰器
- `component` - 组件装饰器

## 迁移指南

### 从旧版本迁移

1. **移除不必要的配置**：现在很多配置都有默认值，可以移除
2. **简化配置**：只需要配置必要的字段和需要覆盖的默认值
3. **更新按钮配置**：使用 `showSubmit` 和 `showReset` 控制按钮显示

### 示例对比

**旧版本**：
```javascript
const config = {
  layout: 'vertical',
  labelWidth: '120px',
  submitText: '提交',
  resetText: '重置',
  fields: [...]
}
```

**新版本**：
```javascript
const config = {
  fields: [...]  // 其他配置使用默认值
}
```

## 注意事项

1. 所有配置项都是可选的，有合理的默认值
2. 字段配置中的 `fields` 数组是必需的
3. 搜索表单建议使用 `layout: 'inline'` 和 `colon: false`
4. 装饰器支持模板变量 `{{value}}` 来显示当前字段值
5. 联动功能支持字段间的动态交互

## 已移除的多余配置

以下配置项已被移除，因为它们在实际使用中未被应用：

- `span` - 栅格占位（未在模板中使用）
- `offset` - 栅格偏移（未在模板中使用）
- `fieldSpacing` - 字段间距（未在模板中使用）

这些配置项在早期版本中可能存在，但当前版本的表单布局使用 CSS Grid 而不是栅格系统，因此不再需要这些配置。
