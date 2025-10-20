<template>
  <div class="td-pro-table">
    <!-- 搜索表单 -->
    <td-search-form
      v-if="search"
      ref="searchFormRef"
      :config="searchConfig"
      :request="searchRequest"
      @submit="handleSearch"
      @reset="handleReset"
    />

    <div class="table-header" v-if="!hideTitleBar">
      <slot name="title">
        <span class="table-title">{{ title }}</span>
      </slot>
      <div class="table-toolbar">
        <slot name="toolbar"></slot>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-container">
      <t-table
        v-loading="loading"
        :data="tableData"
        :row-key="rowKey"
        :bordered="bordered"
        :stripe="stripe"
        :hover="hover"
        :size="size"
        :max-height="maxHeight"
        :height="height"
        :columns="processedColumns"
        :empty="emptyConfig"
        :pagination="paginationConfig"
        @select-change="handleSelectionChange"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDblClick"
        @cell-click="handleCellClick"
        @sort-change="handleSortChange"
        @filter-change="handleFilterChange"
        @page-change="handlePageChange"
        @data-change="handleDataChange"
        @async-loading-change="handleAsyncLoadingChange"
        @scroll="handleScroll"
        @scroll-to-bottom="handleScrollToBottom"
        @scroll-to-left="handleScrollToLeft"
        @scroll-to-right="handleScrollToRight"
        @scroll-to-top="handleScrollToTop"
        @scroll-to-bottom-left="handleScrollToBottomLeft"
        @scroll-to-bottom-right="handleScrollToBottomRight"
        @scroll-to-top-left="handleScrollToTopLeft"
        @scroll-to-top-right="handleScrollToTopRight"
      >
        <!-- 自定义列头 -->
        <template v-for="column in processedColumns" :key="column.colKey" #[`${column.colKey}-header`]="scope">
          <slot :name="`${column.colKey}-header`" v-bind="scope"></slot>
        </template>

        <!-- 自定义列内容 todo1 这里有问题 -->
        <template v-for="column in processedColumns" :key="column.colKey" #[`${column.colKey}`]="scope">
          <slot :name="column.colKey" v-bind="scope"></slot>
        </template>

        <!-- 空状态插槽 -->
        <template #empty>
          <slot name="empty">
            <div class="empty-state">
              <t-icon name="inbox" size="48px" />
              <p>暂无数据</p>
            </div>
          </slot>
        </template>
      </t-table>
    </div>

    <!-- 分页 -->
    <!-- <t-pagination
      v-if="paginationConfig.show && total > 0"
      v-model:current="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-size-options="paginationConfig.pageSizeOptions"
      :show-total="paginationConfig.showTotal"
      :show-jumper="paginationConfig.showJumper"
      :show-sizer="paginationConfig.showSizer"
      :size="paginationConfig.size"
      :theme="paginationConfig.theme"
      :class="paginationConfig.className"
      :style="paginationConfig.style"
      @change="handlePaginationChange"
      @page-size-change="handlePageSizeChange"
      @current-change="handleCurrentPageChange"
    /> -->
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount, watch, nextTick } from 'vue';
import { Table as TTable, Pagination as TPagination } from 'tdesign-vue-next';
import TdSearchForm from '../TdSearchForm/index.vue';

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
const mockColumns = [
  {
    align: 'left',
    colKey: 'id',
    title: 'ID',
    width: 80,
  },
  {
    align: 'left',
    colKey: 'name',
    title: '姓名',
    width: 120,
  },
  {
    align: 'left',
    colKey: 'email',
    title: '邮箱',
    minWidth: 200,
  },
  {
    align: 'left',
    colKey: 'phone',
    title: '电话',
    width: 150,
  },
  {
    align: 'left',
    colKey: 'createTime',
    title: '创建时间',
    width: 180,
  },
];

