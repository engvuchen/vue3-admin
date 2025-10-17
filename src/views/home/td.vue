<template>
  <div class="role-management">
    <!-- 搜索区域 -->
    <t-card class="search-card" :bordered="false">
      <t-form ref="searchForm" :data="searchForm" layout="inline" @submit="handleSearch">
        <t-form-item label="角色名称" name="name">
          <t-input v-model="searchForm.name" placeholder="请输入角色名称" clearable style="width: 200px" />
        </t-form-item>
        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit" :loading="loading">
              <template #icon><t-icon name="search" /></template>
              搜索
            </t-button>
            <t-button @click="handleReset">
              <template #icon><t-icon name="refresh" /></template>
              重置
            </t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-card>

    <!-- 操作区域 -->
    <t-card class="action-card" :bordered="false" style="display: flex; justify-content: flex-end">
      <t-space>
        <t-button theme="primary" @click="handleAdd">
          <template #icon>
            <t-icon name="add" />
          </template>
          新建角色
        </t-button>
        <t-button @click="handleRefresh" :loading="loading">
          <template #icon><t-icon name="refresh" /></template>
          刷新
        </t-button>
      </t-space>
    </t-card>

    <!-- 表格区域 -->
    <t-card class="table-card" :bordered="false">
      <t-table
        :data="tableData"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <!-- 资源权限列 -->
        <template #resource="{ row }">
          <t-space wrap>
            <t-tag
              v-for="resourceId in row.resource_id || []"
              :key="resourceId"
              theme="primary"
              variant="light"
              size="small"
            >
              {{ getResourceName(resourceId) }}
            </t-tag>
            <t-tag v-if="!row.resource_id || row.resource_id.length === 0" theme="default" variant="light" size="small">
              无权限
            </t-tag>
          </t-space>
        </template>

        <!-- 操作列 -->
        <template #operation="{ row }">
          <t-space>
            <t-button theme="primary" variant="text" size="small" @click="handleEdit(row)">
              <template #icon><t-icon name="edit" /></template>
              编辑
            </t-button>
            <t-popconfirm content="确定要删除这个角色吗？删除后无法恢复。" @confirm="handleDelete(row)">
              <t-button theme="danger" variant="text" size="small">
                <template #icon><t-icon name="delete" /></template>
                删除
              </t-button>
            </t-popconfirm>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 新建/编辑对话框 -->
    <t-dialog
      v-model:visible="dialogVisible"
      :header="dialogTitle"
      width="600px"
      :confirm-on-enter="false"
      @confirm="handleSubmit"
      @cancel="handleCancel"
    >
      <t-form ref="formRef" :data="formData" :rules="formRules" label-width="100px" @submit="handleSubmit">
        <t-form-item label="角色名称" name="name">
          <t-input v-model="formData.name" placeholder="请输入角色名称" />
        </t-form-item>

        <t-form-item label="资源权限" name="resource_id" help="支持多选，可搜索资源名称">
          <t-select
            v-model="formData.resource_id"
            placeholder="请选择资源权限"
            multiple
            filterable
            clearable
            :loading="resourceLoading"
            @search="handleResourceSearch"
            @focus="handleResourceFocus"
            style="width: 100%"
          >
            <t-option
              v-for="resource in resourceOptions"
              :key="resource.value"
              :label="resource.label"
              :value="resource.value"
            />
          </t-select>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { apiGetRoleList, apiRoleModify, apiRoleDel } from '@/api/role';
import { apiGetResourceList } from '@/api/resource';
import { apiGetRoleResourceList, apiRoleResourceModify } from '@/api/role_resource';

// 响应式数据
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const isEdit = ref(false);
const resourceLoading = ref(false);

// 搜索表单
const searchForm = reactive({
  name: '',
});

// 表格数据
const tableData = ref([]);
const resourceMap = ref({});
const resourceOptions = ref([]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
  showSizer: true,
  pageSizeOptions: [10, 20, 50, 100],
});

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  resource_id: [],
});

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  resource_id: [{ required: true, message: '请选择资源权限', trigger: 'change' }],
};

// 表格列配置
const columns = [
  {
    colKey: 'index',
    title: '序号',
    width: 80,
    cell: (h, { rowIndex }) => {
      return (pagination.current - 1) * pagination.pageSize + rowIndex + 1;
    },
  },
  {
    colKey: 'name',
    title: '角色名称',
    width: 200, // 设置固定宽度
    ellipsis: true,
  },
  {
    colKey: 'resource_id',
    title: '资源权限',
    width: 200, // 设置固定宽度
    cell: 'resource',
  },
  {
    colKey: 'operation',
    title: '操作',
    cell: 'operation',
    // fixed: 'right',
    className: 'opts',
    width: 80,
  },
];

// 计算属性
const getResourceName = (resourceId) => {
  return resourceMap.value[resourceId] || resourceId;
};

