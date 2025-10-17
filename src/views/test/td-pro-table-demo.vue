<template>
  <div class="td-pro-table-demo">
    <h2>TdProTable 组件演示</h2>
    
    <!-- 基础表格 -->
    <div class="demo-section">
      <h3>基础表格</h3>
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
    </div>

    <!-- 高级表格 -->
    <div class="demo-section">
      <h3>高级表格（带自定义按钮）</h3>
      <td-pro-table
        :request="getTableData"
        :columns="advancedColumns"
        :search="advancedSearchConfig"
        :pagination="paginationConfig"
        title="高级用户列表"
        @submit="handleSearch"
        @reset="handleReset"
        @selectionChange="handleSelectionChange"
      >
        <template #toolbar>
          <t-button theme="primary" @click="handleAdd">
            <template #icon>
              <t-icon name="add" />
            </template>
            新增用户
          </t-button>
          <t-button theme="default" @click="handleBatchDelete" :disabled="!selectedRows.length">
            <template #icon>
              <t-icon name="delete" />
            </template>
            批量删除
          </t-button>
        </template>

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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { Button as TButton, Tag as TTag, Space as TSpace, Icon as TIcon } from 'tdesign-vue-next';
import TdProTable from '@/components/TdProTable/index.vue';

// 响应式数据
const selectedRows = ref([]);

// 基础表格列配置
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
  {
    key: 'phone',
    title: '电话',
    width: 150,
  },
  {
    key: 'createTime',
    title: '创建时间',
    width: 180,
  },
];

// 高级表格列配置
const advancedColumns = [
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
  {
    key: 'phone',
    title: '电话',
    width: 150,
  },
  {
    key: 'status',
    title: '状态',
    width: 100,
    colKey: 'status',
  },
  {
    key: 'createTime',
    title: '创建时间',
    width: 180,
  },
  {
    key: 'action',
    title: '操作',
    width: 150,
    colKey: 'action',
    fixed: 'right',
  },
];

// 基础搜索配置
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
      key: 'email',
      label: '邮箱',
      type: 'input',
      placeholder: '请输入邮箱',
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

// 高级搜索配置（带自定义按钮）
const advancedSearchConfig = {
  fields: [
    {
      key: 'name',
      label: '姓名',
      type: 'input',
      placeholder: '请输入姓名',
      span: 6,
    },
    {
      key: 'email',
      label: '邮箱',
      type: 'input',
      placeholder: '请输入邮箱',
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
    {
      key: 'createTime',
      label: '创建时间',
      type: 'date-picker',
      placeholder: '请选择创建时间',
      span: 6,
    },
  ],
  layout: 'inline',
  labelWidth: 'auto',
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
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 模拟搜索过滤
  let filteredData = [...mockData];
  
  if (params.name) {
    filteredData = filteredData.filter(item => 
      item.name.includes(params.name)
    );
  }
  
  if (params.email) {
    filteredData = filteredData.filter(item => 
      item.email.includes(params.email)
    );
  }
  
  if (params.status !== undefined && params.status !== '') {
    filteredData = filteredData.filter(item => 
      item.status === params.status
    );
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

const handleBatchDelete = () => {
  console.log('批量删除:', selectedRows.value);
};
</script>

<style scoped>
.td-pro-table-demo {
  padding: 20px;
}

.demo-section {
  margin-bottom: 40px;
}

.demo-section h3 {
  margin-bottom: 16px;
  color: #1f2937;
  font-size: 16px;
  font-weight: 500;
}
</style>
