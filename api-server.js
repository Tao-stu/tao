import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

// 加载环境变量
config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

// 中间件
app.use(cors())
app.use(express.json())

// 简单的认证中间件
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token === 'test-admin-token' || token === 'admin-token') {
    next()
  } else {
    res.status(401).json({ success: false, error: '未授权' })
  }
}

// 备份API
app.get('/api/backup', authenticate, async (req, res) => {
  try {
    // 动态导入备份模块
    const backupHandler = await import('./api/backup/index.js')
    return backupHandler.default(req, res)
  } catch (error) {
    console.error('Backup error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 恢复API
app.post('/api/restore', authenticate, async (req, res) => {
  console.log('收到恢复请求')
  try {
    // 动态导入恢复模块
    console.log('正在导入恢复模块...')
    const restoreModule = await import('./api/restore/index.cjs')
    console.log('恢复模块导入成功:', typeof restoreModule)
    const restoreHandler = restoreModule.default || restoreModule
    console.log('恢复处理器类型:', typeof restoreHandler)
    
    if (typeof restoreHandler === 'function') {
      console.log('调用恢复处理器...')
      return restoreHandler(req, res)
    } else {
      throw new Error('恢复处理器不是函数')
    }
  } catch (error) {
    console.error('Restore error:', error)
    res.status(500).json({ success: false, error: error.message })
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

export default app