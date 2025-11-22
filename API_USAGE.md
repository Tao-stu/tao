# Home项目API使用说明

## 概述

本项目已根据dazidian项目的写法进行了重构，使用了统一的数据库连接工具和认证系统。

## 环境变量配置

在部署前，请确保设置以下环境变量：

```bash
# 数据库连接（必需）
POSTGRES_URL=your_postgres_connection_string
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_connection_string

# 认证相关（生产环境必需）
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
PASSWORD_SALT=your_password_salt
ADMIN_PASSWORD_HASH=your_hashed_admin_password
```

### 生成密码哈希

在开发环境中，可以通过以下API生成密码哈希：

```bash
GET /api/auth/login?action=hash&password=your_password
```

## API端点

### 认证API

#### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "password": "your_password"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "expiresIn": "24h",
    "role": "admin"
  }
}
```

### 博客API

#### 获取文章列表
```http
GET /api/posts?limit=50&includeDrafts=false
```

#### 获取单篇文章
```http
GET /api/posts?id=1
GET /api/posts?slug=article-slug
```

#### 创建文章（需要认证）
```http
POST /api/posts
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "slug": "article-slug",
  "title": "文章标题",
  "summary": "文章摘要",
  "content": "文章内容",
  "location": "地点",
  "cover": "封面图片URL",
  "tags": ["标签1", "标签2"],
  "status": "published",
  "published": true
}
```

#### 更新文章（需要认证）
```http
PUT /api/posts
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "id": 1,
  "title": "更新后的标题",
  "content": "更新后的内容"
}
```

#### 删除文章（需要认证）
```http
DELETE /api/posts?id=1
Authorization: Bearer your_jwt_token
```

### 留言板API

#### 获取留言列表
```http
GET /api/messages
```

#### 添加留言
```http
POST /api/messages
Content-Type: application/json

{
  "avatar": "头像URL",
  "nickname": "昵称",
  "gender": "性别",
  "birthday": "2000-01-01",
  "email": "email@example.com",
  "content": "留言内容"
}
```

#### 更新留言（需要认证）
```http
PUT /api/messages
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "id": 1,
  "nickname": "更新后的昵称",
  "content": "更新后的留言内容"
}
```

#### 删除留言（需要认证）
```http
DELETE /api/messages?id=1
Authorization: Bearer your_jwt_token
```

## 数据库结构

### posts表
- `id`: 主键
- `slug`: URL友好的唯一标识符
- `title`: 文章标题
- `summary`: 文章摘要
- `content`: 文章内容
- `location`: 地点
- `cover`: 封面图片URL
- `tags`: 标签（JSONB格式）
- `status`: 状态（draft/published）
- `published`: 是否发布
- `created_at`: 创建时间
- `updated_at`: 更新时间

### messages表
- `id`: 主键
- `avatar`: 头像URL
- `nickname`: 昵称
- `gender`: 性别
- `birthday`: 生日
- `email`: 邮箱
- `content`: 留言内容
- `created_at`: 创建时间

## 主要改进

1. **统一的数据库连接工具**：支持Vercel Postgres和Prisma Postgres
2. **JWT认证系统**：安全的token认证机制
3. **增强的博客功能**：支持slug、tags、status等字段
4. **完整的CRUD操作**：支持创建、读取、更新、删除
5. **错误处理**：统一的错误处理和日志记录
6. **安全性**：密码哈希、token验证、CORS配置

## 部署注意事项

1. 确保所有环境变量都已正确设置
2. 在生产环境中必须设置强密码和安全的JWT密钥
3. 数据库连接字符串应使用非池化连接（POSTGRES_URL_NON_POOLING）
4. 建议使用HTTPS协议保护数据传输