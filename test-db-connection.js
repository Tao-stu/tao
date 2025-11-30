import { config } from 'dotenv';
import { getDatabaseClient } from './api/utils/db.js';

// 加载环境变量
config({ path: '.env.local' });

async function testDatabaseConnection() {
  try {
    console.log('正在测试数据库连接...');
    const db = await getDatabaseClient();
    console.log('数据库连接成功!');
    
    // 测试查询
    if (db.pool) {
      const result = await db.pool.query('SELECT NOW() as current_time');
      console.log('数据库查询结果:', result.rows[0]);
    } else if (db.db) {
      // SQLite
      const result = await db.db.get('SELECT datetime("now") as current_time');
      console.log('数据库查询结果 (SQLite):', result);
    } else {
      const result = await db.sql`SELECT NOW() as current_time`;
      console.log('数据库查询结果:', result);
    }
    
    // 测试分类表是否存在
    console.log('检查分类表...');
    if (db.pool) {
      const tableResult = await db.pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'categories'
        );
      `);
      console.log('分类表是否存在:', tableResult.rows[0].exists);
    } else if (db.db) {
      // SQLite
      const tableResult = await db.db.get(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='categories'
      `);
      console.log('分类表是否存在 (SQLite):', !!tableResult);
    } else {
      const tableResult = await db.sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'categories'
        );
      `;
      console.log('分类表是否存在:', tableResult[0].exists);
    }
    
    if (db.end) await db.end();
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    console.error('错误详情:', error.stack);
  }
}

testDatabaseConnection();