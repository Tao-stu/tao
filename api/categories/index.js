// Vercel Serverless Function - 分类 API
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
    console.log('分类API认证检查开始...');
    const authResult = authenticateRequest(req);
    console.log('分类API认证结果:', authResult);
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
    if (pool) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          slug VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // 插入默认分类
      await pool.query(`
        INSERT INTO categories (name, slug, description) VALUES
        ('未分类', 'uncategorized', '默认分类，用于未指定分类的文章'),
        ('技术', 'tech', '技术相关文章'),
        ('生活', 'life', '生活感悟和随笔'),
        ('学习', 'learning', '学习笔记和心得')
        ON CONFLICT (slug) DO NOTHING
      `);
    } else {
      await sql`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          slug VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // 插入默认分类
      await sql`
        INSERT INTO categories (name, slug, description) VALUES
        ('未分类', 'uncategorized', '默认分类，用于未指定分类的文章'),
        ('技术', 'tech', '技术相关文章'),
        ('生活', 'life', '生活感悟和随笔'),
        ('学习', 'learning', '学习笔记和心得')
        ON CONFLICT (slug) DO NOTHING
      `;
    }

    // GET - 获取所有分类
    if (req.method === 'GET') {
      console.log('[API] GET /categories 请求');
      
      let result;
      if (pool) {
        result = await pool.query(`
          SELECT c.*, COUNT(p.id) as post_count 
          FROM categories c 
          LEFT JOIN posts p ON c.id = p.category_id AND p.published = TRUE AND p.status = 'published'
          GROUP BY c.id, c.name, c.slug, c.description, c.created_at
          ORDER BY c.created_at ASC
        `);
      } else {
        result = await sql`
          SELECT c.*, COUNT(p.id) as post_count 
          FROM categories c 
          LEFT JOIN posts p ON c.id = p.category_id AND p.published = TRUE AND p.status = 'published'
          GROUP BY c.id, c.name, c.slug, c.description, c.created_at
          ORDER BY c.created_at ASC
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
      const { name, slug, description } = req.body;
      
      console.log('[API] POST /categories 请求', {
        name,
        slug,
        description
      });

      // 验证必填字段
      if (!name || !slug) {
        return res.status(400).json({
          success: false,
          error: '分类名称和别名不能为空'
        });
      }

      // 检查slug是否已存在
      if (pool) {
        const existingResult = await pool.query(
          'SELECT id FROM categories WHERE slug = $1 OR name = $2 LIMIT 1',
          [slug, name]
        );
        const existing = existingResult.rows;

        if (existing && existing.length > 0) {
          return res.status(409).json({
            success: false,
            error: '该分类名称或别名已存在'
          });
        }

        const insertResult = await pool.query(
          'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
          [name, slug, description || '']
        );
        const rows = insertResult.rows;
        
        return res.status(201).json({
          success: true,
          data: rows[0]
        });
      } else {
        // 使用 Vercel Postgres
        const existingResult = await sql`
          SELECT id FROM categories WHERE slug = ${slug} OR name = ${name} LIMIT 1
        `;
        const existing = existingResult.rows || existingResult;

        if (existing && existing.length > 0) {
          return res.status(409).json({
            success: false,
            error: '该分类名称或别名已存在'
          });
        }

        const result = await sql`
          INSERT INTO categories (name, slug, description) 
          VALUES (${name}, ${slug}, ${description || ''}) 
          RETURNING *
        `;
        const rows = result.rows || result;
        
        return res.status(201).json({
          success: true,
          data: rows[0]
        });
      }
    }

    // PUT - 更新分类
    if (req.method === 'PUT') {
      const { id, name, slug, description } = req.body;
      
      console.log('[API] PUT /categories 请求', {
        id,
        name,
        slug,
        description
      });

      if (!id) {
        return res.status(400).json({
          success: false,
          error: '分类ID不能为空'
        });
      }

      // 检查名称或slug是否已被其他分类使用
      if (pool) {
        const existingResult = await pool.query(
          'SELECT id FROM categories WHERE (slug = $1 OR name = $2) AND id != $3 LIMIT 1',
          [slug, name, id]
        );
        const existing = existingResult.rows;

        if (existing && existing.length > 0) {
          return res.status(409).json({
            success: false,
            error: '该分类名称或别名已被其他分类使用'
          });
        }

        const updateResult = await pool.query(
          'UPDATE categories SET name = $1, slug = $2, description = $3 WHERE id = $4 RETURNING *',
          [name, slug, description || '', id]
        );
        const rows = updateResult.rows;

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
      } else {
        // 使用 Vercel Postgres
        const existingResult = await sql`
          SELECT id FROM categories WHERE (slug = ${slug} OR name = ${name}) AND id != ${id} LIMIT 1
        `;
        const existing = existingResult.rows || existingResult;

        if (existing && existing.length > 0) {
          return res.status(409).json({
            success: false,
            error: '该分类名称或别名已被其他分类使用'
          });
        }

        const result = await sql`
          UPDATE categories 
          SET name = ${name}, slug = ${slug}, description = ${description || ''} 
          WHERE id = ${id}
          RETURNING *
        `;
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

      // 检查是否有文章使用此分类
      if (pool) {
        const postsResult = await pool.query(
          'SELECT COUNT(*) as count FROM posts WHERE category_id = $1',
          [id]
        );
        const postCount = parseInt(postsResult.rows[0].count);

        if (postCount > 0) {
          return res.status(400).json({
            success: false,
            error: `无法删除分类，还有 ${postCount} 篇文章使用此分类。请先将这些文章移到其他分类。`
          });
        }

        const deleteResult = await pool.query(
          'DELETE FROM categories WHERE id = $1',
          [id]
        );
        const rowCount = deleteResult.rowCount;

        if (rowCount === 0) {
          return res.status(404).json({
            success: false,
            error: '分类不存在'
          });
        }

        return res.status(200).json({
          success: true,
          message: '分类已删除'
        });
      } else {
        // 使用 Vercel Postgres
        const postsResult = await sql`
          SELECT COUNT(*) as count FROM posts WHERE category_id = ${id}
        `;
        const rows = postsResult.rows || postsResult;
        const postCount = parseInt(rows[0].count);

        if (postCount > 0) {
          return res.status(400).json({
            success: false,
            error: `无法删除分类，还有 ${postCount} 篇文章使用此分类。请先将这些文章移到其他分类。`
          });
        }

        const result = await sql`
          DELETE FROM categories WHERE id = ${id}
        `;
        const rowCount = result.rowCount || (result.rows ? result.rows.length : 0);

        if (rowCount === 0) {
          return res.status(404).json({
            success: false,
            error: '分类不存在'
          });
        }

        return res.status(200).json({
          success: true,
          message: '分类已删除'
        });
      }
    }

    // 不支持的方法
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Categories API Error:', error);
    console.error('Error stack:', error.stack);
    
    let errorMessage = '服务器错误，请稍后再试';
    if (error.message && error.message.includes('duplicate key')) {
      errorMessage = '数据已存在，请检查唯一性约束';
    } else if (error.message && error.message.includes('violates foreign key')) {
      errorMessage = '数据关联错误，请检查关联数据';
    } else if (error.message && error.message.includes('syntax error')) {
      errorMessage = '数据库查询语法错误';
    }
    
    return res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      errorCode: error.code || 'UNKNOWN'
    });
  }
}