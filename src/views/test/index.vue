<template>
  <div id="editor" style="height: 100px; border: 1px solid #eee"></div>
  <pro-table
    ref="table"
    :title="$t('test/list.title')"
    :request="getList"
    :columns="columns"
    :search="searchConfig"
    @selectionChange="handleSelectionChange"
  >
    <!-- 工具栏 -->
    <template #toolbar>
      <el-button type="primary" icon="Delete" @click="batchDelete">
        {{ $t('test/list.batchDelete') }}
      </el-button>
      <el-button type="primary" icon="Plus" @click="$router.push('/test/add')">
        {{ $t('test/list.add') }}
      </el-button>
      <el-button type="primary" icon="Refresh" @click="refresh">
        {{ $t('test/list.refresh') }}
      </el-button>
    </template>
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? $t('public.enabled') : $t('public.disabled') }}
      </el-tag>
    </template>
    <template #operate="scope">
      <el-button size="small" type="primary" @click="$router.push(`/test/edit/${scope.row.id}`)">
        {{ $t('public.edit') }}
      </el-button>
      <el-button size="small" type="danger">
        {{ $t('public.delete') }}
      </el-button>
    </template>
  </pro-table>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiTest } from '@/api/user';
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as monaco from 'monaco-editor';

// 表格列配置，大部分属性跟el-table-column配置一样
const columns = [
  { type: 'selection', width: 56 },
  { label: 'test/list.index', type: 'index', width: 80 },
  {
    label: 'test/list.name',
    prop: 'nickName',
    sortable: true,
    width: 180,
  },
  {
    label: 'test/list.email',
    prop: 'userEmail',
    minWidth: 200,
  },
  {
    label: 'public.status',
    tdSlot: 'status',
    width: 180,
  },
  {
    label: 'public.operate',
    width: 180,
    align: 'center',
    tdSlot: 'operate', // 自定义单元格内容的插槽名称
  },
];
// 搜索配置
const searchConfig = {
  labelWidth: '90px', // 必须带上单位
  inputWidth: '400px', // 必须带上单位
  fields: [
    {
      type: 'text',
      label: 'test/list.name',
      name: 'nickName',
      defaultValue: 'abc',
    },
    {
      label: 'public.status',
      name: 'status',
      type: 'select',
      defaultValue: 1,
      options: [
        {
          name: 'test/list.publish',
          value: 1,
        },
        {
          name: 'test/list.nopublish',
          value: 0,
        },
      ],
    },
    {
      label: 'test/list.gender',
      name: 'sex',
      type: 'radio',
      options: [
        {
          name: 'public.male',
          value: 1,
        },
        {
          name: 'public.female',
          value: 0,
        },
      ],
    },
    {
      label: 'test/list.city',
      name: 'city',
      type: 'radio-button',
      options: [
        {
          name: 'test/list.bj',
          value: 'bj',
        },
        {
          name: 'test/list.sh',
          value: 'sh',
        },
        {
          name: 'test/list.gz',
          value: 'gz',
        },
        {
          name: 'test/list.sz',
          value: 'sz',
        },
      ],
    },
    {
      label: 'test/list.hobby',
      name: 'hobby',
      type: 'checkbox',
      defaultValue: ['eat'],
      options: [
        {
          name: 'test/list.eat',
          value: 'eat',
        },
        {
          name: 'test/list.sleep',
          value: 'sleep',
        },
        {
          name: 'test/list.bit',
          value: 'bit',
        },
      ],
      // transform: (val) => val.join(","),
    },
    {
      label: 'test/list.fruit',
      name: 'fruit',
      type: 'checkbox-button',
      options: [
        {
          name: 'test/list.apple',
          value: 'apple',
        },
        {
          name: 'test/list.banana',
          value: 'banana',
        },
        {
          name: 'test/list.orange',
          value: 'orange',
        },
        {
          name: 'test/list.grape',
          value: 'grape',
        },
      ],
      transform: (val) => val.join(','),
    },
    {
      label: 'test/list.date',
      name: 'date',
      type: 'date',
    },
    {
      label: 'test/list.time',
      name: 'datetime',
      type: 'datetime',
      defaultValue: '2020-10-10 8:00:00',
    },
    {
      label: 'test/list.daterange',
      name: 'daterange',
      type: 'daterange',
      trueNames: ['startDate', 'endDate'],
      style: { width: '400px' },
    },
    {
      label: 'test/list.timerange',
      name: 'datetimerange',
      type: 'datetimerange',
      trueNames: ['startTime', 'endTime'],
      style: { width: '400px' },
      defaultValue: ['2020-10-10 9:00:00', '2020-10-11 18:30:00'],
    },
    {
      label: 'test/list.num',
      name: 'num',
      type: 'number',
      min: 0,
      max: 10,
    },
  ],
};

// const selectedItems = [];

const table = ref(null);
const refresh = () => {
  table.value.refresh();
};

function batchDelete() {}
// 选择
function handleSelectionChange(arr) {
  // state.selectedItems = arr;
}
// 请求函数
async function getList(params) {
  let res = await apiTest();
  if (res.code !== 0) return;
  return res;
}

onMounted(() => {
  // 正常使用右键菜单的部分功能；JSON高亮；查找；样式正常
  monaco.editor.create(document.getElementById('editor'), {
    value: '{ "name": "test" }',
    language: 'json',
  });
});
</script>

<script>
export default {
  name: 'test-list', // 该 name 须跟路由配置的 name 一致，不一致或不设置 name，则不缓存
};
</script>
