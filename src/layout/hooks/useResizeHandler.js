import { storeToRefs } from 'pinia';
import { useApp } from '@/pinia/modules/app';
import { onBeforeMount, onBeforeUnmount, computed } from 'vue';

const WIDTH = 768;
export const useResizeHandler = () => {
  const appStore = useApp();
  const { sidebar } = storeToRefs(appStore);
  const { setDevice, setCollapse } = appStore;
  const collapse = computed(() => Boolean(sidebar.value.collapse));

  const isMobile = () => {
    return window.innerWidth < WIDTH;
  };

  const resizeHandler = () => {
    if (isMobile()) {
      setDevice('mobile');
      setCollapse(true);
    } else {
      setDevice('desktop');
      setCollapse(collapse.value);
    }
  };

  onBeforeMount(() => {
    resizeHandler();
    window.addEventListener('resize', resizeHandler);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler);
  });
};
