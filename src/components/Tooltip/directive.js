// 添加 tooltip 样式到页面
const addTooltipStyles = () => {
  if (document.getElementById('custom-tooltip-styles')) return;

  const styleElement = document.createElement('style');
  styleElement.id = 'custom-tooltip-styles';
  styleElement.innerHTML = `
    .custom-tooltip {
      position: fixed;
      padding: 8px 12px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 99;
      max-width: 300px;
      word-wrap: break-word;
      white-space: normal;
      font-size: 12px;
      line-height: 1.4;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }
    
    .tooltip-arrow {
      position: absolute;
      width: 0;
      height: 0;
      border: 4px solid transparent;
    }
  `;
  document.head.appendChild(styleElement);
};

// 检查文本是否超出容器
const isTextOverflow = (element) => {
  return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;
};

// 创建 tooltip 元素
const createTooltip = (content, options = {}) => {
  const tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip';

  const theme = options.theme || 'dark';
  const isDark = theme === 'dark';

  tooltip.style.cssText = `
    background: ${isDark ? 'rgba(27, 33, 41, 0.9)' : 'rgba(255, 255, 255, 0.95)'};
    color: ${isDark ? '#ffffff' : '#333333'};
    border: 1px solid ${isDark ? 'rgba(27, 33, 41, 0.9)' : 'rgba(0, 0, 0, 0.1)'};
    z-index: ${options.zIndex || 99};
    max-width: ${options.maxWidth || 300}px;
  `;

  // 添加箭头
  if (options.showArrow !== false) {
    const arrow = document.createElement('div');
    arrow.className = 'tooltip-arrow';
    tooltip.appendChild(arrow);
  }

  tooltip.innerHTML = content;
  document.body.appendChild(tooltip);

  return tooltip;
};

// 计算 tooltip 位置
const calculatePosition = (trigger, tooltip, placement = 'top') => {
  const triggerRect = trigger.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  const offset = 8;
  let left = 0;
  let top = 0;

  // 计算基础位置
  switch (placement) {
    case 'top':
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      top = triggerRect.top - tooltipRect.height - offset;
      break;
    case 'bottom':
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      top = triggerRect.bottom + offset;
      break;
    case 'left':
      left = triggerRect.left - tooltipRect.width - offset;
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      break;
    case 'right':
      left = triggerRect.right + offset;
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      break;
  }

  // 边界检测
  const margin = 8;
  left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));
  top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;

  // 设置箭头位置
  const arrow = tooltip.querySelector('.tooltip-arrow');
  if (arrow) {
    const theme = (tooltip.style.background || '').includes('rgba(27, 33, 41') ? 'dark' : 'light';
    const isDark = theme === 'dark';
    const borderColor = isDark ? 'rgba(27, 33, 41, 0.9)' : 'rgba(255, 255, 255, 0.95)';

    // 基础箭头样式
    arrow.style.position = 'absolute';
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.border = '4px solid transparent';

    switch (placement) {
      case 'top':
        arrow.style.bottom = '-4px';
        arrow.style.left = '50%';
        arrow.style.transform = 'translateX(-50%)';
        arrow.style.borderTopColor = borderColor;
        break;
      case 'bottom':
        arrow.style.top = '-4px';
        arrow.style.left = '50%';
        arrow.style.transform = 'translateX(-50%)';
        arrow.style.borderBottomColor = borderColor;
        break;
      case 'left':
        arrow.style.right = '-4px';
        arrow.style.top = '50%';
        arrow.style.transform = 'translateY(-50%)';
        arrow.style.borderLeftColor = borderColor;
        break;
      case 'right':
        arrow.style.left = '-4px';
        arrow.style.top = '50%';
        arrow.style.transform = 'translateY(-50%)';
        arrow.style.borderRightColor = borderColor;
        break;
    }
  }
};

// 显示 tooltip
const showTooltip = (el, binding) => {
  const options = binding.value;
  const content = typeof options === 'string' ? options : options?.content || '';
  const config = typeof options === 'object' ? options : {};

  if (!content || config.disabled) return;

  // 检查是否只在文本超出时显示
  if (config.onlyOverflow === true && !isTextOverflow(el)) return;

  // 如果已经存在 tooltip，先移除
  if (el._tooltipElement) {
    el._tooltipElement.remove();
    el._tooltipElement = undefined;
  }

  el._tooltipElement = createTooltip(content, config);

  // 计算位置
  requestAnimationFrame(() => {
    if (el._tooltipElement) {
      calculatePosition(el, el._tooltipElement, config.placement || 'top');

      // 淡入动画
      requestAnimationFrame(() => {
        if (el._tooltipElement) {
          el._tooltipElement.style.opacity = '1';
        }
      });
    }
  });
};

// 隐藏 tooltip
const hideTooltip = (el) => {
  if (!el._tooltipElement) return;

  el._tooltipElement.style.opacity = '0';

  setTimeout(() => {
    if (el._tooltipElement) {
      el._tooltipElement.remove();
      el._tooltipElement = undefined;
    }
  }, 200);
};

// 清理函数
const cleanup = (el) => {
  if (el._tooltipElement) {
    el._tooltipElement.remove();
    el._tooltipElement = undefined;
  }
};

// 创建指令
const vTooltip = {
  mounted(el, binding) {
    addTooltipStyles();

    const showHandler = () => showTooltip(el, binding);
    const hideHandler = () => hideTooltip(el);

    el.addEventListener('mouseenter', showHandler);
    el.addEventListener('mouseleave', hideHandler);

    // 保存事件处理器，用于清理
    el._tooltipShowHandler = showHandler;
    el._tooltipHideHandler = hideHandler;

    // 监听窗口变化
    const resizeHandler = () => cleanup(el);
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('scroll', resizeHandler);

    el._tooltipResizeHandler = resizeHandler;
  },

  updated(el, binding) {
    // 更新时重新显示 tooltip
    if (el._tooltipElement) {
      hideTooltip(el);
      setTimeout(() => showTooltip(el, binding), 50);
    }
  },

  unmounted(el) {
    // 清理事件监听器
    if (el._tooltipShowHandler) {
      el.removeEventListener('mouseenter', el._tooltipShowHandler);
    }
    if (el._tooltipHideHandler) {
      el.removeEventListener('mouseleave', el._tooltipHideHandler);
    }
    if (el._tooltipResizeHandler) {
      window.removeEventListener('resize', el._tooltipResizeHandler);
      window.removeEventListener('scroll', el._tooltipResizeHandler);
    }

    cleanup(el);
  },
};

export default vTooltip;
