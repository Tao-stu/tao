// Vercel Serverless Function - 文章密码验证 API
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只接受 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '方法不允许',
    });
  }

  try {
    const { slug } = req.query;
    const { password } = req.body;

    if (!slug || !password) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数',
      });
    }

    // 使用统一的数据库连接工具
    const { getDatabaseClient } = await import('../utils/db.js');
    const db = await getDatabaseClient();
    const sql = db.sql;

    // 查询文章信息
    const result = await sql`
      SELECT id, is_encrypted, access_password 
      FROM posts 
      WHERE slug = ${slug}
      LIMIT 1
    `;
    const rows = result.rows || result;

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '文章不存在',
      });
    }

    const article = rows[0];

    // 检查文章是否加密
    if (!article.is_encrypted) {
      return res.status(200).json({
        success: true,
        message: '文章未加密',
      });
    }

    // 验证密码
    if (!article.access_password) {
      return res.status(400).json({
        success: false,
        error: '文章未设置密码',
      });
    }

    if (password === article.access_password) {
      return res.status(200).json({
        success: true,
        message: '密码正确',
      });
    } else {
      return res.status(401).json({
        success: false,
        error: '密码错误',
      });
    }

  } catch (error) {
    console.error('密码验证失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误，请稍后重试',
    });
  }
}