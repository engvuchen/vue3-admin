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
    // 获取用户信息。不存在/update=true，重新获取，已存在直接返回
    async getUserInfo(update = false) {
      if (this.userinfo && !update) return this.userinfo;

      const { code, data } = await apiGetUserInfo();
      if (code === 0) {
        this.userinfo = data;
        return Promise.resolve(data);
      }
      return Promise.resolve();
    },
  },
});
