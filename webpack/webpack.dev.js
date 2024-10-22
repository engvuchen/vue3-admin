const path = require('path');
const baseConfig = require('./webpack.base.js');
const { merge } = require('webpack-merge');

const devConfig = {
  mode: 'development',
  // 定义sourceMap
  devtool: 'cheap-module-source-map',
  optimization: {
    // minimize: false, // 压缩代码
  },
  cache: {
    type: 'filesystem', // 启用磁盘缓存
    cacheDirectory: path.resolve(process.cwd(), '.temp_cache'), // 自定义缓存目录
    compression: 'brotli', // 开启 Brotli 压缩
    maxAge: 60 * 60 * 24 * 30, // 缓存有效期为 30 天
  },
  devServer: {
    hot: true,
    port: Number(process.env.VUE_APP_PORT),
    // 启动完成之后自动打开
    // open: JSON.parse(process.env.VUE_APP_OPEN),
    // open: '//admin.engvu.tech',
    // historyApiFallback: true, // 访问资源 404 之后 自动导航到 index.html
    // client: {
    //   webSocketURL: 'ws://admin.engvu.tech:3000/ws', // 替换为正确的 WebSocket 地址
    // },
    // host: '127.0.0.1',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    client: {
      webSocketURL: 'ws://localhost:3000/ws',
    },
    allowedHosts: 'all',
    proxy: [
      // {
      //   context: ['/ws'], // 匹配需要代理的 WebSocket 路径
      //   target: 'ws://localhost:3000', // 本地 WebSocket 服务器地址
      //   ws: true, // 启用 WebSocket 代理
      //   changeOrigin: true, // 修改请求头中的 `Host` 为目标服务器
      //   secure: false, // 如果是 HTTPS 且没有正确证书，设置为 false
      //   pathRewrite: { '^/ws': '/ws' }, // 可选：重写路径
      // },
      {
        context: ['/api'],
        target: 'http://admin.engvu.tech', // 现网，如果是测试环境转为 localhost
        // secure: false,
        changeOrigin: true,
        // pathRewrite: { '^/api': '' }, // 不希望传递/api，则需要重写路径：
      },
    ],
  },
};

module.exports = merge(baseConfig, devConfig);
