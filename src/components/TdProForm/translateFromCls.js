// ========== CLS 规范映射 ==========
/**
 * @param decorations [{ placement, component,, attributes ... }]
 * @returns map { topDecorator: [ { type, value, props, linkage } ] }
 */
export const normalizeDecorationsFromCLS = (decorations) => {
  if (!decorations) return {};

  const map = { topDecorator: [], leftDecorator: [], rightDecorator: [], bottomDecorator: [] };
  decorations.forEach((dec) => {
    const component = dec.component;
    const attrs = dec.attributes;
    const placement = attrs.placement || 'bottom';

    // 文本/HTML 类型装饰器
    const isText = component === 'text';
    const isHtml = component === 'html';

    const decorator =
      isText || isHtml
        ? {
            type: isHtml ? 'html' : 'text',
            value: dec.value,
            props: { ...attrs },
            linkage: dec.linkage,
          }
        : { type: component, props: { ...attrs }, linkage: dec.linkage };

    if (placement === 'top') map.topDecorator.push(decorator);
    else if (placement === 'left') map.leftDecorator.push(decorator);
    else if (placement === 'right') map.rightDecorator.push(decorator);
    else if (placement === 'bottom') map.bottomDecorator.push(decorator);
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

  /**
   * 1. 我改造了这里的出口参数，注意需要你改造 td-pro-form fieldState 的结构
   *    1. 触控顶层属性现在只有这些：component、name、value、hide、formItemProps、componentProps、rules、items、linkage
   *
   * 2. attributes class、style 现在是给到 t-form-item，而不是其中的 component
   */

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
