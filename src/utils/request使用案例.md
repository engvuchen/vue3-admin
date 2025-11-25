# request.js 各种请求方式使用案例

## 1. GET 请求

### 基本 GET 请求

```javascript
import request from '@/utils/request';

// 方式1：使用 params
const result = await request({
  method: 'GET',
  url: '/user/list',
  params: {
    page: 1,
    pageSize: 10,
    keyword: 'test'
  }
});
// 实际请求：GET /api/user/list?page=1&pageSize=10&keyword=test

// 方式2：使用 data（会被自动转换为 params）
const result2 = await request({
  method: 'GET',
  url: '/user/list',
  data: {
    page: 1,
    pageSize: 10
  }
});
// 实际请求：GET /api/user/list?page=1&pageSize=10
```

### GET 请求带缓存

```javascript
// 缓存 5 分钟（300000 毫秒）
const result = await request({
  method: 'GET',
  url: '/user/info',
  params: { id: 123 },
  cacheTime: 300000  // 5 分钟缓存
});

// 第二次相同请求会直接返回缓存，不会发起网络请求
const result2 = await request({
  method: 'GET',
  url: '/user/info',
  params: { id: 123 },
  cacheTime: 300000
});
```

### GET 请求带数组参数

```javascript
const result = await request({
  method: 'GET',
  url: '/user/list',
  params: {
    ids: [1, 2, 3],
    tags: ['tag1', 'tag2']
  }
});
// 实际请求：GET /api/user/list?ids=1&ids=2&ids=3&tags=tag1&tags=tag2
```

---

## 2. POST 请求

### 基本 POST 请求

```javascript
// 方式1：使用 data（请求体）
const result = await request({
  method: 'POST',
  url: '/user/create',
  data: {
    name: '张三',
    email: 'zhangsan@example.com',
    age: 25
  }
});
// 实际请求：POST /api/user/create
// 请求体：{ name: '张三', email: 'zhangsan@example.com', age: 25 }
// Content-Type: application/json（axios 自动设置）

// 方式2：data 和 params 同时使用
const result2 = await request({
  method: 'POST',
  url: '/user/create',
  data: {
    name: '张三',
    email: 'zhangsan@example.com'
  },
  params: {
    source: 'web',
    version: '1.0'
  }
});
// 实际请求：POST /api/user/create?source=web&version=1.0
// 请求体：{ name: '张三', email: 'zhangsan@example.com' }
```

### POST 请求（仅 params，无 data）

```javascript
const result = await request({
  method: 'POST',
  url: '/user/action',
  params: {
    action: 'activate',
    userId: 123
  }
});
// 实际请求：POST /api/user/action?action=activate&userId=123
// 请求体：空
```

---

## 3. PUT 请求

```javascript
// 更新用户信息
const result = await request({
  method: 'PUT',
  url: '/user/123',
  data: {
    name: '李四',
    email: 'lisi@example.com'
  }
});
// 实际请求：PUT /api/user/123
// 请求体：{ name: '李四', email: 'lisi@example.com' }

// PUT 带 URL 参数
const result2 = await request({
  method: 'PUT',
  url: '/user/123',
  data: { name: '李四' },
  params: { force: true }
});
// 实际请求：PUT /api/user/123?force=true
// 请求体：{ name: '李四' }
```

---

## 4. DELETE 请求

```javascript
// 删除用户
const result = await request({
  method: 'DELETE',
  url: '/user/123'
});
// 实际请求：DELETE /api/user/123

// DELETE 带参数
const result2 = await request({
  method: 'DELETE',
  url: '/user/123',
  params: {
    soft: true,  // 软删除
    reason: '违规'
  }
});
// 实际请求：DELETE /api/user/123?soft=true&reason=违规
```

---

## 5. PATCH 请求

```javascript
// 部分更新用户信息
const result = await request({
  method: 'PATCH',
  url: '/user/123',
  data: {
    email: 'newemail@example.com'  // 只更新邮箱
  }
});
// 实际请求：PATCH /api/user/123
// 请求体：{ email: 'newemail@example.com' }
```

---

