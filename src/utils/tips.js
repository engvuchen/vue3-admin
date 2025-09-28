// 使用按需导入，ElMessage 通过 unplugin-auto-import 自动导入
// 无需手动导入，直接使用全局的 ElMessage

const tips = {};
Object.keys(ElMessage).forEach((key) => {
  tips[key] = ElMessage[key];
});

export default tips;
