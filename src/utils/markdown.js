import { marked } from 'marked'
import hljs from 'highlight.js'
// 导入代码高亮样式（支持暗色和亮色主题）
import 'highlight.js/styles/github-dark.css'

/**
 * 转义 HTML 标签，防止 XSS 攻击
 * 注意：由于只有管理员能写文章，这里完全取消HTML转义
 * @param {string} text - 需要转义的文本
 * @returns {string} 原始文本（完全不转义）
 */
function escapeHtml(text) {
  // 完全取消HTML转义，管理员可信任
  return text == null || text === undefined ? '' : String(text)
}


// 配置 marked，使用标准的 highlight 选项
marked.setOptions({
  highlight: function(code, lang) {
    // 确保 code 是字符串
    const codeStr = String(code || '')
    
    // 如果指定了语言且 highlight.js 支持
    if (lang && hljs.getLanguage(lang)) {
      try {
        const result = hljs.highlight(codeStr, { language: lang })
        // highlight.js 返回 { value: string, language: string, ... }
        // value 是已经高亮后的 HTML 字符串
        return result.value || codeStr // 不转义
      } catch (err) {
        console.warn('代码高亮失败:', err)
        return codeStr // 不转义
      }
    }
    
    // 如果没有指定语言或语言不支持，尝试自动检测
    if (codeStr.trim()) {
      try {
        const result = hljs.highlightAuto(codeStr)
        return result.value || codeStr // 不转义
      } catch (err) {
        return codeStr // 不转义
      }
    }
    
    // 空代码，返回原始代码
    return codeStr // 不转义
  },
  langPrefix: 'hljs language-', // 为代码块添加类名前缀
  breaks: true, // 支持 GitHub 风格的换行
  gfm: true, // 支持 GitHub 风格的 Markdown
  sanitize: false, // 禁用HTML清理
  smartLists: true,
  smartypants: false // 禁用智能标点符号转换
})

