<template>
  <div class="resource">
    <!-- 表格 -->
    <pro-table ref="table" :title="$t('user/role.title')" :request="getList" :columns="columns" :search="searchConfig">
      <!-- 工具栏 -->
      <template #toolbar>
        <el-button icon="Plus" @click="onShowAddForm">
          {{ $t('user/role.add') }}
        </el-button>
        <el-button icon="Refresh" @click="refresh">
          {{ $t('user/role.refresh') }}
        </el-button>
      </template>
      <template #resource="{ row }">
        <el-tag
          v-for="(item, index) in row?.resource_id || []"
          :key="index"
          type="info"
          size="small"
          effect="plain"
          style="margin-right: 10px"
          >{{ resourceMap[item] || item }}</el-tag
        >
      </template>
      <!-- 单元格操作列 -->
      <template #operate="scope">
        <!-- 编辑 -->
        <el-button plain circle :icon="Edit" type="default" @click="onShowUpdForm(scope.row)"></el-button>
        <!-- 删除 -->
        <el-popconfirm
          width="240"
          icon-color="#626AEF"
          :confirm-button-text="$t('public.confirm')"
          :cancel-button-text="$t('public.cancel')"
          :title="$t('public.deleteTip')"
          @confirm="onRemove(scope.row)"
        >
          <template #reference>
            <el-button plain circle :icon="Delete" type="danger"></el-button>
          </template>
        </el-popconfirm>
      </template>
    </pro-table>
    <!-- 新建&编辑 -->
    <el-dialog v-model="formModalVisible" @close="onCancel" class="dialog">
      <template #header>{{ formTitle }}</template>
      <pro-form ref="proform" :config="formConfig" @cancel="onCancel" @submit="onSubmit"></pro-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, toRaw, nextTick } from 'vue';
import { Delete, Edit } from '@element-plus/icons-vue';
import { apiGetRoleList, apiRoleModify, apiRoleDel } from '@/api/role';
import { apiGetResourceList } from '@/api/resource';
import { apiGetRoleResourceList, apiRoleResourceModify } from '@/api/role_resource';
import tips from '@/utils/tips';
const { proxy } = getCurrentInstance();

// 表格
const table = ref(null);
const refresh = () => {
  table.value.refresh();
};
const searchConfig = {
  labelWidth: '80px',
  inputWidth: '200px',
  fields: [
    {
      type: 'text',
      label: 'user/role.name',
      name: 'name',
    },
  ],
};
const columns = [
  { label: 'user/role.index', type: 'index', width: 80 },
  {
    label: 'user/role.name',
    prop: 'name',
    'min-width': 100,
    // sortable: true,
  },
  {
    label: 'user/role.resource_id',
    prop: 'resource_id',
    tdSlot: 'resource',
    wrap: false,
  },
  {
    tdSlot: 'operate',
    label: 'public.operate',
    width: 200,
    align: 'center',
  },
];
// paginationConfig: {
//   layout: 'total, prev, pager, next, sizes',
//   pageSize: 10,
//   pageSizes: [5, 10, 20, 50],
//   style: { 'justify-content': 'flex-end' },
// },

const getList = async (params) => {
  const res = await apiGetRoleList(params); // 获取角色
  if (res.code !== 0) return;

  let list = res.data.list || [];

  // 需支持 role_id 批量查询
  let roleResourceRes = await apiGetRoleResourceList({
    role_id: list.map((curr) => curr._id),
  });
  if (roleResourceRes.code !== 0) return;

  // 获取 role 上绑定的 resource_id
  let role2resource = roleResourceRes.data.list.reduce((map, curr) => {
    map[curr.role_id] = curr.resource_id;
    return map;
  }, {});

  list.forEach((curr) => {
    curr.resource_id = role2resource[curr._id] || [];
  });

  return {
    data: list,
    total: res.data.total || 0,
  };
};
const onRemove = async (row) => {
  await apiRoleDel({ id: row._id });
  tips.success('成功');
  table.value.refresh();
};

// 表单
let resourceItems = [];
let resourceMap = ref({});
async function initResourceItems(name = '', { page, limit } = { page: 0, limit: 20 }) {
  let res = await apiGetResourceList({ name, page, limit }); // [ { _id, name, access, cgi } ]
  if (res.code !== 0) return;
  let items = res.data.list.map((curr) => ({ label: curr.name, value: curr._id }));
  return items;
}

const formModalVisible = ref(false);
const formTitle = ref('添加');
const proform = ref(null);
const formConfig = ref({
  labelWidth: '90px',
  inputWidth: '200px',
  fields: [
    // id
    {
      name: 'id',
      attributes: {
        hide: true,
      },
      value: '',
    },
    // name
    {
      component: 'text',
      label: proxy.$t('user/role.name'),
      name: 'name',
      // attributes: {},
      validity: [
        {
          required: true,
          message: 'Name Required',
          trigger: 'blur',
        },
      ],
    },
    // resource_id
    {
      component: 'select',
      label: proxy.$t('user/role.resource_id'),
      name: 'resource_id',
      items: [],
      attributes: {
        multiple: true,
        filterable: true,
        remote: true,
        loading: false,
      },
      events: {
        'remote-method': initResourceItems,
      },
      validity: [
        {
          required: true,
          message: 'Resource Required',
          trigger: 'blur',
        },
      ],
    },
  ],
});
setTimeout(async () => {
  resourceItems = await initResourceItems('', { page: 0, limit: 1000 });
  resourceMap = resourceItems.reduce((map, curr) => {
    map[curr.value] = curr.label;
    return map;
  }, {});

  let found = formConfig.value.fields.find((curr) => curr.name === 'resource_id');
  found.items = resourceItems;
});

const onShowAddForm = () => {
  formModalVisible.value = true;
  formTitle.value = '添加';

  nextTick(() => {
    proform?.value?.resetFields();
  });
};
const onShowUpdForm = (row) => {
  formModalVisible.value = true;
  formTitle.value = '编辑';

  let data = toRaw(row);

  // 恢复表单数据
  data.id = data._id;
  nextTick(() => {
    Object.assign(proform.value.formModal, data);
  });
};
const onSubmit = async (data) => {
  let postData = {
    ...(data.id ? { id: data.id } : {}),
    name: data.name,
    resource_id: data.resource_id,
  };

  let res = await apiRoleModify(postData);
  if (res.code !== 0) return;

  let roleResourceRes = await apiRoleResourceModify({
    role_id: res.data.id,
    resource_id: postData.resource_id,
  });
  if (roleResourceRes.code !== 0) return;

  refresh();
  tips.success('成功');
  formModalVisible.value = false;
};
const onCancel = () => {
  formModalVisible.value = false;
};
</script>

<style lang="scss" scoped>
.resource {
  :deep(.dialog) {
    width: fit-content;

    .el-textarea__inner {
      min-width: 280px;
      min-height: 150px !important; // textarea 的调整除了样式，还有配置 style 属性。没有 style，样式的宽度可以溢出
    }
  }
}
</style>
