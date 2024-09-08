const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function setCssRules(type, isProd) {
  const loaders = [
    isProd ? MiniCssExtractPlugin.loader : 'style-loader', // 生产环境使用 MiniCssExtractPlugin，开发环境使用 style-loader
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1, // 使 @import 的 CSS 也经过 postcss-loader 等处理
      },
    },
    'postcss-loader', // 添加 autoprefixer 或其他 PostCSS 插件
  ];

  if (type === 'scss') {
    loaders.push('sass-loader'); // 如果是 SCSS 文件，额外处理 Sass 文件
  }

  return loaders;
}

module.exports = setCssRules;