// 方法
const loadRoleList = async () => {
  try {
    loading.value = true;
    const params = {
      name: searchForm.name,
      page: pagination.current - 1,
      limit: pagination.pageSize,
    };

    const res = await apiGetRoleList(params);

    if (res.code !== 0) {
      MessagePlugin.error('获取角色列表失败');
      return;
    }

    let list = res.data.list || [];

    // 获取角色资源关联
    if (list.length > 0) {
      const roleResourceRes = await apiGetRoleResourceList({
        role_id: list.map((item) => item._id),
      });

      if (roleResourceRes.code === 0) {
        const role2resource = roleResourceRes.data.list.reduce((map, curr) => {
          map[curr.role_id] = curr.resource_id;
          return map;
        }, {});

        list.forEach((item) => {
          item.resource_id = role2resource[item._id] || [];
        });
      }
    }

    tableData.value = list;
    pagination.total = res.data.total || 0;
  } catch (error) {
    console.error('加载角色列表失败:', error);
    MessagePlugin.error('加载角色列表失败');
  } finally {
    loading.value = false;
  }
};

const loadResourceList = async (name = '') => {
  try {
    resourceLoading.value = true;
    const res = await apiGetResourceList({
      name,
      page: 0,
      limit: 1000,
    });

    if (res.code === 0) {
      const items = res.data.list.map((item) => ({
        label: item.name,
        value: item._id,
      }));

      resourceOptions.value = items;

      // 更新资源映射
      resourceMap.value = items.reduce((map, item) => {
        map[item.value] = item.label;
        return map;
      }, {});
    }
  } catch (error) {
    console.error('加载资源列表失败:', error);
  } finally {
    resourceLoading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  loadRoleList();
};

const handleReset = () => {
  searchForm.name = '';
  pagination.current = 1;
  loadRoleList();
};

const handleRefresh = () => {
  loadRoleList();
};

const handlePageChange = (pageInfo) => {
  pagination.current = pageInfo.current;
  loadRoleList();
};

const handlePageSizeChange = (pageInfo) => {
  pagination.current = 1;
  pagination.pageSize = pageInfo.pageSize;
  loadRoleList();
};
const handleAdd = () => {
  dialogTitle.value = '新建角色';
  isEdit.value = false;
  dialogVisible.value = true;

  // 重置表单
  Object.assign(formData, {
    id: '',
    name: '',
    resource_id: [],
  });
};

const handleEdit = (row) => {
  dialogTitle.value = '编辑角色';
  isEdit.value = true;
  dialogVisible.value = true;

  // 填充表单数据
  Object.assign(formData, {
    id: row._id,
    name: row.name,
    resource_id: row.resource_id || [],
  });
};

const handleDelete = async (row) => {
  try {
    const res = await apiRoleDel({ id: row._id });
    if (res.code === 0) {
      MessagePlugin.success('删除成功');
      loadRoleList();
    } else {
      MessagePlugin.error('删除失败');
    }
  } catch (error) {
    console.error('删除角色失败:', error);
    MessagePlugin.error('删除失败');
  }
};

const handleSubmit = async () => {
  try {
    // 表单验证
    const formRef = document.querySelector('.t-dialog .t-form');
    if (!formRef) return;

    // 提交数据
    const postData = {
      ...(formData.id ? { id: formData.id } : {}),
      name: formData.name,
      resource_id: formData.resource_id,
    };

    const res = await apiRoleModify(postData);
    if (res.code !== 0) {
      MessagePlugin.error('保存失败');
      return;
    }

    // 更新角色资源关联
    const roleResourceRes = await apiRoleResourceModify({
      role_id: res.data.id,
      resource_id: postData.resource_id,
    });

    if (roleResourceRes.code !== 0) {
      MessagePlugin.error('更新权限失败');
      return;
    }

    MessagePlugin.success(isEdit.value ? '更新成功' : '创建成功');
    dialogVisible.value = false;
    loadRoleList();
  } catch (error) {
    console.error('保存角色失败:', error);
    MessagePlugin.error('保存失败');
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};

const handleResourceSearch = (value) => {
  loadResourceList(value);
};

const handleResourceFocus = () => {
  if (resourceOptions.value.length === 0) {
    loadResourceList();
  }
};

// 生命周期
onMounted(() => {
  loadRoleList();
  loadResourceList();
});
</script>

<style lang="scss" scoped>
.role-management {
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
  text-align: center;

  h1 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 24px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
}

.search-card,
.action-card,
.table-card {
  margin-bottom: 16px;
}

/** 没有 `:deep`，结果 .opts[data-v-xx]，只能在顶层使用；用了 deep，data-vxx opts */
:deep(.opts) {
  width: 5rem;
  min-width: 5rem;
  text-align: center;
  white-space: pre-line;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}
</style>
