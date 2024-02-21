
import request from '@/utils/request'

// 测试
export const TestError = () => {
  return request({
    url: '/api/500',
    method: 'get',
  })
}

// 用户列表
export const getUsers = data => {
  return request({
    url: '/api/test/users',
    method: 'post',
    data,
  })
}
