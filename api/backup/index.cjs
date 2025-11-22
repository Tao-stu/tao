const withCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

module.exports = async function handler(req, res) {
  withCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'GET') {
      // 获取数据库客户端
      const { getDatabaseClient } = await import('../utils/db.js')
      const db = await getDatabaseClient()
      const sql = db.sql

      // 备份所有数据
      const backupData = {
        backup: {
          posts: [],
          messages: []
        },
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        type: 'all'
      }

      // 备份文章数据
      try {
        const postsResult = await sql`
          SELECT id, slug, title, summary, content, location, cover, tags, status, published, is_encrypted, access_password, created_at, updated_at
          FROM posts
          ORDER BY created_at DESC
        `
        if (postsResult && postsResult.rows) {
          backupData.backup.posts = postsResult.rows
          console.log(`备份了 ${postsResult.rows.length} 篇文章`)
        }
      } catch (error) {
        console.error('Error backing up posts:', error)
      }

      // 备份留言数据
      try {
        const messagesResult = await sql`
          SELECT id, avatar, nickname, gender, birthday, email, content, created_at
          FROM messages
          ORDER BY created_at DESC
        `
        if (messagesResult && messagesResult.rows) {
          backupData.backup.messages = messagesResult.rows
          console.log(`备份了 ${messagesResult.rows.length} 条留言`)
        }
      } catch (error) {
        console.error('Error backing up messages:', error)
      }

      // 关闭数据库连接
      if (db.end) {
        await db.end()
      }

      // 设置下载头
      const filename = `backup_all_${new Date().toISOString().split('T')[0]}.json`
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      
      return res.status(200).json(backupData)
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    console.error('Backup API Error:', error)
    
    // 返回错误信息，但保持格式一致
    const errorBackup = {
      backup: {
        posts: [],
        messages: []
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      type: 'all',
      error: error.message || '备份失败'
    }
    
    // 设置下载头
    const filename = `backup_all_${new Date().toISOString().split('T')[0]}_error.json`
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    
    return res.status(500).json(errorBackup)
  }
}