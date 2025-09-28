import QuillEditorAdapter from '../RichText/index.vue';

const registry = new Map();

export const registerCustomComponent = (type, component) => {
  registry.set(type, component);
};

export const getCustomComponent = (type) => {
  return registry.get(type);
};

// 预注册：富文本编辑器
registerCustomComponent('quill', QuillEditorAdapter);