// 自定义渲染器
marked.use({
  renderer: {
    // 代码块渲染 - 添加特殊属性以便后续替换为 Vue 组件
    code(code, infostring, escaped) {
      const lang = (infostring || '').trim() || ''
      
      // code 参数：如果 escaped=true，则是高亮后的 HTML；如果 escaped=false，则是原始代码
      // 我们需要保存原始代码用于 CodeBlock 组件
      let codeStr = String(code || '')
      let rawCode = String(code || '')
      
      // 如果已经被高亮（escaped = true），我们需要从高亮 HTML 中提取原始代码
      // 但由于我们在 highlight 函数中处理，这里 code 参数实际上是原始代码
      // 为了安全，我们直接使用 code 参数作为原始代码
      if (escaped) {
        // 如果已经转义/高亮，尝试提取原始文本（简单方法：移除 HTML 标签）
        // 不进行HTML实体解码，保持原始格式
        rawCode = codeStr.replace(/<[^>]+>/g, '')
      } else {
        // 如果没有被高亮，code 就是原始代码，不转义
        rawCode = codeStr
        codeStr = rawCode // 不转义
      }
      
      // 添加语言类名
      const langClass = lang ? ` language-${lang}` : ''
      
      // 原始代码用于存储（不转义，但需要处理引号以避免HTML属性问题）
      const escapedRawCode = rawCode.replace(/"/g, '&quot;')
      
      // 返回代码块 HTML，添加特殊属性以便后续替换
      // 使用 data 属性保存原始代码和语言信息
      return `<pre data-code-block="true" data-language="${lang}" data-raw-code="${escapedRawCode}"><code class="hljs${langClass}">${codeStr}</code></pre>\n`
    },
    // 行内代码
    codespan(code) {
      const codeStr = String(code || '') // 不转义
      return `<code class="hljs">${codeStr}</code>`
    },
    // HTML 块渲染 - 直接输出 HTML，不转义
    html(html) {
      const htmlStr = String(html || '').trim()
      
      // 直接返回 HTML，不进行转义（管理员可信任）
      return htmlStr
    }
  }
})

/**
 * 清理和验证 HTML，防止 XSS 攻击
 * 注意：由于只有管理员能写文章，这里不进行HTML清理
 * @param {string} html - 需要清理的 HTML
 * @returns {string} 原始 HTML
 */
function sanitizeHtml(html) {
  // 由于只有管理员能写文章，不需要HTML安全清理
  return html || ''
}

/**
 * 渲染 Markdown 为 HTML
 * @param {string} markdown - Markdown 文本
 * @returns {string} 渲染后的 HTML
 */
export function markdownToHtml(markdown) {
  if (!markdown) return ''
  
  // 输入验证：确保 markdown 是字符串
  if (typeof markdown !== 'string') {
    console.warn('markdownToHtml: 输入必须是字符串')
    return String(markdown) // 不转义
  }
  
  try {
    // 使用 marked 渲染 Markdown
    // 段落和 HTML 标签会在 renderer 中被处理
    const html = marked.parse(markdown)
    
    // 确保返回的是字符串
    if (typeof html !== 'string') {
      console.warn('markdownToHtml: marked.parse 返回的不是字符串')
      return markdown // 不转义
    }
    
    // 清理 HTML，防止 XSS 攻击
    const safeHtml = sanitizeHtml(html)
    
    return safeHtml
  } catch (error) {
    console.error('Markdown 渲染错误:', error)
    // 如果渲染失败，返回原始文本
    return `<pre><code class="hljs">${markdown}</code></pre>` // 不转义
  }
}

/**
 * 解析 Markdown 并分离代码块和HTML内容
 * @param {string} markdown - Markdown 文本
 * @returns {Array} 解析后的部分数组，每个部分包含 type 和 html 或 code 属性
 */
export function parseMarkdownParts(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return []
  }
  
  const parts = []
  const codeBlockData = []
  
  try {
    // 使用 lexer 解析 tokens，提取代码块信息
    const tokens = marked.lexer(markdown)
    
    // 递归收集代码块
    function extractCodeBlocks(tokens) {
      for (const token of tokens) {
        if (token.type === 'code' && token.lang !== undefined) {
          let codeText = ''
          if (token.text != null && typeof token.text === 'string') {
            codeText = token.text
          } else if (token.raw != null) {
            let rawText = typeof token.raw === 'string' ? token.raw : String(token.raw)
            rawText = rawText.replace(/^```[\w-]*\n?/, '').replace(/\n?```$/, '')
            codeText = rawText
          }
          
          let language = 'auto'
          if (token.lang != null) {
            language = typeof token.lang === 'string' ? token.lang.trim() : String(token.lang).trim()
            if (!language) language = 'auto'
          }
          
          codeBlockData.push({ code: codeText, language, index: codeBlockData.length })
        }
        
        // 递归处理嵌套
        if (token.tokens) extractCodeBlocks(token.tokens)
        if (token.items) {
          token.items.forEach(item => {
            if (item.tokens) extractCodeBlocks(item.tokens)
          })
        }
      }
    }
    
    extractCodeBlocks(tokens)
    
    // 创建自定义渲染器，将代码块替换为占位符
    const renderer = new marked.Renderer()
    let codeBlockIndex = 0
    
    renderer.code = function(code, infostring) {
      const lang = (infostring || '').trim() || 'auto'
      const placeholder = `__CODE_BLOCK_${codeBlockIndex++}__`
      return placeholder
    }
    
    // 处理 HTML 块，直接输出 HTML
    renderer.html = function(html) {
      // 直接返回 HTML，不转换为代码块，不转义
      return String(html || '')
    }
    
    // 使用自定义渲染器解析
    const html = marked.parse(markdown, { renderer })
    
    // 分割 HTML 并插入代码块组件
    const placeholders = html.match(/__CODE_BLOCK_\d+__/g) || []
    
    if (placeholders.length === 0) {
      // 没有代码块，直接返回
      return [{
        type: 'html',
        html: sanitizeHtml(html)
      }]
    }
    
    let lastIndex = 0
    placeholders.forEach((placeholder, index) => {
      const placeholderIndex = html.indexOf(placeholder, lastIndex)
      const codeBlock = codeBlockData[index]
      
      // 添加占位符前的 HTML
      if (placeholderIndex > lastIndex) {
        const htmlPart = html.substring(lastIndex, placeholderIndex)
        if (htmlPart.trim()) {
          parts.push({
            type: 'html',
            html: sanitizeHtml(htmlPart)
          })
        }
      }
      
      // 添加代码块组件
      if (codeBlock) {
        parts.push({
          type: 'code',
          code: codeBlock.code,
          language: codeBlock.language,
          index: codeBlock.index
        })
      }
      
      lastIndex = placeholderIndex + placeholder.length
    })
    
    // 添加剩余的 HTML
    if (lastIndex < html.length) {
      const htmlPart = html.substring(lastIndex)
      if (htmlPart.trim()) {
        parts.push({
          type: 'html',
          html: sanitizeHtml(htmlPart)
        })
      }
    }
    
    return parts.length > 0 ? parts : [{
      type: 'html',
      html: sanitizeHtml(html)
    }]
  } catch (error) {
    console.error('Markdown 解析错误:', error)
    try {
      const html = marked.parse(markdown)
      return [{
        type: 'html',
        html: sanitizeHtml(html)
      }]
    } catch (parseError) {
      return [{
        type: 'html',
        html: `<pre><code class="hljs">${markdown}</code></pre>` // 不转义
      }]
    }
  }
}