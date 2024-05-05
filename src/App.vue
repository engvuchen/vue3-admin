<template>
  <el-config-provider :locale="locales[lang]">
    <router-view />
  </el-config-provider>
</template>

<script setup>
import { ref } from 'vue';
import { ElConfigProvider } from 'element-plus';
import localeZH from 'element-plus/dist/locale/zh-cn.mjs'; // // https://www.bilibili.com/read/cv25825714/
import localeEN from 'element-plus/dist/locale/en.mjs';
import useLang from '@/i18n/useLang';

const { lang } = useLang();
const locales = ref({
  'zh-cn': localeZH,
  en: localeEN,
});
</script>

<style lang="scss">
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  * {
    outline: none;
  }
}
</style>
