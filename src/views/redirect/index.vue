<script>
import { h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
export default {
  setup() {
    const router = useRouter();
    const route = useRoute();
    let ori = route.fullPath.replace(/^\/redirect/, '');
    router.replace(ori); // 完整路由去掉 redirect
  },
  render() {
    return h('div');
  },
};
</script>
