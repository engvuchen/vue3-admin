import { createRequire } from 'module';
import vue from '@vitejs/plugin-vue';
import { transform } from '@swc/core';

const resolve = createRequire(import.meta.url).resolve;

// let hmrDisabled = false;
/* eslint-disable no-undef */
const isWebContainer = globalThis?.process?.versions?.webcontainer;

const vuePlugin = (options = {}) => {
  const defaultOptions = {
    jsxImportSource: options.jsxImportSource || 'vue',
    tsDecorators: options.tsDecorators,
    plugins: options.plugins ? options.plugins.map((el) => [resolve(el[0]), el[1]]) : undefined, // [  ["plugin-name", { option1: value1, option2: value2 }], ]
    devTarget: options.devTarget || 'es2020',
    parserConfig: options.parserConfig,
  };

  console.log('options', options.plugins); // 没传咯

  return [
    // Vue 插件的配置。支持热更新
    vue(),

    // serve
    {
      name: 'vite:vue-swc',
      apply: 'serve',
      config: () => ({
        esbuild: false,
        optimizeDeps: {
          include: [`${options.jsxImportSource}/jsx-dev-runtime`], // 这是啥 jsx-dev-runtime？
          esbuildOptions: { jsx: 'automatic' },
        },
      }),
      configResolved(config) {
        // if (config.server.hmr === false) hmrDisabled = true;

        const mdxIndex = config.plugins.findIndex((p) => p.name === '@mdx-js/rollup');
        if (mdxIndex !== -1 && mdxIndex > config.plugins.findIndex((p) => p.name === 'vite:vue-swc')) {
          throw new Error('[vite:vue-swc] The MDX plugin should be placed before this plugin');
        }
        if (isWebContainer) {
          config.logger.warn(
            '[vite:vue-swc] SWC is currently not supported in WebContainers. You can use the default React plugin instead.',
          );
        }
      },
      // transformIndexHtml: (_, config) => [
      //   {
      //     tag: "script",
      //     attrs: { type: "module" },
      //     children: preambleCode.replace(
      //       "__PATH__",
      //       config.server!.config.base + runtimePublicPath.slice(1),
      //     ),
      //   },
      // ],
      // 用了这个会样式错误
      // async transform(code, _id, transformOptions) {
      //   const id = _id.split('?')[0];
      //   // const refresh = !transformOptions?.ssr && !hmrDisabled;

      //   const result = await transformWithOptions(
      //     id,
      //     code,
      //     options.devTarget,
      //     options,
      //     // {
      //     //   refresh,
      //     //   development: true,
      //     //   runtime: "automatic",
      //     //   importSource: options.jsxImportSource,
      //     // },
      //   );
      //   if (!result) return;
      //   // if (!refresh) return result;

      //   // const hasRefresh = refreshContentRE.test(result.code);
      //   // if (!hasRefresh && !reactCompRE.test(result.code)) return result;

      //   // const sourceMap = JSON.parse(result.map);

      //   return { code: result.code, map: result.map };
      // },
    },

    // build
    defaultOptions.plugins
      ? {
          name: 'vite:vue-swc',
          apply: 'build',
          enforce: 'pre', // 先于 esbuild 执行
          config: (userConfig) => ({
            build: silenceUseClientWarning(userConfig),
          }),
          /**
           * {
           *   runtime: 'automatic',
           *   importSource: defaultOptions.jsxImportSource,
           * }
           */
          transform: (code, _id) => transformWithOptions(_id.split('?')[0], code, 'esnext', defaultOptions),
        }
      : {
          name: 'vite:vue-swc',
          apply: 'build',
          config: (userConfig) => ({
            build: silenceUseClientWarning(userConfig),
            esbuild: {
              jsx: 'automatic',
              jsxImportSource: defaultOptions.jsxImportSource,
              tsconfigRaw: {
                compilerOptions: { useDefineForClassFields: true },
              },
            },
          }),
        },
  ];
};

// 转换代码
// vueConfig
const transformWithOptions = async (id, code, target, options) => {
  // const decorators = options?.tsDecorators ?? false;

  const parser = options.parserConfig
    ? options.parserConfig(id)
    : id.endsWith('.vue')
      ? { syntax: 'ecmascript', jsx: true } // Vue 文件的解析
      : undefined;
  if (!parser) return;

  let result;
  try {
    result = await transform(code, {
      filename: id,
      swcrc: false,
      configFile: false,
      sourceMaps: true,
      jsc: {
        target,
        parser,
        experimental: { plugins: options.plugins },
        transform: {
          useDefineForClassFields: true,
          //   react: vueConfig, // todo 这里可以替换为 Vue 的相关配置
        },
      },
    });
  } catch (e) {
    const message = e.message;
    const fileStartIndex = message.indexOf('╭─[');
    if (fileStartIndex !== -1) {
      const match = message.slice(fileStartIndex).match(/:(\d+):(\d+)]/);
      if (match) {
        e.line = match[1];
        e.column = match[2];
      }
    }
    throw e;
  }

  return result;
};

// 移除 React Fast Refresh 的相关逻辑，改为 Vue 逻辑
const silenceUseClientWarning = (userConfig) => ({
  rollupOptions: {
    onwarn(warning, defaultHandler) {
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) {
        return;
      }
      // https://github.com/vitejs/vite/issues/15012
      if (
        warning.code === 'SOURCEMAP_ERROR' &&
        warning.message.includes('resolve original location') &&
        warning.pos === 0
      ) {
        return;
      }
      if (userConfig.build?.rollupOptions?.onwarn) {
        userConfig.build.rollupOptions.onwarn(warning, defaultHandler);
      } else {
        defaultHandler(warning);
      }
    },
  },
});

export default vuePlugin;
