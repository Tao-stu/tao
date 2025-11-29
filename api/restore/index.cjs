// 动态导入数据库连接工具
async function getDatabaseClient() {
  const { getDatabaseClient } = await import('../utils/db.js');
  return await getDatabaseClient();
}

const withCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

// 执行SQL文件内容
async function executeSqlFile(sqlContent) {
  // 获取数据库客户端
  const db = await getDatabaseClient();
  const sql = db.sql;
  
  // 移除注释和空行，分割SQL语句
  const cleanSql = sqlContent
    .split('\n')
    .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
    .join('\n');
  
  // 改进的SQL语句分割，处理包含分号的字符串
  const statements = [];
  let currentStatement = '';
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < cleanSql.length; i++) {
    const char = cleanSql[i];
    
    if ((char === "'" || char === '"') && !inString) {
      inString = true;
      stringChar = char;
      currentStatement += char;
    } else if (char === stringChar && inString) {
      inString = false;
      currentStatement += char;
    } else if (char === ';' && !inString) {
      const stmt = currentStatement.trim();
      if (stmt.length > 0) {
        statements.push(stmt);
      }
      currentStatement = '';
    } else {
      currentStatement += char;
    }
  }
  
  // 添加最后一个语句（如果没有以分号结尾）
  const lastStmt = currentStatement.trim();
  if (lastStmt.length > 0) {
    statements.push(lastStmt);
  }
  
  const results = {
    executedStatements: 0,
    errors: []
  };
  
  console.log(`准备执行 ${statements.length} 条SQL语句`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      console.log(`执行语句 ${i + 1}/${statements.length}:`, statement.substring(0, 100) + '...');
      
      // 使用数据库客户端的query方法执行SQL
      if (db.query) {
        await db.query(statement);
      } else {
        // 如果没有query方法，使用sql.unsafe
        await sql.unsafe(statement);
      }
      
      results.executedStatements++;
      console.log(`语句 ${i + 1} 执行成功`);
    } catch (error) {
      console.error('SQL执行错误:', error);
      console.error('失败的语句:', statement);
      results.errors.push({
        statement: statement,
        error: error.message
      });
    }
  }
  
  // 关闭数据库连接
  if (db.end) {
    await db.end();
  }
  
  return results;
}

module.exports = async function handler(req, res) {
  withCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { sqlContent } = req.body

    if (!sqlContent) {
      return res.status(400).json({ success: false, error: '请提供SQL文件内容' })
    }

    // 验证是否是SQL内容
    if (typeof sqlContent !== 'string' || !sqlContent.trim()) {
      return res.status(400).json({ success: false, error: 'SQL文件内容无效' })
    }

    try {
      // 执行SQL文件
      const results = await executeSqlFile(sqlContent);

      if (results.errors.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'SQL文件执行完成，但部分语句执行失败',
          results
        });
      }

      return res.status(200).json({
        success: true,
        message: 'SQL文件执行成功',
        results
      });

    } catch (error) {
      console.error('SQL execution error:', error)
      return res.status(500).json({
        success: false,
        error: 'SQL执行过程中发生错误',
        details: error.message
      })
    }

  } catch (error) {
    console.error('Restore API Error:', error)
    
    // 检查是否是数据库连接错误
    if (error.message && error.message.includes('ENOTFOUND') || 
        error.message && error.message.includes('ECONNREFUSED') ||
        error.message && error.message.includes('database') ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        success: false, 
        error: '数据库连接失败，无法恢复数据'
      });
    }
    
    return res.status(500).json({ success: false, error: '恢复失败，请稍后再试' })
  }
}