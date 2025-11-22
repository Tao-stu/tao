const { sql } = require('@vercel/postgres')

const withCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

// 清空表数据
async function clearTable(tableName) {
  await sql`DELETE FROM ${sql(tableName)}`
}

// 插入文章数据
async function insertPosts(posts) {
  if (!posts || posts.length === 0) return
  
  for (const post of posts) {
    await sql`
      INSERT INTO posts (id, title, summary, content, location, cover, published, created_at, updated_at)
      VALUES (${post.id}, ${post.title}, ${post.summary || ''}, ${post.content}, ${post.location || ''}, ${post.cover || ''}, ${post.published}, ${post.created_at}, ${post.updated_at})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        content = EXCLUDED.content,
        location = EXCLUDED.location,
        cover = EXCLUDED.cover,
        published = EXCLUDED.published,
        updated_at = EXCLUDED.updated_at
    `
  }
}

// 插入留言数据
async function insertMessages(messages) {
  if (!messages || messages.length === 0) return
  
  for (const message of messages) {
    await sql`
      INSERT INTO messages (id, avatar, nickname, gender, birthday, email, content, created_at)
      VALUES (${message.id}, ${message.avatar || ''}, ${message.nickname || '游客'}, ${message.gender || ''}, ${message.birthday || null}, ${message.email || ''}, ${message.content}, ${message.created_at})
      ON CONFLICT (id) DO UPDATE SET
        avatar = EXCLUDED.avatar,
        nickname = EXCLUDED.nickname,
        gender = EXCLUDED.gender,
        birthday = EXCLUDED.birthday,
        email = EXCLUDED.email,
        content = EXCLUDED.content
    `
  }
}

module.exports = async function handler(req, res) {
  withCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { backupData, options = {} } = req.body

    if (!backupData) {
      return res.status(400).json({ success: false, error: '请提供备份数据' })
    }

    // 验证备份数据格式
    if (!backupData.posts && !backupData.messages) {
      return res.status(400).json({ success: false, error: '备份数据格式无效' })
    }

    const { clearExisting = false, restorePosts = true, restoreMessages = true } = options

    // 开始恢复操作
    const results = {
      postsRestored: 0,
      messagesRestored: 0,
      errors: []
    }

    try {
      // 如果选择清空现有数据
      if (clearExisting) {
        if (restorePosts && backupData.posts) {
          await clearTable('posts')
        }
        if (restoreMessages && backupData.messages) {
          await clearTable('messages')
        }
      }

      // 恢复文章数据
      if (restorePosts && backupData.posts && Array.isArray(backupData.posts)) {
        await insertPosts(backupData.posts)
        results.postsRestored = backupData.posts.length
      }

      // 恢复留言数据
      if (restoreMessages && backupData.messages && Array.isArray(backupData.messages)) {
        await insertMessages(backupData.messages)
        results.messagesRestored = backupData.messages.length
      }

      return res.status(200).json({
        success: true,
        message: '数据恢复成功',
        results
      })

    } catch (error) {
      console.error('Restore operation error:', error)
      return res.status(500).json({
        success: false,
        error: '恢复过程中发生错误',
        details: error.message
      })
    }

  } catch (error) {
    console.error('Restore API Error:', error)
    
    // 检查是否是数据库连接错误
    if (error.message && error.message.includes('ENOTFOUND') || 
        error.message && error.message.includes('ECONNREFUSED') ||
        error.message && error.message.includes('database') ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        success: false, 
        error: '数据库连接失败，无法恢复数据'
      });
    }
    
    return res.status(500).json({ success: false, error: '恢复失败，请稍后再试' })
  }
}