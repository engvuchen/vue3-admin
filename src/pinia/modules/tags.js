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
    /** 保存索引 */
    saveActivePosition(index) {
      this.activePosition = index;
    },
    // 添加 item 到 tagList、cacheList
    addTag({ path, fullPath = path, name, meta, params, query }) {
      // 在 cacheList 中已存在，不重复添加
      if (name && !meta.noCache && !this.cacheList.includes(name)) {
        this.cacheList.push(name);
      }

      console.log('addTag', this.tagList);

      // 在 tagList 中已存在，不重复添加
      if (this.tagList.some((v) => v.path === path)) return;

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
        this.tagList.splice(this.activePosition + 1, 0, target); // 在当前页的右侧，添加新的标签
      }

      setItem(TAGLIST, this.tagList);
    },
    delTag(tag) {
      this.deTagList(tag);
      this.deCacheList(tag);
    },
    /** 标签仅保留固定或自己 */
    delOtherTags(tag) {
      this.tagList = this.tagList.filter((v) => !!v?.meta?.affix || v.path === tag.path);
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
      if (!found) return;
      Object.assign(found, tag);
      setItem(TAGLIST, this.tagList);
    },
    clearAllTags() {
      this.cacheList = [];
      this.tagList = [];
      removeItem(TAGLIST);
    },

    // 从 tagList 中删除匹配项
    deTagList(tag) {
      // this.tagList = this.tagList.filter((v) => v.path !== tag.path); // 这里的 filter 会让从源头开始的响应式丢失，因为直接替换了；然后本来的方案是 用到的地方tagList，用 storeToRefs 重新监听了一次-重新建立了 { value: tagList }，这时候 tagList 变化没问题；

      let foundIndex = this.tagList.findIndex((item) => item.path === tag.path);
      if (foundIndex === -1) return;

      this.tagList.splice(foundIndex, 1);

      console.log('tag this.tagList', this.tagList);

      setItem(TAGLIST, this.tagList);
    },
    // 从 cacheList 中删除匹配项。keep-alive 失效
    deCacheList(tag) {
      // this.cacheList = this.cacheList.filter((v) => v !== tag.name);

      let foundIndex = this.cacheList.findIndex((item) => item.path === tag.path);
      if (foundIndex === -1) return;

      this.cacheList.splice(foundIndex, 1);
    },
  },
});
