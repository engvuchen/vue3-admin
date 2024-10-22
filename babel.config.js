module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['last 2 versions', 'not dead'],
        },
      },
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
