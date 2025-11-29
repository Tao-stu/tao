<template>
  <div class="code-block-wrapper" :class="isDark ? 'dark' : 'light'">
    <!-- 工具栏 -->
    <div class="code-block-header">
      <!-- 左上角：语言选择器或语言显示 -->
      <div class="code-block-lang-selector">
        <select 
          v-if="showLanguageSelector"
          v-model="selectedLang" 
          @change="handleLangChange"
          class="lang-select"
          :class="isDark ? 'dark' : 'light'"
        >
          <option value="auto">自动检测</option>
          <option v-for="lang in supportedLanguages" :key="lang" :value="lang">
            {{ lang }}
          </option>
        </select>
        <span v-else class="lang-display" :class="isDark ? 'dark' : 'light'">
          {{ displayLanguage }}
        </span>
      </div>
      
      <!-- 右上角：复制按钮 -->
      <button 
        @click="copyToClipboard"
        class="copy-button"
        :class="isDark ? 'dark' : 'light'"
        :title="copied ? '已复制！' : '复制代码'"
      >
        <svg v-if="!copied" class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2"/>
        </svg>
        <svg v-else class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20 6 9 17 4 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="copy-text sr-only">{{ copied ? '已复制' : '复制' }}</span>
      </button>
    </div>
    
    <!-- 横线分隔 -->
    <div class="code-block-divider" :class="isDark ? 'dark' : 'light'"></div>
    
    <!-- 代码内容区域 -->
    <div class="code-block-content">
      <!-- 代码 -->
      <div class="code-block-code-wrapper" ref="codeWrapperRef">
        <pre class="code-block-pre"><code 
          ref="codeRef"
          :class="`hljs language-${selectedLang === 'auto' ? detectedLang : selectedLang}`"
          v-html="highlightedCode"
        ></code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { useTheme } from '../composables/useTheme'

const props = defineProps({
  code: {
    type: [String, Object],
    required: true,
    default: ''
  },
  language: {
    type: String,
    default: 'auto'
  },
  showLanguageSelector: {
    type: Boolean,
    default: true
  },
  editable: {
    type: Boolean,
    default: false
  },
  codeBlockIndex: {
    type: Number,
    default: -1
  }
})

const emit = defineEmits(['language-change'])

const { isDark } = useTheme()

// 支持的编程语言列表
const supportedLanguages = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
  'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'dart', 'scala',
  'html', 'css', 'scss', 'sass', 'less', 'json', 'xml', 'yaml',
  'sql', 'bash', 'shell', 'powershell', 'dockerfile', 'markdown',
  'vue', 'jsx', 'tsx', 'vue-html'
]

// 选中的语言
const selectedLang = ref(props.language || 'auto')
// 检测到的语言
const detectedLang = ref('')
// 高亮后的代码
const highlightedCode = ref('')
// 是否已复制
const copied = ref(false)
// 行数
const lineCount = ref(1)

// 显示的语言（用于只读模式）
const displayLanguage = computed(() => {
  if (selectedLang.value === 'auto') {
    return detectedLang.value || 'plaintext'
  }
  return selectedLang.value
})

// 代码包装器引用
const codeWrapperRef = ref(null)
const codeRef = ref(null)

// 转义 HTML（已取消转义）
function escapeHtml(text) {
  // 完全取消HTML转义，管理员可信任
  return text == null || text === undefined ? '' : String(text)
}

