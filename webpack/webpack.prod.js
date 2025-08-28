// const path = require('path');
// const webpack = require('webpack');
// const StatsPlugin = require('stats-webpack-plugin');

// const TerserPlugin = require('terser-webpack-plugin');
const { EsbuildPlugin } = require('esbuild-loader');
const baseConfig = require('./webpack.base.js');
const { merge } = require('webpack-merge');

const prodConfig = {
  mode: 'production',

  /**
   * 想通过时间测量，知道是哪个 loader/plugins/过程，耗时比 webpack4 高；
   *
   * 结论：无法对比。webpack5 的时间测量工具没有能用的；
   * 官网推荐的这个，仅 webpack5 可用：--profile --progress
   */

  // stats: 'detail', // 信息太多，而且也有一些是 hidden line
  // profile: true, // 需要，否则打印只有 2 行
  // parallelism: 1, // 测试时间更准确。没有 parallelism 这些提示

  // stats: {
  //   // preset: 'detail',
  //   // modules: true, // 有一点
  //   // builtAt: true,
  //   // moduleAssets: true,
  //   // timings: true,
  //   // name: true,
  //   // hash: true,
  //   // version: true,
  //   timings: true,
  //   // builtAt: true,
  //   // errorsCount: true,
  //   // warningsCount: true,

  //   // warningsCount: true,

  //   // reasons: true,
  //   // reasonsSpace: 1000,
  //   // chunkRelations: true,
  // },

  optimization: {
    // minimize: true, // 压缩代码 prod 默认值
    minimizer: [
      // new TerserPlugin({ // 18270
      //   extractComments: false,
      // }),
      new EsbuildPlugin({
        // 13742 - 24% 提升
        target: ['es2015'], // 'safari12'
        css: true, // css 压缩，不需要 cssnaco
      }),
    ],
  },

  plugins: [
    // 太大了，导入浏览器之后，看不出来哪个 loader 耗时高
    // new webpack.debug.ProfilingPlugin({
    //   outputPath: path.join(__dirname, 'profileEvents.json'),
    // }),
  ],
};

module.exports = merge(baseConfig, prodConfig);

// const compiler = webpack(merge(baseConfig, prodConfig));

// compiler.run((err, stats) => {
//   if (err) {
//     console.error(err);
//     return;
//   }

//   // const info = stats.toJson({ all: false, timings: true });
//   // console.log('info', info);
// });