const props = defineProps({
  // 请求数据的方法
  request: {
    type: Function,
    required: true,
  },
  // 表格标题
  title: {
    type: String,
    default: '',
  },
  // 是否隐藏标题栏
  hideTitleBar: {
    type: Boolean,
    default: false,
  },
  // 搜索表单配置
  search: {
    type: [Boolean, Object],
    default: false,
  },
  // 搜索请求方法
  searchRequest: {
    type: Function,
    default: null,
  },
  // 表格列配置
  columns: {
    type: Array,
    default: () => [],
  },
  // 行数据的Key
  rowKey: {
    type: [String, Function],
    default: 'index',
  },
  // 是否显示边框
  bordered: {
    type: Boolean,
    default: false,
  },
  // 是否显示斑马纹
  stripe: {
    type: Boolean,
    default: false,
  },
  // 是否显示悬浮效果
  hover: {
    type: Boolean,
    default: true,
  },
  // 表格尺寸
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  // 最大高度
  maxHeight: {
    type: [String, Number],
    default: null,
  },
  // 表格高度
  height: {
    type: [String, Number],
    default: null,
  },
  // 分页配置
  pagination: {
    type: [Boolean, Object],
    default: () => ({}),
  },
  // 空状态配置
  empty: {
    type: [String, Object],
    default: '暂无数据',
  },
  // 是否自动请求数据
  autoRequest: {
    type: Boolean,
    default: true,
  },
  // 请求防抖延迟（毫秒）
  requestDelay: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits([
  'submit',
  'reset',
  'selectionChange',
  'rowClick',
  'rowDblClick',
  'cellClick',
  'sortChange',
  'filterChange',
  'pageChange',
  'dataChange',
  'asyncLoadingChange',
  'scroll',
  'scrollToBottom',
  'scrollToLeft',
  'scrollToRight',
  'scrollToTop',
  'scrollToBottomLeft',
  'scrollToBottomRight',
  'scrollToTopLeft',
  'scrollToTopRight',
  'error',
  'clearSelection',
]);

// 响应式数据
const loading = ref(false);
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchFormRef = ref(null);
const searchParams = ref({});

// 分页配置
const paginationConfig = computed(() => {
  return {
    current: currentPage.value,
    pageSize: pageSize.value,
    total: total.value,
    showJumper: true,
    showSizer: true,
    showTotal: true,
    pageSizeOptions: [5, 10, 20, 50, 100],
    size: 'medium',
    theme: 'default',
    className: '', // todo1 这个为空字符串，异常
    // style: {},
    ...props.pagination,
  };
});

// 搜索配置
const searchConfig = computed(() => {
  if (!props.search || typeof props.search === 'boolean') {
    return null;
  }
  return {
    fields: props.search.fields || [],
    layout: props.search.layout || 'inline',
    labelWidth: props.search.labelWidth || 'auto',
    fieldSpacing: props.search.fieldSpacing || { horizontal: 16, vertical: 16 },
    showSubmit: true,
    showReset: true,
    submitText: '查询',
    resetText: '重置',
    ...props.search,
  };
});

// 空状态配置
const emptyConfig = computed(() => {
  if (typeof props.empty === 'string') {
    return props.empty;
  }
  return {
    description: '暂无数据',
    icon: 'inbox',
    ...props.empty,
  };
});

// 防抖请求
let requestTimer = null;
const debouncedRequest = (params = {}) => {
  if (requestTimer) {
    clearTimeout(requestTimer);
  }

  if (props.requestDelay > 0) {
    requestTimer = setTimeout(() => {
      getTableData(params);
    }, props.requestDelay);
  } else {
    getTableData(params);
  }
};
const processedColumns = computed(() => {
  let res = props.columns.map((column) => ({
    // colKey: column.colKey,
    // title: column.title,
    // width: column.width,
    // minWidth: column.minWidth,
    // maxWidth: column.maxWidth,
    // fixed: column.fixed,
    align: column.align || 'left',
    // ellipsis: column.ellipsis,
    // sortType: column.sortType,
    // sorter: column.sorter,
    // filter: column.filter,
    // resizable: column.resizable,
    ...column,
  }));

  console.log('res', res);

  return res;
});

console.log('processedColumns.value', processedColumns.value);

// 获取搜索表单数据
const getSearchData = () => {
  // 优先使用缓存的搜索参数
  if (Object.keys(searchParams.value).length > 0) {
    return searchParams.value;
  }

  // 尝试从搜索表单组件获取数据
  if (searchFormRef.value && typeof searchFormRef.value.getFormData === 'function') {
    return searchFormRef.value.getFormData();
  }

  return {};
};

// 请求表格数据
const getTableData = async (params = {}) => {
  if (loading.value) return; // 防止重复请求

  loading.value = true;

  try {
    const searchData = getSearchData();
    const requestParams = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchData,
      ...params, // 允许外部传入额外参数
    };

    const response = await props.request(requestParams);

    if (response && typeof response === 'object') {
      tableData.value = response.data || response.list || [];

      console.log('tableData.value', tableData.value);

      total.value = response.total || response.totalCount || 0;

      // 触发数据变化事件
      emit('dataChange', {
        data: tableData.value,
        total: total.value,
        params: requestParams,
      });
    } else {
      tableData.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取表格数据失败:', error);
    tableData.value = [];
    total.value = 0;

    // 触发错误事件
    emit('error', error);
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = (searchData) => {
  currentPage.value = 1;
  searchParams.value = { ...searchData }; // 缓存搜索参数
  debouncedRequest();
  emit('submit', searchData);
};

// 重置
const handleReset = () => {
  currentPage.value = 1;
  searchParams.value = {}; // 清空搜索参数
  debouncedRequest();
  emit('reset');
};

// 选择变化
const handleSelectionChange = (selectedRowKeys, selectedRows, currentRowData) => {
  emit('selectionChange', selectedRowKeys, selectedRows, currentRowData);
};

// 行点击
const handleRowClick = (context) => {
  emit('rowClick', context);
};

// 行双击
const handleRowDblClick = (context) => {
  emit('rowDblClick', context);
};

// 单元格点击
const handleCellClick = (context) => {
  emit('cellClick', context);
};

// 排序变化
const handleSortChange = (sortInfo) => {
  emit('sortChange', sortInfo);
  debouncedRequest();
};

// 过滤变化
const handleFilterChange = (filterInfo) => {
  emit('filterChange', filterInfo);
  debouncedRequest();
};

// 分页变化
const handlePageChange = (pageInfo) => {
  console.log('分页变化:', pageInfo);
  currentPage.value = pageInfo.current;
  pageSize.value = pageInfo.pageSize;
  debouncedRequest();
  emit('pageChange', pageInfo);
};

// 数据变化
const handleDataChange = (data) => {
  emit('dataChange', data);
};

// 异步加载变化
const handleAsyncLoadingChange = (loading) => {
  emit('asyncLoadingChange', loading);
};

// 滚动事件
const handleScroll = (params) => {
  emit('scroll', params);
};

const handleScrollToBottom = (params) => {
  emit('scrollToBottom', params);
};

const handleScrollToLeft = (params) => {
  emit('scrollToLeft', params);
};

const handleScrollToRight = (params) => {
  emit('scrollToRight', params);
};

const handleScrollToTop = (params) => {
  emit('scrollToTop', params);
};

const handleScrollToBottomLeft = (params) => {
  emit('scrollToBottomLeft', params);
};

const handleScrollToBottomRight = (params) => {
  emit('scrollToBottomRight', params);
};

const handleScrollToTopLeft = (params) => {
  emit('scrollToTopLeft', params);
};

const handleScrollToTopRight = (params) => {
  emit('scrollToTopRight', params);
};

// 刷新数据
const refresh = (params = {}) => {
  debouncedRequest(params);
};

// 重置分页
const resetPagination = () => {
  currentPage.value = 1;
  pageSize.value = paginationConfig.value.pageSize || 10;
};

// 清空选择
const clearSelection = () => {
  // 这里需要调用表格的清除选择方法
  // 由于 TDesign Table 的限制，暂时通过事件通知父组件
  emit('clearSelection');
};

// 获取当前选择的行
const getSelectedRows = () => {
  // 这里需要从表格组件获取选择的行
  // 暂时返回空数组，实际使用时需要通过 ref 获取
  return [];
};

// 暴露方法
defineExpose({
  refresh,
  getTableData,
  resetPagination,
  clearSelection,
  getSelectedRows,
  // 暴露搜索表单引用
  searchFormRef,
});

// 初始化
onBeforeMount(() => {
  if (props.autoRequest) {
    debouncedRequest();
  }
});

// 监听分页配置变化
watch(
  () => paginationConfig.value,
  (newConfig) => {
    currentPage.value = newConfig.current || 1;
    pageSize.value = newConfig.pageSize || 10;
  },
  { deep: true },
);

// 监听列配置变化，重新处理列
watch(
  () => props.columns,
  () => {
    // 列配置变化时，可以在这里做一些处理
    nextTick(() => {
      // 确保 DOM 更新后再执行
    });
  },
  { deep: true },
);

// 监听搜索配置变化
watch(
  () => props.search,
  (newSearch) => {
    if (newSearch === false) {
      searchParams.value = {};
    }
  },
  { deep: true },
);
</script>

<style lang="scss" scoped>
.td-pro-table {
  width: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 0;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;

    .table-title {
      font-size: 16px;
      font-weight: 500;
      color: #1f2937;
    }

    .table-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .table-container {
    // padding: 20px;
    // background: #fff;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #999;

    p {
      margin-top: 12px;
      font-size: 14px;
    }
  }
}

// 响应式设计
// @media (max-width: 768px) {
//   .td-pro-table {
//     .table-header {
//       flex-direction: column;
//       align-items: flex-start;
//       gap: 12px;

//       .table-toolbar {
//         width: 100%;
//         justify-content: flex-end;
//       }
//     }

//     .table-container {
//       padding: 16px;
//     }
//   }
// }
</style>
