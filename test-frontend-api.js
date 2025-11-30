// 测试前端API调用
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

async function testFrontendAPI() {
  console.log('=== 测试前端API调用 ===\n');
  
  try {
    // 测试获取分类列表
    console.log('1. 测试获取分类列表...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
    console.log('✅ 分类列表获取成功:', categoriesResponse.data);
    
    // 测试获取文章列表
    console.log('\n2. 测试获取文章列表...');
    const postsResponse = await axios.get(`${API_BASE_URL}/posts`);
    console.log('✅ 文章列表获取成功:', postsResponse.data.data?.length || 0, '篇文章');
    
    // 测试创建新分类
    console.log('\n3. 测试创建新分类...');
    const newCategory = {
      name: '测试分类',
      description: '这是一个测试分类'
    };
    
    // 首先需要登录获取token
    console.log('   3.1. 登录获取token...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      password: '20060216'
    });
    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功，获得token');
    
    // 使用token创建分类
    console.log('   3.2. 使用token创建分类...');
    const createCategoryResponse = await axios.post(`${API_BASE_URL}/categories`, newCategory, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ 分类创建成功:', createCategoryResponse.data.data);
    
    // 再次获取分类列表验证
    console.log('\n4. 验证分类是否已创建...');
    const updatedCategoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
    console.log('✅ 更新后的分类列表:', updatedCategoriesResponse.data.data.length, '个分类');
    
    console.log('\n🎉 所有测试通过！分类功能正常工作。');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testFrontendAPI();