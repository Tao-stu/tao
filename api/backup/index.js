// Vercel Serverless Function - 数据备份 API
import { authenticateRequest } from '../utils/auth.js';

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 验证用户认证
  const auth = authenticateRequest(req);
  if (!auth) {
    return res.status(401).json({
      success: false,
      error: '未授权访问'
    });
  }

  try {
    // 使用统一的数据库连接工具
    const { getDatabaseClient } = await import('../utils/db.js');
    const db = await getDatabaseClient();
    const sql = db.sql;

    // GET - 获取备份数据
    if (req.method === 'GET') {
      const { type } = req.query; // 'posts', 'messages', 或 'all'
      
      let backupData = {};
      const timestamp = new Date().toISOString();
      
      if (type === 'posts' || type === 'all') {
        // 直接从数据库获取文章数据
        try {
          const { rows: posts } = await sql`
            SELECT id, slug, title, summary, content, tags, status, is_encrypted, access_password, created_at, updated_at
            FROM posts
            ORDER BY created_at DESC
          `;
          backupData.posts = posts;
        } catch (error) {
          console.error('Error backing up posts:', error);
          backupData.posts = [];
        }
      }
      
      if (type === 'messages' || type === 'all') {
        // 直接从数据库获取留言数据
        try {
          const { rows: messages } = await sql`
            SELECT id, name, content, website, avatar, timestamp
            FROM messages
            ORDER BY timestamp DESC
          `;
          backupData.messages = messages;
        } catch (error) {
          console.error('Error backing up messages:', error);
          backupData.messages = [];
        }
      }
      
      return res.status(200).json({
        success: true,
        data: {
          backup: backupData,
          timestamp,
          version: '1.0.0',
          type: type || 'all'
        }
      });
    }

    // POST - 恢复数据
    if (req.method === 'POST') {
      const { backupData, type } = req.body;
      
      if (!backupData) {
        return res.status(400).json({
          success: false,
          error: '备份数据不能为空'
        });
      }

      let restoreResults = {};
      
      // 恢复文章数据
      if (type === 'posts' || type === 'all') {
        if (backupData.posts && Array.isArray(backupData.posts)) {
          const postsResults = [];
          
          for (const post of backupData.posts) {
            try {
              // 检查文章是否已存在（通过slug）
              const { rows: existingPosts } = await sql`
                SELECT id FROM posts WHERE slug = ${post.slug}
              `;
              
              let postResult;
              if (existingPosts.length > 0) {
                // 更新现有文章
                const { rows: updatedPost } = await sql`
                  UPDATE posts 
                  SET title = ${post.title}, 
                      summary = ${post.summary || ''}, 
                      content = ${post.content}, 
                      tags = ${post.tags || []}, 
                      status = ${post.status || 'draft'},
                      is_encrypted = ${post.is_encrypted || false},
                      access_password = ${post.access_password || ''},
                      updated_at = CURRENT_TIMESTAMP
                  WHERE id = ${existingPosts[0].id}
                  RETURNING *
                `;
                postResult = { success: true, data: updatedPost[0] };
              } else {
                // 创建新文章
                const { rows: newPost } = await sql`
                  INSERT INTO posts (slug, title, summary, content, tags, status, is_encrypted, access_password, created_at, updated_at)
                  VALUES (${post.slug}, ${post.title}, ${post.summary || ''}, ${post.content}, ${post.tags || []}, ${post.status || 'draft'}, ${post.is_encrypted || false}, ${post.access_password || ''}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                  RETURNING *
                `;
                postResult = { success: true, data: newPost[0] };
              }
              
              postsResults.push({
                title: post.title,
                success: postResult.success,
                error: postResult.error || null
              });
            } catch (error) {
              postsResults.push({
                title: post.title,
                success: false,
                error: error.message
              });
            }
          }
          
          restoreResults.posts = postsResults;
        }
      }
      
      // 恢复留言数据
      if (type === 'messages' || type === 'all') {
        if (backupData.messages && Array.isArray(backupData.messages)) {
          const messagesResults = [];
          
          for (const message of backupData.messages) {
            try {
              const { rows: newMessage } = await sql`
                INSERT INTO messages (name, content, website, avatar, timestamp)
                VALUES (${message.name}, ${message.content}, ${message.website || ''}, ${message.avatar || ''}, ${message.timestamp || new Date().toISOString()})
                RETURNING *
              `;
              
              messagesResults.push({
                name: message.name,
                success: true,
                error: null
              });
            } catch (error) {
              messagesResults.push({
                name: message.name,
                success: false,
                error: error.message
              });
            }
          }
          
          restoreResults.messages = messagesResults;
        }
      }
      
      return res.status(200).json({
        success: true,
        data: {
          results: restoreResults,
          timestamp: new Date().toISOString(),
          type: type || 'all'
        }
      });
    }

    // 不支持的方法
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Backup API error:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误，请稍后再试'
    });
  }
}