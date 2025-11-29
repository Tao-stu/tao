<template>
  <div class="pt-28 pb-12" :class="isDark ? 'dark' : 'light'" style="font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- 页面标题 -->
      <div class="text-center mb-12 animate-fade-in">
        <h1 class="text-5xl font-bold mb-4 title-reveal">
          留言 | GUESTBOOK
        </h1>
        <p class="transition-colors" :class="isDark ? 'text-gray-300' : 'text-gray-600'">留下你的足迹吧~</p>
      </div>

      <!-- 留言列表 -->
      <div class="space-y-6 mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold transition-colors" :class="isDark ? 'text-tokyo-night-cyan' : 'text-blue-600'">
            留言列表 ({{ messages.length }})
          </h2>
          <button 
            @click="refreshMessages"
            class="px-4 py-2 text-sm bg-gradient-to-r from-tokyo-night-blue to-tokyo-night-cyan text-white rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium"
            :disabled="isLoading"
          >
            {{ isLoading ? '刷新中...' : '刷新' }}
          </button>
        </div>
        
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          class="glass-effect rounded-3xl p-6 card-hover"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <!-- 留言者信息 -->
          <div class="mb-4">
            <div class="flex items-center gap-3 mb-1">
              <span class="font-bold text-tokyo-night-cyan">{{ message.nickname }}</span>
              <span v-if="message.gender" class="text-sm">
                {{ message.gender === 'male' ? '👨' : message.gender === 'female' ? '👩' : '🧑' }}
              </span>
            </div>
            
            <div class="flex items-center gap-4 text-xs text-tokyo-night-dark5">
              <span v-if="message.email">📧 {{ message.email }}</span>
              <span>🕐 {{ message.timestamp }}</span>
            </div>
          </div>
          
          <!-- 留言内容 -->
          <div>
            <p class="text-tokyo-night-fg leading-relaxed whitespace-pre-wrap">{{ message.content }}</p>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="messages.length === 0 && !isLoading" class="text-center py-20 glass-effect rounded-3xl">
          <div class="text-6xl mb-4">💬</div>
          <p class="text-xl text-tokyo-night-fg">还没有留言</p>
          <p class="text-tokyo-night-fg-dark mt-2">快来做第一个留言的人吧！</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading && messages.length === 0" class="text-center py-20 glass-effect rounded-3xl">
          <div class="text-6xl mb-4 animate-spin">⏳</div>
          <p class="text-xl text-tokyo-night-fg">加载中...</p>
        </div>
      </div>

      <!-- 发表留言按钮 -->
      <div class="text-center">
        <router-link 
          to="/guestbook/new"
          class="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-tokyo-night-blue to-tokyo-night-cyan text-white rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium text-base"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          发表留言
        </router-link>
      </div>

      <!-- 回到顶部按钮 -->
      <transition name="fade">
        <button 
          v-if="showBackToTop"
          @click="scrollToTop"
          class="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-br from-tokyo-night-blue to-tokyo-night-cyan text-white rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center z-30"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
          </svg>
        </button>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useScrollAnimation } from '../composables/useScrollAnimation'
import { useTheme } from '../composables/useTheme'
import axios from 'axios'

useScrollAnimation()
const { isDark } = useTheme()

// API 基础路径
const API_BASE = '/api'

const showBackToTop = ref(false)
const isLoading = ref(false)

// 留言列表
const messages = ref([])

// 获取留言列表
const fetchMessages = async () => {
  try {
    isLoading.value = true
    const response = await axios.get(`${API_BASE}/messages`)
    if (response.data.success) {
      messages.value = response.data.data.map(msg => ({
        ...msg,
        timestamp: new Date(msg.created_at).toLocaleString('zh-CN')
      }))
    }
  } catch (error) {
    console.error('获取留言失败:', error)
    // 如果 API 失败，显示友好提示
    if (messages.value.length === 0) {
      messages.value = [{
        nickname: '系统提示',
        content: '留言加载中，请稍候...',
        timestamp: new Date().toLocaleString('zh-CN')
      }]
    }
  } finally {
    isLoading.value = false
  }
}

// 刷新留言列表
const refreshMessages = async () => {
  await fetchMessages()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  
  // 加载留言列表
  fetchMessages()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 滚动处理
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
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

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
