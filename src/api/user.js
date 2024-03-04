import request from '@/utils/request';

/**
 * @route GET /api/user/list
 * @desc 获取所有用户信息
 * @req { id, username, page, limit }
 * @res [{ id, username, avatar }]
 */
export const apiGetUserList = (data) => {
  return request({
    url: '/user/list',
    method: 'get',
    params: data,
  });
};

/**
 * @route GET /api/user/info
 * @desc 获取自己的用户信息
 * @req {}
 * @res { id, username }
 */
export const apiGetUserInfo = (data) => {
  return request({
    url: '/user/info',
    method: 'get',
    params: data,
  });
};

/**
 * @route POST /api/user/upd
 * @req { username, password, avatar }
 * @desc 修改用户信息（username、password、avatar，任一存在即可）。需 token
 */
export const apiUserUpd = (data) => {
  return request({
    url: '/user/upd',
    method: 'post',
    data,
  });
};

/**
 * @route POST api/user/register
 * @req { username, password }
 * @desc 用户注册
 * @access public
 */
export const apiUserRegister = (data) => {
  return request({
    url: '/user/register',
    method: 'post',
    data,
  });
};

/**
 * @route POST api/user/login
 * @req { username, password }
 * @desc 登录接口地址，返回token
 * @access public
 * 用户登录校验成功，返回 token（token存储了用户信息）
 */
export const apiUserLogin = (data) => {
  return request({
    url: '/user/login',
    method: 'post',
    data,
  });
};

/**
 * @route POST /api/user/del
 * @req { id }
 * @desc 删除用户
 */
export const apiUserDel = (data) => {
  return request({
    url: '/user/del',
    method: 'post',
    data,
  });
};
