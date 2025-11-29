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
            rows="1"
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



      <!-- 正文内容 -->
      <div>
        <label class="block text-sm font-medium mb-2 transition-colors" 
               :class="isDark ? 'text-white' : 'text-gray-800'">
          正文内容 
        </label>
        <div class="border rounded-lg transition-colors" 
             :class="isDark ? 'border-tokyo-night-blue' : 'border-gray-300'">
          <textarea 
            ref="editorTextarea"
            v-model="formData.content"
            @keydown="handleKeyDown"
            @input="handleInput"
            rows="20"
            placeholder="在这里使用 Markdown 语法编写文章内容..."
            class="w-full p-4 resize-none focus:outline-none transition-colors rounded-lg"
            style="font-family: 'Microsoft YaHei', '微软雅黑', sans-serif; font-size: 14px; line-height: 1.6;"
            :class="isDark 
              ? 'bg-tokyo-night-bg text-white placeholder-gray-400' 
              : 'bg-white text-gray-900 placeholder-gray-500'"
          ></textarea>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useTheme } from '../composables/useTheme'
import { markdownToHtml } from '../utils/markdown'

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





// 监听器
watch(() => props.post, (newPost) => {
  console.log('[BlogEditor] watch post 触发', {
    hasPost: !!newPost,
    postId: newPost?.id,
    postTitle: newPost?.title,
    postSlug: newPost?.slug,
    postContentLength: newPost?.content?.length || 0,
    postObject: newPost
  })
  
  if (newPost) {
    // 确保所有字段都有默认值，特别是 content
    const originalFormData = { ...formData.value }
    
    // 处理 slug：null 或 undefined 转换为空字符串，用于显示
    const slugValue = (newPost.slug === null || newPost.slug === undefined) ? '' : String(newPost.slug)
    
    formData.value = {
      title: newPost.title || '',
      slug: slugValue,
      summary: newPost.summary || '',
      content: newPost.content || '',
      location: newPost.location || '',
      cover: newPost.cover || '',
      tags: Array.isArray(newPost.tags) ? [...newPost.tags] : [],
      status: newPost.status || (newPost.published ? 'published' : 'draft')
    }
    tagsInput.value = formData.value.tags.join(', ')
    showOptionalFields.value = !!(newPost.slug || newPost.location || newPost.cover)
    
    console.log('[BlogEditor] 表单数据已更新', {
      before: {
        title: originalFormData.title,
        contentLength: originalFormData.content?.length || 0
      },
      after: {
        title: formData.value.title,
        slug: formData.value.slug,
        contentLength: formData.value.content?.length || 0,
        summary: formData.value.summary,
        location: formData.value.location,
        cover: formData.value.cover,
        tagsCount: formData.value.tags.length,
        status: formData.value.status
      },
      showOptionalFields: showOptionalFields.value
    })
  } else {
    console.log('[BlogEditor] post 为 null，重置表单')
    resetForm()
  }
}, { immediate: true, deep: true })

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





const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// 表单验证
const validateForm = () => {
  const errors = []
  
  if (!formData.value.title || formData.value.title.trim() === '') {
    errors.push('文章标题不能为空')
  }
  
  if (!formData.value.content || formData.value.content.trim() === '') {
    errors.push('文章内容不能为空')
  }
  
  // 验证 slug 格式（如果提供）
  if (formData.value.slug && formData.value.slug.trim() !== '') {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(formData.value.slug)) {
      errors.push('文章别名只能包含小写字母、数字和连字符，且不能以连字符开头或结尾')
    }
  }
  
  return errors
}

// HTML转义函数（已取消转义）
const escapeHtml = (text) => {
  // 完全取消HTML转义，管理员可信任
  return text || ''
}

// 处理内容，保留Markdown语法但不转义HTML标签
const sanitizeContent = (content) => {
  if (!content) return content
  
  // 由于只有管理员能写文章，不进行HTML转义
  // 直接返回原始内容
  return content
}

