-- 创建数据库表结构
-- TaoWeb 数据库初始化脚本

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 文章表
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    password_protected BOOLEAN DEFAULT false,
    password VARCHAR(255),
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    author VARCHAR(100) DEFAULT 'Tao',
    category VARCHAR(100) DEFAULT '技术',
    reading_time INTEGER DEFAULT 5
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_posts_title_search ON posts USING GIN(to_tsvector('chinese', title));
CREATE INDEX IF NOT EXISTS idx_posts_content_search ON posts USING GIN(to_tsvector('chinese', content));

-- 消息表（用于联系表单）
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN DEFAULT false,
    replied BOOLEAN DEFAULT false
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);

-- 更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为posts表创建更新时间戳触发器
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 插入一些示例数据
INSERT INTO posts (title, slug, content, excerpt, published, tags, category) VALUES
('欢迎来到Tao的博客', 'welcome-to-tao-blog', 
'# 欢迎来到我的个人博客

这是我的个人技术博客，在这里我会分享一些技术心得、项目经验和学习笔记。

## 关于我

我是一名热爱技术的开发者，主要关注前端开发和用户体验设计。

## 技术栈

- Vue.js 3
- Vite
- Tailwind CSS
- Node.js
- PostgreSQL

## 联系方式

如果你有任何问题或建议，欢迎通过联系表单与我交流。

', '欢迎来到Tao的个人技术博客，分享前端开发、用户体验和技术心得。', true, '["博客", "介绍", "技术"]', '介绍'),



('Vue 3组合式API入门', 'vue3-composition-api-tutorial',
'# Vue 3组合式API入门教程

Vue 3引入了组合式API，提供了更灵活的代码组织方式。

## 基本语法

```javascript
import { ref, reactive, computed, onMounted } from ''vue''

export default {
  setup() {
    const count = ref(0)
    const state = reactive({ name: ''Vue'' })
    
    const doubled = computed(() => count.value * 2)
    
    onMounted(() => {
      console.log(''组件已挂载'')
    })
    
    return {
      count,
      state,
      doubled
    }
  }
}
```

## 优势

- 更好的逻辑复用
- 更清晰的代码组织
- 更好的TypeScript支持

', 'Vue 3组合式API的入门教程，包含基本语法和使用示例。', true, '["Vue.js", "前端", "JavaScript", "教程"]', '前端开发');

-- 更新序列（确保自增ID正常工作）
SELECT setval('posts_id_seq', (SELECT MAX(id) FROM posts));
SELECT setval('messages_id_seq', (SELECT MAX(id) FROM messages));

-- 显示创建的表
\dt

-- 显示示例数据
SELECT * FROM posts LIMIT 3;