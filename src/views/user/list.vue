<template>
  <div class="user">
    <pro-table ref="table" :title="$t('user/list.title')" :request="getList" :columns="columns" :search="searchConfig">
      <!-- 工具栏 -->
      <template #toolbar>
        <el-button icon="Plus" @click="onShowAddForm">
          {{ $t('user/list.add') }}
        </el-button>
        <el-button icon="Refresh" @click="refresh">
          {{ $t('user/list.refresh') }}
        </el-button>
      </template>
      <!-- 状态显示，需要 columns.tdSlot = 'status' -->
      <template #avatar="{ row }">
        <el-avatar size="small" fit="cover" :src="row.avatar" />
      </template>
      <template #role="{ row }">
        <el-tag
          v-for="(item, index) in row?.role_id || []"
          :key="index"
          type="info"
          size="small"
          effect="plain"
          style="margin-right: 10px"
          >{{ roleId2Zh[item] || item }}</el-tag
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
import { ref, toRaw, nextTick } from 'vue';
import { Delete, Edit } from '@element-plus/icons-vue';
import { apiGetUserList, apiUserUpd, apiUserDel } from '@/api/user';
import { apiGetRoleList } from '@/api/role';
import { apiGetUserRoleList, apiUserRoleModify } from '@/api/user_role';
import tips from '@/utils/tips';

// 表格
const table = ref(null);
const searchConfig = ref({
  labelWidth: '90px', // 必须带上单位
  inputWidth: '200px', // 必须带上单位
  fields: [
    {
      type: 'text',
      label: 'user/list.name',
      name: 'username',
    },
  ],
});
// 表格列配置，大部分属性跟el-table-column配置一样
const columns = [
  // { type: 'selection', width: 56 },
  { label: 'user/list.index', type: 'index', width: 80 },
  {
    label: 'user/list.name',
    prop: 'username',
    sortable: true,
    // width: 180,
  },
  {
    label: 'user/list.role_id',
    prop: 'role_id',
    sortable: true,
    tdSlot: 'role',
  },
  {
    label: 'user/list.avatar',
    prop: 'avatar',
    // sortable: true,
    // width: 180,
    tdSlot: 'avatar', // 自定义单元格内容的插槽名称
  },
  {
    label: 'public.operate',
    width: 180,
    align: 'center',
    tdSlot: 'operate',
  },
];
const getList = async (params) => {
  const res = await apiGetUserList(params); // 获取用户
  if (res.code !== 0) return;

  let list = res.data.list || [];

  let userRoleRes = await apiGetUserRoleList({
    user_id: list.map((curr) => curr.id),
  });
  if (userRoleRes.code !== 0) return;

  // 获取 user 上绑定的 role_id
  let user2role = userRoleRes.data.list.reduce((map, curr) => {
    map[curr.user_id] = curr.role_id;
    return map;
  }, {});

  list.forEach((curr) => {
    curr.role_id = user2role[curr.id] || [];
  });

  return {
    data: list,
    total: res.data.total || 0,
  };
};
const refresh = () => {
  table.value.refresh();
};
const onRemove = async (row) => {
  await apiUserDel({ id: row.id });
  table.value.refresh();
};

// 表单
let roleItems = [];
let roleId2Zh = ref({}); // 角色翻译
async function initRoleItems(name = '', { page, limit } = { page: 0, limit: 20 }) {
  let res = await apiGetRoleList({ name, page, limit }); // [ { _id, name, access, cgi } ]
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
    // username
    {
      component: 'text',
      label: 'user/list.name',
      name: 'username',
      validity: [
        {
          required: true,
          message: 'Username Required',
          trigger: 'blur',
        },
      ],
    },
    // role_Id
    {
      component: 'select',
      label: 'user/list.role_id',
      name: 'role_id',
      items: [],
      attributes: {
        multiple: true,
        filterable: true,
        remote: true,
        loading: false,
      },
      events: {
        'remote-method': initRoleItems,
      },
      validity: [
        {
          required: true,
          message: 'Role Required',
          trigger: 'blur',
        },
      ],
    },
  ],
});
setTimeout(async () => {
  roleItems = (await initRoleItems('', { page: 0, limit: 1000 })) || [];
  roleId2Zh = roleItems.reduce((map, curr) => {
    map[curr.value] = curr.label;
    return map;
  }, {});

  let found = formConfig.value.fields.find((curr) => curr.name === 'role_id');
  found.items = roleItems;
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
  nextTick(() => {
    Object.assign(proform.value.formModal, data);
  });
};
const onSubmit = async (data) => {
  let postData = {
    ...(data.id ? { id: data.id } : {}),
    username: data.username,
  };
  let res = await apiUserUpd(postData);
  if (res.code !== 0) return;

  let userRoleRes = await apiUserRoleModify({
    user_id: postData.id,
    role_id: data.role_id,
  });
  if (userRoleRes.code !== 0) return;

  refresh();
  tips.success('成功');
  formModalVisible.value = false;
};
const onCancel = () => {
  formModalVisible.value = false;
};
</script>
<style lang="scss" scoped>
.user {
  :deep(.dialog) {
    width: fit-content;

    .el-textarea__inner {
      min-width: 280px;
      min-height: 150px !important; // textarea 的调整除了样式，还有配置 style 属性。没有 style，样式的宽度可以溢出
    }
  }
}
</style>
