<template>
  <div class="pt-28 pb-12" :class="isDark ? 'dark' : 'light'" style="font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
    <div class="container mx-auto px-4">
      <!-- 页面标题 -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-8 md:mb-12 animate-fade-in">
        <div class="text-center md:text-left">
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 title-reveal">
          文章 | BLOG
        </h1>
        <p class="text-sm md:text-base transition-colors" :class="isDark ? 'text-gray-300' : 'text-gray-600'">分享我的想法和经验</p>
        </div>
        
        <!-- 统计信息和刷新按钮 -->
        <div class="flex items-center gap-2 md:gap-3">
          <!-- 文章总数 -->
          <div v-if="!loading && !error" class="glass-effect rounded-lg px-3 py-2 text-center card-hover">
            <div class="text-lg md:text-xl font-bold text-tokyo-night-cyan">{{ articles.length }}</div>
            <div class="text-xs transition-colors" :class="isDark ? 'text-gray-400' : 'text-gray-600'">篇文章</div>
          </div>
          
          <!-- 最新发布 -->
          <div v-if="!loading && !error" class="glass-effect rounded-lg px-3 py-2 text-center card-hover">
            <div class="text-sm md:text-base font-bold text-tokyo-night-cyan truncate max-w-20 md:max-w-none">{{ latestArticleDate }}</div>
            <div class="text-xs transition-colors" :class="isDark ? 'text-gray-400' : 'text-gray-600'">最新发布</div>
          </div>
          
          <!-- 页面统计 -->
          <div v-if="!loading && !error" class="glass-effect rounded-lg px-3 py-2 text-center card-hover">
            <div class="text-lg md:text-xl font-bold text-tokyo-night-cyan">{{ totalPages }}</div>
            <div class="text-xs transition-colors" :class="isDark ? 'text-gray-400' : 'text-gray-600'">页内容</div>
          </div>
          
          <button 
            @click="fetchArticles"
            class="px-4 py-2 text-sm bg-gradient-to-r from-tokyo-night-blue to-tokyo-night-cyan text-white rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium"
            :disabled="loading"
          >
            {{ loading ? '同步中...' : '刷新' }}
          </button>
        </div>
      </div>

      <!-- 提示 -->
      <div v-if="error" class="max-w-3xl mx-auto mb-6 px-4 py-3 rounded-2xl border border-red-300 bg-red-50 text-red-600">
        {{ error }}
      </div>

      <!-- 分类筛选 -->
      <div v-if="!loading" class="max-w-6xl mx-auto mb-6">
        <div class="glass-effect rounded-2xl p-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-medium transition-colors" :class="isDark ? 'text-gray-300' : 'text-gray-700'">分类筛选：</span>
            <button 
              v-for="category in categories" 
              :key="category.id"
              @click="selectedCategory = category.id === selectedCategory ? null : category.id"
              class="px-3 py-1 text-sm rounded-full transition-all duration-300 border"
              :class="selectedCategory === category.id 
                ? 'bg-tokyo-night-blue text-white border-tokyo-night-blue' 
                : (isDark 
                  ? 'bg-tokyo-night-bg-highlight text-gray-300 border-tokyo-night-blue/30 hover:bg-tokyo-night-blue/20' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100')"
            >
              {{ category.name }}
              <span v-if="category.post_count > 0" class="ml-1 text-xs opacity-75">({{ category.post_count }})</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="max-w-4xl mx-auto space-y-6">
        <div v-for="i in 2" :key="i" class="glass-effect rounded-3xl p-8 animate-pulse">
          <div class="h-8 w-1/2 bg-white/10 rounded mb-4"></div>
          <div class="h-4 w-1/3 bg-white/5 rounded mb-2"></div>
          <div class="h-4 w-1/4 bg-white/5 rounded mb-6"></div>
          <div class="space-y-3">
            <div class="h-4 w-full bg-white/5 rounded"></div>
            <div class="h-4 w-5/6 bg-white/5 rounded"></div>
            <div class="h-4 w-2/3 bg-white/5 rounded"></div>
          </div>
        </div>
      </div>

      <!-- 文章列表 -->
      <div v-if="!loading" class="max-w-6xl mx-auto space-y-6 md:space-y-8">
        <article 
          v-for="(article, index) in displayedArticles" 
          :key="article.id || index"
          class="group relative glass-effect rounded-2xl p-4 md:p-5 lg:p-6 card-hover overflow-hidden"
        >
          <!-- 装饰性渐变边框 -->
          <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-tokyo-night-blue/20 to-tokyo-night-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <!-- 文章内容 -->
          <div class="relative z-10">
          <!-- 标题和加密标识 -->
          <div class="flex items-start gap-2 mb-2 md:mb-3">
            <h2 
              class="text-lg md:text-xl lg:text-2xl font-bold text-tokyo-night-cyan hover:text-tokyo-night-blue transition-colors cursor-pointer flex-1"
              @click="goToArticle(article)"
            >
              {{ article.title }}
            </h2>
            <!-- 加密标识 -->
            <div v-if="article.is_encrypted" class="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
              <svg class="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
              <span class="text-xs font-medium text-amber-500">加密</span>
            </div>
          </div>
          
          <!-- 发布时间、分类和标签 -->
          <div class="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4 text-xs md:text-sm text-tokyo-night-dark5">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
              </svg>
              {{ formatDate(article.created_at) }}
            </span>
            <!-- 分类 -->
            <span v-if="article.category_name" class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
              </svg>
              {{ article.category_name }}
            </span>
            <span v-if="article.location" class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
              {{ article.location }}
            </span>
            <!-- 标签 -->
            <span v-if="article.tags && article.tags.length > 0" class="flex items-center gap-2">
              <span 
                v-for="tag in article.tags.slice(0, 3)" 
                :key="tag"
                class="px-2 py-1 text-xs rounded-full bg-tokyo-night-blue/20 text-tokyo-night-cyan border border-tokyo-night-blue/30"
              >
                {{ tag }}
              </span>
            </span>
          </div>
          
          <!-- 正文预览 -->
          <div v-if="article.summary" class="prose prose-sm md:prose-base max-w-none text-tokyo-night-fg leading-relaxed">
            <p class="text-xs md:text-sm">{{ article.summary }}</p>
          </div>
          
          <!-- 阅读详情按钮 -->
          <div class="mt-4 flex justify-between items-center">
            <div class="flex gap-1 md:gap-2">
              <span v-if="article.reading_time" class="px-2 md:px-3 py-1 text-xs rounded-full bg-tokyo-night-cyan/20 text-tokyo-night-cyan border border-tokyo-night-cyan/30">
                {{ article.reading_time }} 分钟阅读
              </span>
            </div>
            <button 
              @click="goToArticle(article)"
              class="px-3 md:px-4 py-1.5 bg-gradient-to-r from-tokyo-night-blue to-tokyo-night-cyan text-white rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 group-hover:scale-110 text-xs md:text-sm"
            >
              {{ article.is_encrypted ? '解锁阅读 →' : '阅读详情 →' }}
            </button>
          </div>
          

          </div>
        </article>

        <!-- 空状态 -->
        <div v-if="displayedArticles.length === 0" class="glass-effect rounded-3xl p-10 md:p-16 lg:p-20 text-center w-full">
          <div class="text-4xl md:text-6xl lg:text-8xl mb-4 md:mb-6 animate-bounce">📝</div>
          <p class="text-lg md:text-xl lg:text-2xl font-bold text-tokyo-night-cyan mb-2 md:mb-3">暂无文章</p>
          <p class="text-sm md:text-base text-tokyo-night-fg-dark">敬请期待精彩内容的发布...</p>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="!loading && articles.length > 0" class="mt-8 md:mt-12 flex justify-center gap-2">
        <button 
          v-for="page in totalPages" 
          :key="page"
          :class="{ 'bg-tokyo-night-blue text-white': currentPage === page, 'glass-effect text-tokyo-night-fg': currentPage !== page }"
          class="w-8 h-8 md:w-10 md:h-10 rounded-full hover:scale-110 transition-all duration-300 font-medium border border-tokyo-night-blue/30 text-sm md:text-base"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useScrollAnimation } from '../composables/useScrollAnimation'
