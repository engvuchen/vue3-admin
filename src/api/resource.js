import request from '@/utils/request';

// 获取菜单
export const GetMenus = (params) => {
  return request({
    url: '/api/menus',
    method: 'get',
    params,
  });
};

/**
 * @route GET /api/resource/list
 * @req { name, cgi, access, page, limit } 实际 name 可以用，其他字段不知道是否可以
 * @desc 获取资源列表
 */
export const apiGetResourceList = (data) => {
  return request({
    url: '/resource/list',
    method: 'get',
    data,
  });
};

/**
 * @route GET /api/resource/self
 * @req { name, cgi, access, page, limit } 实际 name 可以用，其他字段不知道是否可以
 * @desc 获取当前用户的资源列表。现获取角色、通过角色再获取资源。⬜️ 需要补充路由
 */
export const apiGetSelfResource = (data) => {
  return request({
    url: '/resource/self',
    method: 'get',
    data,
  });
};

/**
 * @route POST /api/resource/modify
 * @req { id, name, access, cgi } 新增 - { name, access, cgi } 编辑 - { id, access, cgi }
 * @desc 新增、修改 资源
 */
export const apiResourceModify = () => {
  return request({
    url: '/resource/modify',
    method: 'get',
  });
};

/**
 * @route POST /api/resource/del
 * @req { id }
 * @desc 删除 资源
 */
export const apiResourceDel = () => {
  return request({
    url: '/resource/del',
    method: 'post',
  });
};
