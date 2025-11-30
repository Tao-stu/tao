import { config } from 'dotenv';
import { getDatabaseClient } from './api/utils/db.js';

// 加载环境变量
config({ path: '.env.local' });

async function checkDatabaseStructure() {
  try {
    console.log('正在检查数据库结构...');
    const db = await getDatabaseClient();
    
    // 检查posts表结构
    console.log('\n=== POSTS表结构 ===');
    if (db.pool) {
      const result = await db.pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'posts'
        ORDER BY ordinal_position
      `);
      console.table(result.rows);
    } else {
      const result = await db.sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'posts'
        ORDER BY ordinal_position
      `;
      console.table(result);
    }
    
    // 检查categories表是否存在
    console.log('\n=== CATEGORIES表检查 ===');
    try {
      if (db.pool) {
        const tableResult = await db.pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'categories'
          );
        `);
        console.log('Categories表是否存在:', tableResult.rows[0].exists);
        
        if (tableResult.rows[0].exists) {
          const catResult = await db.pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'categories'
            ORDER BY ordinal_position
          `);
          console.table(catResult.rows);
        }
      } else {
        const tableResult = await db.sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'categories'
          );
        `;
        console.log('Categories表是否存在:', tableResult[0].exists);
        
        if (tableResult[0].exists) {
          const catResult = await db.sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'categories'
            ORDER BY ordinal_position
          `;
          console.table(catResult);
        }
      }
    } catch (err) {
      console.log('检查categories表时出错:', err.message);
    }
    
    if (db.end) await db.end();
  } catch (error) {
    console.error('数据库连接失败:', error.message);
  }
}

checkDatabaseStructure();