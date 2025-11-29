import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'

// 加载环境变量
config({ path: '.env.local' })

const app = express()
const PORT = 3001

// 中间件
app.use(cors())
app.use(express.json())

// 导入API路由
import postsHandler from './api/posts/index.js'
import messagesHandler from './api/messages/index.js'
import authHandler from './api/auth/login.js'
import backupHandler from './api/backup/index.js'

// API路由
app.use('/api/posts', postsHandler)
app.use('/api/messages', messagesHandler)
app.use('/api/auth/login', authHandler)
app.use('/api/backup', backupHandler)

// 启动服务器
app.listen(PORT, () => {
  console.log(`API开发服务器运行在 http://localhost:${PORT}`)
  console.log(`前端开发服务器应该运行在 http://localhost:3000`)
  console.log('API端点：')
  console.log('- GET /api/posts')
  console.log('- POST /api/posts')
  console.log('- GET /api/messages')
  console.log('- POST /api/messages')
  console.log('- POST /api/auth/login')
  console.log('- GET /api/backup')
})

export default app