const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = 3001

// 中间件
app.use(cors())
app.use(express.json())

// 模拟数据存储
let posts = [
  {
    id: 1,
    slug: 'test-post',
    title: '测试文章',
    summary: '这是一个测试文章',
    content: '这是文章的详细内容...',
    location: '北京',
    cover: '/img/test.jpg',
    tags: ['测试', '文章'],
    status: 'published',
    published: true,
    is_encrypted: false,
    access_password: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

let messages = [
  {
    id: 1,
    avatar: '/img/avatar.jpg',
    nickname: '测试用户',
    gender: 'male',
    birthday: '1990-01-01',
    email: 'test@example.com',
    content: '这是测试留言',
    created_at: new Date().toISOString()
  }
]

// 简单的认证中间件
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token === 'test-admin-token') {
    next()
  } else {
    res.status(401).json({ success: false, error: '未授权' })
  }
}

// 备份API
app.get('/api/backup', authenticate, (req, res) => {
  try {
    const backupData = {
      backup: {
        posts: posts,
        messages: messages
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      type: 'all'
    }

    const filename = `backup_all_${new Date().toISOString().split('T')[0]}.json`
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    
    res.json(backupData)
  } catch (error) {
    console.error('Backup error:', error)
    const errorBackup = {
      backup: { posts: [], messages: [] },
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      type: 'all',
      error: error.message
    }
    
    const filename = `backup_all_${new Date().toISOString().split('T')[0]}_error.json`
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    
    res.status(500).json(errorBackup)
  }
})

// 文章API
app.get('/api/posts', authenticate, (req, res) => {
  res.json({
    success: true,
    data: posts
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`API服务器运行在 http://localhost:${PORT}`)
  console.log('测试备份功能：')
  console.log('1. 访问 http://localhost:3000')
  console.log('2. 进入博客管理后台')
  console.log('3. 使用密码 "admin123" 登录')
  console.log('4. 在系统设置中测试数据备份')
})