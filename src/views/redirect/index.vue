<script>
import { h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
export default {
  setup() {
    const router = useRouter();
    const route = useRoute();
    router.replace(route.fullPath.replace(/^\/redirect/, '')); // 完整路由去掉 redirect
  },
  render() {
    return h('div');
  },
};
</script>
