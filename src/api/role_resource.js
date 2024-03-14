import request from '@/utils/request';

/**
 * @route POST /api/role_resource/list
 * @req { role_id, resource_id, page, limit }
 * @desc 获取 role、resource 关联列表。依赖 RoleResource / getQueryObj
 */
export const apiGetRoleResourceList = (data) => {
  return request({
    url: '/role_resource/list',
    method: 'post',
    data,
  });
};

/**
 * @route POST /api/role_resource/modify
 * @req { id, role_id, resource_id }
 * @desc 新增、修改 用户权限
 */
export const apiRoleResourceModify = (data) => {
  return request({
    url: '/role_resource/modify',
    method: 'post',
    data,
  });
};

/**
 * @route POST /api/role_resource/del
 * @req { id }
 * @desc 删除 用户权限。依赖 RoleResource / getMongoObjectId
 */
export const apiRoleResourceDel = (data) => {
  return request({
    url: '/role_resource/del',
    method: 'post',
    data,
  });
};
