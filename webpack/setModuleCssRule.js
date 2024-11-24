// const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function setModuleCssRule(type, isProd) {
  let loaders = [
    isProd
      ? {
          loader: MiniCssExtractPlugin.loader,
          options: {
            // publicPath: './', // 指向系统根目录, 当然不对;而且是个 file 链接
            publicPath: '/02-my-code/vue3-admin/dist', // 线上编译,也不是把东西放在根目录
            // publicPath: 'auto', // 配置字体和图片文件的公共路径
            // publicPath: (resourcePath, context) => {
            //   // publicPath 是资源相对于上下文的相对路径
            //   // 例如：对于 ./css/admin/main.css publicPath 将会是 ../../
            //   // 而对于 ./css/main.css publicPath 将会是 ../
            //   return path.relative(path.dirname(resourcePath), context) + '/';
            // },
          },
        }
      : 'vue-style-loader', // 生产环境提取 CSS，开发环境内联 CSS。vue-style-loader 适应 vue 的样式热重载
    {
      loader: 'css-loader',
      options: {
        url: true,
        importLoaders: 1, // 确保 @import 的文件也经过 postcss-loader 处理
        modules: {
          namedExport: false,
          // localIdentName: isProd ? '[contenthash:6]' : '[path][name]__[local]', // 生产环境使用哈希类名，开发环境使用可读性强的类名
          localIdentName: isProd ? '[contenthash:6]' : '[contenthash:6]', // 生产环境使用哈希类名，开发环境使用可读性强的类名
        },
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            ['postcss-preset-env', { stage: 2, autoprefixer: {} }],
            // ...(isProd ? ['cssnano'] : [])
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
