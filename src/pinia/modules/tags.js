/**
 * 标签管理的基础能力
 */

import { defineStore } from 'pinia';
import { getItem, setItem, removeItem } from '@/utils/storage';
const TAGLIST = 'VEA-TAGLIST';

export const useTags = defineStore('tags', {
  state: () => ({
    tagList: getItem(TAGLIST) || [],
    cacheList: [],
    activePosition: -1,
  }),
  actions: {
    saveActivePosition(index) {
      this.activePosition = index;
    },
    // 添加 tagList
    addTag({ path, fullPath = path, name, meta, params, query }) {
      if (name && !this.cacheList.includes(name) && !meta.noCache) {
        this.cacheList.push(name);
      }

      if (this.tagList.some((v) => v.path === path)) return; // tagList 是已打开的标签列表

      // tag 的数据结构
      const target = {
        path,
        fullPath, // 自定义 fullPath 用作判断
        name,
        meta,
        params,
        query,
        title: meta.title || '未命名',
        // fullPath: fullPath || path,
      };
      if (this.activePosition === -1) {
        if (name === 'home') {
          this.tagList.unshift(target);
        } else {
          this.tagList.push(target);
        }
      } else {
        this.tagList.splice(this.activePosition + 1, 0, target);
      }
      setItem(TAGLIST, this.tagList);
    },
    // 删除 tagList - 无调用
    deTagList(tag) {
      this.tagList = this.tagList.filter((v) => v.path !== tag.path);
      setItem(TAGLIST, this.tagList);
    },
    // 删除 cacheList。this.cacheList 去掉自己，keep-alive 失效
    deCacheList(tag) {
      this.cacheList = this.cacheList.filter((v) => v !== tag.name);
    },
    delTag(tag) {
      // 删除tagList
      this.deTagList(tag);
      // 删除cacheList
      this.deCacheList(tag);
    },
    delOtherTags(tag) {
      this.tagList = this.tagList.filter((v) => !!v.meta.affix || v.path === tag.path);
      setItem(TAGLIST, this.tagList);

      this.cacheList = this.cacheList.filter((v) => v === tag.name);
    },
    delSomeTags(tags) {
      this.tagList = this.tagList.filter((v) => !!v.meta.affix || tags.every((tag) => tag.path !== v.path));
      setItem(TAGLIST, this.tagList);

      this.cacheList = this.cacheList.filter((v) => tags.every((tag) => tag.name !== v));
    },
    delAllTags() {
      this.tagList = this.tagList.filter((v) => !!v.meta.affix);
      removeItem(TAGLIST);
      this.cacheList = [];
    },
    /** 在 this.tagList 匹配 tag.path，若匹配上，将 tag 合并到这个项，写入结果到 localStorage  */
    updateTagList(tag) {
      const found = this.tagList.find((v) => v.path === tag.path);
      if (found) {
        Object.assign(found, tag);
        setItem(TAGLIST, this.tagList);
      }
    },
    clearAllTags() {
      this.cacheList = [];
      this.tagList = [];
      removeItem(TAGLIST);
    },
  },
});
