const baseConfig = require('./webpack.base.js');
const { merge } = require('webpack-merge');

const devConfig = {
  mode: 'development',
  // 定义sourceMap
  devtool: 'cheap-module-source-map',
  optimization: {
    minimize: false, // 压缩代码
  },
  devServer: {
    hot: true,
    port: Number(process.env.VUE_APP_PORT),
    // 启动完成之后自动打开
    open: JSON.parse(process.env.VUE_APP_OPEN),
    // 在访问资源 404 之后 自动导航到 index.html
    // historyApiFallback: true,
    proxy: [
      {
        context: ['/api'],
        target: 'http://admin.engvu.tech',
        // secure: false,
        changeOrigin: true,
        // pathRewrite: { '^/api': '' }, // 不希望传递/api，则需要重写路径：
      },
    ],
  },
};

module.exports = merge(baseConfig, devConfig);
