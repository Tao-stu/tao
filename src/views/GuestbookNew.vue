<template>
  <div class="pt-28 pb-12" :class="isDark ? 'dark' : 'light'" style="font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- 页面标题 -->
      <div class="text-center mb-12 animate-fade-in">
        <h1 class="text-5xl font-bold mb-4 title-reveal">
          发表留言 | NEW MESSAGE
        </h1>
        <p class="transition-colors" :class="isDark ? 'text-gray-300' : 'text-gray-600'">留下你的足迹吧~</p>
      </div>

      <!-- 返回按钮 -->
      <div class="mb-6">
        <router-link 
          to="/guestbook"
          class="inline-flex items-center gap-2 px-4 py-3 text-tokyo-night-cyan hover:text-tokyo-night-blue transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          返回留言板
        </router-link>
      </div>

      <!-- 留言表单 -->
      <div class="glass-effect rounded-3xl p-8 card-hover scroll-animate">
        <form @submit.prevent="submitMessage" class="space-y-6">
          <!-- 昵称、邮箱、性别在一行 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">昵称 (可选)</label>
              <input 
                type="text" 
                v-model="form.nickname"
                placeholder="你的昵称"
                class="w-full px-4 py-2 rounded-lg focus:ring-2 outline-none transition-all guestbook-input bg-transparent border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">电子邮件 (可选)</label>
              <input 
                type="email" 
                v-model="form.email"
                placeholder="your@email.com"
                class="w-full px-4 py-2 rounded-lg focus:ring-2 outline-none transition-all guestbook-input bg-transparent border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">性别 (可选)</label>
              <select 
                v-model="form.gender"
                class="w-full px-4 py-2 rounded-lg focus:ring-2 outline-none transition-all guestbook-input bg-transparent border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">请选择</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>

          <!-- 留言内容 -->
          <div>
            <label class="block text-sm font-medium mb-2 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">留言内容 *</label>
            <textarea 
              v-model="form.content"
              required
              rows="6"
              placeholder="写下你想说的话..."
              class="w-full px-4 py-2 rounded-lg focus:ring-2 outline-none transition-all resize-none guestbook-input bg-transparent border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
            <div class="text-right mt-1">
              <span class="text-xs transition-colors" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                {{ form.content.length }} / 500 字符
              </span>
            </div>
          </div>

          <!-- Cookie提示和提交按钮 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="saveCookie"
                v-model="saveCookie"
                class="w-4 h-4 rounded text-tokyo-night-cyan focus:ring-tokyo-night-blue"
              />
              <label for="saveCookie" class="text-sm transition-colors" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
                记住我的信息
              </label>
            </div>
            
            <div class="flex gap-3">
              <button 
                type="button"
                @click="clearForm"
                class="px-6 py-3 border border-tokyo-night-cyan text-tokyo-night-cyan rounded-full hover:bg-tokyo-night-cyan hover:text-white transition-all duration-300 font-medium"
              >
                清空
              </button>
              <button 
                type="submit"
                class="px-8 py-3 bg-gradient-to-r from-tokyo-night-blue to-tokyo-night-cyan text-white rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? '发布中...' : '发布留言' }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- 成功提示 -->
      <transition name="fade">
        <div v-if="showSuccess" class="fixed top-20 right-4 glass-effect rounded-lg p-4 text-green-500 z-50">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            留言发布成功！
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useScrollAnimation } from '../composables/useScrollAnimation'
import { useTheme } from '../composables/useTheme'
import axios from 'axios'

useScrollAnimation()
const { isDark } = useTheme()
const router = useRouter()

// API 基础路径
const API_BASE = '/api'

// HTML实体编码函数（已取消转义）
const escapeHtml = (text) => {
  // 完全取消HTML转义，管理员可信任
  return text || ''
}

// 表单数据
const form = reactive({
  nickname: '游客',
  gender: '',
  email: '',
  content: ''
})

const saveCookie = ref(false)
const isSubmitting = ref(false)
const showSuccess = ref(false)

// 从Cookie加载用户信息
onMounted(() => {
  const savedData = getCookie('guestbook_user')
  if (savedData) {
    try {
      const userData = JSON.parse(savedData)
      Object.assign(form, userData)
      saveCookie.value = true
    } catch (e) {
      console.error('Failed to parse cookie data')
    }
  }
})

// 提交留言
const submitMessage = async () => {
  if (!form.content.trim()) {
    alert('请输入留言内容')
    return
  }
  
  if (form.content.length > 500) {
    alert('留言内容不能超过500个字符')
    return
  }
  
  try {
    isSubmitting.value = true
    
    const response = await axios.post(`${API_BASE}/messages`, {
      nickname: escapeHtml(form.nickname || '游客'),
      gender: form.gender || '',
      email: escapeHtml(form.email || ''),
      content: escapeHtml(form.content)
    })
    
    if (response.data.success) {
      // 保存用户信息到Cookie
      if (saveCookie.value) {
        const userData = {
          nickname: form.nickname,
          gender: form.gender,
          email: form.email
        }
        setCookie('guestbook_user', JSON.stringify(userData), 365)
      } else {
        deleteCookie('guestbook_user')
      }
      
      // 显示成功提示
      showSuccess.value = true
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
      
      // 清空留言内容
      form.content = ''
      
      // 3秒后跳转回留言板
      setTimeout(() => {
        router.push('/guestbook')
      }, 2000)
      
    } else {
      alert('留言提交失败: ' + (response.data.error || '未知错误'))
    }
  } catch (error) {
    console.error('提交留言失败:', error)
    alert('留言提交失败，请稍后再试。\n错误: ' + error.message)
  } finally {
    isSubmitting.value = false
  }
}

// 清空表单
const clearForm = () => {
  form.content = ''
}

// Cookie操作函数
const setCookie = (name, value, days) => {
  const date = new Date()
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
  const expires = "expires=" + date.toUTCString()
  document.cookie = name + "=" + value + ";" + expires + ";path=/"
}

const getCookie = (name) => {
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

const deleteCookie = (name) => {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
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