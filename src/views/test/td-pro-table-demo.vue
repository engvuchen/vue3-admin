<template>
  <div class="td-pro-table-demo">
    <h2>TdProTable 组件演示</h2>

    <!-- 基础表格 -->
    <t-card :bordered="false" class="card">
      <h3>基础表格</h3>
      <td-pro-table
        ref="table"
        class="sample-list"
        :request="getTableData"
        :columns="columns"
        :search="searchConfig"
        :pagination="paginationConfig"
        @submit="handleSearch"
        @reset="handleReset"
        @selectionChange="handleSelectionChange"
      >
        <!-- 工具栏 -->
        <template #toolbar>
          <t-button theme="default" @click="onShowAddForm">
            <template #icon>
              <t-icon name="add" />
            </template>
            添加
          </t-button>
          <t-button theme="default" @click="refresh">
            <template #icon>
              <t-icon name="refresh" />
            </template>
            刷新
          </t-button>
        </template>
      </td-pro-table>
      <!-- 新建&编辑对话框 -->
      <t-dialog
        v-model:visible="dialogVisible"
        :header="formTitle"
        @close="onCancel"
        class="dialog"
        :confirm-btn="null"
        :cancel-btn="null"
      >
        <td-pro-form ref="formRef" :config="formConfig" @submit="onSubmit" />
      </t-dialog>
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
import TdProForm from '@/components/TdProForm/index.vue';
import tips from '@/utils/tips';
import { apiGetResourceList, apiResourceModify, apiResourceDel } from '@/api/resource';
import { validMultiLineTxt } from '@/utils/validate';

// 正则定义
const accessReg = /^(\/[a-zA-Z-]+)+$/; // /user/list-ab
const cgiReg = /^(\/[a-zA-Z_]+)+$/; // /user/get_list

// 响应式数据
const selectedRows = ref([]);
const table = ref(null);
const formRef = ref(null);
const dialogVisible = ref(false);
const formTitle = ref('添加');

