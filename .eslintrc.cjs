module.exports = {
  extends: ['alloy'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: {
      js: '@babel/eslint-parser',
      jsx: '@babel/eslint-parser',
      // Leave the template parser unspecified, so that it could be determined by `<script lang="...">`
    },
  },
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    // browser: true,
    node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
    
    // Element Plus 全局组件
    ElMessage: 'readonly',
    ElMessageBox: 'readonly',
    ElNotification: 'readonly',
    ElLoading: 'readonly',
    ElMessageBox: 'readonly',
    ElAlert: 'readonly',
    ElButton: 'readonly',
    ElInput: 'readonly',
    ElForm: 'readonly',
    ElFormItem: 'readonly',
    ElTable: 'readonly',
    ElTableColumn: 'readonly',
    ElPagination: 'readonly',
    ElDialog: 'readonly',
    ElSelect: 'readonly',
    ElOption: 'readonly',
    ElDatePicker: 'readonly',
    ElTimePicker: 'readonly',
    ElSwitch: 'readonly',
    ElCheckbox: 'readonly',
    ElRadio: 'readonly',
    ElRadioGroup: 'readonly',
    ElCheckboxGroup: 'readonly',
    ElUpload: 'readonly',
    ElProgress: 'readonly',
    ElTag: 'readonly',
    ElTooltip: 'readonly',
    ElPopover: 'readonly',
    ElDropdown: 'readonly',
    ElDropdownMenu: 'readonly',
    ElDropdownItem: 'readonly',
    ElMenu: 'readonly',
    ElMenuItem: 'readonly',
    ElSubmenu: 'readonly',
    ElBreadcrumb: 'readonly',
    ElBreadcrumbItem: 'readonly',
    ElTabs: 'readonly',
    ElTabPane: 'readonly',
    ElCard: 'readonly',
    ElCollapse: 'readonly',
    ElCollapseItem: 'readonly',
    ElDrawer: 'readonly',
    ElBacktop: 'readonly',
    ElAffix: 'readonly',
    ElBadge: 'readonly',
    ElAvatar: 'readonly',
    ElEmpty: 'readonly',
    ElResult: 'readonly',
    ElSkeleton: 'readonly',
    ElDivider: 'readonly',
    ElSpace: 'readonly',
    ElConfigProvider: 'readonly',
    ElRow: 'readonly',
    ElCol: 'readonly',
    ElContainer: 'readonly',
    ElHeader: 'readonly',
    ElAside: 'readonly',
    ElMain: 'readonly',
    ElFooter: 'readonly'
  },
  rules: {
    // 自定义你的规则
    'max-params': ['error', 4], // 将允许的最大参数个数增加到 4
    'no-param-reassign': 'off', // 允许对函数参数进行重新赋值
  },
};
