export function flattenTree(tree = {}, itemsKey = 'children') {
  if (!tree[itemsKey].length) return [];

  let result = [];
  let list = tree[itemsKey];
  while (list.length) {
    let item = list.pop();

    if (item?.[itemsKey]?.length) {
      list.push(...item[itemsKey]);
      continue;
    }
    result.push(item);
  }

  return result;
}
