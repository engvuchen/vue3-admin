const baseConfig = require('./webpack.base.js');
const { merge } = require('webpack-merge');

const prodConfig = {
  mode: 'production',
  optimization: {
    minimize: true, // 压缩代码
  },
};

module.exports = merge(baseConfig, prodConfig);