## 6. 文件上传（FormData）

```javascript
// 上传单个文件
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('file', file);

const result = await request({
  method: 'POST',
  url: '/upload',
  data: formData  // FormData 放在 data 中
});
// 实际请求：POST /api/upload
// Content-Type: multipart/form-data; boundary=...（axios 自动设置）

// 上传多个文件
const formData2 = new FormData();
formData2.append('avatar', file1);
formData2.append('cover', file2);
formData2.append('description', '图片描述');  // 普通字段也可以放在 FormData 中

const result2 = await request({
  method: 'POST',
  url: '/upload/multiple',
  data: formData2
});
```

---

## 7. 特殊配置

### 静默请求（不显示错误提示）

```javascript
// 静默请求，即使出错也不会弹出错误提示
const result = await request({
  method: 'GET',
  url: '/user/list',
  params: { page: 1 },
  silent: true  // 静默模式
});

// 手动处理错误
if (result.code !== 0) {
  // 自定义错误处理
  console.log('请求失败', result);
}
```

### 不需要 Token 的请求

```javascript
// 登录接口不需要 Token
const result = await request({
  method: 'POST',
  url: '/user/login',
  data: {
    username: 'admin',
    password: '123456'
  },
  withoutToken: true  // 不自动添加 Authorization 头
});
```

### 自定义超时时间

```javascript
const result = await request({
  method: 'POST',
  url: '/user/upload',
  data: largeData,
  timeout: 30000  // 30 秒超时（覆盖默认的 5000ms）
});
```

### 自定义请求头

```javascript
const result = await request({
  method: 'POST',
  url: '/user/create',
  data: { name: 'test' },
  headers: {
    'X-Custom-Header': 'custom-value',
    'Content-Type': 'application/json'  // 可以覆盖默认的 Content-Type
  }
});
```

---

## 8. 错误处理

```javascript
// 方式1：使用 try-catch
try {
  const result = await request({
    method: 'GET',
    url: '/user/list'
  });
  
  if (result.code === 0) {
    console.log('成功', result.data);
  } else {
    // 业务错误（已自动提示，这里可以额外处理）
    console.log('业务错误', result);
  }
} catch (error) {
  // 网络错误（已自动提示，这里可以额外处理）
  console.log('网络错误', error);
}

// 方式2：使用 Promise
request({
  method: 'GET',
  url: '/user/list'
}).then(result => {
  if (result.code === 0) {
    console.log('成功', result.data);
  }
}).catch(error => {
  console.log('错误', error);
});
```

---

## 9. 实际业务场景示例

### 用户列表查询（带分页和缓存）

```javascript
const getUserList = async (page = 1, pageSize = 10, keyword = '') => {
  return await request({
    method: 'GET',
    url: '/user/list',
    params: { page, pageSize, keyword },
    cacheTime: 60000  // 1 分钟缓存
  });
};
```

### 创建用户

```javascript
const createUser = async (userData) => {
  return await request({
    method: 'POST',
    url: '/user/create',
    data: userData
  });
};
```

### 更新用户

```javascript
const updateUser = async (id, userData) => {
  return await request({
    method: 'PUT',
    url: `/user/${id}`,
    data: userData
  });
};
```

### 删除用户

```javascript
const deleteUser = async (id) => {
  return await request({
    method: 'DELETE',
    url: `/user/${id}`,
    params: { soft: true }  // 软删除参数
  });
};
```

### 上传头像

```javascript
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  return await request({
    method: 'POST',
    url: '/user/avatar',
    data: formData
  });
};
```

---

## 重要提示

1. **GET 请求**：`data` 会被自动转换为 `params`
2. **非 GET 请求**：`params` 会被拼接到 URL，`data` 放在请求体
3. **返回值**：直接返回 `response.data`，不是完整的 response 对象
4. **错误处理**：自动提示错误（除非 `silent: true`）
5. **Token**：自动注入 Authorization 头（除非 `withoutToken: true`）
6. **缓存**：仅 GET 请求支持，通过 `cacheTime` 配置
7. **FormData**：放在 `data` 中，不要放在 `params` 中


