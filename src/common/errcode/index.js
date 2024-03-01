import resource from './resource';
import roleResource from './role_resource';
import role from './role';
import user from './user';
import userRole from './user_role';

const name2code = {
  TOKEN_ERR: 1001, // token 缺少、过期、不能找到匹配用户
  PERMISSIONS_NOT_MATCH: 1002, // req 的 id 和 token id 不匹配
  NOT_ADMIN: 1003, // 非管理员
  DATA_NOT_EXIST: 1004, // id 在表中无记录
  REPEAT: 1005, // 数据重复
  MISS_FIELD: 1006, // 缺少字段，业务定制 msg
  ID_ERR: 1008, // ID格式错误
};
const code2Zh = {
  1001: 'token 校验出错', // token 缺少、过期、不能找到匹配用户
  1002: '操作越权', // req 的 id 和 token id 不匹配
  1003: '非管理员',
  1004: '数据不存在', // id 在表中无记录
  1005: '数据重复 ',
  1006: '缺少字段，业务定制',
  1008: 'ID格式错误',
};
const map = {
  ...name2code,
  ...code2Zh,
  resource,
  roleResource,
  role,
  user,
  userRole,
};

export default map;
