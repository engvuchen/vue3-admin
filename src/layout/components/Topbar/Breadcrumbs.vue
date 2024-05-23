<template>
  <el-breadcrumb
    separator-class="el-icon-arrow-right"
    class="breadcrumb"
    :class="{
      mobile: device === 'mobile',
      show: isHorizontalMenu,
      hide: breadcrumbs.length <= 1,
    }"
  >
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbs"
      :key="index"
      :class="{ no_link: index === breadcrumbs.length - 1 }"
      :to="index < breadcrumbs.length - 1 ? item.path : ''"
    >
      {{ $t(item.meta.title) }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>
<script setup>
import { useApp } from '@/pinia/modules/app';
import { useLayoutsettings } from '@/pinia/modules/layoutSettings';
import { storeToRefs } from 'pinia';
import { computed, ref, onBeforeMount, watch, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';

const { proxy } = getCurrentInstance();
const { device } = storeToRefs(useApp());
const router = useRouter();
const route = router.currentRoute; // 这里不使用useRoute获取当前路由，否则下面watch监听路由的时候会有警告
const breadcrumbs = ref([]);
const defaultSettings = useLayoutsettings();
const isHorizontalMenu = computed(() => defaultSettings.menus.mode === 'horizontal');

const emit = defineEmits(['on-breadcrumbs-change']);

const getBreadcrumbs = (route) => {
  const home = [{ path: '/', meta: { title: 'route.homepage' } }];
  if (route.name === 'home') {
    return home;
  } else {
    const matched = route.matched.filter((item) => item?.meta?.title);
    return [...home, ...matched];
  }
};

onBeforeMount(() => {
  breadcrumbs.value = getBreadcrumbs(route.value);
});

watch(
  route,
  (newRoute) => {
    // // 获取翻译后的标题，显示在 document.title。注意标签点击“刷新”，产生一次 redirect，没有翻译
    route.value.meta.truetitle = route.value.meta.title ? proxy.$t(route.value.meta.title) : 'unknown';

    breadcrumbs.value = getBreadcrumbs(newRoute);
    emit('on-breadcrumbs-change', breadcrumbs.value.length > 1);
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss" scoped>
.breadcrumb {
  margin-left: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ::v-deep(a),
  ::v-deep(.is-link) {
    font-weight: normal;
  }
  // ::v-deep(.el-breadcrumb__item) {
  //   float: none;
  // }
  .no_link {
    ::v-deep(.el-breadcrumb__inner) {
      color: #97a8be !important;
    }
  }
  &.mobile {
    display: none;
  }
  &.show {
    display: block;
    margin: 0;
    padding: 16px;
    background: #f5f5f5;
  }
  &.hide {
    display: none;
  }
}
</style>
<style lang="scss">
.el-breadcrumb__inner {
  &.is-link,
  a {
    color: #5c5c5c;
  }
}
</style>
