module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // 按需引入 corejs 垫片, 普通的业务开发前端项目适合该方法，简单方便，按需引入
        // 但是不适合处理一些公共第三方库库的打包构建
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    [
      '@babel/preset-typescript',
      {
        // 尝试转换任意类型文件中的 ts 代码
        allExtensions: true,
      },
    ],
  ],
  // plugins: [
  //     // 配置 babel 插件
  //     [
  //         // 配置运行时进行垫片处理的插件
  //         // 不会全局污染原生宿主环境提供的内容，完全重写语法垫片
  //         // 适合封装公共三方库
  //         '@babel/plugin-transform-runtime',
  //         {
  //             corejs: 3
  //         }
  //     ]
  // ]
};
