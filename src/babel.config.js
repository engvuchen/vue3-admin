module.exports = {
  presets: [
    [
      '@babel/preset-env',
      // babel-preset 按需导入垫片
      // {
      //   useBuiltIns: 'usage',
      //   corejs: 3,
      // },
    ],
  ],
  plugins: [
    // 更现代：复用垫片、按需导入垫片、处理全局变量污染
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3,
      },
    ],
  ],
};
