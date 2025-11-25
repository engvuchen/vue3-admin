# Axios Content-Type 自动设置规则

axios 会根据 `data` 的类型自动设置 `Content-Type`：

| data 类型 | axios 自动设置的 Content-Type |
|-----------|------------------------------|
| 普通对象 `{}` | `application/json` |
| `FormData` | `multipart/form-data; boundary=...` |
| `URLSearchParams` | `application/x-www-form-urlencoded` |
| `String` | `text/plain` |
| `ArrayBuffer` / `Blob` | 根据类型自动设置 |

## 注意事项

- **GET 请求**：通常不设置 `Content-Type`，因为 GET 请求没有请求体，参数通过 URL 查询字符串（`params`）传递
- 上述规则主要适用于有请求体的请求方法（POST、PUT、PATCH、DELETE 等）

