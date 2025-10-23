<template>
  <div class="tdesign-theme-test">
    <h1>TDesign 主题样式测试</h1>

    <!-- 测试 TDesign 组件 -->
    <div class="test-section">
      <h2>按钮测试</h2>
      <t-button theme="primary">主要按钮</t-button>
      <t-button theme="default">默认按钮</t-button>
      <t-button theme="danger">危险按钮</t-button>
      <t-button theme="warning">警告按钮</t-button>
      <t-button theme="success">成功按钮</t-button>
    </div>

    <div class="test-section">
      <h2>卡片测试</h2>
      <t-card :bordered="true" class="test-card">
        <h3>测试卡片</h3>
        <p>这是一个测试卡片，用来验证 TDesign 主题样式是否正确应用。</p>
      </t-card>
    </div>

    <div class="test-section">
      <h2>输入框测试</h2>
      <t-input placeholder="请输入内容" />
      <t-textarea placeholder="请输入多行内容" />
    </div>

    <div class="test-section">
      <h2>颜色变量测试</h2>
      <div class="color-test">
        <div class="color-item brand">品牌色</div>
        <div class="color-item success">成功色</div>
        <div class="color-item warning">警告色</div>
        <div class="color-item error">错误色</div>
      </div>
    </div>

    <div class="test-section">
      <h2>主题切换测试</h2>
      <t-button @click="toggleTheme"> 切换到{{ isDark ? '浅色' : '深色' }}主题 </t-button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'TDesignThemeTest',
  setup() {
    const isDark = ref(false);

    const toggleTheme = () => {
      isDark.value = !isDark.value;
      document.documentElement.setAttribute('theme-mode', isDark.value ? 'dark' : 'light');
    };

    return {
      isDark,
      toggleTheme,
    };
  },
};
</script>

<style scoped>
.tdesign-theme-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-medium);
  background-color: var(--td-bg-color-container);
}

.test-section h2 {
  margin-top: 0;
  color: var(--td-text-color-primary);
  font: var(--td-font-title-medium);
}

.test-card {
  margin-top: 10px;
}

.color-test {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-item {
  padding: 10px 20px;
  border-radius: var(--td-radius-medium);
  color: white;
  font-weight: 600;
}

.color-item.brand {
  background-color: var(--td-brand-color);
}

.color-item.success {
  background-color: var(--td-success-color);
}

.color-item.warning {
  background-color: var(--td-warning-color);
}

.color-item.error {
  background-color: var(--td-error-color);
}

/* 测试 CSS 变量是否生效 */
.test-section {
  box-shadow: var(--td-shadow-1);
}

h1 {
  color: var(--td-text-color-primary);
  font: var(--td-font-headline-medium);
  margin-bottom: 30px;
}
</style>