// 高亮代码
function highlightCode(code, lang) {
  // 确保 code 是字符串，防止 Object 转换问题
  let codeStr = ''
  if (code == null || code === undefined) {
    codeStr = ''
  } else if (typeof code === 'string') {
    codeStr = code
  } else if (typeof code === 'object') {
    // 如果是对象，尝试转换为字符串
    try {
      codeStr = JSON.stringify(code, null, 2)
    } catch (e) {
      codeStr = String(code)
    }
  } else {
    codeStr = String(code)
  }
  
  // 计算行数（保留空行，使用原始代码）
  const lines = codeStr.split('\n')
  lineCount.value = Math.max(1, lines.length)
  
  // 如果指定了语言且 highlight.js 支持
  if (lang && lang !== 'auto' && hljs.getLanguage(lang)) {
    try {
      // 直接使用原始代码进行高亮，保留所有格式
      const result = hljs.highlight(codeStr, { language: lang })
      return result.value || escapeHtml(codeStr)
    } catch (err) {
      console.warn('代码高亮失败:', err)
      return escapeHtml(codeStr)
    }
  }
  
  // 自动检测语言
  if (codeStr) {
    try {
      // 使用新的自动检测API
      const result = hljs.highlightAuto ? hljs.highlightAuto(codeStr) : hljs.highlight(codeStr, { language: 'plaintext' })
      detectedLang.value = result.language || 'plaintext'
      return result.value || escapeHtml(codeStr)
    } catch (err) {
      return escapeHtml(codeStr)
    }
  }
  
  return escapeHtml(codeStr)
}

// 处理语言变化
function handleLangChange() {
  updateHighlight()
  
  // 如果是可编辑模式，通知父组件更新Markdown源码
  if (props.editable && props.codeBlockIndex >= 0) {
    emit('language-change', {
      index: props.codeBlockIndex,
      language: selectedLang.value === 'auto' ? detectedLang.value : selectedLang.value
    })
  }
}

// 更新高亮
function updateHighlight() {
  // 确保 code 是字符串
  let codeStr = ''
  if (props.code == null || props.code === undefined) {
    codeStr = ''
  } else if (typeof props.code === 'string') {
    codeStr = props.code
  } else if (typeof props.code === 'object') {
    // 如果是对象，尝试转换为字符串
    try {
      codeStr = JSON.stringify(props.code, null, 2)
    } catch (e) {
      codeStr = String(props.code)
    }
  } else {
    codeStr = String(props.code)
  }
  
  const lang = selectedLang.value === 'auto' ? detectedLang.value : selectedLang.value
  highlightedCode.value = highlightCode(codeStr, lang)
}



