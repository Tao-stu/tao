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
    console.log('认证检查开始...');
    const authResult = authenticateRequest(req);
    console.log('认证结果:', authResult);
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
      // 创建分类表
      await pool.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // 插入默认分类
      await pool.query(`
        INSERT INTO categories (name, description) VALUES
        ('未分类', '默认分类，用于未指定分类的文章'),
        ('技术', '技术相关文章'),
        ('生活', '生活感悟和随笔'),
        ('学习', '学习笔记和心得')
        ON CONFLICT (name) DO NOTHING
      `);
      
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
          category_id INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        )
      `);
      
      // 检查并添加缺失的列（用于已存在的表）
      try {
        await pool.query(`
          DO $$ 
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='posts' AND column_name='is_encrypted') THEN
              ALTER TABLE posts ADD COLUMN is_encrypted BOOLEAN DEFAULT FALSE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='posts' AND column_name='access_password') THEN
              ALTER TABLE posts ADD COLUMN access_password VARCHAR(255);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='posts' AND column_name='slug') THEN
              ALTER TABLE posts ADD COLUMN slug VARCHAR(255) UNIQUE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='posts' AND column_name='tags') THEN
              ALTER TABLE posts ADD COLUMN tags JSONB DEFAULT '[]';
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='posts' AND column_name='status') THEN
              ALTER TABLE posts ADD COLUMN status VARCHAR(20) DEFAULT 'published';
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='posts' AND column_name='location') THEN
              ALTER TABLE posts ADD COLUMN location VARCHAR(120);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='posts' AND column_name='cover') THEN
              ALTER TABLE posts ADD COLUMN cover TEXT;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='posts' AND column_name='summary') THEN
              ALTER TABLE posts ADD COLUMN summary TEXT;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='posts' AND column_name='category_id') THEN
              ALTER TABLE posts ADD COLUMN category_id INTEGER DEFAULT 1;
            END IF;
          END $$;
        `);
      } catch (migrationError) {
        // 如果 DO 语句不支持（某些 PostgreSQL 版本），使用单独的 ALTER TABLE 语句
        console.log('尝试使用单独的 ALTER TABLE 语句添加缺失的列...');
        const columnsToAdd = [
          { name: 'is_encrypted', sql: 'ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE' },
          { name: 'access_password', sql: 'ALTER TABLE posts ADD COLUMN IF NOT EXISTS access_password VARCHAR(255)' },
          { name: 'slug', sql: 'ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug VARCHAR(255)' },
          { name: 'tags', sql: 'ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT \'[]\'' },
          { name: 'status', sql: 'ALTER TABLE posts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT \'published\'' },
          { name: 'location', sql: 'ALTER TABLE posts ADD COLUMN IF NOT EXISTS location VARCHAR(120)' },
          { name: 'cover', sql: 'ALTER TABLE posts ADD COLUMN IF NOT EXISTS cover TEXT' },
          { name: 'summary', sql: 'ALTER TABLE posts ADD COLUMN IF NOT EXISTS summary TEXT' },
          { name: 'category_id', sql: 'ALTER TABLE posts ADD COLUMN IF NOT EXISTS category_id INTEGER DEFAULT 1' }
        ];
        
        for (const column of columnsToAdd) {
          try {
            await pool.query(column.sql);
          } catch (err) {
            // 忽略列已存在的错误
            if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
              console.warn(`添加列 ${column.name} 时出错:`, err.message);
            }
          }
        }
      }
    } else {
      // 创建分类表
      await sql`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // 插入默认分类
      await sql`
        INSERT INTO categories (name, description) VALUES
        ('未分类', '默认分类，用于未指定分类的文章'),
        ('技术', '技术相关文章'),
        ('生活', '生活感悟和随笔'),
        ('学习', '学习笔记和心得')
        ON CONFLICT (name) DO NOTHING
      `;
      
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
          category_id INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // 对于 Vercel Postgres，检查并添加缺失的列
      try {
        // 检查列是否存在，如果不存在则添加
        const checkColumn = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'posts' AND column_name = 'is_encrypted'
        `;
        const rows = checkColumn.rows || checkColumn;
        if (!rows || rows.length === 0) {
          await sql`ALTER TABLE posts ADD COLUMN is_encrypted BOOLEAN DEFAULT FALSE`;
          console.log('已添加 is_encrypted 列');
        }
      } catch (err) {
        console.warn('检查/添加 is_encrypted 列时出错:', err.message);
      }
      
      try {
        const checkColumn = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'posts' AND column_name = 'access_password'
        `;
        const rows = checkColumn.rows || checkColumn;
        if (!rows || rows.length === 0) {
          await sql`ALTER TABLE posts ADD COLUMN access_password VARCHAR(255)`;
          console.log('已添加 access_password 列');
        }
      } catch (err) {
        console.warn('检查/添加 access_password 列时出错:', err.message);
      }
      
      // 检查并添加其他可能缺失的列
      const columnsToCheck = [
        { name: 'slug', type: 'VARCHAR(255)' },
        { name: 'tags', type: 'JSONB DEFAULT \'[]\'' },
        { name: 'status', type: 'VARCHAR(20) DEFAULT \'published\'' },
        { name: 'location', type: 'VARCHAR(120)' },
        { name: 'cover', type: 'TEXT' },
        { name: 'summary', type: 'TEXT' },
        { name: 'category_id', type: 'INTEGER DEFAULT 1' }
      ];
      
      for (const column of columnsToCheck) {
        try {
          const checkColumn = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'posts' AND column_name = ${column.name}
          `;
          const rows = checkColumn.rows || checkColumn;
          if (!rows || rows.length === 0) {
            await sql.unsafe(`ALTER TABLE posts ADD COLUMN ${column.name} ${column.type}`);
            console.log(`已添加 ${column.name} 列`);
          }
        } catch (err) {
          if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
            console.warn(`检查/添加 ${column.name} 列时出错:`, err.message);
          }
        }
      }
    }

    // GET - 获取所有文章或单篇文章
    if (req.method === 'GET') {
      const { slug, id } = req.query;
      
      console.log('[API] GET /posts 请求', {
        slug,
        id,
        query: req.query,
        hasAuth: !!req.headers.authorization
      });

      // 检查 slug 是否有效（不是 null、undefined 或空字符串）
      if (slug && slug !== 'null' && slug !== 'undefined' && slug.trim() !== '') {
        console.log('[API] 通过 slug 获取文章', { slug });
        // 通过slug获取单篇文章
        const result = await sql`
          SELECT p.*, c.name as category_name 
          FROM posts p 
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.slug = ${slug}
          LIMIT 1
        `;
        const rows = result.rows || result;
        
        console.log('[API] 数据库查询结果 (by slug)', {
          found: rows.length > 0,
          articleId: rows[0]?.id,
          articleTitle: rows[0]?.title,
          articleSlug: rows[0]?.slug,
          contentLength: rows[0]?.content?.length || 0
        });
        
        if (rows.length === 0) {
          console.log('[API] 文章不存在 (by slug)', { slug });
          return res.status(404).json({
            success: false,
            error: '文章不存在'
          });
        }

        const article = rows[0];

        // 如果文章加密且没有认证，不返回完整内容
        // 如果有认证（管理员编辑），返回完整内容
        const authResult = authenticateRequest(req);
        console.log('[API] 认证检查结果', {
          isAuthenticated: !!authResult,
          isEncrypted: article.is_encrypted
        });
        
        if (article.is_encrypted && !authResult) {
          article.content = article.content ? article.content.substring(0, 100) + '...' : '';
          article.summary = '这是一篇加密文章，需要密码才能查看完整内容';
          console.log('[API] 文章已加密，内容已截断');
        }
        // 如果有认证，返回完整内容（包括加密文章）

        console.log('[API] 返回文章数据 (by slug)', {
          id: article.id,
          title: article.title,
          slug: article.slug,
          contentLength: article.content?.length || 0,
          isEncrypted: article.is_encrypted
        });

        return res.status(200).json({
          success: true,
          data: article
        });
      } else if (id) {
        console.log('[API] 通过 id 获取文章', { id });
        // 通过id获取单篇文章
        const result = await sql`
          SELECT p.*, c.name as category_name 
          FROM posts p 
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.id = ${id}
          LIMIT 1
        `;
        const rows = result.rows || result;
        
        console.log('[API] 数据库查询结果 (by id)', {
          found: rows.length > 0,
          articleId: rows[0]?.id,
          articleTitle: rows[0]?.title,
          articleSlug: rows[0]?.slug,
          contentLength: rows[0]?.content?.length || 0
        });
        
        if (rows.length === 0) {
          console.log('[API] 文章不存在 (by id)', { id });
          return res.status(404).json({
            success: false,
            error: '文章不存在'
          });
        }

        const article = rows[0];

        // 如果文章加密且没有认证，不返回完整内容
        // 如果有认证（管理员编辑），返回完整内容
        const authResult = authenticateRequest(req);
        console.log('[API] 认证检查结果', {
          isAuthenticated: !!authResult,
          isEncrypted: article.is_encrypted
        });
        
        if (article.is_encrypted && !authResult) {
          article.content = article.content ? article.content.substring(0, 100) + '...' : '';
          article.summary = '这是一篇加密文章，需要密码才能查看完整内容';
          console.log('[API] 文章已加密，内容已截断');
        }
        // 如果有认证，返回完整内容（包括加密文章）

        console.log('[API] 返回文章数据 (by id)', {
          id: article.id,
          title: article.title,
          slug: article.slug,
          contentLength: article.content?.length || 0,
          isEncrypted: article.is_encrypted
        });

        return res.status(200).json({
          success: true,
          data: article
        });
      } else {
        // 获取所有文章
        const limit = Number(req.query.limit) || 50;
        const includeDrafts = req.query.includeDrafts !== 'false';
        
        let result;
        if (includeDrafts) {
          result = await sql`
            SELECT p.*, c.name as category_name 
            FROM posts p 
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.updated_at DESC
            LIMIT ${limit}
          `;
        } else {
          result = await sql`
            SELECT p.*, c.name as category_name 
            FROM posts p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.published = TRUE AND p.status = 'published'
            ORDER BY p.updated_at DESC
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
      const { slug, title, summary, content, location, cover, tags, status, published, is_encrypted, access_password, category_id } = req.body;
      
      console.log('[API] POST /posts 请求', {
        slug,
        title,
        contentLength: content?.length || 0,
        tags,
        status,
        hasAuth: !!req.headers.authorization,
        body: {
          ...req.body,
          content: content ? `[${content.length} chars]` : null
        }
      });

      // 验证必填字段
      if (!title || !content) {
        console.log('[API] 验证失败：标题或内容为空', { hasTitle: !!title, hasContent: !!content });
        return res.status(400).json({
          success: false,
          error: '标题和内容不能为空'
        });
      }

      // 如果提供了slug，检查是否已存在
      if (slug && slug !== 'null' && slug !== 'undefined' && slug.trim() !== '') {
        console.log('[API] 检查 slug 是否已存在', { slug });
        const existingResult = await sql`
          SELECT id FROM posts WHERE slug = ${slug} LIMIT 1
        `;
        const existing = existingResult.rows || existingResult;

        if (existing && existing.length > 0) {
          console.log('[API] slug 已存在', { slug, existingId: existing[0].id });
          return res.status(409).json({
            success: false,
            error: '该slug已存在，请使用不同的slug'
          });
        }
        console.log('[API] slug 可用', { slug });
      }

      // 插入新文章
      const tagsArray = Array.isArray(tags) ? tags : [];
      // 清理 slug：如果是 'null' 或 'undefined' 字符串，转换为 null
      const cleanSlug = (slug && slug !== 'null' && slug !== 'undefined' && slug.trim() !== '') ? slug.trim() : null;
      
      console.log('[API] slug 清理结果', {
        originalSlug: slug,
        cleanSlug,
        slugType: typeof slug
      });
      
      let result;
      if (pool) {
        const insertQuery = `
          INSERT INTO posts (slug, title, summary, content, location, cover, tags, status, published, is_encrypted, access_password, category_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12)
          RETURNING *
        `;
        const insertValues = [
          cleanSlug, 
          title, 
          summary || '', 
          content, 
          location || '', 
          cover || '', 
          JSON.stringify(tagsArray), 
          status || 'published', 
          published !== false,
          is_encrypted || false,
          access_password || '',
          category_id || 1
        ];
        result = await pool.query(insertQuery, insertValues);
      } else {
        // 使用 Vercel Postgres
        result = await sql`
          INSERT INTO posts (slug, title, summary, content, location, cover, tags, status, published, is_encrypted, access_password, category_id)
          VALUES (${cleanSlug}, ${title}, ${summary || ''}, ${content}, ${location || ''}, ${cover || ''}, ${tagsArray}::jsonb, ${status || 'published'}, ${published !== false}, ${is_encrypted || false}, ${access_password || ''}, ${category_id || 1})
          RETURNING *
        `;
      }
      const rows = result.rows || result;
      
      console.log('[API] 文章创建成功', {
        id: rows[0]?.id,
        title: rows[0]?.title,
        slug: rows[0]?.slug
      });

      return res.status(201).json({
        success: true,
        data: rows[0]
      });
    }

    // PUT - 更新文章
    if (req.method === 'PUT') {
      const { id, slug, title, summary, content, location, cover, tags, status, published, is_encrypted, access_password, category_id } = req.body;
      
      console.log('[API] PUT /posts 请求', {
        id,
        slug,
        title,
        contentLength: content?.length || 0,
        tags,
        status,
        hasAuth: !!req.headers.authorization,
        body: {
          ...req.body,
          content: content ? `[${content.length} chars]` : null
        }
      });

      if (!id) {
        console.log('[API] 验证失败：文章ID为空');
        return res.status(400).json({
          success: false,
          error: '文章ID不能为空'
        });
      }

      // 如果更新slug，检查新slug是否已被其他文章使用
      if (slug && slug !== 'null' && slug !== 'undefined' && slug.trim() !== '') {
        console.log('[API] 检查新 slug 是否已被其他文章使用', { slug, currentId: id });
        const existingResult = await sql`
          SELECT id FROM posts WHERE slug = ${slug} AND id != ${id} LIMIT 1
        `;
        const existing = existingResult.rows || existingResult;

        if (existing && existing.length > 0) {
          console.log('[API] slug 已被其他文章使用', { slug, existingId: existing[0].id });
          return res.status(409).json({
            success: false,
            error: '该slug已被其他文章使用'
          });
        }
        console.log('[API] slug 可用', { slug });
      }

      // 构建更新语句
      const updateParts = [];
      const updateValues = [];
      let paramIndex = 1;
      
      if (slug !== undefined) {
        // 清理 slug：如果是 'null' 或 'undefined' 字符串，转换为 null
        const cleanSlug = (slug && slug !== 'null' && slug !== 'undefined' && slug.trim() !== '') ? slug.trim() : null;
        console.log('[API] slug 清理结果 (PUT)', {
          originalSlug: slug,
          cleanSlug,
          slugType: typeof slug
        });
        updateParts.push(`slug = $${paramIndex++}`);
        updateValues.push(cleanSlug);
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
      if (category_id !== undefined) {
        updateParts.push(`category_id = $${paramIndex++}`);
        updateValues.push(category_id);
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
              // 清理 slug：如果是 'null' 或 'undefined' 字符串，转换为 null
              const cleanSlug = (slug && slug !== 'null' && slug !== 'undefined' && slug.trim() !== '') ? slug.trim() : null;
              newUpdateParts.push(`slug = $${newParamIndex++}`);
              newUpdateValues.push(cleanSlug);
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
            if (category_id !== undefined) {
              newUpdateParts.push(`category_id = $${newParamIndex++}`);
              newUpdateValues.push(category_id);
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
          // 清理 slug：如果是 'null' 或 'undefined' 字符串，转换为 null
          const cleanSlug = (slug && slug !== 'null' && slug !== 'undefined' && slug.trim() !== '') ? slug.trim() : null;
          setParts.push(`slug = ${sql`${cleanSlug}`}`);
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
        if (category_id !== undefined) {
          setParts.push(`category_id = ${sql`${category_id}`}`);
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
      
      console.log('[API] 数据库更新结果', {
        updated: rows.length > 0,
        articleId: rows[0]?.id,
        articleTitle: rows[0]?.title,
        articleSlug: rows[0]?.slug,
        contentLength: rows[0]?.content?.length || 0
      });

      if (rows.length === 0) {
        console.log('[API] 文章不存在，无法更新', { id });
        return res.status(404).json({
          success: false,
          error: '文章不存在'
        });
      }

      console.log('[API] 文章更新成功', {
        id: rows[0].id,
        title: rows[0].title,
        slug: rows[0].slug
      });

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
    console.error('Request method:', req.method);
    console.error('Request query:', req.query);
    console.error('Request body:', req.body);
    console.error('Request headers:', req.headers);
    
    // 根据错误类型返回更具体的错误信息
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
      details: process.env.NODE_ENV === 'development' ? error.message : undefined, // 仅在开发环境显示详细错误
      errorCode: error.code || 'UNKNOWN'
    });
  }
}