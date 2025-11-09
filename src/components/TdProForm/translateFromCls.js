// ========== CLS 规范映射 ==========
/**
 * @param decorations [{ placement, component, attributes ... }]
 * @returns map { topDecorator: [ { type, value, props, linkage } ] }
 */
export const normalizeDecorationsFromCLS = (decorations) => {
  if (!decorations) return {};

  const map = { topDecorator: [], leftDecorator: [], rightDecorator: [], bottomDecorator: [] };
  decorations.forEach((deco) => {
    let {
      component = 'html',
      name = '',
      value,
      placement = 'bottom',
      attributes: { placeholder = '', hide = false, disabled = false, class: className = '', style = '' } = {},
      linkage = [],
    } = deco;

    let props = {
      placeholder,
      disabled,
      class: className,
      style,
    };

    const config = {
      component,
      name,
      value,
      hide: Boolean(hide),
      props, // { class、style, placeholder,, disabled }
      linkage,
    };

    map[`${placement}Decorator`].push(config);

    // if (placement === 'top') map.topDecorator.push(config);
    // else if (placement === 'left') map.leftDecorator.push(config);
    // else if (placement === 'right') map.rightDecorator.push(config);
    // else if (placement === 'bottom') map.bottomDecorator.push(config);
  });

  return map;
};

/**
 * 扁平化 CLS 配置 { name, label, component, attributes, validity, items, decoration, linkage, decoration: [ { placement: 'top' } ] }
 * 1. 展开部分 attributes 属性( hide、disabled、placeholder、help、class、style )，其他是 componentProps；
 * 2. decoration 转为分别 4 方向的 topDecorator...
 */

// 返回有默认值处理
export const clsItemToField = (item) => {
  let {
    name = '',
    label = '',
    component = 'html',
    value,
    attributes: {
      placeholder = '',
      hide = false,
      disabled = false,
      help = '',
      class: className = '',
      style = '',
      formItemProps = {},
      ...componentProps
    } = {},
    validity: rules,
    items,
    decoration,
    linkage,
  } = item;

  // 装饰器映射
  const decors = normalizeDecorationsFromCLS(decoration);

  formItemProps = {
    label,
    help,
    class: className,
    style,
    ...formItemProps,
  };
  componentProps = {
    disabled,
    placeholder,
    ...componentProps,
  };
  return {
    component,
    name,
    value,
    hide: Boolean(hide),
    rules,
    items,
    linkage,
    formItemProps,
    componentProps,
    ...decors,
  };
};
