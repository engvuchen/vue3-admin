const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function setModuleCssRule(type, isProd) {
  let loaders = [
    isProd ? MiniCssExtractPlugin.loader : 'vue-style-loader', // 生产环境提取 CSS，开发环境内联 CSS。vue-style-loader 适应 vue 的样式热重载
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1, // 确保 @import 的文件也经过 postcss-loader 处理
        modules: {
          localIdentName: isProd ? '[contenthash:6]' : '[path][name]__[local]', // 生产环境使用哈希类名，开发环境使用可读性强的类名
        },
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            ['postcss-preset-env', { stage: 1, autoprefixer: { grid: true }, features: { 'nesting-rules': true } }],
            ...(isProd ? ['cssnano'] : []),
          ],
        },
      },
    },
  ];

  // 处理 Sass 文件
  if (type === 'scss') {
    loaders.push({
      loader: 'sass-loader',
      options: {
        warnRuleAsWarning: false,
        additionalData: '@use "@/assets/style/global-variables.scss" as *;',
      },
    });
  }

  return loaders;
}

module.exports = setModuleCssRule;
