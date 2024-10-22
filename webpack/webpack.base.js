// 公共的 webpack 配置
const { resolve, relative } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const webpack = require('webpack');
const MinicssExtractPlugin = require('mini-css-extract-plugin');
const setCssRules = require('./setCssRules');
const setModuleCssRule = require('./setModuleCssRule');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const HappyPack = require('happypack');

// const Smp = require('speed-measure-webpack-plugin');
// const smp = new Smp(); // 即使不用，也会多十几秒。18s
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// 读取 node_env 环境变量的值
let nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

const envVars = ['.env', `.env.${nodeEnv}`, `.env.${nodeEnv}.local`, '.env.local'];
// 读取当前构建环境对应的环境变量文件的所有内容，将其注入到环境变量中
envVars.forEach((envVar) => {
  const envFilePath = resolve(__dirname, '..', envVar);
  const envFileExists = require('fs').existsSync(envFilePath);
  if (envFileExists) {
    require('dotenv').config({
      path: envFilePath,
    });
  }
});

let config = {
  // 配置入口
  entry: resolve(__dirname, '..', 'src', 'main.js'),
  // 配置打包出口
  output: {
    path: resolve(__dirname, '..', 'dist'),
    filename: 'js/[name].[contenthash:6].js', // 使用文件指纹
    clean: true, // 从 webpack5 开始，clean=true,每一次构建会自动清理输出目录
    publicPath: '/', // 打包后访问的资源前缀
  },
  // 配置路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, '..', 'src'),
      vue$: 'vue/dist/vue.runtime.esm-bundler.js',
    },
    extensions: ['.js', '.ts', '.tsx', '.vue', '.json'], // 配置模块的访问路径。'/util' -> 'util.js'
  },
  optimization: {
    chunkIds: 'named', // 用文件的名字作为chunk的名字
    runtimeChunk: { name: 'runtime' }, // runtime 独立打包
    splitChunks: {
      chunks: 'all', // 任意模块都可以拆分F
      cacheGroups: {
        // node_modules 独立拆成另一个包
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true, // 不需要重复拆开 chunk
        },
      },
    },
  },
  // cache: {
  //   type: 'filesystem',
  // },
  // 配置 plugins
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, '..', 'index.html'), // 指定 html 模板的路径
      title: process.env.VUE_APP_TITLE, // 该配置会注入到 html 文件的模板语法中F
    }),
    // 加载 vue-loader 插件
    new VueLoaderPlugin(),
    // 在编译时候全局替换静态值
    new webpack.DefinePlugin({
      // 定义全局变量
      'process.env': {
        VUE_APP_API_URI: JSON.stringify(process.env.VUE_APP_API_URI),
      },
      // 决定 vue3 是否启用 options api
      __VUE_OPTIONS_API__: true,
      // Vue Devtools 在生产环境中不可用
      __VUE_PROD_DEVTOOLS__: false,
    }),
    new MinicssExtractPlugin({
      filename: 'css/[name].[contenthash:6].css',
      // chunkFilename: "css/[name].[contenthash:6].css",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: resolve(__dirname, '..', 'public'),
          to: resolve(__dirname, '..', 'dist'),
          toType: 'dir',
          globOptions: {
            ignore: ['**/index.html', '**/.DS_Store'],
          },
          info: {
            minimized: true,
          },
        },
      ],
    }),
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'server',
    //   analyzerHost: '127.0.0.1',
    //   analyzerPort: 8888,
    //   openAnalyzer: true,
    //   generateStatsFile: false,
    //   statsOptions: null,
    //   logLevel: 'info',
    // }),
  ],
  // 配置 loader
  module: {
    rules: [
      // 配置 js loader
      {
        test: /\.js$/,
        exclude: /node_modules/,
        // use: 'happypack/loader?id=js', // babel8 + happypack threads=4 22710 22976
        use: [
          // 不使用 thread-loader，或开启全部 cpu-1 核心，基本都是 18s。开了 thread，还慢一些。workers = 4，反而到了 23s
          // 不用: 18794 18593 18991
          // {
          //   // loader: 'thread-loader', // 19446 18561 19265
          //   loader: resolve(__dirname, '../node_modules/thread-loader/dist/cjs.js'), // 18877 19154 19072
          //   options: {
          //     // workers: 4, // 指定线程数，可根据项目规模调整 19346 19673
          //     poolTimeout: 0,
          //   },
          // },
          // 用 swc-loader 替换 babel-loader
          {
            loader: 'swc-loader', // 18270 18585 18965，差不了很多
            options: {
              // https://swc.rs/docs/configuration/swcrc#compilation
              jsc: {
                // target: 'es5', // 转译为 ES5。默认
                externalHelpers: true, // 启用外部 helpers (即使用 @swc/helpers)
              },
            },
          },
        ],
      },
      // 配置 .vue 文件
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      // 处理 css
      {
        test: /\.css$/i,
        exclude: [/node_modules/, /\.module\.css$/], // 过滤 `node_modules`, `.module.css` 结尾的文件
        use: setCssRules('css', isProd),
      },
      // 处理 scss、sass
      {
        test: /\.s[ac]ss$/i,
        // 过滤掉 node_modules 以及以 .module.scss 结尾的文件
        exclude: [/node_modules/, /\.module\.s[ac]ss$/], // `node_modules`
        use: setCssRules('scss', isProd),
      },
      // 处理 css module: `.module.sass`、`.module.scss`、`.module.css` 结尾的文件
      {
        test: /\.module\.(sa|sc|c)ss$/i,
        exclude: /node_modules/,
        use: setModuleCssRule('scss', isProd),
      },
      // 处理图片
      {
        test: /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/,
        // webpack5 新特性，不再需要使用loader去进行处理
        // assets 是 webpack5 通用的资源处理类型
        // 默认情况下 8kb 以下的资源会被转化为 base64 编码
        exclude: [resolve(process.cwd(), 'src/assets/svg')], // 排除要用 sprite 处理的 svg 文件
        type: 'asset',
        parser: {
          dataUrlCondition: {
            // 自定义 10 kb 以下的资源会被转化为 base 64 位编码
            maxSize: 10 * 1024,
          },
        },
        generator: {
          filename: 'images/[name].[ext]', // 输出图片的名称，自动创建 images 文件夹
        },
      },
      // 处理字体
      {
        test: /\.(woff|woff2|eot|ttf)\??.*$/,
        // 默认情况下 8kb 以下的资源会被转化为 base64 编码
        type: 'asset',
        parser: {
          dataUrlCondition: {
            // 自定义 10 kb 以下的资源会被转化为 base 64 位编码
            maxSize: 10 * 1024,
          },
        },
        generator: {
          filename: 'fonts/[name].[ext]', // 输出图片的名称
        },
      },
      // 指定目录的 svg 转为组件
      {
        test: /\.svg$/,
        include: [resolve(process.cwd(), 'src/assets/svg')], // 仅处理此目录下的SVG文件
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              // symbolId: '[folder]-[name]', // 自定义symbolId格式
              symbolId: (filePath) => {
                const relativePath = relative(resolve(process.cwd(), 'src/assets/svg'), filePath);

                // 移除第一层目录
                const result = relativePath
                  .replace(/[.]+[\\/]/, '')
                  .replace(/[\\/]+/g, '-')
                  .replace('.svg', '');

                return result; // 返回处理后的 symbolId
              },
            },
          },
        ],
      },
    ],
  },
};

module.exports = config;

// module.exports = smp.wrap(config);
