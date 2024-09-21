const requireAll = (requireContext) => requireContext.keys().forEach(requireContext);

// 使用 require.context 加载指定目录下（递归子目录）的所有 svg 文件
const svgFiles = require.context('./assets/svg', true, /\.svg$/);

requireAll(svgFiles);
