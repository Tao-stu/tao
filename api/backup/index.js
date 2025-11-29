const withCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req, res) {
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

      // 生成SQL备份内容
      let sqlContent = `-- 数据库备份文件
-- 备份时间: ${new Date().toISOString()}
-- 备份版本: 1.0.0

-- 清空现有数据
DELETE FROM messages;
DELETE FROM posts;
ALTER SEQUENCE posts_id_seq RESTART WITH 1;
ALTER SEQUENCE messages_id_seq RESTART WITH 1;

`;

      // 备份文章数据为SQL INSERT语句
      try {
        const postsResult = await sql`
          SELECT id, slug, title, summary, content, location, cover, tags, status, published, is_encrypted, access_password, created_at, updated_at
          FROM posts
          ORDER BY created_at DESC
        `
        if (postsResult && postsResult.rows) {
          sqlContent += `-- 文章数据\n`;
          for (const post of postsResult.rows) {
            const escapedTitle = post.title.replace(/'/g, "''");
            const escapedSummary = (post.summary || '').replace(/'/g, "''");
            const escapedContent = post.content.replace(/'/g, "''");
            const escapedLocation = (post.location || '').replace(/'/g, "''");
            const escapedCover = (post.cover || '').replace(/'/g, "''");
            const escapedSlug = (post.slug || '').replace(/'/g, "''");
            const escapedAccessPassword = (post.access_password || '').replace(/'/g, "''");
            const tagsJson = post.tags ? JSON.stringify(post.tags).replace(/'/g, "''") : '[]';
            
            sqlContent += `INSERT INTO posts (id, slug, title, summary, content, location, cover, tags, status, published, is_encrypted, access_password, created_at, updated_at) VALUES (${post.id}, '${escapedSlug}', '${escapedTitle}', '${escapedSummary}', '${escapedContent}', '${escapedLocation}', '${escapedCover}', '${tagsJson}'::jsonb, '${post.status}', ${post.published}, ${post.is_encrypted}, '${escapedAccessPassword}', '${post.created_at.toISOString()}', '${post.updated_at.toISOString()}');\n`;
          }
          console.log(`备份了 ${postsResult.rows.length} 篇文章`);
        }
      } catch (error) {
        console.error('Error backing up posts:', error);
      }

      sqlContent += `\n`;

      // 备份留言数据为SQL INSERT语句
      try {
        const messagesResult = await sql`
          SELECT id, avatar, nickname, gender, birthday, email, content, created_at
          FROM messages
          ORDER BY created_at DESC
        `
        if (messagesResult && messagesResult.rows) {
          sqlContent += `-- 留言数据\n`;
          for (const message of messagesResult.rows) {
            const escapedAvatar = (message.avatar || '').replace(/'/g, "''");
            const escapedNickname = (message.nickname || '游客').replace(/'/g, "''");
            const escapedGender = (message.gender || '').replace(/'/g, "''");
            const escapedEmail = (message.email || '').replace(/'/g, "''");
            const escapedContent = message.content.replace(/'/g, "''");
            const birthdayStr = message.birthday ? `'${message.birthday.toISOString().split('T')[0]}'` : 'NULL';
            
            sqlContent += `INSERT INTO messages (id, avatar, nickname, gender, birthday, email, content, created_at) VALUES (${message.id}, '${escapedAvatar}', '${escapedNickname}', '${escapedGender}', ${birthdayStr}, '${escapedEmail}', '${escapedContent}', '${message.created_at.toISOString()}');\n`;
          }
          console.log(`备份了 ${messagesResult.rows.length} 条留言`);
        }
      } catch (error) {
        console.error('Error backing up messages:', error);
      }

      // 关闭数据库连接
      if (db.end) {
        await db.end()
      }

      // 设置下载头
      const filename = `backup_all_${new Date().toISOString().split('T')[0]}.sql`
      res.setHeader('Content-Type', 'application/sql')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      
      return res.status(200).send(sqlContent)
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    console.error('Backup API Error:', error)
    
    // 返回错误信息
    const errorSql = `-- 数据库备份失败
-- 错误时间: ${new Date().toISOString()}
-- 错误信息: ${error.message || '备份失败'}

-- 请检查数据库连接和配置
`;
    
    // 设置下载头
    const filename = `backup_all_${new Date().toISOString().split('T')[0]}_error.sql`
    res.setHeader('Content-Type', 'application/sql')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    
    return res.status(500).send(errorSql)
  }
}