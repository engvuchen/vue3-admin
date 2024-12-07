let isCodeEditorLoaded = false;

async function initCodeEditor() {
  if (isCodeEditorLoaded) return;

  // 先加载编辑器核心包、加载语言插件。若在同一个 promise.all 中，当 vite 本地启动，编辑器核心代码/语言配置同时加载，语言配置会报 monaco 不存在
  let [monaco] = await Promise.all([
    import(/* webpackChunkName: "monaco-editor" */ 'monaco-editor/esm/vs/editor/editor.api.js'),
    // 查找的核心包，里面导入有：findWidget、findModel、findOptionsWidget、findState
    import(
      /* webpackChunkName: "monaco-editor" */ 'monaco-editor/esm/vs/editor/contrib/find/browser/findController.js'
    ),
    // 查询的样式，需要单独导入
    import(/* webpackChunkName: "monaco-editor" */ 'monaco-editor/esm/vs/base/browser/ui/codicons/codiconStyles.js'),
  ]);
  window.monaco = monaco;

  // 语法高亮文件
  await Promise.all([
    import(
      /* webpackChunkName: "monaco-editor" */ 'monaco-editor/esm/vs/basic-languages/protobuf/protobuf.contribution.js'
    ),
    import(/* webpackChunkName: "monaco-editor" */ 'monaco-editor/esm/vs/language/json/monaco.contribution.js'),
  ]);

  isCodeEditorLoaded = true;
}
/**
 * 加载代码编辑器
 * @param {*} elId 容器元素ID
 * @param {*} code 代码内容
 * @param {*} options 其余配置
 */
function loadCodeEditor(elId, code, options = {}) {
  !options.format && (options.format = 'proto');

  return new Promise((resolved) => {
    initCodeEditor().then(() => {
      // 初始化编辑器
      let editor = window.monaco.editor.create(document.getElementById(elId), options);

      // 其余语法格式需要增加代码高亮文件
      window.monaco.editor.setModelLanguage(editor.getModel(), options.format);
      editor.setValue(code);
      options.readOnly !== true && editor.focus();

      resolved(editor);
    });
  });
}

export { initCodeEditor, loadCodeEditor };
