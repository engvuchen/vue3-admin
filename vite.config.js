import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
// import vueSwc from './vite-swc';

// import viteCompression from 'vite-plugin-compression';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default (env) => {
  return defineConfig({
    plugins: [
      nodeResolve({
        modulePaths: [
          path.resolve(process.cwd(), './node_modules'),
          path.resolve(process.cwd(), './src/components/biz/components'),
          path.resolve(process.cwd(), './src'),
        ],
      }),
      nodePolyfills({
        include: ['buffer'],
      }),
      // vueSwc(),
      vue(),
      // https://github.com/vbenjs/vite-plugin-svg-icons/blob/main/README.zh_CN.md
      createSvgIconsPlugin({
        iconDirs: [path.resolve(__dirname, 'src/assets/svg')], // 指定需要缓存的图标文件夹
        symbolId: 'icon-[dir]-[name]', // 指定symbolId格式
      }),
      // 生成浏览器兼容文件
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
      // viteCompression({
      //   verbose: true, // 是否在控制台输出压缩结果
      //   disable: false, // 是否禁用,相当于开关在这里
      //   threshold: 500 * 1024, // 体积大于 threshold 才会被压缩,单位 byte，1024b=1KB。大于 500 KB，就会压缩
      //   algorithm: 'gzip', // 压缩算法,可选 [ 'gzip' , 'brotliCompress' ,'deflate' , 'deflateRaw']
      //   ext: '.gz', // 文件后缀
      //   deleteOriginFile: false,
      // }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          // additionalData: '@import "./src/assets/style/global-variables.scss";',
          additionalData: `@use "./src/assets/style/global-variables.scss" as *;`, // 每个样式表前都插入这一句 https://cn.vitejs.dev/config/shared-options.html#css-preprocessoroptions-extension-additionaldata
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3001,
      open: 'http://admin.engvu.tech', // boolean || string, true => 默认 localhost
      // proxy: {
      //   '/api': {
      //     target: 'http://dev.api.xxx.com', // 后端接口的域名
      //     changeOrigin: true,
      //     rewrite: (path) => path.replace(/^\/api/, ''),
      //   },
      // },
    },
    build: {
      commonjsOptions: {
        include: /node_modules|src/,
      },
      reportCompressedSize: false, // 启用/禁用 gzip 压缩大小报告。压缩大型输出文件可能会很慢，因此禁用该功能可能会提高大型项目的构建性能。
      rollupOptions: {
        output: {
          // manualChunks: {
          //   // 拆分单独模块
          //   'element-plus': ['element-plus'],
          // },
          manualChunks(id) {
            // todo 设置分包，所有 legacy 都没了

            // 根据模块路径手动分割
            if (id.includes('node_modules/element-plus')) {
              return 'element-plus';
            }
          },
        },
      },
    },
  });
};
