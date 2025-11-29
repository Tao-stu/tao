const { markdownToHtml, parseMarkdownParts } = require('./src/utils/markdown.js');

// 测试基本的markdown语法
const testMarkdown = `# 标题测试
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
![图片描述](https://example.com/image.jpg)`;

console.log('=== 测试 markdownToHtml ===');
console.log(markdownToHtml(testMarkdown));

console.log('\n=== 测试 parseMarkdownParts ===');
const parts = parseMarkdownParts(testMarkdown);
console.log(JSON.stringify(parts, null, 2));