// 复制到剪贴板
async function copyToClipboard() {
  try {
    // 确保获取的是字符串格式的代码
    let codeText = ''
    if (props.code == null || props.code === undefined) {
      codeText = ''
    } else if (typeof props.code === 'string') {
      codeText = props.code
    } else if (typeof props.code === 'object') {
      // 如果是对象，转换为格式化的 JSON
      try {
        codeText = JSON.stringify(props.code, null, 2)
      } catch (e) {
        codeText = String(props.code)
      }
    } else {
      codeText = String(props.code)
    }
    
    await navigator.clipboard.writeText(codeText)
    copied.value = true
    
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案
    try {
      let codeText = ''
      if (props.code == null || props.code === undefined) {
        codeText = ''
      } else if (typeof props.code === 'string') {
        codeText = props.code
      } else {
        codeText = String(props.code)
      }
      
      const textArea = document.createElement('textarea')
      textArea.value = codeText
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (e) {
      alert('复制失败，请手动复制')
    }
  }
}

// 监听代码变化
watch(() => props.code, () => {
  updateHighlight()
}, { immediate: true })

// 监听语言变化
watch(() => props.language, (newLang) => {
  if (newLang && newLang !== selectedLang.value) {
    selectedLang.value = newLang
    updateHighlight()
  }
})

onMounted(() => {
  updateHighlight()
})
</script>

<style scoped>
.code-block-wrapper {
  @apply rounded-lg overflow-hidden my-4;
  background-color: var(--tokyo-night-bg);
  border: 1px solid var(--tokyo-night-terminal-black);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.light .code-block-wrapper {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.code-block-header {
  @apply flex items-center justify-between px-4 py-2;
  background-color: var(--tokyo-night-bg-highlight);
  border-bottom: 1px solid var(--tokyo-night-terminal-black);
}

.light .code-block-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;
}

.code-block-lang-selector {
  @apply flex items-center;
}

.lang-select {
  @apply px-3 py-1 rounded text-sm font-medium outline-none transition-all;
  background-color: var(--tokyo-night-bg-highlight);
  border: 1px solid var(--tokyo-night-blue);
  color: var(--tokyo-night-fg);
  cursor: pointer;
}

.lang-select.dark {
  color: var(--tokyo-night-fg);
  background-color: var(--tokyo-night-bg-highlight);
  border-color: var(--tokyo-night-blue);
}

.lang-select.dark:hover {
  background-color: var(--tokyo-night-terminal-black);
  border-color: var(--tokyo-night-cyan);
  box-shadow: 0 0 8px rgba(125, 203, 255, 0.3);
}

.lang-select.light {
  color: #1f2937;
  background-color: rgba(255, 255, 255, 0.9);
  border-color: #2563eb;
}

.lang-select.light:hover {
  background-color: #f3f4f6;
  border-color: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
}

.lang-display {
  @apply px-3 py-1 rounded text-sm font-medium;
  background-color: var(--tokyo-night-bg-highlight);
  border: 1px solid var(--tokyo-night-blue);
  color: var(--tokyo-night-fg);
  user-select: none;
}

.lang-display.dark {
  color: var(--tokyo-night-fg);
  background-color: var(--tokyo-night-bg-highlight);
  border-color: var(--tokyo-night-blue);
}

.lang-display.light {
  color: #1f2937;
  background-color: rgba(255, 255, 255, 0.9);
  border-color: #2563eb;
}

.copy-button {
  @apply flex items-center justify-center px-3 py-1 rounded text-sm font-medium transition-all;
  cursor: pointer;
  width: 40px;
  height: 32px;
}

.copy-button.dark {
  color: var(--tokyo-night-fg);
  background-color: var(--tokyo-night-bg-highlight);
  border: 1px solid var(--tokyo-night-blue);
}

.copy-button.dark:hover {
  background-color: var(--tokyo-night-terminal-black);
  border-color: var(--tokyo-night-cyan);
  box-shadow: 0 0 8px rgba(125, 203, 255, 0.3);
}

.copy-button.light {
  color: #1f2937;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #2563eb;
}

.copy-button.light:hover {
  background-color: #f3f4f6;
  border-color: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
}

.copy-icon {
  @apply w-4 h-4;
}

.copy-text {
  @apply text-xs;
  @apply sr-only;
}

.code-block-divider {
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    var(--tokyo-night-blue), 
    transparent);
}

.code-block-divider.light {
  background: linear-gradient(90deg, 
    transparent, 
    #2563eb, 
    transparent);
}

.code-block-content {
  @apply relative;
  max-height: 600px;
  overflow: auto;
  padding-top: 1rem;
}

.code-block-code-wrapper {
  @apply w-full;
  padding-top: 0;
  padding-bottom: 1rem;
  margin: 0;
}

.code-block-pre {
  @apply m-0;
  background-color: transparent;
  font-family: 'JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--tokyo-night-fg);
  padding: 0;
  padding-left: 1rem;
  padding-right: 1rem;
  margin: 0;
  border: none;
  border-radius: 0;
  padding-top: 0;
}

.light .code-block-pre {
  color: #1f2937;
}

.code-block-pre code {
  @apply block;
  background-color: transparent !important;
  padding: 0;
  margin: 0;
  font-size: inherit;
  line-height: 1.6 !important;
  color: inherit;
  border: none;
  border-radius: 0;
}

/* 确保代码正常显示 */
.code-block-pre code :deep(*) {
  display: inline;
  line-height: 1.6 !important;
  margin: 0;
  padding: 0;
}

/* 确保代码行与行号对齐 */
.code-block-pre code :deep(br) {
  line-height: 1.6;
}

/* 自定义滚动条 */
.code-block-content::-webkit-scrollbar,
.code-block-code-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-block-content::-webkit-scrollbar-track,
.code-block-code-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.code-block-content::-webkit-scrollbar-thumb,
.code-block-code-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.code-block-content::-webkit-scrollbar-thumb:hover,
.code-block-code-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>