<template>
  <div class="glass-effect rounded-3xl p-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold transition-colors" 
          :class="isDark ? 'text-white' : 'text-gray-800'">
        {{ post ? '编辑文章' : '写新文章' }}
      </h2>
      <div class="flex gap-2">
        <button 
          @click="$emit('cancel')"
          class="px-4 py-2 rounded-lg border font-medium transition-all"
          :class="isDark 
            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
        >
          取消
        </button>
        <button 
          @click="saveDraft"
          :disabled="isSaving"
          class="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
          :class="isDark 
            ? 'bg-gray-700 text-white hover:bg-gray-600' 
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'"
        >
          {{ isSaving ? '保存中...' : '保存草稿' }}
        </button>
        <button 
          @click="publish"
          :disabled="isSaving"
          class="px-4 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-50"
          :class="isDark 
            ? 'bg-tokyo-night-blue hover:bg-tokyo-night-blue0' 
            : 'bg-blue-600 hover:bg-blue-700'"
        >
          {{ isSaving ? '发布中...' : '发布文章' }}
        </button>
      </div>
    </div>

    <form @submit.prevent="publish" class="space-y-6">
      <!-- 文章标题 -->
      <div>
        <label class="block text-sm font-medium mb-2 transition-colors" 
               :class="isDark ? 'text-white' : 'text-gray-800'">
          文章标题 *
        </label>
        <input 
          type="text" 
          v-model="formData.title"
          required
          placeholder="输入文章标题"
          class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          :class="isDark 
            ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
        />
      </div>

      <!-- 可选字段 -->
      <div class="space-y-4">
        <!-- 可选字段开关 -->
        <div class="flex items-center gap-3">
          <input 
            type="checkbox" 
            id="showOptionalFields"
            v-model="showOptionalFields"
            class="w-4 h-4 text-tokyo-night-blue rounded focus:ring-tokyo-night-blue"
          />
          <label for="showOptionalFields" class="text-sm font-medium transition-colors cursor-pointer"
                 :class="isDark ? 'text-white' : 'text-gray-800'">
            可选字段（别名、地点、封面图）
          </label>
        </div>

        <!-- 可选字段内容 -->
        <div v-if="showOptionalFields" class="space-y-4 pl-7 border-l-2 border-tokyo-night-blue/20">
          <!-- 文章别名 -->
          <div>
            <label class="block text-sm font-medium mb-2 transition-colors" 
                   :class="isDark ? 'text-white' : 'text-gray-800'">
              文章别名 (URL)
            </label>
            <input 
              type="text" 
              v-model="formData.slug"
              placeholder="article-url-slug"
              class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              :class="isDark 
                ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
            />
          </div>

          <!-- 地点 -->
          <div>
            <label class="block text-sm font-medium mb-2 transition-colors" 
                   :class="isDark ? 'text-white' : 'text-gray-800'">
              地点
            </label>
            <input 
              type="text" 
              v-model="formData.location"
              placeholder="文章相关地点（可选）"
              class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              :class="isDark 
                ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
            />
          </div>

          <!-- 封面图片 -->
          <div>
            <label class="block text-sm font-medium mb-2 transition-colors" 
                   :class="isDark ? 'text-white' : 'text-gray-800'">
              封面图片URL
            </label>
            <input 
              type="url" 
              v-model="formData.cover"
              placeholder="https://example.com/image.jpg"
              class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              :class="isDark 
                ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
            />
          </div>
        </div>
      </div>

      <!-- 标签和摘要放在一行 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 文章摘要 -->
        <div>
          <label class="block text-sm font-medium mb-2 transition-colors" 
                 :class="isDark ? 'text-white' : 'text-gray-800'">
            文章摘要
          </label>
          <textarea 
            v-model="formData.summary"
            rows="3"
            placeholder="输入文章摘要（可选）"
            class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            :class="isDark 
              ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
          ></textarea>
        </div>

        <!-- 标签 -->
        <div>
          <label class="block text-sm font-medium mb-2 transition-colors" 
                 :class="isDark ? 'text-white' : 'text-gray-800'">
            标签 (用逗号分隔)
          </label>
          <input 
            type="text" 
            v-model="tagsInput"
            placeholder="Vue3, JavaScript, 前端开发"
            class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            :class="isDark 
              ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
          />
        </div>
      </div>



      <!-- 编辑器工具栏 -->
      <div class="border rounded-t-lg transition-colors" 
           :class="isDark ? 'border-tokyo-night-blue' : 'border-gray-300'">
        <div class="flex flex-wrap gap-1 p-3 border-b transition-colors" 
             :class="isDark ? 'border-tokyo-night-bg-highlight bg-tokyo-night-bg-highlight' : 'border-gray-200 bg-gray-50'">
          <button 
            type="button"
            v-for="tool in editorTools" 
            :key="tool.name"
            @click="insertMarkdown(tool.markdown)"
            class="px-3 py-1 rounded text-sm font-medium transition-all hover:scale-105"
            :class="isDark 
              ? 'bg-tokyo-night-bg text-tokyo-night-fg hover:bg-tokyo-night-blue' 
              : 'bg-white text-gray-700 hover:bg-blue-100'"
            :title="tool.name"
          >
            {{ tool.icon }} {{ tool.name }}
          </button>
        </div>

        <!-- Markdown 编辑器 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <!-- 编辑区 -->
          <div class="border-r transition-colors" :class="isDark ? 'border-tokyo-night-blue' : 'border-gray-300'">
            <div class="p-3 text-sm font-medium border-b transition-colors" 
                 :class="isDark ? 'border-tokyo-night-bg-highlight bg-tokyo-night-bg-highlight text-white' : 'border-gray-200 bg-gray-50 text-gray-800'">
              Markdown 编辑器
            </div>
            <textarea 
              ref="editorTextarea"
              v-model="formData.content"
              rows="20"
              placeholder="在这里使用 Markdown 语法编写文章内容..."
              class="w-full p-4 resize-none focus:outline-none font-mono text-sm transition-colors"
              :class="isDark 
                ? 'bg-tokyo-night-bg text-white placeholder-gray-400' 
                : 'bg-white text-gray-900 placeholder-gray-500'"
            ></textarea>
          </div>

          <!-- 预览区 -->
          <div>
            <div class="p-3 text-sm font-medium border-b transition-colors" 
                 :class="isDark ? 'border-tokyo-night-bg-highlight bg-tokyo-night-bg-highlight text-white' : 'border-gray-200 bg-gray-50 text-gray-800'">
              实时预览
            </div>
            <div class="p-4 h-96 overflow-y-auto prose prose-sm max-w-none transition-colors" 
                 :class="isDark ? 'prose-invert bg-tokyo-night-bg' : 'bg-white'">
              <div v-html="markdownPreview"></div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useTheme } from '../composables/useTheme'

