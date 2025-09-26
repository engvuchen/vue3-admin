import { defineStore } from 'pinia';
import { getItem, setItem, removeItem } from '@/utils/storage';

import { useAccount } from './account';
import { useTags } from './tags';
import { useMenus } from './menu';

export const TOKEN = 'VEA-TOKEN';
const COLLAPSE = 'VEA-COLLAPSE';

/**
 * 全局的属性：网页标题、token存储、侧栏折叠、设备类型
 * state { title, authorization, sidebar, device }
 */
export const useApp = defineStore('app', {
  state: () => ({
    title: 'Vue3 Element Admin',
    authorization: getItem(TOKEN),
    sidebar: {
      collapse: getItem(COLLAPSE),
    },
    device: 'desktop',
  }),
  actions: {
    setCollapse(data) {
      this.sidebar.collapse = data;

      setItem(COLLAPSE, data); // 保存到localStorage
    },
    clearCollapse() {
      this.sidebar.collapse = false;
      removeItem(COLLAPSE);
    },
    setDevice(device) {
      this.device = device;
    },
    setToken(data) {
      this.authorization = data.token;
      setItem(TOKEN, data.token);
    },
    initToken(data) {
      this.clearToken();
      this.setToken(data);
    },
    clearToken() {
      this.authorization = '';
      removeItem(TOKEN);
      useAccount().clearUserinfo(); // 清除用户信息
      useTags().clearAllTags(); // 清除标签栏
      useMenus().setMenus([]); // 清空menus
    },
  },
});
