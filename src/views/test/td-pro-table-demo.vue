<template>
  <div class="td-pro-table-demo">
    <h2>TdProTable 组件演示</h2>

    <!-- 基础表格 -->
    <t-card :bordered="false" class="card">
      <h3>基础表格</h3>
      <td-pro-table
        ref="table"
        class="sample-list"
        :search="searchConfig"
        :request="getTableData"
        :columns="columns"
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

    <!-- 查询 指定用户 指定角色 的资源（使用 TdProForm） -->
    <t-card :bordered="false" class="card">
      <h3>查询指定用户在指定角色下的资源（TdProForm）</h3>
      <td-pro-form ref="formRef2" :config="resourceQueryForm" @submit="onResourceQuerySubmit" />
      <div style="margin-top: 12px">
        <div v-if="resourceQueryResult.length">
          <t-space>
            <div>结果：</div>
            <t-tag v-for="item in resourceQueryResult" :key="item.value" variant="outline" theme="primary">
              {{ item.label }}
            </t-tag>
          </t-space>
        </div>
        <div v-else style="color: #999">请先选择用户、角色后点击"查询资源"</div>
      </div>
    </t-card>

    <!-- 嵌套字段演示 -->
    <t-card :bordered="false" class="card">
      <h3>嵌套字段演示（name 支持点号分隔的路径）</h3>
      <div class="nested-form-description">
        <t-alert theme="info">
          <template #message>
            <div>功能说明</div>
            <div>
              <p><strong>嵌套字段功能：</strong>支持使用点号分隔的路径来定义嵌套的表单数据结构</p>
              <ul style="margin: 8px 0; padding-left: 20px">
                <li><code>user.name</code> → formData.user.name</li>
                <li><code>config.notification.email.enabled</code> → formData.config.notification.email.enabled</li>
                <li>支持任意层级嵌套，自动创建中间对象</li>
                <li>完全支持表单验证、字段联动等所有功能</li>
              </ul>
              <p style="margin-top: 8px">
                <strong>操作提示：</strong>点击"填充测试数据"按钮查看效果，提交后可查看嵌套的数据结构
              </p>
            </div>
          </template>
        </t-alert>
      </div>
      <td-pro-form ref="nestedFormRef" :config="nestedFormConfig" @submit="onNestedFormSubmit">
        <template #submitBtnGroup>
          <t-form-item class="btn-group">
            <t-space>
              <t-button theme="default" @click="handleNestedFormReset">重置</t-button>
              <t-button theme="primary" @click="handleNestedFormSubmit">提交</t-button>
              <t-button theme="default" @click="handleNestedFormFill">填充测试数据</t-button>
            </t-space>
          </t-form-item>
        </template>
      </td-pro-form>
      <div v-if="nestedFormData" class="nested-form-result">
        <h4>提交的数据结构：</h4>
        <pre>{{ JSON.stringify(nestedFormData, null, 2) }}</pre>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="jsx">
import TdProTable from '@/components/TdProTable/index.vue';
import TdProForm from '@/components/TdProForm/index.vue';
import tips from '@/utils/tips';
import { apiGetResourceList, apiResourceModify, apiResourceDel } from '@/api/resource';
import { apiGetUserList } from '@/api/user';
import { apiGetRoleList } from '@/api/role';
import { apiGetRoleResourceList } from '@/api/role_resource';
import { apiGetUserRoleList } from '@/api/user_role';
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

