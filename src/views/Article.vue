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
        <div class="glass-effect rounded-3xl p-8 animate-pulse" :class="isDark ? 'dark' : 'light'">
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
        <div class="glass-effect rounded-3xl p-8 text-center" :class="isDark ? 'dark' : 'light'">
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
        <div class="glass-effect rounded-3xl p-6 md:p-8 lg:p-12 shadow-2xl">
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
            <MarkdownRenderer 
              :markdown="article.content" 
              :editable="false"
              :show-language-selector="true"
            />
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
import { markdownToHtml } from '../utils/markdown'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'

// 响应式数据
const isDark = useDark()
const route = useRoute()
const loading = ref(true)
const error = ref('')
const article = ref(null)

// 获取文章数据
const fetchArticle = async () => {
  console.log('[Article] fetchArticle 开始执行', {
    slug: route.params.slug,
    query: route.query
  })
  
  loading.value = true
  error.value = ''

  const slug = route.params.slug
  const id = route.query.id

  // 优先使用 ID，如果没有 ID 则使用 slug
  let url = ''
  let fetchMethod = ''
  
  if (id) {
    // 使用 ID 获取
    fetchMethod = 'by_id'
    url = `/api/posts?id=${id}`
    console.log('[Article] 使用 ID 获取文章', { id, url })
  } else if (slug && slug !== 'null' && slug !== 'undefined') {
    // 使用 slug 获取
    fetchMethod = 'by_slug'
    url = `/api/posts?slug=${encodeURIComponent(slug)}`
    console.log('[Article] 使用 slug 获取文章', { slug, url })
  } else {
    // 既没有 ID 也没有有效的 slug
    console.error('[Article] 文章标识无效', {
      slug,
      id,
      hasSlug: !!slug,
      hasId: !!id
    })
    error.value = '文章标识无效，请使用正确的文章链接访问'
    loading.value = false
    return
  }

  try {
    const response = await fetch(url)
    
    console.log('[Article] API 响应', {
      method: fetchMethod,
      status: response.status,
      ok: response.ok
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        error.value = '文章不存在'
        loading.value = false
        return
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    console.log('[Article] 文章数据解析', {
      success: data.success,
      hasData: !!data.data,
      articleId: data.data?.id,
      articleTitle: data.data?.title
    })

    if (data.success && data.data) {
      article.value = data.data
      // 确保 content 是字符串
      if (article.value.content && typeof article.value.content !== 'string') {
        console.warn('[Article] content 不是字符串，正在转换', typeof article.value.content, article.value.content)
        article.value.content = String(article.value.content || '')
      }
      console.log('[Article] 文章加载成功', {
        hasContent: !!article.value.content,
        contentType: typeof article.value.content,
        contentLength: article.value.content?.length
      })
    } else {
      error.value = data.error || '文章不存在'
    }
  } catch (err) {
    console.error('[Article] 获取文章失败:', {
      error: err.message,
      stack: err.stack
    })
    error.value = '获取文章失败，请稍后重试'
  } finally {
    loading.value = false
    console.log('[Article] fetchArticle 执行完成')
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



// 组件挂载时获取文章
onMounted(fetchArticle)
</script>