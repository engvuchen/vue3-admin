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


el-table 文档不能用简阅读到完整的，还是只能看完文档；
当一屏里超过 1000 条数据记录时，表格会出现卡顿等性能问题；

t-table 新增特性：
1. 表格提供分页属性；也有独立的 pagination 组件
2. 可拖拽排序
3. 支持懒加载（也是 1000 行左右会遇到性能问题）
3. 可编辑表格
   1. 单元格是只读标签，点击后开放表格编辑
   2. 最后一列是操作列，点击编辑后，开放整行编辑

t-table 演示用的 tsx，通过查看源码也知道它仅提供 tsx 方式
1. 通过 columns 配置列表现；[ {  ..., cell } ]，cell 属性可以自定义单元格表现


el-table：

```
[
    "基础表格",
    "带斑马纹表格",
    "带边框表格",
    "带状态表格",
    "显示溢出工具提示的表格",
    "固定表头",
    "固定列",
    "固定列和表头",
    "流体高度",
    "多级表头",
    "固定表头",
    "单选",
    "多选",
    "排序",
    "筛选",
    "自定义列模板",
    "自定义表头",
    "展开行",
    "树形数据与懒加载",
    "可选择的树形数据2.8.0",
    "表尾合计行",
    "合并行或列",
    "自定义索引",
    "表格布局",
  ]
```

t-table:

```
[
    "基础表格", 
    "行高亮表格",
    "可自定义样式的表格",
    "单元格超出省略的表格",
    "固定表头/固定行的表格",
    "固定列的表格",
    "固定表头和列的表格",
    "自定义单元格的表格",
    "自定义表头的表格",
    "自定义表尾的表格",
    "可表头吸顶/表尾吸顶的表格",
    "可展开和收起的表格",
    "可进行列配置的表格",
    "可排序的表格",
    "可选中行的表格",
    "可分页的表格",
    "可筛选的表格",
    "带合并单元格的表格",
    "多级表头的表格",
    "加载状态的表格",
    "空表格",
    "可拖拽排序的表格",
    "懒加载的表格",
    "虚拟滚动的表格",
    "可编辑的表格",
    "树形结构的表格",
  ]
```

## el-table 入门

小结：

1. table 传 data 和其他全局配置项目；`[{ data, age}]`；
2. table-columns，根据 `pro` 显示数组中的每一项；
    1. 支持默认插槽，支持显示自定义内容


### 基础表格

```js
<template>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column fixed prop="date" label="Date" width="150" />
    <el-table-column prop="name" label="Name" width="120" />
    <el-table-column prop="state" label="State" width="120" />

    <el-table-column prop="tag" label="Tag" width="120">
        <template #default="scope">
            <el-popover effect="light" trigger="hover" placement="top" width="auto">
                <template #default>
                    <div>name: {{ scope.row.name }}</div>
                    <div>address: {{ scope.row.address }}</div>
                </template>
                <template #reference>
                    <el-tag>{{ scope.row.name }}</el-tag>
                </template>
            </el-popover>
        </template>
    </el-table-column>
    
    <el-table-column fixed="right" label="Operations" min-width="120">
      <template #default>
        <el-button link type="primary" size="small" @click="handleClick">
          Detail
        </el-button>
        <el-button link type="primary" size="small">Edit</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
const handleClick = () => {
  console.log('click')
}

const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    tag: 'Home',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    tag: 'Office',
  },
]
</script>
```

### 单元格插槽支持

```js
    <el-table-column fixed="right" label="Operations" min-width="120">
      <template #default>
        <el-button link type="primary" size="small" @click="handleClick">
          Detail
        </el-button>
        <el-button link type="primary" size="small">Edit</el-button>
      </template>
    </el-table-column>
```

### 单列筛选

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

### 显示溢出工具

优化了

当内容太长时，它会分成多行。您可以使用 show-overflow-tooltip 将其保留在一行中。

属性 show-overflow-tooltip 接受一个布尔值。 为 true 时多余的内容会在 hover 时以 tooltip 的形式显示出来。

```vue
<template>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column type="selection" width="55" />
    <el-table-column label="Date" width="120">
      <template #default="scope">{{ scope.row.date }}</template>
    </el-table-column>
    <el-table-column property="name" label="Name" width="120" />
    <el-table-column
      property="address"
      label="use show-overflow-tooltip"
      width="240"
      show-overflow-tooltip
    />
    <el-table-column property="address" label="address" />
  </el-table>
</template>

<script lang="ts" setup>
interface User {
  date: string
  name: string
  address: string
}
const tableData: User[] = [
  {
    date: '2016-05-04',
    name: 'Aleyna Kutzner',
    address: 'Lohrbergstr. 86c, Süd Lilli, Saarland',
  },
  {
    date: '2016-05-03',
    name: 'Helen Jacobi',
    address: '760 A Street, South Frankfield, Illinois',
  },
  {
    date: '2016-05-02',
    name: 'Brandon Deckert',
    address: 'Arnold-Ohletz-Str. 41a, Alt Malinascheid, Thüringen',
  },
  {
    date: '2016-05-01',
    name: 'Margie Smith',
    address: '23618 Windsor Drive, West Ricardoview, Idaho',
  },
]
</script>
```
