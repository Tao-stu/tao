const { authenticate } = require('../utils/auth');

// 内存存储分类数据（临时解决方案）
let categoriesData = [
  {
    id: 'cat_技术',
    name: '技术',
    description: '技术相关文章',
    created_at: '2024-01-01T00:00:00Z',
    post_count: 5
  },
  {
    id: 'cat_前端开发',
    name: '前端开发',
    description: '前端开发相关文章',
    created_at: '2024-01-02T00:00:00Z',
    post_count: 3
  },
  {
    id: 'cat_uncategorized',
    name: '未分类',
    description: '系统默认分类',
    created_at: new Date().toISOString(),
    post_count: 2
  }
];

// 获取所有分类及文章数量
async function getCategories(req, res) {
  try {
    console.log('获取分类列表...');
    
    // 返回模拟的分类数据
    res.json({
      success: true,
      data: categoriesData
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
    
    // 在内存数据中更新分类
    const categoryIndex = categoriesData.findIndex(cat => cat.name === oldName);
    if (categoryIndex > -1) {
      categoriesData[categoryIndex].name = newName;
      categoriesData[categoryIndex].id = `cat_${newName}`;
      
      console.log(`分类 "${oldName}" 已重命名为 "${newName}"`);
      
      res.json({
        success: true,
        data: {
          updatedCount: 1,
          message: `分类 "${oldName}" 已重命名为 "${newName}"`
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: '分类不存在'
      });
    }
    
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
    
    // 在内存数据中删除分类
    const categoryIndex = categoriesData.findIndex(cat => cat.name === categoryName);
    if (categoryIndex > -1) {
      const deletedCategory = categoriesData[categoryIndex];
      categoriesData.splice(categoryIndex, 1);
      
      // 更新未分类的文章数量
      const uncategorizedIndex = categoriesData.findIndex(cat => cat.name === '未分类');
      if (uncategorizedIndex > -1) {
        categoriesData[uncategorizedIndex].post_count += deletedCategory.post_count;
      }
      
      console.log(`分类 "${categoryName}" 已删除，${deletedCategory.post_count} 篇文章已设为未分类`);
      
      res.json({
        success: true,
        data: {
          updatedCount: deletedCategory.post_count,
          message: `分类 "${categoryName}" 已删除，${deletedCategory.post_count} 篇文章已设为未分类`
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: '分类不存在'
      });
    }
    
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({
      success: false,
      error: '删除分类失败'
    });
  }
}

module.exports = async (req, res) => {
  // 简化的认证检查（临时解决方案）
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || (token !== 'test-admin-token' && token !== 'admin-token')) {
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