const saveDraft = () => {
  console.log('[BlogEditor] saveDraft 开始执行', {
    formData: {
      title: formData.value.title,
      slug: formData.value.slug,
      contentLength: formData.value.content?.length || 0,
      tags: formData.value.tags
    }
  })
  
  // 验证表单（草稿模式允许标题或内容为空）
  const errors = validateForm()
  if (errors.length > 0 && formData.value.title.trim() === '' && formData.value.content.trim() === '') {
    alert(errors.join('\n'))
    return
  }
  
  const data = { 
    ...formData.value, 
    status: 'draft',
    content: sanitizeContent(formData.value.content)
  }
  const originalSlug = data.slug
  
  if (!data.slug && data.title) {
    data.slug = generateSlug(data.title)
    console.log('[BlogEditor] 自动生成 slug', {
      title: data.title,
      generatedSlug: data.slug
    })
  }
  
  console.log('[BlogEditor] 发送保存草稿事件', {
    originalSlug,
    finalSlug: data.slug,
    data: {
      ...data,
      contentLength: data.content?.length || 0
    }
  })
  
  emit('save', data)
}

const publish = () => {
  console.log('[BlogEditor] publish 开始执行', {
    formData: {
      title: formData.value.title,
      slug: formData.value.slug,
      contentLength: formData.value.content?.length || 0,
      tags: formData.value.tags
    }
  })
  
  // 发布前必须验证表单
  const errors = validateForm()
  if (errors.length > 0) {
    alert(errors.join('\n'))
    return
  }
  
  const data = { 
    ...formData.value, 
    status: 'published',
    content: sanitizeContent(formData.value.content)
  }
  const originalSlug = data.slug
  
  if (!data.slug && data.title) {
    data.slug = generateSlug(data.title)
    console.log('[BlogEditor] 自动生成 slug', {
      title: data.title,
      generatedSlug: data.slug
    })
  }
  
  console.log('[BlogEditor] 发送发布事件', {
    originalSlug,
    finalSlug: data.slug,
    data: {
      ...data,
      contentLength: data.content?.length || 0
    }
  })
  
  emit('save', data)
}

// 处理键盘事件（自动缩进）
const handleKeyDown = (event) => {
  const textarea = event.target
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  
  // Tab 键：插入 2 个空格（自动缩进）
  if (event.key === 'Tab') {
    event.preventDefault()
    
    const beforeCursor = formData.value.content.substring(0, start)
    const afterCursor = formData.value.content.substring(end)
    
    // 如果按 Shift+Tab，减少缩进
    if (event.shiftKey) {
      // 查找当前行的开始位置
      const lineStart = beforeCursor.lastIndexOf('\n') + 1
      const currentLine = beforeCursor.substring(lineStart)
      
      // 如果行首有 2 个空格，删除它们
      if (currentLine.startsWith('  ')) {
        const newStart = start - 2
        formData.value.content = formData.value.content.substring(0, lineStart) + 
                          currentLine.substring(2) + 
                          afterCursor
        setTimeout(() => {
          textarea.setSelectionRange(newStart, newStart)
        }, 10)
      }
    } else {
      // 普通 Tab：插入 2 个空格
      const indent = '  '
      formData.value.content = beforeCursor + indent + afterCursor
      setTimeout(() => {
        textarea.setSelectionRange(start + indent.length, start + indent.length)
      }, 10)
    }
  }
  
  // Enter 键：自动继承上一行的缩进（在默认行为之后处理）
  if (event.key === 'Enter') {
    // 不阻止默认行为，让换行先发生
    setTimeout(() => {
      const newStart = textarea.selectionStart
      const beforeCursor = formData.value.content.substring(0, newStart - 1) // -1 因为已经插入了换行
      const lineStart = beforeCursor.lastIndexOf('\n') + 1
      const currentLine = beforeCursor.substring(lineStart)
      
      // 计算上一行的前导空格
      const indentMatch = currentLine.match(/^(\s*)/)
      if (indentMatch) {
        const indent = indentMatch[1]
        
        // 如果上一行以某些字符结尾，可能需要额外缩进
        const trimmedLine = currentLine.trim()
        const needsExtraIndent = /[{\[(:]$/.test(trimmedLine)
        
        // 在当前位置插入缩进
        const afterCursor = formData.value.content.substring(newStart)
        const newIndent = indent + (needsExtraIndent ? '  ' : '')
        const indentLength = newIndent.length
        formData.value.content = formData.value.content.substring(0, newStart) + newIndent + afterCursor
        
        // 设置光标位置
        setTimeout(() => {
          textarea.setSelectionRange(newStart + indentLength, newStart + indentLength)
        }, 10)
      }
    }, 0)
  }
}

// 处理输入事件（用于其他自动格式化）
const handleInput = (event) => {
  // 可以在这里添加其他自动格式化逻辑
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