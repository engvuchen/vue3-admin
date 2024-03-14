import request from '@/utils/request';

/**
 * @route GET /api/role/list
 * @req { name }
 * @desc 获取权限列表
 */
export const apiGetRoleList = (data) => {
  return request({
    url: '/role/list',
    method: 'get',
    params: data,
  });
};

/**
 * @route POST /api/role/modify
 * @req { id, name }
 * @desc 新增、修改 权限
 */
export const apiRoleModify = (data) => {
  return request({
    url: '/role/modify',
    method: 'post',
    data,
  });
};

/**
 * @route POST /api/role/del
 * @req { id }
 * @desc 删除 用户权限
 */
export const apiRoleDel = (data) => {
  return request({
    url: '/role/del',
    method: 'post',
    data,
  });
};
