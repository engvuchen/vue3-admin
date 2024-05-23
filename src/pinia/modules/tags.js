/**
 * 标签管理的基础能力
 */

import { defineStore } from 'pinia';
import { getItem, setItem, removeItem } from '@/utils/storage';
const TAGLIST = 'VEA-TAGLIST';

// 负责条件的项，才在列表中保留
function remainListItem(list, ...args) {
  let condition = args.pop();
  if (typeof condition !== 'function') return console.error('removeListItem: 最后一个参数需要是函数');

  let remains = [];
  while (list.length) {
    let item = list.shift();
    let result = condition(item, ...args);
    if (result) remains.push(item);
  }

  console.log('remainListItem, remains', remains);
  list.push(...remains);
}

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
    /** 标签仅保留固定、自己 */
    delOtherTags(tag) {
      remainListItem(this.tagList, tag, (item, tag) => {
        if (item?.meta?.affix || item.path === tag.path) {
          return true;
        }
      });
      setItem(TAGLIST, this.tagList);

      console.log('this.tagList', this.tagList); // todo

      remainListItem(this.cacheList, tag, (item, tag) => item === tag.name);
    },
    /** 保留和 tags 不一致的 */
    delSomeTags(tags) {
      remainListItem(
        this.tagList,
        tags,
        (item, tags) => item?.meta?.affix || tags.every((_item) => _item.path !== item.path),
      );
      setItem(TAGLIST, this.tagList);

      remainListItem(this.cacheList, tags, (name, tags) => tags.every((item) => item.name !== name));
    },
    delAllTags() {
      remainListItem(this.tagList, (tag) => tag?.meta?.affix);

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
      // filter 直接替换，会导致其他地方 tagList.value 的响应式丢失；
      // 原来的方案：用到的 tagList，用 storeToRefs 重新监听了一次 - 重新建立了 { value: tagList }，这时候 tagList 变化没问题；
      // this.tagList = this.tagList.filter((v) => v.path !== tag.path);

      let foundIndex = this.tagList.findIndex((item) => item.path === tag.path);
      if (foundIndex === -1) return;
      this.tagList.splice(foundIndex, 1);

      setItem(TAGLIST, this.tagList);
    },
    // 从 cacheList 中删除匹配项。keep-alive 失效
    deCacheList(tag) {
      let foundIndex = this.cacheList.findIndex((item) => item.path === tag.path);
      if (foundIndex === -1) return;
      this.cacheList.splice(foundIndex, 1);
    },
  },
});
