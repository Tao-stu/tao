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

      <!-- 文章内容 -->
      <div>
        <label class="block text-sm font-medium mb-2 transition-colors" 
               :class="isDark ? 'text-white' : 'text-gray-800'">
          文章内容 *
        </label>
        <textarea 
          v-model="formData.content"
          required
          placeholder="输入文章内容..."
          rows="10"
          class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-vertical"
          :class="isDark 
            ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
        ></textarea>
      </div>

      <!-- 文章别名、分类和标签 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 文章别名 -->
        <div>
          <label class="block text-sm font-medium mb-2 transition-colors" 
                 :class="isDark ? 'text-white' : 'text-gray-800'">
            文章别名
          </label>
          <input 
            type="text" 
            v-model="formData.slug"
            placeholder="自动生成或手动输入别名"
            class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            :class="isDark 
              ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
          />
          <p class="mt-1 text-xs transition-colors" 
             :class="isDark ? 'text-gray-400' : 'text-gray-500'">
            用于URL路径，留空将自动生成
          </p>
        </div>

        <!-- 分类 -->
        <div>
          <label class="block text-sm font-medium mb-2 transition-colors" 
                 :class="isDark ? 'text-white' : 'text-gray-800'">
            分类
          </label>
          <select 
            v-model="formData.category_id"
            class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            :class="isDark 
              ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white' 
              : 'bg-white border-gray-300 text-gray-900'"
          >
            <option value="">选择分类</option>
            <option 
              v-for="category in categories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- 标签 -->
        <div>
          <label class="block text-sm font-medium mb-2 transition-colors" 
                 :class="isDark ? 'text-white' : 'text-gray-800'">
            标签
          </label>
          <input 
            type="text" 
            v-model="tagsInput"
            placeholder="输入标签，用逗号分隔"
            class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            :class="isDark 
              ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
          />
          <div v-if="formData.tags.length > 0" class="mt-2 flex flex-wrap gap-2">
            <span v-for="tag in formData.tags" :key="tag" 
                  class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useTheme } from '../composables/useTheme'
import { markdownToHtml } from '../utils/markdown'
import axios from 'axios'

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
  category_id: null,
  status: 'draft'
})

const tagsInput = ref('')
const categories = ref([])

// 方法定义（必须在watch之前，避免初始化错误）
const resetForm = () => {
  formData.value = {
    title: '',
    slug: '',
    summary: '',
    content: '',
    location: '',
    cover: '',
    tags: [],
    category_id: 1,
    status: 'draft'
  }
  tagsInput.value = ''
  showOptionalFields.value = false
}

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
      category_id: newPost.category_id || null,
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

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/categories')
    if (response.data.success) {
      categories.value = response.data.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 组件挂载时获取分类列表
onMounted(fetchCategories)

// 方法

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

const saveDraft = () => {
  console.log('[BlogEditor] saveDraft 开始执行', {
    title: formData.value.title,
    contentLength: formData.value.content?.length || 0,
    tags: formData.value.tags,
    status: 'draft'
  })
  
  const errors = validateForm()
  if (errors.length > 0) {
    alert('表单验证失败：\n' + errors.join('\n'))
    return
  }
  
  // 自动生成 slug（如果为空）
  let finalSlug = formData.value.slug
  if (!finalSlug || finalSlug.trim() === '') {
    finalSlug = generateSlug(formData.value.title)
  }
  
  const postData = {
    ...formData.value,
    slug: finalSlug,
    published: false,
    status: 'draft'
  }
  
  console.log('[BlogEditor] 发送保存草稿事件', {
    originalSlug: formData.value.slug,
    finalSlug: finalSlug,
    data: postData
  })
  
  emit('save', postData)
}

const publish = () => {
  console.log('[BlogEditor] publish 开始执行', {
    formData: formData.value
  })
  
  const errors = validateForm()
  if (errors.length > 0) {
    alert('表单验证失败：\n' + errors.join('\n'))
    return
  }
  
  // 自动生成 slug（如果为空）
  let finalSlug = formData.value.slug
  if (!finalSlug || finalSlug.trim() === '') {
    finalSlug = generateSlug(formData.value.title)
  }
  
  console.log('[BlogEditor] 自动生成 slug', {
    title: formData.value.title,
    generatedSlug: finalSlug
  })
  
  const postData = {
    ...formData.value,
    slug: finalSlug,
    published: true,
    status: 'published'
  }
  
  console.log('[BlogEditor] 发送发布事件', {
    originalSlug: formData.value.slug,
    finalSlug: finalSlug,
    data: postData
  })
  
  emit('save', postData)
}
</script>