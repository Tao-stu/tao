export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const { slug } = req.query
    const { password } = req.body

    if (!slug || !password) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      })
    }

    // 获取数据库客户端
    const { getDatabaseClient } = await import('../../utils/db.js')
    const db = await getDatabaseClient()
    const sql = db.sql

    // 查询文章信息
    const result = await sql`
      SELECT id, is_encrypted, access_password, title, content, published
      FROM posts 
      WHERE slug = ${slug}
      LIMIT 1
    `

    const rows = result.rows || result

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '文章不存在'
      })
    }

    const post = rows[0]

    // 检查文章是否加密
    if (!post.is_encrypted) {
      return res.status(400).json({
        success: false,
        error: '该文章未加密'
      })
    }

    // 检查文章是否已发布
    if (!post.published) {
      return res.status(404).json({
        success: false,
        error: '文章未发布'
      })
    }

    // 验证密码
    if (post.access_password === password) {
      // 密码正确，返回文章内容
      return res.status(200).json({
        success: true,
        data: {
          id: post.id,
          title: post.title,
          content: post.content
        }
      })
    } else {
      // 密码错误
      return res.status(401).json({
        success: false,
        error: '密码错误'
      })
    }

  } catch (error) {
    console.error('密码验证 API Error:', error)
    return res.status(500).json({
      success: false,
      error: '服务器错误，请稍后重试'
    })
  }
}