<template>
  <h2>编辑页面 id:{{ $route.params.id }}</h2>
  <el-button type="primary" @click="closeTag">关闭</el-button>
  <el-button type="success" @click="closeTag({ reload: true })"> 关闭当前页面，更新上级页面（组件重新渲染） </el-button>
  <el-button type="warning" @click="closeTag({ f5: true })"> 关闭当前页面，刷新上级页面（浏览器刷新） </el-button>
</template>
<script setup>
import useCloseTag from '@/hooks/useCloseTag'; // useCloseTag 只在这里使用到

const { closeTag } = useCloseTag();
</script>
