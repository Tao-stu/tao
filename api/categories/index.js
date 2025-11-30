const { Pool } = require('pg');
const { authenticate } = require('../utils/auth');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 获取所有分类及文章数量
async function getCategories(req, res) {
  try {
    const client = await pool.connect();
    
    // 获取所有文章并统计分类
    const result = await client.query(`
      SELECT 
        category,
        COUNT(*) as post_count,
        MIN(created_at) as created_at
      FROM posts 
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY post_count DESC, category ASC
    `);
    
    // 构建分类列表
    const categories = result.rows.map(row => ({
      id: `cat_${row.category}`,
      name: row.category,
      description: '',
      created_at: row.created_at,
      post_count: parseInt(row.post_count)
    }));
    
    // 添加"未分类"统计
    const uncategorizedResult = await client.query(`
      SELECT COUNT(*) as post_count
      FROM posts 
      WHERE category IS NULL OR category = '' OR category = '未分类'
    `);
    
    const uncategorizedCount = parseInt(uncategorizedResult.rows[0].post_count);
    
    // 如果有未分类文章，添加到列表
    if (uncategorizedCount > 0) {
      categories.unshift({
        id: 'cat_uncategorized',
        name: '未分类',
        description: '系统默认分类',
        created_at: new Date().toISOString(),
        post_count: uncategorizedCount
      });
    }
    
    client.release();
    
    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({
      success: false,
      error: '获取分类失败'
    });
  }
}

// 更新分类名称
async function updateCategory(req, res) {
  try {
    const { oldName, newName } = req.body;
    
    if (!oldName || !newName) {
      return res.status(400).json({
        success: false,
        error: '分类名称不能为空'
      });
    }
    
    if (oldName === '未分类') {
      return res.status(400).json({
        success: false,
        error: '系统默认分类不可修改'
      });
    }
    
    const client = await pool.connect();
    
    // 更新所有使用该分类的文章
    const result = await client.query(`
      UPDATE posts 
      SET category = $1, updated_at = CURRENT_TIMESTAMP
      WHERE category = $2
      RETURNING id
    `, [newName, oldName]);
    
    client.release();
    
    res.json({
      success: true,
      data: {
        updatedCount: result.rowCount,
        message: `分类 "${oldName}" 已重命名为 "${newName}"`
      }
    });
    
  } catch (error) {
    console.error('更新分类失败:', error);
    res.status(500).json({
      success: false,
      error: '更新分类失败'
    });
  }
}

// 删除分类（将相关文章设为未分类）
async function deleteCategory(req, res) {
  try {
    const { categoryName } = req.body;
    
    if (!categoryName) {
      return res.status(400).json({
        success: false,
        error: '分类名称不能为空'
      });
    }
    
    if (categoryName === '未分类') {
      return res.status(400).json({
        success: false,
        error: '系统默认分类不可删除'
      });
    }
    
    const client = await pool.connect();
    
    // 将使用该分类的文章设为未分类
    const result = await client.query(`
      UPDATE posts 
      SET category = '未分类', updated_at = CURRENT_TIMESTAMP
      WHERE category = $1
      RETURNING id
    `, [categoryName]);
    
    client.release();
    
    res.json({
      success: true,
      data: {
        updatedCount: result.rowCount,
        message: `分类 "${categoryName}" 已删除，${result.rowCount} 篇文章已设为未分类`
      }
    });
    
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({
      success: false,
      error: '删除分类失败'
    });
  }
}

module.exports = async (req, res) => {
  // 分类管理需要管理员权限
  const authResult = await authenticate(req);
  if (!authResult.success) {
    return res.status(401).json({
      success: false,
      error: '需要管理员权限'
    });
  }
  
  switch (req.method) {
    case 'GET':
      return getCategories(req, res);
    case 'PUT':
      return updateCategory(req, res);
    case 'DELETE':
      return deleteCategory(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({
        success: false,
        error: '方法不被允许'
      });
  }
};