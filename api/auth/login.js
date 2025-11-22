// Vercel Serverless Function - 登录认证 API
import { hashPassword, verifyPassword, generateToken, getStoredPasswordHash } from '../utils/auth.js';

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - 获取登录状态或生成密码哈希（仅开发环境）
  if (req.method === 'GET') {
    const { action } = req.query;
    
    if (action === 'hash' && process.env.NODE_ENV === 'development') {
      // 开发环境：生成密码哈希的工具
      const { password } = req.query;
      if (!password) {
        return res.status(400).json({
          success: false,
          error: '请提供password参数'
        });
      }
      
      const hash = hashPassword(password);
      return res.status(200).json({
        success: true,
        data: {
          password,
          hash,
          envVar: `ADMIN_PASSWORD_HASH=${hash}`
        }
      });
    }
    
    return res.status(200).json({
      success: true,
      message: '登录API可用'
    });
  }

  // POST - 用户登录
  if (req.method === 'POST') {
    const { password } = req.body;

    // 验证必填字段
    if (!password) {
      return res.status(400).json({
        success: false,
        error: '密码不能为空'
      });
    }

    try {
      // 获取存储的密码哈希
      const storedHash = getStoredPasswordHash();
      
      // 验证密码
      const isValid = verifyPassword(password, storedHash);
      
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: '密码错误'
        });
      }

      // 生成 JWT token
      const token = generateToken({
        role: 'admin',
        loginTime: new Date().toISOString()
      });

      return res.status(200).json({
        success: true,
        data: {
          token,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h',
          role: 'admin'
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        error: '服务器错误，请稍后再试'
      });
    }
  }

  // 不支持的方法
  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}