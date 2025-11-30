// Vercel Serverless Function - 分类管理 API
import { authenticateRequest } from '../utils/auth.js';

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 对于需要认证的操作（POST, PUT, DELETE），验证 token
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const authResult = authenticateRequest(req);
    if (!authResult) {
      return res.status(401).json({
        success: false,
        error: '未授权，请先登录',
      });
    }
  }

  try {
    // 使用统一的数据库连接工具
    const { getDatabaseClient } = await import('../utils/db.js');
    const db = await getDatabaseClient();
    const sql = db.sql;
    const pool = db.pool;

    // 初始化分类表
    const createCategoriesTable = async () => {
      if (pool) {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } else {
        await sql`
          CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
      }
    };

    // 初始化文章分类关联表
    const createPostCategoriesTable = async () => {
      if (pool) {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS post_categories (
            id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
            category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(post_id, category_id)
          )
        `);
      } else {
        await sql`
          CREATE TABLE IF NOT EXISTS post_categories (
            id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
            category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(post_id, category_id)
          )
        `;
      }
    };

    // 创建表
    await createCategoriesTable();
    await createPostCategoriesTable();

    // 插入默认分类"未分类"
    const insertDefaultCategory = async () => {
      try {
        if (pool) {
          await pool.query(`
            INSERT INTO categories (name, description) 
            VALUES ('未分类', '默认分类，未指定分类的文章将归入此类')
            ON CONFLICT (name) DO NOTHING
          `);
        } else {
          await sql`
            INSERT INTO categories (name, description) 
            VALUES ('未分类', '默认分类，未指定分类的文章将归入此类')
            ON CONFLICT (name) DO NOTHING
          `;
        }
      } catch (error) {
        // 忽略插入冲突错误
        if (!error.message.includes('duplicate')) {
          console.warn('插入默认分类时出错:', error.message);
        }
      }
    };
    await insertDefaultCategory();

    // GET - 获取所有分类
    if (req.method === 'GET') {
      let result;
      if (pool) {
        result = await pool.query(`
          SELECT * FROM categories 
          ORDER BY id ASC
        `);
      } else {
        result = await sql`
          SELECT * FROM categories 
          ORDER BY id ASC
        `;
      }
      const rows = result.rows || result;
      
      return res.status(200).json({
        success: true,
        data: rows
      });
    }

    // POST - 创建新分类
    if (req.method === 'POST') {
      const { name, description } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: '分类名称不能为空'
        });
      }

      let result;
      if (pool) {
        result = await pool.query(`
          INSERT INTO categories (name, description) 
          VALUES ($1, $2)
          RETURNING *
        `, [name.trim(), description || '']);
      } else {
        result = await sql`
          INSERT INTO categories (name, description) 
          VALUES (${name.trim()}, ${description || ''})
          RETURNING *
        `;
      }
      const rows = result.rows || result;

      return res.status(201).json({
        success: true,
        data: rows[0]
      });
    }

    // PUT - 更新分类
    if (req.method === 'PUT') {
      const { id, name, description } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: '分类ID不能为空'
        });
      }

      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: '分类名称不能为空'
        });
      }

      let result;
      if (pool) {
        result = await pool.query(`
          UPDATE categories 
          SET name = $1, description = $2
          WHERE id = $3
          RETURNING *
        `, [name.trim(), description || '', id]);
      } else {
        result = await sql`
          UPDATE categories 
          SET name = ${name.trim()}, description = ${description || ''}
          WHERE id = ${id}
          RETURNING *
        `;
      }
      const rows = result.rows || result;

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: '分类不存在'
        });
      }

      return res.status(200).json({
        success: true,
        data: rows[0]
      });
    }

    // DELETE - 删除分类
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: '分类ID不能为空'
        });
      }

      // 检查是否是"未分类"默认分类
      let categoryResult;
      if (pool) {
        categoryResult = await pool.query(`
          SELECT name FROM categories WHERE id = $1
        `, [id]);
      } else {
        categoryResult = await sql`
          SELECT name FROM categories WHERE id = ${id}
        `;
      }
      const categoryRows = categoryResult.rows || categoryResult;

      if (categoryRows.length > 0 && categoryRows[0].name === '未分类') {
        return res.status(400).json({
          success: false,
          error: '不能删除默认分类"未分类"'
        });
      }

      // 删除分类前，将该分类下的文章移到"未分类"
      const uncategorizedResult = await sql`
        SELECT id FROM categories WHERE name = '未分类' LIMIT 1
      `;
      const uncategorizedRows = uncategorizedResult.rows || uncategorizedResult;
      
      if (uncategorizedRows.length > 0) {
        const uncategorizedId = uncategorizedRows[0].id;
        
        if (pool) {
          await pool.query(`
            UPDATE post_categories 
            SET category_id = $1 
            WHERE category_id = $2
          `, [uncategorizedId, id]);
        } else {
          await sql`
            UPDATE post_categories 
            SET category_id = ${uncategorizedId} 
            WHERE category_id = ${id}
          `;
        }
      }

      // 删除分类
      let result;
      if (pool) {
        result = await pool.query(`
          DELETE FROM categories WHERE id = $1
        `, [id]);
      } else {
        result = await sql`
          DELETE FROM categories WHERE id = ${id}
        `;
      }
      const rowCount = result.rowCount || (result.rows ? result.rows.length : 0);

      if (rowCount === 0) {
        return res.status(404).json({
          success: false,
          error: '分类不存在'
        });
      }

      return res.status(200).json({
        success: true,
        message: '分类已删除，相关文章已移至"未分类"'
      });
    }

    // 不支持的方法
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Categories API Error:', error);
    
    let errorMessage = '服务器错误，请稍后再试';
    if (error.message && error.message.includes('duplicate key')) {
      errorMessage = '分类名称已存在';
    }
    
    return res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}