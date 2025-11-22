// Vercel Serverless Function - 修改密码 API
import { hashPassword, verifyPassword, authenticateRequest } from '../utils/auth.js';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // 验证认证状态
  const authResult = authenticateRequest(req);
  if (!authResult) {
    return res.status(401).json({
      success: false,
      error: '未授权，请先登录'
    });
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;

  // 验证必填字段
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      error: '所有字段都是必填的'
    });
  }

  // 验证新密码确认
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      error: '新密码与确认密码不匹配'
    });
  }

  // 验证新密码长度
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: '新密码长度至少为6位'
    });
  }

  try {
    // 获取当前密码哈希
    const { getStoredPasswordHash } = await import('../utils/auth.js');
    const currentHash = getStoredPasswordHash();

    // 验证当前密码
    const isValidCurrentPassword = verifyPassword(currentPassword, currentHash);
    if (!isValidCurrentPassword) {
      return res.status(400).json({
        success: false,
        error: '当前密码错误'
      });
    }

    // 生成新密码哈希
    const newPasswordHash = hashPassword(newPassword);

    // 在生产环境中，这里应该更新数据库或环境变量
    // 由于我们使用环境变量存储密码哈希，这里只能返回新的哈希值
    // 用户需要手动更新环境变量
    console.log('密码修改成功，新的哈希值：', newPasswordHash);
    console.log('请将以下环境变量添加到你的部署配置中：');
    console.log(`ADMIN_PASSWORD_HASH=${newPasswordHash}`);

    return res.status(200).json({
      success: true,
      data: {
        message: '密码修改成功！',
        newPasswordHash,
        envVar: `ADMIN_PASSWORD_HASH=${newPasswordHash}`,
        note: '请将新的密码哈希值添加到环境变量中以永久生效'
      }
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误，请稍后再试'
    });
  }
}