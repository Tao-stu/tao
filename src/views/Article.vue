<template>
  <div class="pt-28 pb-12 min-h-screen" :class="isDark ? 'dark' : 'light'" style="font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
    <div class="container mx-auto px-4">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <button 
          @click="$router.go(-1)"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
          :class="isDark 
            ? 'bg-tokyo-night-bg-highlight text-tokyo-night-fg hover:bg-tokyo-night-blue' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          返回
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="max-w-4xl mx-auto">
        <div class="glass-effect rounded-3xl p-8 animate-pulse">
          <div class="h-8 w-3/4 bg-white/10 rounded mb-4"></div>
          <div class="h-4 w-1/2 bg-white/10 rounded mb-6"></div>
          <div class="space-y-3">
            <div class="h-4 bg-white/10 rounded"></div>
            <div class="h-4 bg-white/10 rounded w-5/6"></div>
            <div class="h-4 bg-white/10 rounded w-4/6"></div>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="max-w-4xl mx-auto">
        <div class="glass-effect rounded-3xl p-8 text-center">
          <div class="text-6xl mb-4">😕</div>
          <h2 class="text-2xl font-bold mb-4" :class="isDark ? 'text-white' : 'text-gray-800'">
            {{ error }}
          </h2>
          <button 
            @click="$router.push('/blog')"
            class="px-6 py-3 bg-gradient-to-r from-tokyo-night-blue to-tokyo-night-cyan text-white rounded-full hover:shadow-lg transition-all"
          >
            返回文章列表
          </button>
        </div>
      </div>



      <!-- 文章内容 -->
      <article v-if="article" class="max-w-4xl mx-auto">
        <div class="glass-effect rounded-3xl p-8 md:p-12">
          <!-- 文章头部 -->
          <header class="mb-8">
            <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-tokyo-night-cyan">
              {{ article.title }}
            </h1>
            
            <!-- 文章元信息 -->
            <div class="flex flex-wrap items-center gap-4 text-sm md:text-base" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
                {{ formatDate(article.created_at) }}
              </span>
              
              <span v-if="article.location" class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                </svg>
                {{ article.location }}
              </span>

              <span v-if="article.updated_at !== article.created_at" class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                </svg>
                更新于 {{ formatDate(article.updated_at) }}
              </span>
            </div>

            <!-- 标签 -->
            <div v-if="article.tags && article.tags.length > 0" class="flex flex-wrap gap-2 mt-4">
              <span 
                v-for="tag in article.tags" 
                :key="tag"
                class="px-3 py-1 text-sm rounded-full bg-tokyo-night-blue/20 text-tokyo-night-cyan border border-tokyo-night-blue/30"
              >
                {{ tag }}
              </span>
            </div>
          </header>

          <!-- 文章摘要 -->
          <div v-if="article.summary" class="mb-8 p-4 rounded-lg" :class="isDark ? 'bg-tokyo-night-bg-highlight' : 'bg-gray-50'">
            <p class="text-lg italic" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
              {{ article.summary }}
            </p>
          </div>

          <!-- 文章内容 -->
          <div class="prose prose-lg max-w-none" :class="isDark ? 'prose-invert' : ''">
            <div v-html="formatContent(article.content)"></div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDark } from '@vueuse/core'

// 响应式数据
const isDark = useDark()
const route = useRoute()
const loading = ref(true)
const error = ref('')
const article = ref(null)

// 获取文章数据
const fetchArticle = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`/api/posts?slug=${route.params.slug}`)
    const data = await response.json()

    if (data.success && data.data) {
      article.value = data.data
    } else {
      error.value = data.error || '文章不存在'
    }
  } catch (err) {
    console.error('获取文章失败:', err)
    error.value = '获取文章失败，请稍后重试'
  } finally {
    loading.value = false
  }
}



// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 格式化内容（简单的 Markdown 转 HTML）
const formatContent = (content) => {
  if (!content) return ''
  
  return content
    // 标题
    .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-8 mb-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-8 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-8 mb-4">$1</h1>')
    // 粗体和斜体
    .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>')
    // 图片
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
    // 代码
    .replace(/`([^`]+)`/g, '<code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">$1</code>')
    // 代码块
    .replace(/```([^`]+)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>')
    // 引用
    .replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4">$1</blockquote>')
    // 分割线
    .replace(/^---$/gim, '<hr class="my-8 border-t border-gray-300 dark:border-gray-600">')
    // 列表
    .replace(/^- (.+)$/gim, '<li class="ml-4">$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside my-4">$1</ul>')
    // 段落
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^/, '<p class="mb-4">')
    .replace(/$/, '</p>')
}

// 组件挂载时获取文章
onMounted(fetchArticle)
</script>