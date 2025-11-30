-- 创建数据库表结构
-- TaoWeb 数据库初始化脚本

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 不再插入默认分类，用户需要手动创建

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
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    author VARCHAR(100) DEFAULT 'Tao',
    reading_time INTEGER DEFAULT 5
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_posts_title_search ON posts USING GIN(to_tsvector('chinese', title));
CREATE INDEX IF NOT EXISTS idx_posts_content_search ON posts USING GIN(to_tsvector('chinese', content));
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

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

-- 不再插入示例数据，用户需要手动创建

-- 更新序列（确保自增ID正常工作）
SELECT setval('posts_id_seq', (SELECT MAX(id) FROM posts));
SELECT setval('messages_id_seq', (SELECT MAX(id) FROM messages));

-- 显示创建的表
\dt

-- 显示示例数据
SELECT * FROM posts LIMIT 3;