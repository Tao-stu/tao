<template>
  <div class="markdown-renderer" :class="isDark ? 'dark' : 'light'">
    <template v-for="(part, index) in parsedParts" :key="index">
      <CodeBlock 
        v-if="part.type === 'code'" 
        :code="part.code" 
        :language="part.language"
        :show-language-selector="showLanguageSelector"
        :editable="editable"
        :code-block-index="part.index"
        @language-change="handleCodeBlockLanguageChange"
      />
      <div v-else v-html="part.html" class="markdown-content"></div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { parseMarkdownParts } from '../utils/markdown'
import CodeBlock from './CodeBlock.vue'
import { useTheme } from '../composables/useTheme'

const props = defineProps({
  markdown: {
    type: String,
    default: ''
  },
  editable: {
    type: Boolean,
    default: false
  },
  showLanguageSelector: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['language-change'])

const { isDark } = useTheme()

// 处理代码块语言变化
function handleCodeBlockLanguageChange(event) {
  emit('language-change', event)
}

// 预处理 Markdown：将 HTML 标签转换为代码块
function preprocessMarkdown(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return markdown
  }
  
  let processedMarkdown = markdown
  const replacements = []
  
  // 匹配所有 HTML 标签（包括单标签和双标签）
  // 匹配 <tag>...</tag> 或 <tag /> 格式
  const htmlTagRegex = /<([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?(?:\/>|>[\s\S]*?<\/\1>)/gi
  
  let match
  while ((match = htmlTagRegex.exec(markdown)) !== null) {
    const fullMatch = match[0]
    const tagName = match[1].toLowerCase()
    const matchIndex = match.index
    
    // 检查是否已经在代码块中
    const beforeMatch = markdown.substring(0, matchIndex)
    const codeBlockCount = (beforeMatch.match(/```/g) || []).length
    if (codeBlockCount % 2 === 1) {
      // 在代码块中，跳过
      continue
    }
    
    // 检查是否在行内代码中
    const beforeLine = beforeMatch.split('\n').pop() || ''
    const backtickCount = (beforeLine.match(/`/g) || []).length
    if (backtickCount % 2 === 1) {
      // 在行内代码中，跳过
      continue
    }
    
    // 确定语言类型
    let language = 'html'
    if (tagName === 'script') {
      // 检查 script 标签中的类型
      const typeMatch = fullMatch.match(/type\s*=\s*["']([^"']+)["']/i)
      if (typeMatch) {
        const type = typeMatch[1].toLowerCase()
        if (type.includes('javascript') || type.includes('js') || type === 'text/javascript') {
          language = 'javascript'
        } else if (type.includes('typescript') || type.includes('ts')) {
          language = 'typescript'
        } else if (type.includes('json')) {
          language = 'json'
        }
      } else {
        language = 'javascript' // 默认 JavaScript
      }
    } else if (tagName === 'style') {
      language = 'css'
    } else if (tagName === 'svg') {
      language = 'xml'
    }
    
    // 获取前面的内容（换行和缩进）
    const lineStart = beforeMatch.lastIndexOf('\n')
    const beforeLineContent = lineStart >= 0 ? beforeMatch.substring(lineStart + 1) : beforeMatch
    const indent = beforeLineContent.match(/^[ \t]*/)?.[0] || ''
    const beforeNewline = lineStart >= 0 ? '\n' : (matchIndex === 0 ? '' : '\n')
    
    // 创建代码块
    const codeBlock = `${beforeNewline}${indent}\`\`\`${language}\n${indent}${fullMatch}\n${indent}\`\`\``
    replacements.push({
      start: matchIndex,
      end: matchIndex + fullMatch.length,
      replacement: codeBlock,
      original: fullMatch
    })
  }
  
  // 从后往前替换，避免索引偏移
  replacements.reverse().forEach(replacement => {
    processedMarkdown = processedMarkdown.substring(0, replacement.start) + 
                       replacement.replacement + 
                       processedMarkdown.substring(replacement.end)
  })
  
  return processedMarkdown
}

// 解析 Markdown 并分离代码块
const parsedParts = computed(() => {
  return parseMarkdownParts(preprocessMarkdown(props.markdown))
})
</script>

<style scoped>
.markdown-renderer {
  width: 100%;
}

.markdown-content {
  max-width: none;
  line-height: 1.75;
}

/* 标题样式 */
.markdown-content :deep(h1) {
  font-size: 2.25em;
  font-weight: 800;
  margin-top: 0;
  margin-bottom: 0.8888889em;
  line-height: 1.1111111;
}

.markdown-content :deep(h2) {
  font-size: 1.5em;
  font-weight: 700;
  margin-top: 2em;
  margin-bottom: 1em;
  line-height: 1.3333333;
}

.markdown-content :deep(h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 1.6em;
  margin-bottom: 0.6em;
  line-height: 1.6;
}

.markdown-content :deep(h4) {
  font-size: 1.125em;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  line-height: 1.5555556;
}

.markdown-content :deep(h5) {
  font-size: 1em;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  line-height: 1.5555556;
}

.markdown-content :deep(h6) {
  font-size: 0.875em;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  line-height: 1.5555556;
}

/* 段落 */
.markdown-content :deep(p) {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}

/* 列表 */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  padding-left: 1.625em;
}

.markdown-content :deep(li) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.markdown-content :deep(ul > li) {
  position: relative;
  padding-left: 0.375em;
  list-style-type: disc;
}

.markdown-content :deep(ol > li) {
  position: relative;
  padding-left: 0.375em;
  list-style-type: decimal;
}

/* 引用 */
.markdown-content :deep(blockquote) {
  font-weight: 500;
  font-style: italic;
  color: inherit;
  border-left-width: 0.25rem;
  border-left-color: rgba(122, 162, 247, 0.5);
  quotes: "\201C""\201D""\2018""\2019";
  margin-top: 1.6em;
  margin-bottom: 1.6em;
  padding-left: 1em;
}

/* 链接 */
.markdown-content :deep(a) {
  color: #7aa2f7;
  text-decoration: underline;
  font-weight: 500;
}

.markdown-content :deep(a:hover) {
  color: #7dcfff;
}

/* 图片 */
.markdown-content :deep(img) {
  margin-top: 2em;
  margin-bottom: 2em;
  border-radius: 0.5rem;
}

/* 表格 */
.markdown-content :deep(table) {
  width: 100%;
  table-layout: auto;
  text-align: left;
  margin-top: 2em;
  margin-bottom: 2em;
  font-size: 0.875em;
  line-height: 1.7142857;
}

.markdown-content :deep(thead) {
  border-bottom-width: 1px;
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.markdown-content :deep(thead th) {
  color: inherit;
  font-weight: 600;
  vertical-align: bottom;
  padding-right: 0.5714286em;
  padding-bottom: 0.5714286em;
  padding-left: 0.5714286em;
}

.markdown-content :deep(tbody tr) {
  border-bottom-width: 1px;
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.markdown-content :deep(tbody td) {
  vertical-align: baseline;
  padding-top: 0.5714286em;
  padding-right: 0.5714286em;
  padding-bottom: 0.5714286em;
  padding-left: 0.5714286em;
}

/* 水平线 */
.markdown-content :deep(hr) {
  border-color: rgba(255, 255, 255, 0.1);
  border-top-width: 1px;
  margin-top: 3em;
  margin-bottom: 3em;
}

/* 强调 */
.markdown-content :deep(strong) {
  font-weight: 600;
}

.markdown-content :deep(em) {
  font-style: italic;
}

/* 行内代码样式 */
.markdown-content :deep(:not(pre) > code) {
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  background-color: rgba(110, 118, 129, 0.4);
  font-size: 0.875em;
  font-family: 'JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
}

/* 隐藏原来的代码块（会被 CodeBlock 组件替换） */
.markdown-content :deep(pre[data-code-block]) {
  display: none;
}
</style>