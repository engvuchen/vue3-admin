import { useAccount } from '@/pinia/modules/account';

export const Permission = (app) => {
  app.directive('permission', {
    mounted: function (el, binding) {
      const { permissionList } = useAccount();

      if (binding.value && permissionList.every((item) => item !== binding.value)) {
        // 移除组件
        el.parentNode.removeChild(el);
      }
    },
  });
};
