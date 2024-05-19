<div align="center">
  <div>
    <a href="https://github.com/engvuchen/vue3-admin">
        <img alt="VEA Logo" width="160" src="https://upload2.engvu.tech/img/logo.png">
    </a>
  </div>

  <div align="center">
      <img src="https://img.shields.io/badge/Vue-3.4.21-brightgreen.svg"/>
      <img src="https://img.shields.io/badge/Vite-5.2.8-green.svg"/>
      <img src="https://img.shields.io/badge/Element Plus-2.7.2-blue.svg"/>
      <img src="https://img.shields.io/badge/license-MIT-green.svg"/>
  </div>

  <div align="center">
    <a target="_blank" href="http://admin.engvu.tech">👀 在线预览</a>
  </div>

  <h1>Vue3 Element Admin</h1>
</div>

## 简介

**Vue3 Element Admin** 是一个免费开源的中后台模版。基于 `Vue3` + `ElementPlus` + `Vite` 开发，是一个开箱即用的中后台系统前端解决方案，它可以帮助你快速搭建企业级中后台产品原型，也可用于学习参考。

- **简洁易用**：基于 [vue-element-admin]((https://huzhushan.gitee.io/vue3-element-admin)) 升级，解决一系列适配问题。

- **数据交互**：配套 [Koa2 服务](https://github.com/engvuchen/v3-admin-koa2.git) 和 [在线接口文档](https://apifox.com/apidoc/shared-c0a3914c-08d9-48d9-9425-e845fc50a961)。

- **权限管理**：可控制页面、接口权限。

- **基础设施**：动态路由、按钮权限、国际化、代码规范、Git 提交规范、常用组件封装。

## 技术储备

> 提前了解和学习以下知识会对您使用本项目有很大的帮助

- [node](http://nodejs.org/) 和 [git](https://git-scm.com/) -项目开发环境
- [Es6+](http://es6.ruanyifeng.com/) - 熟悉 es6 基本语法
- [Vite](https://www.pipipi.net/vite/) - 熟悉 vite 特性
- [Vue3](https://v3.vuejs.org/) - 熟悉 Vue 基础语法
- [Vue-Router-Next](https://next.router.vuejs.org/zh/) - 熟悉 vue-router@4 基本使用
- [Element-Plus](https://element-plus.gitee.io/#/zh-CN) - ui 基本使用

## 安装使用

最近一次 node.js 运行版本是 `18.16.0`。

```bash
# 克隆项目
git clone https://github.com/engvuchen/vue3-admin.git

# 进入项目目录
cd vue3-element-admin

# 通过如下操作提速 npm 下载。建议不直接使用 cnpm 安装依赖，会有各种诡异的 bug。
npm install --registry=https://registry.npm.taobao.org

# 启动服务
npm start
```

## 打包发布

```bash
npm run build
```

## 页面代理方案

基于 [`Proxy SwitchyOmega`](https://chromewebstore.google.com/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif?pli=1)、[`whistle`](https://wproxy.org/whistle/) 方案；

`Proxy Proxy SwitchyOmega` 配置文件，从插件界面导入此配置（从备份文件恢复）即可，[下载链接](https://www.jianguoyun.com/p/DRr5-jcQwfi6CRiCj8QFIAA)。

`whistle`:

```
/^https?://admin.engvu.tech/(?!api)(.*)/ http://127.0.0.1:3001/$1
wss://admin.engvu.tech ws://127.0.0.1:3001/
/^https?://admin.engvu.tech/api/(.*)/ http://127.0.0.1:5000/api/$1
```

## 如何贡献

非常欢迎你的加入！[提一个 Issue](https://github.com/huzhushan/vue3-element-admin/issues/new/choose) 或者提交一个 Pull Request。

**Pull Request:**

1. Fork 代码!
2. 创建自己的分支: `git checkout -b feat/xxxx`
3. 提交你的修改: `git commit -am 'feat(function): add xxxxx'`
4. 推送您的分支: `git push origin feat/xxxx`
5. 提交 `pull request`

## Git 贡献提交规范

- 参考 [vue](https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md) 规范 ([Angular](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular))

  - `feat` 增加新功能
  - `fix` 修复问题/BUG
  - `style` 代码风格相关无影响运行结果的
  - `perf` 优化/性能提升
  - `refactor` 重构
  - `revert` 撤销修改
  - `test` 测试相关
  - `docs` 文档/注释
  - `chore` 依赖更新/脚手架配置修改等
  - `workflow` 工作流改进
  - `ci` 持续集成
  - `types` 类型定义文件更改
  - `wip` 开发中

## 浏览器支持

本地开发推荐使用`Chrome 80+` 浏览器

| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt=" Edge" width="24px" height="24px" /></br>IE | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt=" Edge" width="24px" height="24px" /></br>Edge | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" /></br>Firefox | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" /></br>Chrome | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" /></br>Safari |
| :----------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                                                   not support                                                                    |                                                                  last 2 versions                                                                   |                                                                        last 2 versions                                                                        |                                                                      last 2 versions                                                                      |                                                                      last 2 versions                                                                      |
