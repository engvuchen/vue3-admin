import { storeToRefs } from 'pinia';
import { useAccount } from '@/pinia/modules/account';

export const useUserinfo = () => {
  const { userinfo } = storeToRefs(useAccount());
  return { userinfo };
};
