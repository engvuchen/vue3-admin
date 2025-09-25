1. ele-ment、tdesign table 都不了解使用
    1. element table 的封装思路；
        1. 处理：search 请求，重置页码；翻页发起请求
        2. 不太理解
        3. 还有个 form
        4. 对比下 2 个组件库的区别吧
        5. weadmin:
            1. search 请求，重置页码；翻页携带请求参数，发起请求
            2. 列冻结；表格排序（接口）；列居中；选择列显示；单元格显示标签、图片、输入框、按钮；单元格单选、多选；本地翻页；导出 CSV；单元格折叠
            

2. monaco-editor 组件；tdesign 联动表单

4. 面试题怎么挖空啊？

5. 


## el-table 入门

1. table 传 data `[{ data, age}]`；
2. table-columns，根据 `pro` 显示数组每一项；
    1. 支持插槽，表现


```js
<el-table :data="tableData" style="width: 100%">
    <el-table-column prop="date" label="Date" width="180" />
    <el-table-column prop="name" label="Name" width="180" />
    <el-table-column prop="address" label="Address" />
</el-table>

const tableData = [
    {
        date: '2016-05-03',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    }
]
```

对表格进行筛选

在列中设置 filters 和 filter-method 属性即可开启该列的筛选， filters 是一个数组，filter-method 是一个方法，它用于决定某些数据是否显示， 会传入三个参数：value, row 和 column。

```js
<el-button @click="clearFilter">reset all filters</el-button>
<el-table-column
    prop="tag"
    label="Tag"
    width="100"
    :filters="[
    { text: 'Home', value: 'Home' },
    { text: 'Office', value: 'Office' },
    ]"
    :filter-method="filterTag"
    filter-placement="bottom-end"
>
    <!-- 表头 -->
    <template #header>
    <el-input v-model="search" size="small" placeholder="Type to search" />
    </template>
    <!-- 单元格 -->
    <template #default="scope">
    <el-tag
        :type="scope.row.tag === 'Home' ? 'primary' : 'success'"
        disable-transitions
        >{{ scope.row.tag }}</el-tag
    >
    </template>
</el-table-column>

const filterTag = (value: string, row: User) => {
  return row.tag === value
}

const resetDateFilter = () => {
  tableRef.value!.clearFilter(['date'])
}
const clearFilter = () => {
  tableRef.value!.clearFilter()
}
```