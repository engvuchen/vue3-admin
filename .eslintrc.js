module.exports = {
  extends: ['alloy'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: {
      js: '@babel/eslint-parser',
      jsx: '@babel/eslint-parser',
      // Leave the template parser unspecified, so that it could be determined by `<script lang="...">`
    },
  },
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    // browser: true,
    node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    // 自定义你的规则
    'max-params': ['error', 4], // 将允许的最大参数个数增加到 4
    'no-param-reassign': 'off', // 允许对函数参数进行重新赋值
  },
};
