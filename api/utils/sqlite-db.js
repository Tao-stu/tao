// SQLite 数据库连接工具函数
// 作为 PostgreSQL 的替代方案，用于开发环境

import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'blog.sqlite');

// 确保数据目录存在
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export async function getSqliteDatabaseClient() {
  try {
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    // 创建表结构
    await createTables(db);

    // 创建一个模拟的 sql 标签函数
    const sql = (strings, ...values) => {
      let query = strings.join('?');
      return db.all(query, values);
    };

    // 添加辅助函数
    sql.run = (query, values = []) => db.run(query, values);
    sql.get = (query, values = []) => db.get(query, values);
    sql.all = (query, values = []) => db.all(query, values);

    return {
      sql,
      db,
      query: (text, params) => db.all(text, params),
      end: () => db.close()
    };
  } catch (error) {
    console.error('SQLite数据库连接失败:', error);
    throw error;
  }
}

async function createTables(db) {
  // 创建posts表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE,
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT NOT NULL,
      location TEXT,
      cover TEXT,
      tags TEXT DEFAULT '[]',
      status TEXT DEFAULT 'published',
      published BOOLEAN DEFAULT 1,
      is_encrypted BOOLEAN DEFAULT 0,
      access_password TEXT,
      category_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 确保posts表有category_id字段（用于已存在的表）
  try {
    await db.exec(`
      ALTER TABLE posts ADD COLUMN category_id INTEGER
    `);
    console.log('已为posts表添加category_id字段');
  } catch (err) {
    // 字段可能已存在，忽略错误
    if (!err.message.includes('duplicate column name')) {
      console.warn('添加category_id字段时出错:', err.message);
    }
  }

  // 创建categories表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建messages表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read BOOLEAN DEFAULT 0,
      replied BOOLEAN DEFAULT 0
    )
  `);

  // 插入默认分类
  await db.run(`
    INSERT OR IGNORE INTO categories (name, description) VALUES
    ('未分类', '默认分类，用于未指定分类的文章'),
    ('技术', '技术相关文章'),
    ('生活', '生活感悟和随笔'),
    ('学习', '学习笔记和心得')
  `);

  console.log('SQLite数据库表创建完成');
}