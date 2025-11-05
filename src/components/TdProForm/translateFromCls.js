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
 * 1. 展开部分 attributes 属性，其他是 componentProps；
 * 2. decoration 转为分别 4 方向的 topDecorator...
 */
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

  // 规则应该是分开的 todo
  // const rules = (item.validity || []).map((r) => ({
  //   required: r.required,
  //   message: r.message,
  //   min: r.min,
  //   max: r.max,
  //   pattern: r.pattern,
  //   validator: r.validator,
  // }));

  // 装饰器映射
  const decors = normalizeDecorationsFromCLS(decoration);

  return {
    component,
    name,
    label,
    value,
    hide: Boolean(hide),
    disabled: Boolean(disabled),
    help,
    placeholder,
    class: className,
    style,
    formItemProps,
    componentProps,
    rules,
    items,
    linkage,
    ...decors,
  };
};
