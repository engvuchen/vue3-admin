import request from '@/utils/request';

/**
 * @route GET /api/user_role/list
 * @req { user_id, role_id, page, limit }
 * @desc 获取用户、权限关联列表。依赖 getQueryObj
 */
export const apiGetUserRoleList = (data) => {
  return request({
    url: '/user_role/list',
    method: 'post',
    data,
  });
};

/**
 * @route POST /api/user_role/modify
 * @req { id, user_id, role_id } 新增：{ user_id, role_id } 编辑： { id, role_id }
 * @desc 新增、修改 用户权限
 */
export const apiUserRoleModify = (data) => {
  return request({
    url: '/user_role/modify',
    method: 'post',
    data,
  });
};

/**
 * @route POST /api/user_role/del
 * @req { id }
 * @desc 删除 用户权限。依赖 getMongoObjectId、UserRole
 */
export const apiUserRoleDel = (data) => {
  return request({
    url: '/user_role/del',
    method: 'post',
    data,
  });
};
