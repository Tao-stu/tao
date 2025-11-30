import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

// 加载环境变量
// 优先尝试SQLite配置，如果不存在则使用原始配置
try {
  config({ path: '.env.sqlite' })
  console.log('使用SQLite配置启动服务器')
} catch (error) {
  config({ path: '.env.local' })
  console.log('使用原始配置启动服务器')
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

// 中间件
app.use(cors())
app.use(express.json())

// 路由调试中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`)
  next()
})

// 简单的认证中间件
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token === 'test-admin-token' || token === 'admin-token') {
    next()
  } else {
    res.status(401).json({ success: false, error: '未授权' })
  }
}

// 备份API - 支持所有HTTP方法
app.all('/api/backup', async (req, res) => {
  try {
    // 备份API允许GET请求无需认证，其他方法需要认证
    if (req.method !== 'GET') {
      const token = req.headers.authorization?.replace('Bearer ', '')
      if (token !== 'test-admin-token' && token !== 'admin-token') {
        return res.status(401).json({ success: false, error: '未授权' })
      }
    }
    
    // 动态导入备份模块
    const backupHandler = await import('./api/backup/index.js')
    return backupHandler.default(req, res)
  } catch (error) {
    console.error('Backup error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 恢复API - 支持所有HTTP方法
app.all('/api/restore', async (req, res) => {
  try {
    // 恢复API需要认证
    if (req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '')
      if (token !== 'test-admin-token' && token !== 'admin-token') {
        return res.status(401).json({ success: false, error: '未授权' })
      }
    }
    
    console.log('收到恢复请求')
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

// 文章API - 支持所有HTTP方法
app.all('/api/posts', async (req, res) => {
  try {
    // 动态导入文章模块
    const postsHandler = await import('./api/posts/index.js')
    return postsHandler.default(req, res)
  } catch (error) {
    console.error('Posts API error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 文章详情API - 支持所有HTTP方法
app.all('/api/posts/:slug', async (req, res) => {
  try {
    const postsHandler = await import('./api/posts/[slug]/index.js')
    return postsHandler.default(req, res)
  } catch (error) {
    console.error('Post detail API error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 分类API - 支持所有HTTP方法
app.all('/api/categories', async (req, res) => {
  try {
    const categoriesHandler = await import('./api/categories/index.js')
    return categoriesHandler.default(req, res)
  } catch (error) {
    console.error('Categories API error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 消息API - 支持所有HTTP方法
app.all('/api/messages', async (req, res) => {
  try {
    const messagesHandler = await import('./api/messages/index.js')
    return messagesHandler.default(req, res)
  } catch (error) {
    console.error('Messages API error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 登录API - 支持GET和POST
app.all('/api/auth/login', async (req, res) => {
  try {
    const loginHandler = await import('./api/auth/login.js')
    return loginHandler.default(req, res)
  } catch (error) {
    console.error('Login API error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 修改密码API
app.all('/api/auth/change-password', async (req, res) => {
  try {
    const changePasswordHandler = await import('./api/auth/change-password.js')
    return changePasswordHandler.default(req, res)
  } catch (error) {
    console.error('Change password API error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 文章密码验证API
app.all('/api/posts/:slug/verify-password', async (req, res) => {
  try {
    const verifyPasswordHandler = await import('./api/posts/[slug]/verify-password.js')
    return verifyPasswordHandler.default(req, res)
  } catch (error) {
    console.error('Verify password API error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 文章内容API
app.all('/api/posts/:slug/content', async (req, res) => {
  try {
    const contentHandler = await import('./api/posts/[slug]/content.js')
    return contentHandler.default(req, res)
  } catch (error) {
    console.error('Content API error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 测试API
app.all('/api/test', async (req, res) => {
  try {
    const testHandler = await import('./api/test.js')
    return testHandler.default(req, res)
  } catch (error) {
    console.error('Test API error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`API服务器运行在 http://localhost:${PORT}`)
  console.log('可用的API端点:')
  console.log('- GET  /api/test - 测试API')
  console.log('- GET  /api/posts - 获取文章列表')
  console.log('- POST /api/auth/login - 登录')
  console.log('- POST /api/posts - 发表文章(需要认证)')
})

export default app