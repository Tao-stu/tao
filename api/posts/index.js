// Vercel Serverless Function - 博客文章 API
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

    // 初始化数据库表
    if (pool) {
      await pool.query(`
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
        )
      `);
    } else {
      await sql`
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
        )
      `;
    }

    // GET - 获取所有文章或单篇文章
    if (req.method === 'GET') {
      const { slug, id } = req.query;

      if (slug) {
        // 通过slug获取单篇文章
        const result = await sql`
          SELECT * FROM posts 
          WHERE slug = ${slug}
          LIMIT 1
        `;
        const rows = result.rows || result;
        
        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: '文章不存在'
          });
        }

        return res.status(200).json({
          success: true,
          data: rows[0]
        });
      } else if (id) {
        // 通过id获取单篇文章
        const result = await sql`
          SELECT * FROM posts 
          WHERE id = ${id}
          LIMIT 1
        `;
        const rows = result.rows || result;
        
        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: '文章不存在'
          });
        }

        return res.status(200).json({
          success: true,
          data: rows[0]
        });
      } else {
        // 获取所有文章
        const limit = Number(req.query.limit) || 50;
        const includeDrafts = req.query.includeDrafts !== 'false';
        
        let result;
        if (includeDrafts) {
          result = await sql`
            SELECT * FROM posts 
            ORDER BY updated_at DESC
            LIMIT ${limit}
          `;
        } else {
          result = await sql`
            SELECT * FROM posts 
            WHERE published = TRUE AND status = 'published'
            ORDER BY updated_at DESC
            LIMIT ${limit}
          `;
        }
        const rows = result.rows || result;
        
        return res.status(200).json({
          success: true,
          data: rows
        });
      }
    }

    // POST - 创建新文章
    if (req.method === 'POST') {
      const { slug, title, summary, content, location, cover, tags, status, published, is_encrypted, access_password } = req.body;

      // 验证必填字段
      if (!title || !content) {
        return res.status(400).json({
          success: false,
          error: '标题和内容不能为空'
        });
      }

      // 如果提供了slug，检查是否已存在
      if (slug) {
        const { rows: existing } = await sql`
          SELECT id FROM posts WHERE slug = ${slug} LIMIT 1
        `;

        if (existing.length > 0) {
          return res.status(409).json({
            success: false,
            error: '该slug已存在，请使用不同的slug'
          });
        }
      }

      // 插入新文章
      const tagsArray = Array.isArray(tags) ? tags : [];
      
      let result;
      if (pool) {
        const insertQuery = `
          INSERT INTO posts (slug, title, summary, content, location, cover, tags, status, published, is_encrypted, access_password)
          VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11)
          RETURNING *
        `;
        const insertValues = [
          slug || null, 
          title, 
          summary || '', 
          content, 
          location || '', 
          cover || '', 
          JSON.stringify(tagsArray), 
          status || 'published', 
          published !== false,
          is_encrypted || false,
          access_password || ''
        ];
        result = await pool.query(insertQuery, insertValues);
      } else {
        result = await sql`
          INSERT INTO posts (slug, title, summary, content, location, cover, tags, status, published, is_encrypted, access_password)
          VALUES (${slug || null}, ${title}, ${summary || ''}, ${content}, ${location || ''}, ${cover || ''}, ${JSON.stringify(tagsArray)}::jsonb, ${status || 'published'}, ${published !== false}, ${is_encrypted || false}, ${access_password || ''})
          RETURNING *
        `;
      }
      const rows = result.rows || result;

      return res.status(201).json({
        success: true,
        data: rows[0]
      });
    }

    // PUT - 更新文章
    if (req.method === 'PUT') {
      const { id, slug, title, summary, content, location, cover, tags, status, published, is_encrypted, access_password } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: '文章ID不能为空'
        });
      }

      // 如果更新slug，检查新slug是否已被其他文章使用
      if (slug) {
        const existingResult = await sql`
          SELECT id FROM posts WHERE slug = ${slug} AND id != ${id} LIMIT 1
        `;
        const existing = existingResult.rows || existingResult;

        if (existing.length > 0) {
          return res.status(409).json({
            success: false,
            error: '该slug已被其他文章使用'
          });
        }
      }

      // 构建更新语句
      const updateParts = [];
      const updateValues = [];
      let paramIndex = 1;
      
      if (slug !== undefined) {
        updateParts.push(`slug = $${paramIndex++}`);
        updateValues.push(slug || null);
      }
      if (title !== undefined) {
        updateParts.push(`title = $${paramIndex++}`);
        updateValues.push(title);
      }
      if (summary !== undefined) {
        updateParts.push(`summary = $${paramIndex++}`);
        updateValues.push(summary || '');
      }
      if (content !== undefined) {
        updateParts.push(`content = $${paramIndex++}`);
        updateValues.push(content);
      }
      if (location !== undefined) {
        updateParts.push(`location = $${paramIndex++}`);
        updateValues.push(location || '');
      }
      if (cover !== undefined) {
        updateParts.push(`cover = $${paramIndex++}`);
        updateValues.push(cover || '');
      }
      if (tags !== undefined) {
        const tagsArray = Array.isArray(tags) ? tags : [];
        updateParts.push(`tags = $${paramIndex++}`);
        updateValues.push(tagsArray);
      }
      if (status !== undefined) {
        updateParts.push(`status = $${paramIndex++}`);
        updateValues.push(status);
      }
      if (published !== undefined) {
        updateParts.push(`published = $${paramIndex++}`);
        updateValues.push(published);
      }
      if (is_encrypted !== undefined) {
        updateParts.push(`is_encrypted = $${paramIndex++}`);
        updateValues.push(is_encrypted);
      }
      if (access_password !== undefined) {
        updateParts.push(`access_password = $${paramIndex++}`);
        updateValues.push(access_password || '');
      }
      updateParts.push(`updated_at = CURRENT_TIMESTAMP`);
      
      // 添加 id 参数
      updateValues.push(id);
      
      let result;
      if (pool) {
        const updateQuery = `
          UPDATE posts 
          SET ${updateParts.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING *
        `;
        
        try {
          result = await pool.query(updateQuery, updateValues);
        } catch (updateError) {
          if (updateError.message.includes('text[] but expression is of type')) {
            // 如果是类型不匹配，重新构建查询
            console.log('检测到tags类型不匹配，调整查询...');
            const newUpdateParts = [];
            const newUpdateValues = [];
            let newParamIndex = 1;
            
            if (slug !== undefined) {
              newUpdateParts.push(`slug = $${newParamIndex++}`);
              newUpdateValues.push(slug || null);
            }
            if (title !== undefined) {
              newUpdateParts.push(`title = $${newParamIndex++}`);
              newUpdateValues.push(title);
            }
            if (summary !== undefined) {
              newUpdateParts.push(`summary = $${newParamIndex++}`);
              newUpdateValues.push(summary || '');
            }
            if (content !== undefined) {
              newUpdateParts.push(`content = $${newParamIndex++}`);
              newUpdateValues.push(content);
            }
            if (location !== undefined) {
              newUpdateParts.push(`location = $${newParamIndex++}`);
              newUpdateValues.push(location || '');
            }
            if (cover !== undefined) {
              newUpdateParts.push(`cover = $${newParamIndex++}`);
              newUpdateValues.push(cover || '');
            }
            if (tags !== undefined) {
              const tagsArray = Array.isArray(tags) ? tags : [];
              newUpdateParts.push(`tags = $${newParamIndex++}::text[]`);
              newUpdateValues.push(tagsArray);
            }
            if (status !== undefined) {
              newUpdateParts.push(`status = $${newParamIndex++}`);
              newUpdateValues.push(status);
            }
            if (published !== undefined) {
              newUpdateParts.push(`published = $${newParamIndex++}`);
              newUpdateValues.push(published);
            }
            if (is_encrypted !== undefined) {
              newUpdateParts.push(`is_encrypted = $${newParamIndex++}`);
              newUpdateValues.push(is_encrypted);
            }
            if (access_password !== undefined) {
              newUpdateParts.push(`access_password = $${newParamIndex++}`);
              newUpdateValues.push(access_password || '');
            }
            newUpdateParts.push(`updated_at = CURRENT_TIMESTAMP`);
            newUpdateValues.push(id);
            
            const newUpdateQuery = `
              UPDATE posts 
              SET ${newUpdateParts.join(', ')}
              WHERE id = $${newParamIndex}
              RETURNING *
            `;
            result = await pool.query(newUpdateQuery, newUpdateValues);
          } else {
            throw updateError;
          }
        }
      } else {
        // 使用 Vercel Postgres
        const setParts = [];
        
        if (slug !== undefined) {
          setParts.push(`slug = ${sql`${slug || null}`}`);
        }
        if (title !== undefined) {
          setParts.push(`title = ${sql`${title}`}`);
        }
        if (summary !== undefined) {
          setParts.push(`summary = ${sql`${summary || ''}`}`);
        }
        if (content !== undefined) {
          setParts.push(`content = ${sql`${content}`}`);
        }
        if (location !== undefined) {
          setParts.push(`location = ${sql`${location || ''}`}`);
        }
        if (cover !== undefined) {
          setParts.push(`cover = ${sql`${cover || ''}`}`);
        }
        if (tags !== undefined) {
          const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
          setParts.push(`tags = ${sql`${tagsJson}`}::jsonb`);
        }
        if (status !== undefined) {
          setParts.push(`status = ${sql`${status}`}`);
        }
        if (published !== undefined) {
          setParts.push(`published = ${sql`${published}`}`);
        }
        if (is_encrypted !== undefined) {
          setParts.push(`is_encrypted = ${sql`${is_encrypted}`}`);
        }
        if (access_password !== undefined) {
          setParts.push(`access_password = ${sql`${access_password || ''}`}`);
        }
        setParts.push('updated_at = CURRENT_TIMESTAMP');
        
        result = await sql`
          UPDATE posts 
          SET ${sql.unsafe(setParts.join(', '))}
          WHERE id = ${id}
          RETURNING *
        `;
      }
      const rows = result.rows || result;

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: '文章不存在'
        });
      }

      return res.status(200).json({
        success: true,
        data: rows[0]
      });
    }

    // DELETE - 删除文章
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: '文章ID不能为空'
        });
      }

      const result = await sql`
        DELETE FROM posts WHERE id = ${id}
      `;
      const rowCount = result.rowCount || (result.rows ? result.rows.length : 0);

      if (rowCount === 0) {
        return res.status(404).json({
          success: false,
          error: '文章不存在'
        });
      }

      return res.status(200).json({
        success: true,
        message: '文章已删除'
      });
    }

    // 不支持的方法
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('API Error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    return res.status(500).json({
      success: false,
      error: '服务器错误，请稍后再试',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      errorCode: error.code || 'UNKNOWN'
    });
  }
}