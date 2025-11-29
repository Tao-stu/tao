<template>
  <div class="min-h-[400px] flex items-center justify-center">
    <div class="max-w-md w-full mx-auto p-6">
      <div class="glass-effect rounded-2xl p-8 text-center">
        <!-- 锁图标 -->
        <div class="mb-6">
          <svg class="w-16 h-16 mx-auto" :class="isDark ? 'text-blue-400' : 'text-blue-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>

        <h2 class="text-2xl font-bold mb-4 transition-colors" 
            :class="isDark ? 'text-white' : 'text-gray-800'">
          这是一篇加密文章
        </h2>
        
        <p class="mb-6 transition-colors" 
           :class="isDark ? 'text-gray-300' : 'text-gray-600'">
          请输入访问密码以查看文章内容
        </p>

        <!-- 密码输入表单 -->
        <form @submit.prevent="verifyPassword" class="space-y-4">
          <div>
            <input 
              type="password" 
              v-model="password"
              placeholder="请输入密码"
              required
              class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center"
              :class="isDark 
                ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
            />
          </div>

          <!-- 错误提示 -->
          <div v-if="error" class="text-red-500 text-sm">
            {{ error }}
          </div>

          <!-- 提交按钮 -->
          <button 
            type="submit"
            :disabled="isVerifying"
            class="w-full px-4 py-3 rounded-lg font-medium text-white transition-all disabled:opacity-50"
            :class="isDark 
              ? 'bg-tokyo-night-blue hover:bg-tokyo-night-blue0' 
              : 'bg-blue-600 hover:bg-blue-700'"
          >
            {{ isVerifying ? '验证中...' : '访问文章' }}
          </button>
        </form>

        <!-- 提示信息 -->
        <div class="mt-6 text-xs transition-colors" 
             :class="isDark ? 'text-gray-400' : 'text-gray-500'">
          密码由文章作者设置，请勿尝试暴力破解
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDark } from '@vueuse/core'

// Props
const props = defineProps({
  articleId: {
    type: [String, Number],
    required: true
  },
  articleSlug: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['authenticated'])

// 响应式数据
const isDark = useDark()
const password = ref('')
const isVerifying = ref(false)
const error = ref('')

// 验证密码
const verifyPassword = async () => {
  if (!password.value.trim()) {
    error.value = '请输入密码'
    return
  }

  isVerifying.value = true
  error.value = ''

  try {
    // 调用 API 验证密码
    const response = await fetch(`/api/posts/${props.articleSlug}/verify-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: password.value
      })
    })

    const data = await response.json()

    if (data.success) {
      // 密码正确，保存到会话存储
      sessionStorage.setItem(`article_${props.articleId}_access`, 'true')
      sessionStorage.setItem(`article_${props.articleId}_password`, password.value)
      
      // 通知父组件验证成功
      emit('authenticated', true)
    } else {
      error.value = data.error || '密码错误，请重试'
    }
  } catch (err) {
    console.error('密码验证失败:', err)
    error.value = '验证失败，请稍后重试'
  } finally {
    isVerifying.value = false
  }
}

// 检查是否已经验证过
const checkExistingAccess = () => {
  const hasAccess = sessionStorage.getItem(`article_${props.articleId}_access`)
  if (hasAccess === 'true') {
    emit('authenticated', true)
  }
}

// 组件挂载时检查现有访问权限
checkExistingAccess()
</script>