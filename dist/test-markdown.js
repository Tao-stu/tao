// 简单的 Markdown 测试脚本
// 可以在浏览器控制台中运行

// 测试 markdown 内容
const testMarkdown = `
# 标题测试
这是一个段落，包含\`行内代码\`和**粗体文本**。

## 代码块测试

\`\`\`javascript
function hello() {
  console.log('Hello World');
}
\`\`\`

## HTML标签测试

<div class='test'>
  <p>这是一个HTML段落</p>
</div>

<script type='text/javascript'>
const x = 10;
console.log(x);
</script>

<style>
.test { color: red; }
</style>

## 列表测试
- 项目1
- 项目2
- 项目3

## 链接和图片
[链接文本](https://example.com)
`;

// 如果在浏览器环境中，可以测试 markdown 渲染
if (typeof window !== 'undefined') {
  console.log('Markdown 测试内容:');
  console.log(testMarkdown);
  
  // 这里可以导入 markdownToHtml 函数进行测试
  // import { markdownToHtml } from '/src/utils/markdown.js';
  // console.log(markdownToHtml(testMarkdown));
}

console.log('测试脚本已加载，请在浏览器控制台中运行测试');