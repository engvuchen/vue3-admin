// const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function setCssRules(type, isProd) {
  let loaders = [
    isProd
      ? {
          loader: MiniCssExtractPlugin.loader,
          options: {
            // D:\02-my-code\vue3-admin\webpack\setCssRules.js

            publicPath: '/02-my-code/vue3-admin/dist',
            // publicPath: 'auto', // 配置字体和图片文件的公共路径. auto '' 都一样不对
            // publicPath: (resourcePath, context) => {
            //   // publicPath 是资源相对于上下文的相对路径
            //   // 例如：对于 ./css/admin/main.css publicPath 将会是 ../../
            //   // 而对于 ./css/main.css publicPath 将会是 ../
            //   return path.relative(path.dirname(resourcePath), context) + '/';
            // },
          },
        }
      : 'vue-style-loader', // 生产环境使用 MiniCssExtractPlugin，开发环境使用 style-loader
    {
      loader: 'css-loader',
      options: {
        url: true,
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
