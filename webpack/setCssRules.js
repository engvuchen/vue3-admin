const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function setCssRules(type, isProd) {
  let loaders = [
    isProd ? MiniCssExtractPlugin.loader : 'vue-style-loader', // 生产环境使用 MiniCssExtractPlugin，开发环境使用 style-loader
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1, // 使 @import 的 CSS 也经过 postcss-loader 等处理
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [['postcss-preset-env', { stage: 2, autoprefixer: {} }]], // ...(isProd ? ['cssnano'] : [])
        },
      },
    },
  ];

  // 额外处理 Sass 文件
  if (type === 'scss') {
    // https://webpack.docschina.org/loaders/sass-loader/
    loaders.push({
      loader: 'sass-loader',
      options: {
        warnRuleAsWarning: false, // 忽略警告，否则有全屏报错
        additionalData: '@use "@/assets/style/global-variables.scss" as *;',
      },
    });
  }

  return loaders;
}

module.exports = setCssRules;
