# 🚀 Cloudflare Pages + D1 数据库部署指南

## 步骤 1：创建 Cloudflare D1 数据库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入左侧菜单的 **Workers & Pages**
3. 点击 **D1** > **Create database**
4. 输入数据库名称（如：`taoweb-db`）
5. 点击 **Create**

## 步骤 2：初始化数据库表

创建数据库后，执行以下 SQL 来初始化表结构：

```sql
-- 在 Cloudflare D1 控制台中执行
-- 文章表
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  location TEXT,
  cover TEXT,
  published BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 留言表
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  avatar TEXT,
  nickname TEXT,
  gender TEXT,
  birthday DATE,
  email TEXT,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
```

## 步骤 3：配置 wrangler.toml

1. 在 Cloudflare D1 数据库页面找到 **Database ID**
2. 更新 `wrangler.toml` 文件中的 `database_id`：
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "taoweb-db"
   database_id = "你的实际数据库ID"
   ```

## 步骤 4：部署到 Cloudflare Pages

### 方式一：通过 Cloudflare Dashboard（推荐）

1. 在 Cloudflare Dashboard 中进入 **Pages**
2. 点击 **Create a project**
3. 选择 **Connect to Git**
4. 授权并选择你的 GitHub 仓库
5. 配置构建设置：
   ```
   Framework preset: Vue
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```
6. 在 **Environment variables** 中添加：
   ```
   NODE_VERSION: 18
   ```
7. 点击 **Save and Deploy**

### 方式二：使用 Wrangler CLI

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署
wrangler pages deploy dist --project-name=taoweb
```

## 步骤 5：绑定 D1 数据库到 Pages

1. 在 Cloudflare Pages 项目设置中
2. 进入 **Functions** 标签
3. 在 **D1 database bindings** 部分：
   - Variable name: `DB`
   - D1 database: 选择你创建的数据库
4. 点击 **Add binding**

## 步骤 6：测试 API

部署完成后，测试以下 API 端点：

- `https://你的域名.pages.dev/api/messages` - 获取留言列表
- `https://你的域名.pages.dev/api/posts` - 获取文章列表

## 🎉 完成！

现在你的网站已经：
- ✅ 部署在 Cloudflare Pages 上
- ✅ 使用 Cloudflare D1 数据库
- ✅ 支持全球 CDN 加速
- ✅ 自动 HTTPS 证书
- ✅ 免费无限流量

## 💡 数据库管理

### 备份数据
```bash
# 使用 Wrangler 导出数据
wrangler d1 export taoweb-db --output backup.sql
```

### 恢复数据
```bash
# 使用 Wrangler 导入数据
wrangler d1 execute taoweb-db --file=backup.sql
```

### 直接查询
在 Cloudflare D1 控制台可以直接执行 SQL 查询。

## 🔧 API 端点说明

### 留言板 API
- `GET /api/messages` - 获取所有留言
- `POST /api/messages` - 添加新留言

### 文章 API
- `GET /api/posts` - 获取文章列表
- `GET /api/posts?id=1` - 获取单篇文章
- `POST /api/posts` - 创建文章
- `PUT /api/posts?id=1` - 更新文章
- `DELETE /api/posts?id=1` - 删除文章

### 数据管理 API
- `GET /api/backup` - 备份所有数据
- `POST /api/restore` - 恢复数据

## 📝 注意事项

1. **免费额度限制**：
   - D1 数据库：5GB 存储，2500万次读取/月
   - Pages：20,000 次函数调用/月
   - 足够个人网站使用

2. **数据迁移**：
   - 如果你有现有的 Vercel 数据，需要手动迁移
   - 可以使用 `/api/backup` 导出数据，然后修改格式后导入

3. **本地开发**：
   ```bash
   # 创建本地 D1 数据库
   wrangler d1 create taoweb-db-dev
   
   # 执行 SQL 初始化
   wrangler d1 execute taoweb-db-dev --file=schema.sql
   
   # 本地预览
   npm run dev
   ```

## 🚀 性能优化

Cloudflare Pages + D1 的优势：
- **全球边缘网络**：自动分发到 200+ 城市
- **零冷启动**：函数调用延迟极低
- **自动扩容**：无需担心流量峰值
- **绿色能源**：100% 可再生能源驱动