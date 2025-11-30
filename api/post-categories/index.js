// Vercel Serverless Function - 文章分类关联 API
import { authenticateRequest } from '../utils/auth.js';

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 对于需要认证的操作（POST, DELETE），验证 token
  if (['POST', 'DELETE'].includes(req.method)) {
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

    // GET - 获取文章的分类或分类下的文章
    if (req.method === 'GET') {
      const { postId, categoryId } = req.query;

      if (postId) {
        // 获取指定文章的所有分类
        let result;
        if (pool) {
          result = await pool.query(`
            SELECT c.* FROM categories c
            INNER JOIN post_categories pc ON c.id = pc.category_id
            WHERE pc.post_id = $1
            ORDER BY c.id ASC
          `, [postId]);
        } else {
          result = await sql`
            SELECT c.* FROM categories c
            INNER JOIN post_categories pc ON c.id = pc.category_id
            WHERE pc.post_id = ${postId}
            ORDER BY c.id ASC
          `;
        }
        const rows = result.rows || result;
        
        return res.status(200).json({
          success: true,
          data: rows
        });
      } else if (categoryId) {
        // 获取指定分类下的所有文章
        let result;
        if (pool) {
          result = await pool.query(`
            SELECT p.* FROM posts p
            INNER JOIN post_categories pc ON p.id = pc.post_id
            WHERE pc.category_id = $1 AND p.published = TRUE AND p.status = 'published'
            ORDER BY p.updated_at DESC
          `, [categoryId]);
        } else {
          result = await sql`
            SELECT p.* FROM posts p
            INNER JOIN post_categories pc ON p.id = pc.post_id
            WHERE pc.category_id = ${categoryId} AND p.published = TRUE AND p.status = 'published'
            ORDER BY p.updated_at DESC
          `;
        }
        const rows = result.rows || result;
        
        return res.status(200).json({
          success: true,
          data: rows
        });
      } else {
        // 获取所有分类及其文章数量
        let result;
        if (pool) {
          result = await pool.query(`
            SELECT 
              c.*,
              COUNT(pc.post_id) as post_count
            FROM categories c
            LEFT JOIN post_categories pc ON c.id = pc.category_id
            LEFT JOIN posts p ON pc.post_id = p.id AND p.published = TRUE AND p.status = 'published'
            GROUP BY c.id
            ORDER BY c.id ASC
          `);
        } else {
          result = await sql`
            SELECT 
              c.*,
              COUNT(pc.post_id) as post_count
            FROM categories c
            LEFT JOIN post_categories pc ON c.id = pc.category_id
            LEFT JOIN posts p ON pc.post_id = p.id AND p.published = TRUE AND p.status = 'published'
            GROUP BY c.id
            ORDER BY c.id ASC
          `;
        }
        const rows = result.rows || result;
        
        return res.status(200).json({
          success: true,
          data: rows
        });
      }
    }

    // POST - 设置文章的分类
    if (req.method === 'POST') {
      const { postId, categoryIds } = req.body;

      if (!postId) {
        return res.status(400).json({
          success: false,
          error: '文章ID不能为空'
        });
      }

      if (!Array.isArray(categoryIds)) {
        return res.status(400).json({
          success: false,
          error: '分类ID必须是数组'
        });
      }

      // 先删除现有的分类关联
      if (pool) {
        await pool.query(`DELETE FROM post_categories WHERE post_id = $1`, [postId]);
      } else {
        await sql`DELETE FROM post_categories WHERE post_id = ${postId}`;
      }

      // 如果没有指定分类，将其归类为"未分类"
      let finalCategoryIds = categoryIds;
      if (categoryIds.length === 0) {
        // 获取"未分类"分类的ID
        let uncategorizedResult;
        if (pool) {
          uncategorizedResult = await pool.query(`
            SELECT id FROM categories WHERE name = '未分类' LIMIT 1
          `);
        } else {
          uncategorizedResult = await sql`
            SELECT id FROM categories WHERE name = '未分类' LIMIT 1
          `;
        }
        const uncategorizedRows = uncategorizedResult.rows || uncategorizedResult;
        
        if (uncategorizedRows.length > 0) {
          finalCategoryIds = [uncategorizedRows[0].id];
        }
      }

      // 添加新的分类关联
      for (const categoryId of finalCategoryIds) {
        if (pool) {
          await pool.query(`
            INSERT INTO post_categories (post_id, category_id) 
            VALUES ($1, $2)
            ON CONFLICT (post_id, category_id) DO NOTHING
          `, [postId, categoryId]);
        } else {
          await sql`
            INSERT INTO post_categories (post_id, category_id) 
            VALUES (${postId}, ${categoryId})
            ON CONFLICT (post_id, category_id) DO NOTHING
          `;
        }
      }

      return res.status(200).json({
        success: true,
        message: '文章分类设置成功'
      });
    }

    // DELETE - 删除文章的特定分类关联
    if (req.method === 'DELETE') {
      const { postId, categoryId } = req.query;

      if (!postId || !categoryId) {
        return res.status(400).json({
          success: false,
          error: '文章ID和分类ID不能为空'
        });
      }

      let result;
      if (pool) {
        result = await pool.query(`
          DELETE FROM post_categories 
          WHERE post_id = $1 AND category_id = $2
        `, [postId, categoryId]);
      } else {
        result = await sql`
          DELETE FROM post_categories 
          WHERE post_id = ${postId} AND category_id = ${categoryId}
        `;
      }
      const rowCount = result.rowCount || (result.rows ? result.rows.length : 0);

      return res.status(200).json({
        success: true,
        message: `已删除 ${rowCount} 个分类关联`
      });
    }

    // 不支持的方法
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Post Categories API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: '服务器错误，请稍后再试',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}