import { useTheme } from '../composables/useTheme'
import axios from 'axios'


useScrollAnimation()
const { isDark } = useTheme()
const router = useRouter()

const API_URL = '/api/posts'
const articles = ref([])
const categories = ref([])
const loading = ref(false)
const error = ref('')
const selectedCategory = ref(null)
const currentPage = ref(1)
const pageSize = 6

const totalPages = computed(() => {
  let filteredArticles = articles.value
  
  // 按分类筛选
  if (selectedCategory.value) {
    filteredArticles = filteredArticles.filter(article => 
      article.category_id === selectedCategory.value
    )
  }
  
  if (filteredArticles.length === 0) return 1
  return Math.ceil(filteredArticles.length / pageSize)
})

const displayedArticles = computed(() => {
  let filteredArticles = articles.value
  
  // 按分类筛选
  if (selectedCategory.value) {
    filteredArticles = filteredArticles.filter(article => 
      article.category_id === selectedCategory.value
    )
  }
  
  const start = (currentPage.value - 1) * pageSize
  return filteredArticles.slice(start, start + pageSize)
})

const latestArticleDate = computed(() => {
  if (articles.value.length === 0) return '暂无'
  const latest = articles.value.reduce((prev, current) => 
    new Date(prev.created_at) > new Date(current.created_at) ? prev : current
  )
  return formatDate(latest.created_at)
})

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

const fetchArticles = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch(`${API_URL}?includeDrafts=false&limit=100`)
    
    // 检查响应是否为JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('服务器响应格式错误，请检查API配置')
    }
    
    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.error || '文章加载失败')
    }
    articles.value = result.data || []
    currentPage.value = 1
  } catch (err) {
    console.error('Blog fetch error:', err)
    error.value = err.message || '文章加载失败'
    articles.value = [] // 确保为空数组
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchCategories()
  await fetchArticles()
})

watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) {
    currentPage.value = 1
  }
})

const formatDate = (value) => {
  if (!value) return '未知日期'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 跳转到文章页面
const goToArticle = (article) => {
  // 优先使用 slug，如果没有 slug 则使用 ID
  if (article.slug && article.slug !== 'null' && article.slug !== 'undefined') {
    router.push(`/article/${article.slug}`)
  } else {
    router.push(`/article/?id=${article.id}`)
  }
}


</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}

.animate-bounce {
  animation: float 3s ease-in-out infinite;
}

/* 统计卡片悬浮效果 */
.glass-effect.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-effect.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(122, 162, 247, 0.15);
}

/* 文章卡片特殊效果 */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

/* 渐变边框动画 */
.group .absolute.inset-0 {
  transition: opacity 0.5s ease;
}

/* 标签样式 */
.bg-tokyo-night-blue\/20 {
  background-color: rgba(59, 130, 246, 0.2);
}

.bg-tokyo-night-cyan\/20 {
  background-color: rgba(125, 207, 255, 0.2);
}

.border-tokyo-night-blue\/30 {
  border-color: rgba(59, 130, 246, 0.3);
}

.border-tokyo-night-cyan\/30 {
  border-color: rgba(125, 207, 255, 0.3);
}


</style>

