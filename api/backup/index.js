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
    // GET - 获取备份数据
    if (req.method === 'GET') {
      const { type } = req.query; // 'posts', 'messages', 或 'all'
      
      let backupData = {};
      const timestamp = new Date().toISOString();
      
      if (type === 'posts' || type === 'all') {
        // 获取文章数据
        const postsResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/posts`, {
          headers: { 'Authorization': req.headers.authorization }
        });
        const postsResult = await postsResponse.json();
        
        if (postsResult.success) {
          backupData.posts = postsResult.data;
        }
      }
      
      if (type === 'messages' || type === 'all') {
        // 获取留言数据
        const messagesResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/messages`, {
          headers: { 'Authorization': req.headers.authorization }
        });
        const messagesResult = await messagesResponse.json();
        
        if (messagesResult.success) {
          backupData.messages = messagesResult.data;
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
              const existingResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/posts?slug=${post.slug}`, {
                headers: { 'Authorization': req.headers.authorization }
              });
              const existingResult = await existingResponse.json();
              
              let postResult;
              if (existingResult.success && existingResult.data) {
                // 更新现有文章
                const updateResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/posts`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization
                  },
                  body: JSON.stringify({
                    id: existingResult.data.id,
                    slug: post.slug,
                    title: post.title,
                    content: post.content,
                    tags: post.tags || [],
                    status: post.status || 'draft'
                  })
                });
                postResult = await updateResponse.json();
              } else {
                // 创建新文章
                const createResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/posts`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization
                  },
                  body: JSON.stringify({
                    slug: post.slug,
                    title: post.title,
                    content: post.content,
                    tags: post.tags || [],
                    status: post.status || 'draft'
                  })
                });
                postResult = await createResponse.json();
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
              const createResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/messages`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': req.headers.authorization
                },
                body: JSON.stringify({
                  name: message.name,
                  content: message.content,
                  website: message.website || '',
                  avatar: message.avatar || '',
                  timestamp: message.timestamp || new Date().toISOString()
                })
              });
              
              const messageResult = await createResponse.json();
              messagesResults.push({
                name: message.name,
                success: messageResult.success,
                error: messageResult.error || null
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