// 基础表格列配置
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
// 基础搜索配置（CLS 规范）
const searchConfig = {
  attributes: {
    labelWidth: '80px', // 根据最长的表单标题，业务进行调节
    layout: 'inline',
    labelAlign: 'left',
    colon: false,
  },
  items: [
    {
      name: 'name',
      label: '资源名',
      component: 'input',
      attributes: {
        placeholder: '请输入',
      },
    },
    {
      name: 'access',
      label: '路径',
      component: 'input',
      attributes: {
        placeholder: '请输入',
      },
    },
    {
      name: 'cgi',
      label: '接口',
      component: 'input',
      attributes: {
        placeholder: '请输入',
      },
    },
  ],
};
// 分页配置
const paginationConfig = {
  // show: true,
  current: 1,
  pageSize: 10,
  total: 0,
  // showTotal: true,
  // showPageSize: false,
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
// 高级搜索配置（CLS 规范，带装饰器和联动）
const advancedSearchConfig = {
  attributes: {
    labelWidth: '80px', // 根据最长的表单标题，业务进行调节
    layout: 'vertical',
    labelAlign: 'right',
    colon: true,
  },
  items: [
    {
      name: 'topic',
      label: '话题',
      component: 'textarea',
      attributes: {
        placeholder: '请输入话题内容',
        style: { width: '400px' },
        rows: 3,
        maxlength: 500,
        showLimit: true,
      },
      decoration: [
        {
          component: 'quill',
          name: 'topic_quill',
          attributes: {
            placement: 'left',
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
              action: (value, { updateItem }) => {
                // 将 textarea 的值同步到 quill 编辑器（新 API：通过装饰器 name 更新）
                updateItem('topic_quill', { modelValue: value || '' });
              },
            },
          ],
        },
      ],
    },
    {
      name: 'userType',
      label: '用户类型',
      component: 'select',
      attributes: {
        value: 'normal',
        help: '当前选择：{{value}}，不同类型将显示不同的表单字段',
      },
      items: [
        { label: '普通用户', value: 'normal' },
        { label: 'VIP用户', value: 'vip' },
        { label: '企业用户', value: 'enterprise' },
      ],
      decoration: [
        {
          component: 'text',
          attributes: {
            placement: 'top',
            value: '💡 选择不同用户类型会显示不同的表单字段',
            class: 'tip-decorator',
          },
        },
        {
          component: 'quill',
          attributes: {
            placement: 'bottom',
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
      ],
    },
    {
      name: 'vipLevel',
      label: 'VIP等级',
      component: 'select',
      attributes: {
        hide: true,
      },
      items: [
        { label: '银卡', value: 'silver' },
        { label: '金卡', value: 'gold' },
        { label: '钻石卡', value: 'diamond' },
      ],
      linkage: [
        {
          watchField: 'userType',
          action: (value, { show, hide }) => {
            if (value === 'vip') {
              show('vipLevel');
            } else {
              hide('vipLevel');
            }
          },
        },
      ],
    },
    {
      name: 'companyName',
      label: '公司名称',
      component: 'input',
      attributes: {
        placeholder: '请输入公司名称',
        hide: true,
      },
      validity: [{ required: true, message: '公司名称不能为空' }],
      linkage: [
        {
          watchField: 'userType',
          action: (value, { show, hide }) => {
            if (value === 'enterprise') {
              show('companyName');
            } else {
              hide('companyName');
            }
          },
        },
      ],
    },
    {
      name: 'companySize',
      label: '公司规模',
      component: 'select',
      attributes: {
        hide: true,
      },
      items: [
        { label: '1-10人', value: 'small' },
        { label: '11-50人', value: 'medium' },
        { label: '51-200人', value: 'large' },
        { label: '200人以上', value: 'xlarge' },
      ],
      linkage: [
        {
          watchField: 'userType',
          action: (value, { show, hide }) => {
            if (value === 'enterprise') {
              show('companySize');
            } else {
              hide('companySize');
            }
          },
        },
      ],
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

// 获取表格数据
const getTableData = async (params) => {
  const res = await apiGetResourceList(params);
  if (res.code === 0) {
    return {
      list: res?.data?.list || [],
      total: res?.data?.total || 0,
    };
  }
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
  attributes: {
    labelWidth: '90px',
    layout: 'vertical',
    showSubmit: true,
    showReset: true,
    submitText: '提交',
    resetText: '重置',
  },
  items: [
    // id（隐藏）
    {
      component: 'input',
      name: 'id',
      label: 'ID',
      attributes: {
        value: '',
        hide: true,
      },
    },
    // name
    {
      name: 'name',
      component: 'input',
      label: '用户名',
      attributes: {
        placeholder: '请输入用户名',
      },
      validity: [{ required: true, message: 'Name Required' }], // todo
    },
    // access
    {
      name: 'access',
      component: 'textarea',
      label: '路径',
      attributes: {
        placeholder: '请输入路径',
      },
      validity: [
        { required: true, message: 'Access Required' },
        {
          validator: (value) => {
            if (!validMultiLineTxt(accessReg, value)) return 'Word error';
            return true;
          },
        },
      ],
    },
    // cgi
    {
      name: 'cgi',
      component: 'textarea',
      label: '接口',
      attributes: {
        placeholder: '请输入接口',
        style: { width: '280px', minHeight: '150px' },
      },
      validity: [
        { required: true, message: 'Cgi Required' },
        {
          validator: (value) => {
            if (!validMultiLineTxt(cgiReg, value)) return 'Word error';
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

// ===== 使用 TdProForm 查询 指定用户 指定角色 的资源 =====
const resourceQueryResult = ref([]);
const resourceQueryForm = ref({
  attributes: {
    layout: 'inline',
    labelAlign: 'left',
    colon: false,
    showSubmit: true,
    showReset: true,
    submitText: '查询资源',
    labelWidth: '60px',
  },
  items: [
    {
      name: 'user_id',
      label: '用户',
      component: 'select',
      attributes: {
        placeholder: '请选择用户',
        filterable: true,
      },
      // 初始化选项：进入时加载一次
      linkage: [
        {
          watchField: 'user_id',
          action: async (value, { setOptions, setValue }) => {
            // 当用户改变时，也可动态刷新角色列表（这里简单处理为不联动过滤）
            const res = await apiGetUserRoleList({
              user_id: [value],
            });

            let roleIds = res?.data?.list?.map((curr) => curr.role_id).flat();

            const options = [...toRaw(roleIdItems.value).filter((curr) => roleIds.includes(curr.value))];
            // const options = [ roleIdItems.value.filter((curr) => roleIds.includes(curr.value)) ]; // ...toRaw([Proxy 对象])，toRaw 对数组不生效的

            setValue('role_id', '');
            setOptions('role_id', options);
          },
        },
      ],
      validity: [
        {
          required: true,
          message: '请选择用户',
        },
      ],
    },
    {
      name: 'role_id',
      label: '角色',
      component: 'select',
      // value: '',
      attributes: {
        placeholder: '请选择角色',
        filterable: true,
      },
      validity: [
        {
          required: true,
          message: '请选择角色',
        },
      ],
    },
  ],
});

// 首次进入时加载用户与角色选项
onMounted(async () => {
  initRoleItems({ page: 0, limit: 1000 });
  initResourceItems({ page: 0, limit: 1000 });

  try {
    const userRes = await apiGetUserList({});
    const userOptions = (userRes?.data?.list || []).map((u) => ({ label: u.username, value: u.id }));
    nextTick(() => {
      formRef2.value?.setOptions('user_id', userOptions);
    });
  } catch (e) {
    console.error('初始化用户失败', e);
  }
});

const formRef2 = ref(null);
const onResourceQuerySubmit = async (values) => {
  console.log('values', values);

  try {
    const { data } = await apiGetRoleResourceList({ role_id: [values.role_id] });

    let bindResources = data.list.reduce((arr, curr) => {
      arr.push(...curr.resource_id);
      return arr;
    }, []);

    resourceQueryResult.value = resourceItems.value.filter((curr) => bindResources.includes(curr.value));
  } catch (e) {
    console.error('查询资源失败', e);
  }
};

// 表单
let roleIdItems = ref([]);
async function initRoleItems({ name = '', page = 0, limit = 20 } = {}) {
  let res = await apiGetRoleList({ name, page, limit }); // [ { _id, name, access, cgi } ]
  if (res.code !== 0) return;
  roleIdItems.value = res.data.list.map((curr) => ({ label: curr.name, value: curr._id }));
}

let resourceItems = ref([]);
async function initResourceItems({ name = '', page = 0, limit = 20 } = {}) {
  let res = await apiGetResourceList({ name, page, limit }); // [ { _id, name, access, cgi } ] // todo
  if (res.code !== 0) return;
  resourceItems.value = res.data.list.map((curr) => ({ label: curr.name, value: curr._id }));
}

// ==================== 嵌套字段演示 ====================
const nestedFormRef = ref(null);
const nestedFormData = ref(null);

// 嵌套字段表单配置
const nestedFormConfig = {
  attributes: {
    layout: 'vertical',
    labelWidth: '140px',
    showSubmit: false,
    showReset: false,
  },
  items: [
    // 用户信息组
    {
      label: '用户名',
      name: 'user.name',
      component: 'input',
      value: '',
      componentProps: {
        placeholder: '请输入用户名',
      },
      rules: [{ required: true, message: '请输入用户名' }],
    },
    {
      label: '用户邮箱',
      name: 'user.email',
      component: 'input',
      value: '',
      componentProps: {
        placeholder: '请输入邮箱',
      },
      rules: [
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '请输入正确的邮箱格式' },
      ],
    },
    {
      label: '用户年龄',
      name: 'user.age',
      component: 'number',
      value: undefined,
      componentProps: {
        min: 1,
        max: 150,
        placeholder: '请输入年龄',
      },
    },

    // 联系方式组
    {
      label: '手机号',
      name: 'user.contact.phone',
      component: 'input',
      value: '',
      componentProps: {
        placeholder: '请输入手机号',
      },
    },
    {
      label: '紧急联系人',
      name: 'user.contact.emergency',
      component: 'input',
      value: '',
      componentProps: {
        placeholder: '请输入紧急联系人',
      },
    },

    // 公司信息组
    {
      label: '公司名称',
      name: 'company.name',
      component: 'input',
      value: '',
      componentProps: {
        placeholder: '请输入公司名称',
      },
    },
    {
      label: '公司地址',
      name: 'company.address',
      component: 'input',
      value: '',
      componentProps: {
        placeholder: '请输入公司地址',
      },
    },
    {
      label: '所属部门',
      name: 'company.department',
      component: 'input',
      value: '',
      componentProps: {
        placeholder: '请输入所属部门',
      },
    },

    // 配置信息组（带联动）
    {
      label: '主题',
      name: 'config.appearance.theme',
      component: 'select',
      value: 'light',
      items: [
        { label: '浅色', value: 'light' },
        { label: '深色', value: 'dark' },
        { label: '自动', value: 'auto' },
      ],
    },
    {
      label: '语言',
      name: 'config.appearance.language',
      component: 'select',
      value: 'zh-CN',
      items: [
        { label: '简体中文', value: 'zh-CN' },
        { label: 'English', value: 'en-US' },
        { label: '日本語', value: 'ja-JP' },
      ],
    },
    {
      label: '启用邮件通知',
      name: 'config.notification.email.enabled',
      component: 'switch',
      value: false,
    },
    {
      label: '邮件通知地址',
      name: 'config.notification.email.address',
      component: 'input',
      value: '',
      hide: true,
      componentProps: {
        placeholder: '请输入邮件通知地址',
      },
      linkage: [
        {
          watchField: 'config.notification.email.enabled',
          action: (value, { show, hide, setValue }) => {
            if (value) {
              show('config.notification.email.address');
            } else {
              hide('config.notification.email.address');
              setValue('config.notification.email.address', '');
            }
          },
        },
      ],
    },
    {
      label: '启用短信通知',
      name: 'config.notification.sms.enabled',
      component: 'switch',
      value: false,
    },
    {
      label: '短信通知手机号',
      name: 'config.notification.sms.phone',
      component: 'input',
      value: '',
      hide: true,
      componentProps: {
        placeholder: '请输入短信通知手机号',
      },
      linkage: [
        {
          watchField: 'config.notification.sms.enabled',
          action: (value, { show, hide, setValue }) => {
            if (value) {
              show('config.notification.sms.phone');
            } else {
              hide('config.notification.sms.phone');
              setValue('config.notification.sms.phone', '');
            }
          },
        },
      ],
    },
    {
      label: '通知频率',
      name: 'config.notification.frequency',
      component: 'select',
      value: 'daily',
      items: [
        { label: '实时', value: 'realtime' },
        { label: '每小时', value: 'hourly' },
        { label: '每天', value: 'daily' },
        { label: '每周', value: 'weekly' },
      ],
    },
  ],
};

// 提交嵌套表单
const onNestedFormSubmit = (data) => {
  console.log('嵌套表单提交的数据:', data);
  nestedFormData.value = data;
  tips.success('提交成功！请查看下方的数据结构');
};
// 重置嵌套表单
const handleNestedFormReset = () => {
  nestedFormRef.value?.resetFields();
  nestedFormData.value = null;
  tips.info('表单已重置');
};
// 提交嵌套表单
const handleNestedFormSubmit = async () => {
  const valid = await nestedFormRef.value?.validate();
  if (valid === true) {
    const data = nestedFormRef.value?.getFieldsValue();
    onNestedFormSubmit(data);
  }
};

// 填充测试数据
const handleNestedFormFill = () => {
  // 使用嵌套对象结构批量设置
  nestedFormRef.value?.setFieldsValue({
    user: {
      name: '张三',
      email: 'zhangsan@example.com',
      age: 28,
      contact: {
        phone: '13800138000',
        emergency: '李四',
      },
    },
    company: {
      name: '某某科技有限公司',
      address: '北京市朝阳区',
      department: '技术部',
    },
    config: {
      appearance: {
        theme: 'dark',
        language: 'zh-CN',
      },
      notification: {
        email: {
          enabled: true,
          address: 'notify@example.com',
        },
        sms: {
          enabled: true,
          phone: '13900139000',
        },
        frequency: 'hourly',
      },
    },
  });

  tips.success('测试数据已填充');
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

.nested-form-description {
  margin-bottom: 20px;

  :deep(.t-alert) {
    border-radius: 4px;
  }

  p {
    margin: 0 0 8px 0;
    line-height: 1.6;
  }

  ul {
    margin: 8px 0;
    padding-left: 20px;

    li {
      margin: 4px 0;
      line-height: 1.8;

      code {
        padding: 2px 6px;
        background: #f3f4f6;
        border-radius: 3px;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        color: #d14;
      }
    }
  }
}

.nested-form-result {
  margin-top: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #e5e7eb;

  h4 {
    margin: 0 0 12px 0;
    color: #374151;
    font-size: 14px;
    font-weight: 500;
  }

  pre {
    margin: 0;
    padding: 12px;
    background: #fff;
    border-radius: 4px;
    overflow-x: auto;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    color: #1f2937;
    border: 1px solid #e5e7eb;
  }
}
</style>
