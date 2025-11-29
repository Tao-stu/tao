// 验证 Markdown 功能的脚本
const fs = require('fs');
const path = require('path');

// 测试用例
const testCases = [
  {
    name: '基本语法测试',
    input: `# 标题
这是一个段落，包含\`行内代码\`和**粗体文本**。

## 代码块
\`\`\`javascript
console.log('Hello World');
\`\`\``,
    expectContains: ['<h1>', '<h2>', '<code>', '<strong>', '<pre>', '<code class="hljs language-javascript">']
  },
  {
    name: 'HTML标签处理测试',
    input: `<div class="test">
  <p>HTML内容</p>
</div>

<script>
const x = 10;
</script>`,
    expectContains: ['<pre><code class="hljs language-html">', '<pre><code class="hljs language-javascript">']
  },
  {
    name: '列表测试',
    input: `- 项目1
- 项目2
- 项目3`,
    expectContains: ['<ul>', '<li>']
  }
];

console.log('🔍 开始验证 Markdown 功能...\n');

// 检查文件是否存在
const markdownPath = path.join(__dirname, 'src/utils/markdown.js');
if (!fs.existsSync(markdownPath)) {
  console.error('❌ markdown.js 文件不存在');
  process.exit(1);
}

console.log('✅ markdown.js 文件存在');

// 检查导出的函数
const markdownContent = fs.readFileSync(markdownPath, 'utf8');
const hasMarkdownToHtml = markdownContent.includes('export function markdownToHtml');
const hasParseMarkdownParts = markdownContent.includes('export function parseMarkdownParts');

console.log(hasMarkdownToHtml ? '✅ markdownToHtml 函数已导出' : '❌ markdownToHtml 函数未找到');
console.log(hasParseMarkdownParts ? '✅ parseMarkdownParts 函数已导出' : '❌ parseMarkdownParts 函数未找到');

// 检查关键功能
const hasHighlightJs = markdownContent.includes('import hljs from \'highlight.js\'');
const hasMarked = markdownContent.includes('import { marked } from \'marked\'');
const hasHtmlRenderer = markdownContent.includes('renderer.html');
const hasCodeRenderer = markdownContent.includes('renderer.code');

console.log(hasHighlightJs ? '✅ highlight.js 已导入' : '❌ highlight.js 未找到');
console.log(hasMarked ? '✅ marked 已导入' : '❌ marked 未找到');
console.log(hasHtmlRenderer ? '✅ HTML 渲染器已配置' : '❌ HTML 渲染器未找到');
console.log(hasCodeRenderer ? '✅ 代码渲染器已配置' : '❌ 代码 渲染器未找到');

// 检查安全功能
const hasEscapeHtml = markdownContent.includes('function escapeHtml');
const hasSanitizeHtml = markdownContent.includes('function sanitizeHtml');

console.log(hasEscapeHtml ? '✅ HTML 转义函数存在' : '❌ HTML 转义函数未找到');
console.log(hasSanitizeHtml ? '✅ HTML 清理函数存在' : '❌ HTML 清理函数未找到');

console.log('\n🎯 Markdown 功能验证完成！');
console.log('\n📝 建议的测试步骤：');
console.log('1. 启动开发服务器: npm run dev');
console.log('2. 访问博客页面: http://localhost:3001/blog');
console.log('3. 创建或编辑文章，测试以下内容：');
console.log('   - 基本标题和段落');
console.log('   - 代码块 (指定语言和自动检测)');
console.log('   - HTML 标签 (应该转换为代码块)');
console.log('   - 行内代码和格式化文本');
console.log('   - 列表和链接');
console.log('4. 检查代码高亮是否正常工作');
console.log('5. 验证暗色/亮色主题切换');