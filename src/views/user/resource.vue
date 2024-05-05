<template>
  <div class="resource">
    <!-- 表格 -->
    <pro-table
      ref="table"
      :title="$t('user/resource.title')"
      :request="getList"
      :columns="columns"
      :search="searchConfig"
    >
      <!-- 工具栏 -->
      <template #toolbar>
        <el-button plain type="default" icon="Plus" @click="onShowAddForm">
          {{ $t('user/resource.add') }}
        </el-button>
        <el-button plain type="default" icon="Refresh" @click="refresh">
          {{ $t('user/resource.refresh') }}
        </el-button>
      </template>
      <template #access="{ row }">
        <!-- <el-avatar size="small" fit="cover" :src="row.avatar" /> -->
        <el-tag
          v-for="(item, index) in row?.access || []"
          :key="index"
          type="info"
          size="small"
          effect="plain"
          style="margin-right: 10px"
          >{{ item }}</el-tag
        >
      </template>
      <template #cgi="{ row }">
        <!-- <el-avatar size="small" fit="cover" :src="row.avatar" /> -->
        <el-tag
          v-for="(item, index) in row?.cgi || []"
          :key="index"
          type="info"
          size="small"
          effect="plain"
          style="margin-right: 10px"
          >{{ item }}</el-tag
        >
      </template>
      <!-- 单元格操作列 -->
      <template #operate="scope">
        <!-- 编辑 -->
        <!-- {{ $t('public.edit') }} -->
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
            <!-- {{ $t('public.delete') }} -->
            <el-button plain circle :icon="Delete" type="danger"></el-button>
          </template>
        </el-popconfirm>
      </template>
    </pro-table>
    <!-- 新建&编辑 -->
    <el-dialog v-model="dialogVisible" @close="onCancel" class="dialog">
      <template #header>{{ formTitle }}</template>
      <pro-form ref="proform" :config="formConfig" @cancel="onCancel" @submit="onSubmit"></pro-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, toRaw, nextTick } from 'vue';
import { Delete, Edit } from '@element-plus/icons-vue';
import { apiGetResourceList, apiResourceModify, apiResourceDel } from '@/api/resource';
import tips from '@/utils/tips';
import { validMultiLineTxt } from '@/utils/validate';

// 表格
const { searchConfig, columns } = toRefs(
  reactive({
    request: apiGetResourceList,
    searchConfig: {
      labelWidth: '80px',
      inputWidth: '200px',
      fields: [
        {
          type: 'text',
          label: 'user/resource.name',
          name: 'name',
        },
        {
          type: 'text',
          label: 'user/resource.access',
          name: 'access',
        },
        {
          type: 'text',
          label: 'user/resource.cgi',
          name: 'cgi',
        },
      ],
    },
    columns: [
      { label: 'user/resource.index', type: 'index', width: 80 },
      {
        label: 'user/resource.name',
        prop: 'name',
        'min-width': 100,
        // sortable: true,
      },
      {
        label: 'user/resource.access',
        prop: 'access',
        // sortable: true,
        tdSlot: 'access', // 先定义所有 slot 出口，proForm 根据配置渲染 slot 入口
        wrap: false,
      },
      {
        label: 'user/resource.cgi',
        prop: 'cgi',
        // sortable: true,
        tdSlot: 'cgi',
        wrap: false,
      },
      {
        tdSlot: 'operate',
        label: 'public.operate',
        width: 200,
        align: 'center',
      },
    ],
    paginationConfig: {
      layout: 'total, prev, pager, next, sizes',
      pageSize: 10,
      pageSizes: [5, 10, 20, 50],
      style: { 'justify-content': 'flex-end' },
    },
  }),
);
const table = ref(null);
const refresh = () => {
  table.value.refresh();
};
const getList = async (params) => {
  const { data } = await apiGetResourceList(params);
  return {
    data: data?.list || [],
    total: Number(data?.total) || 0,
  };
};
const onRemove = async (row) => {
  await apiResourceDel({ id: row._id });
  tips.success('成功');
  table.value.refresh();
};

// 表单
const dialogVisible = ref(false);
const formTitle = ref('添加');
const proform = ref(null);

let accessReg = /^(\/[a-zA-Z-]+)+$/; // /user/list-ab
let cgiReg = /^(\/[a-zA-Z_]+)+$/; // /user/get_list
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
      label: 'user/resource.name',
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
    // access
    {
      component: 'textarea',
      name: 'access',
      label: 'user/resource.access', // user/resource.batchDelete
      attributes: {
        multiple: true,
        style: {
          width: '280px', // 改的是 el-textarea el-input--suffix
        },
      },
      validity: [
        {
          required: true,
          message: 'Access Required',
          trigger: 'blur',
        },
        {
          validator: (rule, value, callback) => {
            if (!validMultiLineTxt(accessReg, value)) {
              return callback('Word error');
            }
            callback();
          },
          trigger: 'blur',
        },
      ],
    },
    // cgi
    {
      component: 'textarea',
      name: 'cgi',
      label: 'user/resource.cgi',
      attributes: {
        multiple: true,
        style: {
          width: '280px',
        },
      },
      validity: [
        { required: true, message: 'Cgi Required', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (!validMultiLineTxt(cgiReg, value)) {
              return callback('Word error');
            }

            callback();
          },
          trigger: 'blur',
        },
      ],
    },
  ],
});

const onShowAddForm = () => {
  dialogVisible.value = true;
  formTitle.value = '添加';

  nextTick(() => {
    proform?.value?.resetFields();
  });
};
const onShowUpdForm = (row) => {
  dialogVisible.value = true;
  formTitle.value = '编辑';

  let data = toRaw(row);

  // 恢复表单数据
  data.id = data._id;
  if (Array.isArray(data.access)) {
    data.access = data?.access?.join('\n') || '';
  }
  if (Array.isArray(data.cgi)) {
    data.cgi = data?.cgi?.join('\n') || '';
  }
  nextTick(() => {
    Object.assign(proform.value.formModal, data);
  });
};
const onSubmit = async (data) => {
  ['access', 'cgi'].forEach((name) => {
    data[name] = Array.from(
      new Set(
        data[name]
          .replace(/[,;\n]+/g, ',')
          .split(',')
          .filter((str) => str),
      ),
    );
  });

  let postData = {};
  let needs = ['id', 'name', 'access', 'cgi'];
  needs.forEach((key) => {
    if (data[key]) {
      postData[key] = data[key];
    }
  });

  let res = await apiResourceModify(postData);
  if (res.code !== 0) return;

  refresh();
  tips.success('成功');
  dialogVisible.value = false;
};
const onCancel = () => {
  dialogVisible.value = false;
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
