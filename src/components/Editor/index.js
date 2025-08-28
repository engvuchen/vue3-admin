// 防止重复加载静态资源
let isCodeEditorLoaded = false;

/** 初始化代码编辑器 */
export function initCodeEditor() {
  return new Promise(async (resolved) => {
    if (!isCodeEditorLoaded) {
      // note: vite 编辑器核心代码/语言配置同时加载，语言配置会报 monaco 不存在
      let [monaco] = await Promise.all([
        import(/* webpackChunkName: "monaco-editor" */ 'monaco-editor/esm/vs/editor/editor.api.js'),
        // import(/* webpackChunkName: "monaco-editor" */ 'monaco-editor/esm/vs/editor/browser/coreCommands.js'),
        // 查找代码
        import(
          /* webpackChunkName: "monaco-editor" */ 'monaco-editor/esm/vs/editor/contrib/find/browser/findController.js'
        ),
        import(/* webpackChunkName: "monaco-editor" */ 'monaco-editor/esm/vs/base/browser/ui/codicons/codiconStyles.js'),
        // 折叠代码
        import(
          /* webpackChunkName: "monaco-editor" */ 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js'
        ),
      ]);
      window.monaco = monaco;

      await Promise.all([
        import(/* webpackChunkName: "monaco-editor" */ './monaco-language-protobuf.js'), // 支持protobuf语法高亮
        import(/* webpackChunkName: "monaco-editor" */ './monaco-language-json.js'), // 支持json语法高亮
      ]);
      isCodeEditorLoaded = true;
      resolved();
    } else {
      resolved();
    }
  });
}

/**
 * 加载代码编辑器
 * @param {*} elId 容器元素ID
 * @param {*} code 代码内容
 * @param {*} options 其余配置
 */
export function loadCodeEditor(elId, code, options = {}) {
  !options.language && (options.language = 'json');

  return new Promise((resolved) => {
    initCodeEditor().then(() => {
      const editor = window.monaco.editor.create(document.getElementById(elId), {
        ...options,
      });

      window.monaco.editor.setModelLanguage(editor.getModel(), options.language);
      editor.setValue(code);
      options.readOnly !== true && editor.focus();

      resolved(editor);
    });
  });
}

/**
 * 加载代码对比编辑器
 * @param {*} elId 容器元素ID
 * @param {*} originalCode 原版内容
 * @param {*} modifiedCode 修改的内容
 * @param {*} options 其余配置
 */
export function loadDiffEditor(elId, originalCode, modifiedCode, options = {}) {
  !options.language && (options.language = 'json');
  // 左右对比模式，inline，默认是前者
  !options.renderSideBySide && (options.renderSideBySide = true);

  return new Promise((resolved) => {
    initCodeEditor().then(() => {
      const editor = window.monaco.editor.createDiffEditor(document.getElementById(elId), {
        ...options,
      });

      editor.setModel({
        original: window.monaco.editor.createModel(originalCode, options.language),
        modified: window.monaco.editor.createModel(modifiedCode, options.language),
      });

      resolved(editor);
    });
  });
}
