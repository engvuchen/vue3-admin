// 公共的 webpack 配置
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const webpack = require('webpack');
const MinicssExtractPlugin = require('mini-css-extract-plugin');
const setCssRules = require('./setCssRules');
const setModuleCssRule = require('./setModuleCssRule');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// 读取 node_env 环境变量的值
let nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

const envVars = ['.env', `.env.${nodeEnv}`, `.env.${nodeEnv}.local`, '.env.local'].filter(Boolean);

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

module.exports = {
  // 配置入口
  entry: resolve(__dirname, '..', 'src', 'main.js'),
  // 配置打包出口
  output: {
    path: resolve(__dirname, '..', 'dist'),
    filename: 'js/[name].[contenthash:6].js', // 使用文件指纹
    clean: true, // 从 webpack5 开始，只要开启这个开关，那么每一次构建会自动清理输出目录
    // 打包后访问的资源前缀
    publicPath: '/',
  },
  // 配置路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, '..', 'src'),
      vue$: 'vue/dist/vue.runtime.esm-bundler.js',
    },
    // 配置模块的访问路径
    extensions: ['.js', '.ts', '.tsx', '.vue', '.json'],
  },
  optimization: {
    // minimize: true, // 压缩代码
    // 用文件的名字作为chunk的名字
    chunkIds: 'named',
    runtimeChunk: { name: 'runtime' }, // runtime 独立打包
    splitChunks: {
      // 任意模块都可以拆分
      chunks: 'all',
      cacheGroups: {
        // node_modules 独立拆成另一个包
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          // 不需要重复拆 chunk
          reuseExistingChunk: true,
        },
      },
    },
  },
  // 配置插件
  plugins: [
    new HtmlWebpackPlugin({
      // 指定 html 模板的路径
      // template: resolve(__dirname, '..', 'public', 'index.html'),
      template: resolve(__dirname, '../index.html'),
      // 该配置会注入到 html 文件的模板语法中
      title: process.env.VUE_APP_TITLE,
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
            minimized: true, // 注意：minimize 应该是 minimized，根据CopyWebpackPlugin的文档进行修正
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
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        // 配置 .vue 文件
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        oneOf: [
          // 处理 css 相关的内容
          {
            test: /\.css$/i,
            exclude: [/\.module\.css$/], // 过滤掉 node_modules 以及以 .module.css 结尾的文件
            use: setCssRules('css', isProd),
          },
          //  处理 .module.css 结尾的文件
          // {
          //   test: /\.module\.css$/,
          //   exclude: /node_modules/,
          //   use: setModuleCssRule('css', isProd),
          // },
          // 处理 scss 相关的内容
          {
            test: /\.s[ac]ss$/i,
            // 过滤掉 node_modules 以及以 .module.scss 结尾的文件
            // exclude: [/\.module\.s[ac]ss$/], // [/node_modules/]，不处理这个 node_modules，element-plus 样式显示不出来
            use: setCssRules('scss', isProd),
          },
          // 处理 .module.scss、.module.sass、.module.css 结尾的文件
          {
            test: /\.module\.(sa|sc|c)ss$/,
            exclude: /node_modules/,
            use: setModuleCssRule('scss', isProd),
          },
        ],
      },
      // 处理图片
      {
        test: /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/,
        // webpack5 新特性，不再需要使用loader去进行处理
        // assets 是 webpack5 通用的资源处理类型
        // 默认情况下 8kb 以下的资源会被转化为 base64 编码
        exclude: [resolve(__dirname, 'src/assets/svg')], // 排除要用 sprite 处理的 svg 文件
        type: 'asset',
        parser: {
          dataUrlCondition: {
            // 自定义 10 kb 以下的资源会被转化为 base 64 位编码
            maxSize: 10 * 1024,
          },
        },
        generator: {
          // outputPath: "images", // 输出图片的目录
          filename: 'images/[name].[ext]', // 输出图片的名称
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
          // 输出图片的名称
          filename: 'fonts/[name].[ext]',
        },
      },
      // svg 类型的静态资源期望转为为 asset/resource 类型进行处理，覆盖了第一个规则中对 svg 的处理，确保 SVG 文件作为资源导出
      // {
      //   test: /\.(svg)(\?.*)?$/,
      //   // 默认会将构建结果导出单独的配置文件
      //   type: 'asset/resource',
      //   exclude: [resolve(__dirname, 'src/assets/svg')], // 排除需要 sprite 处理的 SVG
      //   generator: {
      //     // 输出 svg 的目录
      //     // outputPath: "images",
      //     // 输出 svg 的名称
      //     filename: 'svgs/[name].[contenthash:6].[ext]',
      //   },
      // },
      // 指定目录的 svg 转为组件
      {
        test: /\.svg$/,
        include: [resolve(__dirname, 'src/assets/svg')], // 仅处理此目录下的SVG文件
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              symbolId: 'icon-[name]', // 自定义symbolId格式
            },
          },
        ],
      },
    ],
  },
};