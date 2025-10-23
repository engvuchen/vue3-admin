<template>
  <div class="td-pro-table-demo">
    <h2>TdProTable 组件演示</h2>

    <!-- 基础表格 -->
    <t-card :bordered="false" class="card">
      <h3>基础表格</h3>
      <td-pro-table
        :request="getTableData"
        :columns="columns"
        :search="searchConfig"
        :pagination="paginationConfig"
        title=""
        @submit="handleSearch"
        @reset="handleReset"
        @selectionChange="handleSelectionChange"
      />
    </t-card>

    <!-- 高级表格（带自定义按钮） -->
    <t-card :bordered="false" class="card">
      <h3>高级表格（带自定义按钮和优化分页）</h3>
      <td-pro-table
        :request="getTableData"
        :columns="advancedColumns"
        :search="advancedSearchConfig"
        :pagination="advancedPaginationConfig"
        :empty="{
          description: '暂无用户数据',
          icon: 'user',
        }"
        :request-delay="300"
        title=""
        @submit="handleSearch"
        @reset="handleReset"
        @selectionChange="handleSelectionChange"
        @error="handleError"
      >
        <template #toolbar>
          <t-button theme="default" @click="handleBatchDelete" :disabled="!selectedRows.length">
            <template #icon>
              <t-icon name="delete" />
            </template>
            批量删除
          </t-button>
          <t-button theme="default" @click="handleAdd">
            <template #icon>
              <t-icon name="add" />
            </template>
            新增
          </t-button>
        </template>
      </td-pro-table>
    </t-card>
  </div>
</template>

<script setup lang="jsx">
import TdProTable from '@/components/TdProTable/index.vue';

// 响应式数据
const selectedRows = ref([]);

// 基础表格列配置
const columns = [
  {
    colKey: 'id',
    title: 'ID',
    width: 80,
  },
  {
    colKey: 'name',
    title: '姓名',
    width: 120,
  },
  {
    colKey: 'email', // 'detail.email' 支持往里取值？
    title: '邮箱',
    minWidth: 200,
  },
  {
    colKey: 'phone',
    title: '电话',
    width: 150,
  },
  {
    colKey: 'createTime',
    title: '创建时间',
    width: 180,
  },
];
// 基础搜索配置
const searchConfig = {
  labelWidth: '80px', // 根据最长的表单标题，业务进行调节
  fields: [
    {
      key: 'name',
      label: '姓名',
      type: 'input',
      placeholder: '请输入姓名',
      value: '123',
    },
    {
      key: 'email',
      label: '邮箱',
      type: 'input',
      placeholder: '请输入邮箱',
    },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      placeholder: '请选择状态',
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
    // {
    //   key: 'dateRange',
    //   label: '时间范围',
    //   type: 'date-range-picker',
    //   placeholder: '请选择时间范围',
    //   value: [],
    //   props: {
    //     rangeSeparator: '至',
    //     clearable: true,
    //     format: 'YYYY-MM-DD',
    //     valueFormat: 'YYYY-MM-DD',
    //   },
    // },
    // {
    //   key: 'status',
    //   label: '状态',
    //   type: 'select',
    //   placeholder: '请选择状态',
    //   options: [
    //     { label: '全部', value: '' },
    //     { label: '启用', value: 1 },
    //     { label: '禁用', value: 0 },
    //   ],
    // },
    // {
    //   key: 'status1',
    //   label: '状态',
    //   type: 'select',
    //   placeholder: '请选择状态',
    //   options: [
    //     { label: '全部', value: '' },
    //     { label: '启用', value: 1 },
    //     { label: '禁用', value: 0 },
    //   ],
    // },
    // {
    //   key: 'status2',
    //   label: '状态',
    //   type: 'select',
    //   placeholder: '请选择状态',
    //   options: [
    //     { label: '全部', value: '' },
    //     { label: '启用', value: 1 },
    //     { label: '禁用', value: 0 },
    //   ],
    // },
    // {
    //   key: 'status3',
    //   label: '状态',
    //   type: 'select',
    //   placeholder: '请选择状态',
    //   options: [
    //     { label: '全部', value: '' },
    //     { label: '启用', value: 1 },
    //     { label: '禁用', value: 0 },
    //   ],
    // },
  ],
};
// 分页配置
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

