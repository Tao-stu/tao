// Vercel Serverless Function - 获取加密文章完整内容 API
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只接受 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '方法不允许',
    });
  }

  try {
    const { slug } = req.query;

    // 检查 slug 是否有效（不是 null、undefined 或空字符串）
    if (!slug || slug === 'null' || slug === 'undefined' || slug.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '缺少文章标识',
      });
    }

    // 使用统一的数据库连接工具
    const { getDatabaseClient } = await import('../utils/db.js');
    const db = await getDatabaseClient();
    const sql = db.sql;

    // 查询文章完整信息
    const result = await sql`
      SELECT * FROM posts 
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

    // 返回完整文章内容（无论是否加密）
    return res.status(200).json({
      success: true,
      data: article
    });

  } catch (error) {
    console.error('获取文章内容失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误，请稍后重试',
    });
  }
}