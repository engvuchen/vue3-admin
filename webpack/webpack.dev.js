const baseConfig = require('./webpack.base.js');
const { merge } = require('webpack-merge');

/**
 * @type {import('webpack').Configuration}
 */

const devConfig = {
  mode: 'development',
  // webpack5 本身就直接支持了热更新
  // 定义sourceMap
  devtool: 'cheap-module-source-map',
  devServer: {
    port: Number(process.env.VUE_APP_PORT),
    // 启动完成之后自动打开
    open: JSON.parse(process.env.VUE_APP_OPEN),
    // 在访问资源 404 之后 自动导航到 index.html
    historyApiFallback: true,
  },
};

module.exports = merge(baseConfig, devConfig);
