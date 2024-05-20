<template>
  <h2>该页面入口不在菜单中显示</h2>
  <div>
    如果不需要在菜单中显示：
    <br />
    需要配置路由增加属性 hide: true，注意不是在meta中增加该属性，而是跟meta同级
  </div>
  <el-button type="primary" @click="closeTag">关闭</el-button>
  <el-button type="success" @click="closeTag({ reload: true })"> 关闭当前页面，更新上级页面（组件重新渲染） </el-button>
  <el-button type="warning" @click="closeTag({ f5: true })"> 关闭当前页面，刷新上级页面（浏览器刷新） </el-button>
</template>

<script setup>
import useCloseTag from '@/hooks/useCloseTag'; // useCloseTag 只在这里使用到

const { closeTag } = useCloseTag();
</script>

<script>
export default {
  name: 'test-add', // 该 name 须跟路由配置的 name 一致，不一致或不设置 name，则不缓存
};
</script>
