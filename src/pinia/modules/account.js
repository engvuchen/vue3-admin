import { defineStore } from 'pinia';
import { apiGetUserInfo } from '@/api/user';

export const useAccount = defineStore('account', {
  state: () => ({
    userinfo: null,
    permissionList: [],
  }),
  actions: {
    // 清除用户信息
    clearUserinfo() {
      this.userinfo = null;
    },
    /**
     * 获取用户信息
     * @returns { id, username }
     */
    async getUserinfo() {
      const { code, data } = await apiGetUserInfo();
      if (code === 0) {
        this.userinfo = data;
        return Promise.resolve(data);
      }
      return Promise.resolve();
    },
  },
});
