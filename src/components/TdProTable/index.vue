<template>
  <div class="td-pro-table">
    <!-- 搜索表单 -->
    <div v-if="search" class="search-form-container">
      <td-pro-form
        ref="searchFormRef"
        :config="searchFormConfig"
        @change="handleSearchChange"
        @error="handleSearchError"
      >
        <template #submitBtnGroup>
          <t-space>
            <t-button theme="default" @click="handleSearchReset">重置</t-button>
            <t-button theme="primary" @click="handleSearchSubmit">查询</t-button>
          </t-space>
        </template>
      </td-pro-form>
    </div>

    <div class="table-header" v-if="$slots.title || $slots.toolbar">
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
        :loading="loading"
        :data="tableData"
        :row-key="rowKey"
        :bordered="bordered"
        :stripe="stripe"
        :hover="hover"
        :size="size"
        :disable-data-page="disableDataPage"
        :max-height="maxHeight"
        :height="height"
        :columns="columns"
        :pagination="pagination"
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
        <!-- 空状态插槽 -->
        <template #empty>
          <slot name="empty">
            <div class="empty-state">
              <t-icon name="file" size="20px" stroke-width="1" />
              <p>暂无数据</p>
            </div>
          </slot>
        </template>
      </t-table>
    </div>
  </div>
</template>

<script setup>
import TdProForm from '../TdProForm/index.vue';

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
  // 搜索表单配置
  search: {
    type: [Boolean, Object],
    default: false,
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
  disableDataPage: {
    type: Boolean,
    default: true,
  },
  // 分页配置
  pagination: {
    type: [Boolean, Object],
    default: () => ({}),
  },
  // 是否自动请求数据
  autoRequest: {
    type: Boolean,
    default: true,
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
const searchFormRef = ref(null);
const loading = ref(false);
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 搜索表单配置
const searchFormConfig = computed(() => {
  if (!props.search) return;

  // CLS 规范：直接使用，但补充默认的 attributes
  return {
    attributes: {
      layout: 'inline',
      labelWidth: 'auto',
      labelAlign: 'left',
      colon: false,
      class: '',
      style: {},
      showSubmit: false,
      showReset: false,
      ...props.search.attributes,
    },
    items: props.search.items || [],
  };
});
const columns = computed(() => {
  let res = props.columns.map((column) => ({
    align: column.align || 'left',
    // colKey: column.colKey,
    // title: column.title,
    // width: column.width,
    // minWidth: column.minWidth,
    // maxWidth: column.maxWidth,
    // fixed: column.fixed,
    // ellipsis: column.ellipsis,
    // sortType: column.sortType,
    // sorter: column.sorter,
    // filter: column.filter,
    // resizable: column.resizable,
    ...column,
  }));

  return res;
});
// 分页配置
const pagination = computed(() => {
  return {
    size: 'medium',
    theme: 'default',
    showJumper: true,
    showTotal: true,
    showPageSize: false,
    // style: {},
    // className: '', // todo1 这个为空字符串，异常
    ...props.pagination,
    // 这些属性必须在最后，确保响应式数据不会被 props 覆盖
    current: currentPage.value,
    pageSize: pageSize.value,
    total: total.value,
  };
});

// 请求表格数据
const getTableData = async (params = {}) => {
  if (loading.value) return; // 防止重复请求
  loading.value = true;

  tableData.value = [];
  total.value = 0;

  try {
    const searchData = searchFormRef?.value?.getFieldsValue?.() || {}; // beforeMount 调用，form 还没初始化，需要可访问符
    const res = await props.request({
      page: currentPage.value - 1,
      limit: pageSize.value,
      ...searchData,
      // ...params, // 允许外部传入额外参数
    });

    if (res) {
      tableData.value = res.list || [];
      total.value = res.total || 0;

      // 触发数据变化事件
      emit('dataChange', {
        data: tableData.value,
        total: total.value,
        // params: requestParams,
      });
    }
  } catch (error) {
    console.error('获取表格数据失败:', error);
    // 触发错误事件
    emit('error', error);
  } finally {
    loading.value = false;
  }
};

const handleSearchSubmit = () => {
  const searchData = searchFormRef.value?.getFieldsValue() || {};
  currentPage.value = 1;
  getTableData();
  emit('submit', searchData);
};
const handleSearchReset = () => {
  searchFormRef.value?.resetFields();
  currentPage.value = 1;
  getTableData();
  emit('reset');
};
const handleSearchChange = (key, value, formData) => {
  emit('change', key, value, formData);
};
const handleSearchError = (error) => {
  emit('error', error);
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
const handlePageChange = (pageInfo) => {
  currentPage.value = pageInfo.current;
  pageSize.value = pageInfo.pageSize;
  getTableData(); // todo
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
  getTableData(params);
};
// 重置分页
const resetPagination = () => {
  currentPage.value = 1;
  pageSize.value = pagination.value.pageSize || 10;
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
  searchFormRef, // 暴露搜索表单引用
});

// 初始化
onBeforeMount(() => {
  if (props.autoRequest) getTableData();
});

// 监听分页配置变化
watch(
  () => pagination.value,
  (newConfig) => {
    currentPage.value = newConfig.current || 1;
    pageSize.value = newConfig.pageSize || 10;
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

  :deep(th) {
    background-color: #eeeeee;
  }

  .search-form-container {
    width: 100%;
    // padding: 20px 0 0 0;
    background: #fff;
    margin: 20px 0;
    border-radius: 6px;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

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
</style>