// 基础表格列配置 todo
const columns = [
  {
    label: 'user/resource.name',
    colKey: 'name',
    title: '资源名',
  },
  {
    label: 'user/resource.access',
    colKey: 'access',
    title: '路径',
    className: 'access',
    cell: (h, { row }) => {
      return (row?.access || []).map((item, index) => (
        <t-tag key={index} style="margin-right: 8px" theme="success" variant="outline" size="small">
          {item}
        </t-tag>
      ));
    },
  },
  // todo
  {
    label: 'user/resource.cgi',
    colKey: 'cgi',
    title: '接口',
    className: 'cgi',
    cell: (h, { row }) => {
      return (row?.cgi || []).map((item, index) => (
        <t-tag key={index} style="margin-right: 8px" theme="success" variant="outline" size="small">
          {item}
        </t-tag>
      ));
    },
  },
  {
    colKey: 'operate',
    title: '操作',
    width: 200,
    align: 'center',
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-button theme="primary" variant="text" onClick={() => onShowEditForm(row)}>
            <t-icon name="edit" />
          </t-button>
          <t-popconfirm theme="danger" content="确定要删除这条记录吗？" onConfirm={() => onRemove(row)}>
            <t-button theme="danger" variant="text">
              <t-icon name="delete" />
            </t-button>
          </t-popconfirm>
        </t-space>
      );
    },
  },
];
// 基础搜索配置
const searchConfig = {
  labelWidth: '80px', // 根据最长的表单标题，业务进行调节
  fields: [
    {
      key: 'name',
      label: '资源名',
      type: 'input',
      placeholder: '请输入',
    },
    {
      key: 'access',
      label: '路径',
      type: 'input',
      placeholder: '请输入',
    },
    {
      key: 'cgi',
      label: '接口',
      type: 'input',
      placeholder: '请输入',
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
  layout: 'vertical',
  fields: [
    {
      key: 'topic',
      label: '话题',
      type: 'textarea',
      placeholder: '请输入话题内容',
      props: {
        style: { width: '400px' },
        rows: 3,
        maxlength: 500,
        showLimit: true,
      },
      beforeDecorator: {
        label: '话题详情',
        type: 'quill',
        props: {
          style: { marginLeft: '80px', width: '400px' },
          modelValue: '',
          placeholder: '请输入话题详情...',
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
        linkage: [
          {
            watchField: 'topic',
            action: (value, { updateDecoratorProps }) => {
              // 将 textarea 的值同步到 quill 编辑器
              updateDecoratorProps('topic', 'bottom', { modelValue: value || '' });
            },
          },
        ],
      },
    },
    {
      key: 'userType',
      label: '用户类型',
      type: 'select',
      value: 'normal',
      options: [
        { label: '普通用户', value: 'normal' },
        { label: 'VIP用户', value: 'vip' },
        { label: '企业用户', value: 'enterprise' },
      ],
      help: '当前选择：{{value}}，不同类型将显示不同的表单字段', // 之前我有计划 help 可以联动的吗？
      topDecorator: {
        type: 'text',
        value: '💡 选择不同用户类型会显示不同的表单字段',
        props: {
          class: 'tip-decorator',
        },
      },
      bottomDecorator: {
        label: '文章内容',
        type: 'quill',
        props: {
          // style: { maxHeight: '200px' },
          value: '你好啊',
          placeholder: '请输入文章内容...',
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
    // {
    //   key: 'discount',
    //   label: '折扣比例',
    //   type: 'slider',
    //   value: 100,
    //   props: { min: 50, max: 100, step: 5 },
    //   afterDecorator: {
    //     type: 'text',
    //     value: '当前折扣: {{value}}%',
    //     className: 'discount-decorator',
    //   },
    //   linkage: [
    //     {
    //       watchField: 'userType',
    //       action: (value, { setFieldValue }) => {
    //         switch (value) {
    //           case 'vip':
    //             setFieldValue('discount', 85);
    //             break;
    //           case 'enterprise':
    //             setFieldValue('discount', 75);
    //             break;
    //           default:
    //             setFieldValue('discount', 100);
    //             break;
    //         }
    //       },
    //     },
    //   ],
    // },
    // {
    //   key: 'notifications',
    //   label: '接收通知',
    //   type: 'switch',
    //   value: true,
    //   afterDecorator: {
    //     type: 'text',
    //     value: '开启后将通过邮件接收重要通知',
    //     className: 'help-text',
    //   },
    // },
  ],
};

// todo 外部改配置无效；因为组件设计把 fields 另外展开了，丢失了响应性；必须通过内部 api 控制了
// setTimeout(() => {
//   advancedSearchConfig.fields.label = '延迟被改的话题';
// }, 1000);

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

// 获取表格数据
const getTableData = async (params) => {
  const { data } = await apiGetResourceList(params);
  return {
    data: data?.list || [],
    total: Number(data?.total) || 0,
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
// 表格刷新
const refresh = () => {
  table.value?.refresh();
};
// todo
// 表单配置
const formConfig = ref({
  labelWidth: '90px',
  fields: [
    // id
    {
      type: 'input',
      key: 'id',
      value: '',
      visible: false,
    },
    // name
    {
      key: 'name',
      type: 'input',
      label: '用户名',
      // label: 'user/resource.name',
      placeholder: '请输入用户名',
      rules: [
        {
          required: true,
          message: 'Name Required',
        },
      ],
    },
    // access
    {
      key: 'access',
      type: 'textarea',
      label: '路径', // user/resource.batchDelete
      placeholder: '请输入路径',
      props: {
        // 源码不支持 style：1. 包裹 div 去掉了 style 2. textarea 接受的 props 是固定的
        // style: {
        //   // minWidth: '280px',
        //   // minHeight: '280px',
        // },
        // rows: 80,
        // cols: 1200,
      },
      rules: [
        {
          required: true,
          message: 'Access Required',
        },
        {
          validator: (value) => {
            if (!validMultiLineTxt(accessReg, value)) {
              return 'Word error';
            }
            return true;
          },
        },
      ],
    },
    // cgi
    {
      key: 'cgi',
      type: 'textarea',
      label: '接口',
      placeholder: '请输入接口',
      props: {
        style: {
          width: '280px',
          minHeight: '150px',
        },
      },
      rules: [
        {
          required: true,
          message: 'Cgi Required',
        },
        {
          validator: (value) => {
            if (!validMultiLineTxt(cgiReg, value)) {
              return 'Word error';
            }
            return true;
          },
        },
      ],
    },
  ],
});
// 显示添加表单
const onShowAddForm = () => {
  console.log('onShowAddForm');

  dialogVisible.value = true;
  formTitle.value = '添加';
  nextTick(() => {
    formRef.value?.resetFields(); // 会触发 reset
  });
};
// 显示编辑表单
const onShowEditForm = (row) => {
  console.log('row', toRaw(row));

  dialogVisible.value = true;
  formTitle.value = '编辑';

  nextTick(() => {
    formRef.value?.setFieldsValue({
      id: row._id,
      name: row.name,
      access: row.access.join('\n'),
      cgi: row.cgi.join('\n'),
    });
  });
};
// 提交表单
const onSubmit = async (data) => {
  // 将 textarea 的多行文本转换为数组（去除空行和首尾空格）
  const accessArray = (data.access || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);
  const cgiArray = (data.cgi || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);

  const postData = {
    id: data.id,
    name: data.name,
    access: accessArray,
    cgi: cgiArray,
  };
  let res = await apiResourceModify(postData);
  if (res.code !== 0) return;

  tips.success('成功');
  dialogVisible.value = false;
  refresh();
};
// 取消表单
const onCancel = () => {
  dialogVisible.value = false; // 重置会触发 reset；导致 onCancel 被触发
};
// 删除记录
const onRemove = async (row) => {
  let res = await apiResourceDel({ id: row._id });
  if (res.code !== 0) return;

  refresh();
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

<style lang="scss" scoped>
.td-pro-table-demo {
  padding: 20px;
}
.sample-list {
  .access {
    width: 400px;
    white-space: pre-line;
    word-break: break-all;
  }
  .cgi {
    width: 400px;
    white-space: pre-line;
    word-break: break-all;
  }
}

:deep(.dialog) {
  .t-form__controls {
    margin-left: 0 !important;
  }
  .btn-group {
    .t-form__controls-content {
      justify-content: center;
    }
  }
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