const { isDark } = useTheme()

// Props
const props = defineProps({
  post: {
    type: Object,
    default: null
  },
  isSaving: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['save', 'cancel'])

// 响应式数据
const showOptionalFields = ref(false)
const formData = ref({
  title: '',
  slug: '',
  summary: '',
  content: '',
  location: '',
  cover: '',
  tags: [],
  status: 'draft'
})

const tagsInput = ref('')

// 编辑器工具
const editorTools = [
  { name: '粗体', markdown: '**粗体文本**' },
  { name: '斜体', markdown: '*斜体文本*' },
  { name: '标题', markdown: '## 标题' },
  { name: '链接', markdown: '[链接文本](URL)' },
  { name: '图片', markdown: '![图片描述](图片URL)' },
  { name: '代码', markdown: '`代码`' },
  { name: '代码块', markdown: '```代码块```' },
  { name: '引用', markdown: '> 引用文本' },
  { name: '列表', markdown: '- 列表项' },
  { name: '分割线', markdown: '---' }
]

// 计算属性 - Markdown 预览
const markdownPreview = computed(() => {
  if (!formData.value.content) return '<p class="text-gray-500">在左侧编辑器中输入内容...</p>'
  
  // 简单的 Markdown 解析（生产环境建议使用专业的 Markdown 解析库）
  let html = formData.value.content
    // 标题
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // 图片
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded" />')
    // 代码
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm">$1</code>')
    // 代码块
    .replace(/```([^`]+)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto"><code>$1</code></pre>')
    // 引用
    .replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic">$1</blockquote>')
    // 分割线
    .replace(/^---$/gim, '<hr class="my-4 border-t border-gray-300 dark:border-gray-600">')
    // 列表
    .replace(/^- (.+)$/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc pl-6">$1</ul>')
    // 段落
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
  
  return html
})

// 监听器
watch(() => props.post, (newPost) => {
  if (newPost) {
    formData.value = {
      title: newPost.title || '',
      slug: newPost.slug || '',
      summary: newPost.summary || '',
      content: newPost.content || '',
      location: newPost.location || '',
      cover: newPost.cover || '',
      tags: Array.isArray(newPost.tags) ? [...newPost.tags] : [],
      status: newPost.status || 'draft'
    }
    tagsInput.value = formData.value.tags.join(', ')
    showOptionalFields.value = !!(newPost.slug || newPost.location || newPost.cover)
  } else {
    resetForm()
  }
}, { immediate: true })

watch(tagsInput, (newValue) => {
  formData.value.tags = newValue
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
})

// 方法
const resetForm = () => {
  formData.value = {
    title: '',
    slug: '',
    summary: '',
    content: '',
    location: '',
    cover: '',
    tags: [],
    status: 'draft'
  }
  tagsInput.value = ''
  showOptionalFields.value = false
}



const insertMarkdown = (markdown) => {
  const textarea = document.querySelector('textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = textarea.value
  
  const newText = text.substring(0, start) + markdown + text.substring(end)
  formData.value.content = newText
  
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + markdown.length, start + markdown.length)
  })
}

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const saveDraft = () => {
  const data = { ...formData.value, status: 'draft' }
  if (!data.slug && data.title) {
    data.slug = generateSlug(data.title)
  }
  emit('save', data)
}

const publish = () => {
  const data = { ...formData.value, status: 'published' }
  if (!data.slug && data.title) {
    data.slug = generateSlug(data.title)
  }
  emit('save', data)
}

// 生命周期
onMounted(() => {
  resetForm()
})
</script>

<style scoped>
/* 自定义样式 */
.prose h1, .prose h2, .prose h3 {
  @apply font-bold mb-4;
}

.prose h1 {
  @apply text-2xl;
}

.prose h2 {
  @apply text-xl;
}

.prose h3 {
  @apply text-lg;
}

.prose p {
  @apply mb-4 leading-relaxed;
}

.prose ul {
  @apply mb-4;
}

.prose li {
  @apply mb-2;
}

.prose blockquote {
  @apply my-4;
}

.prose hr {
  @apply my-6;
}

.prose a {
  @apply text-blue-600 hover:text-blue-800 underline;
}

.prose img {
  @apply my-4;
}

.prose pre {
  @apply my-4;
}

.prose code {
  @apply text-sm;
}

/* 复选框样式 */
input[type="checkbox"]:checked {
  @apply bg-tokyo-night-blue border-tokyo-night-blue;
}

input[type="checkbox"]:focus {
  @apply ring-2 ring-tokyo-night-blue ring-offset-2;
}
</style>