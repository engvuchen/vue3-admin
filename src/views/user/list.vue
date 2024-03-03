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
      <el-button type="primary" icon="Delete" @click="batchDelete">
        {{ $t('user/list.batchDelete') }}
      </el-button>
      <el-button type="primary" icon="Plus" @click="$router.push('/user/add')">
        {{ $t('user/list.add') }}
      </el-button>
      <el-button type="primary" icon="Refresh" @click="refresh">
        {{ $t('user/list.refresh') }}
      </el-button>
    </template>
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'error'">
        {{ row.status === 1 ? $t('public.enabled') : $t('public.disabled') }}
      </el-tag>
    </template>
    <template #operate="scope">
      <el-button size="small" type="primary" @click="$router.push(`/user/edit/${scope.row.id}`)">
        {{ $t('public.edit') }}
      </el-button>
      <el-button size="small" type="danger">
        {{ $t('public.delete') }}
      </el-button>
    </template>
  </pro-table>
</template>

<script>
import { defineComponent, reactive, ref, toRefs } from 'vue';
import { apiGetUserList } from '@/api/user';
export default defineComponent({
  name: 'userList',
  setup() {
    const state = reactive({
      // 搜索配置
      searchConfig: {
        labelWidth: '90px', // 必须带上单位
        inputWidth: '400px', // 必须带上单位
        fields: [
          {
            type: 'text',
            label: 'user/list.id',
            name: 'id',
          },
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
          width: 180,
        },
        {
          label: 'user/list.role_id',
          prop: 'role_id',
          sortable: true,
          width: 180,
        },
        {
          label: 'public.operate',
          width: 180,
          align: 'center',
          tdSlot: 'operate', // 自定义单元格内容的插槽名称
        },
      ],
      // 分页配置
      paginationConfig: {
        layout: 'total, prev, pager, next, sizes', // 分页组件显示哪些功能
        pageSize: 10, // 每页条数
        pageSizes: [5, 10, 20, 50],
        style: { 'justify-content': 'flex-end' },
      },
      selectedItems: [],
      batchDelete() {
        console.log('user.batchDelete', state.selectedItems);
      },
      // 选择
      handleSelectionChange(arr) {
        state.selectedItems = arr;
      },
      // 请求函数。须返回一个对象 { data<Array>, total<Number> }
      async getList(params) {
        console.log('getList', params);

        // params 是从组件接收的，包含分页和搜索字段。
        const { data } = await apiGetUserList(params);

        return {
          data: data.list,
          total: Number(data.total),
        };
      },
    });
    const table = ref(null);
    const refresh = () => {
      table.value.refresh();
    };

    return { ...toRefs(state), refresh, table };
  },
});
</script>
