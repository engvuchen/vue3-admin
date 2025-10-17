# TdProTable 组件使用说明

## 概述

TdProTable 是基于 TDesign Vue Next 开发的高级表格组件，集成了搜索表单、表格展示、分页等功能。

## 组件结构

- `TdProTable` - 主表格组件
- `TdSearchForm` - 搜索表单组件（基于 TdProForm 改造）
- `TdProForm` - 表单组件（原 ProForm2 重命名）

## 主要特性

### TdProTable 特性
- 基于 TDesign Table 组件
- 集成搜索表单功能
- 支持分页
- 支持自定义工具栏
- 支持列插槽自定义
- 支持所有 TDesign Table 的事件和属性

### TdSearchForm 特性
- 基于 TDesign Form 组件
- 支持多种字段类型
- 支持字段联动
- 支持自定义按钮
- 支持 request 参数
- 支持装饰器功能

## 基础用法

```vue
<template>
  <td-pro-table
    :request="getTableData"
    :columns="columns"
    :search="searchConfig"
    :pagination="paginationConfig"
    title="用户列表"
    @submit="handleSearch"
    @reset="handleReset"
    @selectionChange="handleSelectionChange"
  />
</template>

<script setup>
import { ref } from 'vue';

const columns = [
  {
    key: 'id',
    title: 'ID',
    width: 80,
  },
  {
    key: 'name',
    title: '姓名',
    width: 120,
  },
  {
    key: 'email',
    title: '邮箱',
    minWidth: 200,
  },
];

const searchConfig = {
  fields: [
    {
      key: 'name',
      label: '姓名',
      type: 'input',
      placeholder: '请输入姓名',
      span: 6,
    },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      placeholder: '请选择状态',
      span: 6,
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  ],
  layout: 'inline',
  labelWidth: 'auto',
};

const paginationConfig = {
  show: true,
  current: 1,
  pageSize: 10,
  total: 0,
  pageSizeOptions: [5, 10, 20, 50],
  showTotal: true,
  showJumper: true,
  showSizer: true,
};

const getTableData = async (params) => {
  // 返回 { data: [], total: 0 }
  return {
    data: [],
    total: 0,
  };
};

const handleSearch = (searchData) => {
  console.log('搜索:', searchData);
};

const handleReset = () => {
  console.log('重置搜索');
};

const handleSelectionChange = (selectedRowKeys, selectedRowsData) => {
  console.log('选择变化:', selectedRowKeys, selectedRowsData);
};
</script>
```

## 高级用法

### 自定义工具栏

```vue
<template>
  <td-pro-table
    :request="getTableData"
    :columns="columns"
    title="用户列表"
  >
    <template #toolbar>
      <t-button theme="primary" @click="handleAdd">
        新增用户
      </t-button>
      <t-button theme="default" @click="handleExport">
        导出
      </t-button>
    </template>
  </td-pro-table>
</template>
```

### 自定义列内容

```vue
<template>
  <td-pro-table
    :request="getTableData"
    :columns="columns"
    title="用户列表"
  >
    <template #status="{ row }">
      <t-tag :theme="row.status === 1 ? 'success' : 'default'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </t-tag>
    </template>

    <template #action="{ row }">
      <t-space>
        <t-button theme="primary" variant="text" @click="handleEdit(row)">
          编辑
        </t-button>
        <t-button theme="danger" variant="text" @click="handleDelete(row)">
          删除
        </t-button>
      </t-space>
    </template>
  </td-pro-table>
</template>

<script setup>
const columns = [
  // ... 其他列
  {
    key: 'status',
    title: '状态',
    width: 100,
    colKey: 'status',
  },
  {
    key: 'action',
    title: '操作',
    width: 150,
    colKey: 'action',
    fixed: 'right',
  },
];
</script>
```

### 搜索表单自定义按钮

```vue
<template>
  <td-pro-table
    :request="getTableData"
    :columns="columns"
    :search="searchConfig"
    title="用户列表"
  />
</template>

<script setup>
const searchConfig = {
  fields: [
    // ... 字段配置
  ],
  customButtons: [
    {
      key: 'export',
      text: '导出',
      theme: 'default',
      action: async (formData, context) => {
        console.log('导出数据:', formData);
        // 调用导出API
      },
    },
    {
      key: 'import',
      text: '导入',
      theme: 'default',
      action: async (formData, context) => {
        console.log('导入数据:', formData);
        // 调用导入API
      },
    },
  ],
};
</script>
```

## API 参考

### TdProTable Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| request | 请求数据的方法 | Function | - |
| title | 表格标题 | String | '' |
| hideTitleBar | 是否隐藏标题栏 | Boolean | false |
| search | 搜索表单配置 | Object/Boolean | false |
| searchRequest | 搜索请求方法 | Function | null |
| columns | 表格列配置 | Array | [] |
| rowKey | 行数据的Key | String/Function | 'id' |
| bordered | 是否显示边框 | Boolean | false |
| stripe | 是否显示斑马纹 | Boolean | false |
| hover | 是否显示悬浮效果 | Boolean | true |
| size | 表格尺寸 | String | 'medium' |
| maxHeight | 最大高度 | String/Number | null |
| height | 表格高度 | String/Number | null |
| pagination | 分页配置 | Object/Boolean | {} |

### TdSearchForm Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| config | 表单配置 | Object | - |
| request | 请求方法 | Function | null |

### TdSearchForm Config

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| fields | 字段配置 | Array | [] |
| layout | 表单布局 | String | 'inline' |
| labelWidth | 标签宽度 | String | 'auto' |
| fieldSpacing | 字段间距 | Object | { horizontal: 16, vertical: 24 } |
| showSubmit | 是否显示提交按钮 | Boolean | true |
| showReset | 是否显示重置按钮 | Boolean | true |
| submitText | 提交按钮文本 | String | '查询' |
| resetText | 重置按钮文本 | String | '重置' |
| customButtons | 自定义按钮 | Array | [] |

## 事件

### TdProTable Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| submit | 搜索提交 | searchData |
| reset | 搜索重置 | - |
| selectionChange | 选择变化 | selectedRowKeys, selectedRowsData, currentRowData |
| rowClick | 行点击 | context |
| rowDblClick | 行双击 | context |
| cellClick | 单元格点击 | context |
| sortChange | 排序变化 | sortInfo |
| filterChange | 过滤变化 | filterInfo |
| pageChange | 分页变化 | pageInfo |

### TdSearchForm Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| submit | 表单提交 | formData |
| reset | 表单重置 | - |
| change | 字段变化 | key, value, formData |
| error | 错误事件 | error |
| buttonClick | 自定义按钮点击 | button, formData |

## 演示页面

访问 `/test/td-pro-table-demo` 查看完整的使用示例。
