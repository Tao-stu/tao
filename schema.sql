-- 文章表
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  location VARCHAR(120),
  cover TEXT,
  tags JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'published',
  published BOOLEAN DEFAULT TRUE,
  is_encrypted BOOLEAN DEFAULT FALSE,
  access_password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 留言表
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  avatar TEXT,
  nickname VARCHAR(100) DEFAULT '游客',
  gender VARCHAR(10),
  birthday DATE,
  email VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_encrypted ON posts(is_encrypted);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);