<template>
  <pro-table
    ref="table"
    :title="$t('user/list.title')"
    :request="getList"
    :columns="columns"
    :search="searchConfig"
    @selectionChange="handleSelectionChange"
  >
    <!-- 工具栏 -->
    <template #toolbar>
      <!-- <el-button type="primary" icon="Delete" @click="batchDelete">
        {{ $t('user/list.batchDelete') }}
      </el-button> -->
      <!-- <el-button type="primary" icon="Plus" @click="$router.push('/user/add')">
        {{ $t('user/list.add') }}
      </el-button> -->
      <el-button type="primary" icon="Refresh" @click="refresh">
        {{ $t('user/list.refresh') }}
      </el-button>
    </template>
    <!-- 状态显示，需要 columns.tdSlot = 'status' -->
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'error'">
        {{ row.status === 1 ? $t('public.enabled') : $t('public.disabled') }}
      </el-tag>
    </template>
    <template #avatar="{ row }">
      <el-avatar size="small" fit="cover" :src="row.avatar" />
    </template>
    <!-- 单元格操作列 -->
    <template #operate="scope">
      <!-- 还没有这一页 -->
      <el-button size="small" type="primary" @click="$router.push(`/user/edit/${scope.row.id}`)">
        {{ $t('public.edit') }}
      </el-button>

      <!-- <el-button size="small" type="danger" @click="onRemove">
        {{ $t('public.delete') }}
      </el-button> -->

      <el-popconfirm
        width="240"
        icon-color="#626AEF"
        :confirm-button-text="$t('public.confirm')"
        :cancel-button-text="$t('public.cancel')"
        :title="$t('public.deleteTip')"
        @confirm="onRemove(scope.row)"
      >
        <template #reference>
          <el-button size="small" type="danger">
            {{ $t('public.delete') }}
          </el-button>
        </template>
      </el-popconfirm>
    </template>
  </pro-table>
</template>

<script>
import { defineComponent, reactive, ref, toRefs } from 'vue';
import { apiGetUserList, apiUserDel } from '@/api/user';
export default defineComponent({
  name: 'userList',
  setup() {
    const state = reactive({
      // 搜索配置
      searchConfig: {
        labelWidth: '90px', // 必须带上单位
        inputWidth: '200px', // 必须带上单位
        fields: [
          // {
          //   type: 'text',
          //   label: 'user/list.id',
          //   name: 'id',
          // },
          {
            type: 'text',
            label: 'user/list.name',
            name: 'username',
          },
        ],
      },
      // 表格列配置，大部分属性跟el-table-column配置一样
      columns: [
        { type: 'selection', width: 56 },
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
          // width: 180,
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
      ],
      // 分页配置
      paginationConfig: {
        layout: 'total, prev, pager, next, sizes', // 分页组件显示哪些功能
        pageSize: 10, // 每页条数
        pageSizes: [5, 10, 20, 50],
        style: { 'justify-content': 'flex-end' },
      },
      // 选择
      selectedItems: [],
      handleSelectionChange(arr) {
        state.selectedItems = arr;
      },
      // 批量删除
      // batchDelete() {
      //   console.log('user.batchDelete', state.selectedItems);
      // },
      // 请求函数。须返回一个对象 { data<Array>, total<Number> }
      async getList(params) {
        const { data } = await apiGetUserList(params);
        return {
          data: data?.list || [],
          total: Number(data?.total) || 0,
        };
      },
    });

    const table = ref(null);
    const refresh = () => {
      table.value.refresh();
    };

    const onRemove = async (row) => {
      await apiUserDel({ id: row.id });
      table.value.refresh();
    };

    return { ...toRefs(state), table, refresh, onRemove };
  },
});
</script>
