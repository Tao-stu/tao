import { config } from 'dotenv';

// 加载SQLite环境配置（不包含PostgreSQL）
config({ 
  path: '.env.sqlite'
});

console.log('环境变量检查:');
console.log('POSTGRES_URL:', process.env.POSTGRES_URL);
console.log('POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING);

// 测试categories API
async function testCategoriesAPI() {
  try {
    console.log('\n=== 测试Categories API ===');
    
    // 模拟请求对象
    const req = {
      method: 'GET',
      headers: {},
      query: {},
      body: {}
    };
    
    // 模拟响应对象
    let responseData = null;
    let statusCode = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
            console.log('响应状态:', statusCode);
            console.log('响应数据:', JSON.stringify(data, null, 2));
          }
        };
      },
      setHeader: () => {},
      end: () => {}
    };
    
    // 导入并执行API处理器
    const categoriesHandler = await import('./api/categories/index.js');
    await categoriesHandler.default(req, res);
    
  } catch (error) {
    console.error('测试失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

testCategoriesAPI();