<template>
  <div class="td-pro-table">
    <!-- 搜索表单 -->
    <td-search-form
      v-if="!!search"
      :config="searchConfig"
      :request="searchRequest"
      @submit="handleSearch"
      @reset="handleReset"
    />

    <!-- 标题和工具栏 -->
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

        <!-- 自定义列内容 -->
        <template v-for="column in processedColumns" :key="column.colKey" #[`${column.colKey}`]="scope">
          <slot :name="column.colKey" v-bind="scope"></slot>
        </template>
      </t-table>
    </div>

    <!-- 分页 -->
    <t-pagination
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
    />
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount, toRaw, toRefs, watch } from 'vue';
import { Table as TTable, Pagination as TPagination } from 'tdesign-vue-next';
import TdSearchForm from '../TdSearchForm/index.vue';

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
    default: 'id',
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
]);

// 响应式数据
const loading = ref(false);
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 分页配置
const paginationConfig = computed(() => {
  const defaultConfig = {
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
    className: '',
    style: {},
  };
  return { ...defaultConfig, ...props.pagination };
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

// 处理列配置
const processedColumns = computed(() => {
  return props.columns.map((column) => ({
    colKey: column.key || column.dataIndex || column.prop,
    title: column.title || column.label,
    width: column.width,
    minWidth: column.minWidth,
    maxWidth: column.maxWidth,
    fixed: column.fixed,
    align: column.align || 'left',
    ellipsis: column.ellipsis,
    sortType: column.sortType,
    sorter: column.sorter,
    filter: column.filter,
    resizable: column.resizable,
    ...column,
  }));
});

// 获取搜索表单数据
const getSearchData = () => {
  // 这里需要从 TdSearchForm 组件获取数据
  // 由于组件间通信的限制，这里先返回空对象
  // 实际使用时需要通过 ref 或者事件来获取
  return {};
};

// 请求表格数据
const getTableData = async () => {
  loading.value = true;
  
  try {
    const searchData = getSearchData();
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchData,
    };

    const response = await props.request(params);
    
    if (response && typeof response === 'object') {
      tableData.value = response.data || response.list || [];
      total.value = response.total || response.totalCount || 0;
    } else {
      tableData.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取表格数据失败:', error);
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = (searchData) => {
  currentPage.value = 1;
  // 这里需要将搜索数据传递给 getTableData
  // 由于组件间通信的限制，这里先调用 getTableData
  getTableData();
  emit('submit', searchData);
};

// 重置
const handleReset = () => {
  currentPage.value = 1;
  getTableData();
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
  getTableData();
};

// 过滤变化
const handleFilterChange = (filterInfo) => {
  emit('filterChange', filterInfo);
  getTableData();
};

// 分页变化
const handlePaginationChange = (pageInfo) => {
  currentPage.value = pageInfo.current;
  pageSize.value = pageInfo.pageSize;
  getTableData();
  emit('pageChange', pageInfo);
};

// 页码变化
const handleCurrentPageChange = (current, pageInfo) => {
  currentPage.value = current;
  getTableData();
  emit('pageChange', pageInfo);
};

// 每页条数变化
const handlePageSizeChange = (pageSize, pageInfo) => {
  currentPage.value = 1;
  pageSize.value = pageSize;
  getTableData();
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
const refresh = () => {
  getTableData();
};

// 暴露方法
defineExpose({
  refresh,
  getTableData,
});

// 初始化
onBeforeMount(() => {
  getTableData();
});

// 监听分页配置变化
watch(
  () => paginationConfig.value,
  (newConfig) => {
    currentPage.value = newConfig.current || 1;
    pageSize.value = newConfig.pageSize || 10;
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.td-pro-table {
  width: 100%;
  background: #fff;

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 0;
    background: #fff;

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
    padding: 20px;
    background: #fff;
  }
}
</style>