// 高级表格列配置
const advancedColumns = [
  {
    colKey: 'id',
    title: 'ID',
    width: 80,
  },
  {
    colKey: 'name',
    title: '姓名',
    width: 120,
  },
  {
    colKey: 'email',
    title: '邮箱',
    minWidth: 200,
  },
  {
    colKey: 'phone',
    title: '电话',
    width: 150,
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100,
    cell: (h, { row }) => {
      return <t-tag theme={row.status === 1 ? 'success' : 'default'}>{row.status === 1 ? '启用' : '禁用'}</t-tag>;
    },
  },
  {
    colKey: 'createTime',
    title: '创建时间',
    width: 180,
  },
  {
    colKey: 'action',
    title: '操作',
    width: 150,
    fixed: 'right',
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-button theme="primary" variant="text" onClick={() => handleEdit(row)}>
            编辑
          </t-button>
          <t-button theme="danger" variant="text" onClick={() => handleDelete(row)}>
            删除
          </t-button>
        </t-space>
      );
    },
  },
];
// 高级搜索配置（带自定义按钮）
const advancedSearchConfig = {
  labelWidth: '80px', // 根据最长的表单标题，业务进行调节
  fields: [
    {
      key: 'name',
      label: '姓名',
      type: 'input',
      placeholder: '请输入姓名',
    },
    // {
    //   key: 'email',
    //   label: '邮箱',
    //   type: 'input',
    //   placeholder: '请输入邮箱',
    // },
    // {
    //   key: 'status',
    //   label: '状态',
    //   type: 'select',
    //   placeholder: '请选择状态',
    //   options: [
    //     { label: '全部', value: '' },
    //     { label: '启用', value: 1 },
    //     { label: '禁用', value: 0 },
    //   ],
    // },
    // // {
    // //   key: 'createTime',
    // //   label: '创建时间',
    // //   type: 'date-picker',
    // //   placeholder: '请选择创建时间',
    // // },
    {
      key: 'dateRange',
      label: '时间范围',
      type: 'date-range-picker',
      placeholder: '请选择时间范围',
      value: [],
      props: {
        rangeSeparator: '至',
        clearable: true,
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
    },
    {
      key: 'dateRange',
      label: '时间范围',
      type: 'date-range-picker',
      placeholder: '请选择时间范围',
      value: [],
      props: {
        rangeSeparator: '至',
        clearable: true,
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
    },
    {
      key: 'dateRange1',
      label: '时间范围',
      type: 'date-range-picker',
      placeholder: '请选择时间范围',
      value: [],
      props: {
        rangeSeparator: '至',
        clearable: true,
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
    },
    {
      key: 'dateRange2',
      label: '时间范围',
      type: 'date-range-picker',
      placeholder: '请选择时间范围',
      value: [],
      props: {
        rangeSeparator: '至',
        clearable: true,
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
    },
    {
      key: 'dateRange3',
      label: '时间范围',
      type: 'date-range-picker',
      placeholder: '请选择时间范围',
      value: [],
      props: {
        rangeSeparator: '至',
        clearable: true,
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
    },
  ],
  customButtons: [
    {
      key: 'export',
      text: '导出',
      theme: 'default',
      action: async (formData, context) => {
        console.log('导出数据:', formData);
        // 这里可以调用导出API
      },
    },
    {
      key: 'import',
      text: '导入',
      theme: 'default',
      action: async (formData, context) => {
        console.log('导入数据:', formData);
        // 这里可以调用导入API
      },
    },
  ],
};
// 高级分页配置示例
const advancedPaginationConfig = {
  show: true,
  current: 1,
  pageSize: 10,
  total: 0,
  pageSizeOptions: [5, 10, 20, 50, 100],
  showTotal: true,
  showJumper: true,
  showSizer: true,
  size: 'medium',
  theme: 'default',
  className: 'custom-pagination',
  style: {
    marginTop: '16px',
  },
};

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    status: 1,
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    status: 0,
    createTime: '2024-01-02 10:00:00',
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    status: 1,
    createTime: '2024-01-03 10:00:00',
  },
  {
    id: 4,
    name: '赵六',
    email: 'zhaoliu@example.com',
    phone: '13800138004',
    status: 1,
    createTime: '2024-01-04 10:00:00',
  },
  {
    id: 5,
    name: '钱七',
    email: 'qianqi@example.com',
    phone: '13800138005',
    status: 0,
    createTime: '2024-01-05 10:00:00',
  },
];

// 获取表格数据
const getTableData = async (params) => {
  console.log('请求参数:', params);

  // 模拟API请求延迟
  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });

  // 模拟搜索过滤
  let filteredData = [...mockData];

  if (params.name) {
    filteredData = filteredData.filter((item) => item.name.includes(params.name));
  }

  if (params.email) {
    filteredData = filteredData.filter((item) => item.email.includes(params.email));
  }

  if (params.status !== undefined && params.status !== '') {
    filteredData = filteredData.filter((item) => item.status === params.status);
  }

  // 处理日期范围过滤
  if (params.dateRange && params.dateRange.length === 2) {
    const [startDate, endDate] = params.dateRange;
    filteredData = filteredData.filter((item) => {
      const itemDate = new Date(item.createTime);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return itemDate >= start && itemDate <= end;
    });
  }

  // 模拟分页
  const { page = 1, pageSize = 10 } = params;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = filteredData.slice(start, end);

  return {
    data,
    total: filteredData.length,
  };
};

// 事件处理
const handleSearch = (searchData) => {
  console.log('搜索:', searchData);
};
const handleReset = () => {
  console.log('重置搜索');
};
const handleSelectionChange = (selectedRowKeys, selectedRowsData, currentRowData) => {
  selectedRows.value = selectedRowsData;
  console.log('选择变化:', selectedRowKeys, selectedRowsData);
};

const handleAdd = () => {
  console.log('新增用户');
};
const handleEdit = (row) => {
  console.log('编辑用户:', row);
};
const handleDelete = (row) => {
  console.log('删除用户:', row);
};

const handleError = (error) => {
  console.error('表格请求错误:', error);
  // 这里可以显示错误提示
};
</script>

<style scoped>
.td-pro-table-demo {
  padding: 20px;
}

.card {
  margin-bottom: 40px;
}

.card h3 {
  margin-bottom: 16px;
  color: #1f2937;
  font-size: 16px;
  font-weight: 500;
}
</style>
