# TaoWeb - Tao的个人网站

这是一个使用 Vue 3 + Vite 构建的现代化个人网站，部署在 Vercel 上。

## 🚀 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: Vue Router
- **部署**: Vercel

## 📦 安装依赖

```bash
npm install
```

## 🛠️ 本地开发

```bash
npm run dev
```

开发服务器将在 http://localhost:5173 启动

## 🏗️ 生产构建

```bash
npm run build
```

构建产物将生成在 `dist` 目录

## 👀 预览生产构建

```bash
npm run preview
```

## 🌐 部署到 Vercel

### 方式一：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 方式二：通过 Git 集成

1. 将代码推送到 GitHub
2. 在 Vercel 上导入项目
3. Vercel 会自动检测配置并部署

## 🗄️ 数据库设置

### 步骤 1：在 Vercel 创建 Postgres 数据库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击顶部的 **Storage** 标签
3. 点击 **Create Database**
4. 选择 **Postgres**
5. 选择区域（建议选择离你最近的）
6. 点击 **Create**

### 步骤 2：连接数据库到项目

1. 在 Storage 页面找到刚创建的数据库
2. 点击 **Connect Project**
3. 选择你的项目 `taoweb`
4. 点击 **Connect**

Vercel 会自动添加以下环境变量到你的项目：

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

详细设置指南请参考：[SETUP_DATABASE.md](./SETUP_DATABASE.md)

## 📁 项目结构

```
Tao/
├── img/                    # 图片资源
├── src/
│   ├── components/        # Vue 组件
│   │   ├── NavBar.vue    # 导航栏
│   │   ├── Footer.vue    # 页脚
│   │   └── LoadingScreen.vue  # 加载动画
│   ├── views/            # 页面视图
│   │   ├── Home.vue      # 主页
│   │   ├── About.vue     # 关于
│   │   ├── Blog.vue      # 文章
│   │   └── Guestbook.vue # 留言
│   ├── router/           # 路由配置
│   ├── App.vue           # 根组件
│   ├── main.js           # 入口文件
│   └── style.css         # 全局样式
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json           # Vercel 配置
└── SETUP_DATABASE.md     # 数据库设置指南

```

## ✨ 功能特性

### 1. 主页

- 个人简介和签名
- 技能展示（操作系统、编程语言）
- GitHub 统计卡片
- 左对齐的欢迎区与锚点导航
- 待开发的音乐播放器

### 2. 关于

- 国家/地区信息
- 个人基本信息
- 设备配置详情
- 诗歌展示
- 毛玻璃背景悬浮效果

### 3. 文章

- Markdown 格式文章展示
- 发布时间和地点
- 分页功能
- 支持后台管理（CMS）

### 4. 留言

- 用户可选填写头像、昵称、性别、生日、邮箱
- 必填留言内容
- Cookie 保存用户信息
- LocalStorage 保存留言记录
- 回到顶部按钮

### 5. 博客 CMS

- 在线创建、编辑、删除文章
- 发布/草稿切换、实时统计
- 一键同步到前台博客列表

## 🎨 设计特色

- **毛玻璃效果**: 现代化的毛玻璃背景（backdrop-filter）
- **流畅动画**: 页面加载、页面切换、悬浮交互等动画效果
- **响应式设计**: 完美适配桌面端、平板和移动端
- **渐变配色**: 紫色到粉色的渐变主题
- **交互反馈**: 丰富的鼠标悬浮和点击反馈

## ⚡ 性能优化

- Vite 快速构建和热更新
- 按需加载路由组件
- Tailwind CSS PurgeCSS 优化
- 图片懒加载
- 现代浏览器优化（backdrop-filter、transform）

## 📝 License

Copyright © 2006-present Tao & DaZidian. All Rights Reserved.

---

**若非心胸宽广如海，人生如何能保持风平浪静。**

---

### 技术栈：

- 核心：Vue 3 + Vite + Tailwind CSS，构建现代响应式单页应用。（Core: Vue 3 + Vite + Tailwind CSS for building a modern responsive SPA.）
- 部署：使用 Vercel 部署，享受自动化构建与 CDN 加速。（Deployment: use Vercel for deployment, taking advantage of automated builds and CDN acceleration.）
- 其他：可选集成 TypeScript、Pinia/Vuex 管理状态，使用 Vue Router 实现路由。（Others: optionally integrate TypeScript, Pinia/Vuex for state management, and Vue Router for routing.）

### 安装与部署步骤：

1. 克隆仓库并进入项目目录。（Clone the repository and navigate to the project directory.）
2. 安装依赖：运行 `npm install`。（Install dependencies: run `npm install`.)
3. 本地开发：执行 `npm run dev` 启动开发服务器进行实时调试。（Local development: run `npm run dev` to start the development server for live debugging.）
4. 生产构建：执行 `npm run build` 生成生产环境静态文件。（Production build: run `npm run build` to generate production static files.）
5. 部署：使用 `vercel deploy` 或连接 GitHub 并在 Vercel 上自动部署。（Deploy: use `vercel deploy` or connect the repo to Vercel for automated deployment.）
