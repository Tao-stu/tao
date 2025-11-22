<template>
  <div v-if="showGate" class="glass-effect rounded-3xl p-8 max-w-md mx-auto text-center">
    <div class="mb-6">
      <div class="text-4xl mb-4">🔒</div>
      <h2 class="text-2xl font-bold mb-2 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
        加密文章
      </h2>
      <p class="text-sm transition-colors" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
        这篇文章需要密码才能查看
      </p>
    </div>
    
    <form @submit.prevent="handlePasswordSubmit" class="space-y-4">
      <div>
        <input 
          type="password" 
          v-model="passwordInput"
          required
          placeholder="请输入访问密码"
          class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          :class="isDark 
            ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
        />
      </div>
      
      <button 
        type="submit"
        :disabled="isVerifying"
        class="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
        :class="isDark 
          ? 'bg-tokyo-night-blue hover:bg-tokyo-night-blue0 text-white' 
          : 'bg-blue-600 hover:bg-blue-700 text-white'"
      >
        {{ isVerifying ? '验证中...' : '解锁文章' }}
      </button>
    </form>
    
    <div v-if="error" class="mt-4 p-3 rounded-lg border border-red-300 bg-red-50 text-red-600">
      {{ error }}
    </div>
    
    <div class="mt-6 pt-6 border-t" :class="isDark ? 'border-tokyo-night-bg-highlight' : 'border-gray-200'">
      <p class="text-xs transition-colors" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
        提示：密码错误次数过多将暂时锁定访问
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'

const { isDark } = useTheme()

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
const emit = defineEmits(['unlocked'])

// 响应式数据
const passwordInput = ref('')
const isVerifying = ref(false)
const error = ref('')
const failedAttempts = ref(0)

// 计算属性
const showGate = computed(() => {
  const storageKey = `article_${props.articleId}_access`
  const hasAccess = localStorage.getItem(storageKey)
  return !hasAccess
})

// 方法
const handlePasswordSubmit = async () => {
  if (!passwordInput.value.trim()) {
    error.value = '请输入密码'
    return
  }
  
  if (failedAttempts.value >= 5) {
    error.value = '密码错误次数过多，请稍后再试'
    return
  }
  
  isVerifying.value = true
  error.value = ''
  
  try {
    // 调用API验证密码
    const response = await fetch(`/api/posts?slug=${props.articleSlug}`)
    const result = await response.json()
    
    if (result.success && result.data) {
      const article = result.data
      
      // 验证密码
      if (article.access_password === passwordInput.value) {
        // 密码正确，保存访问状态
        const storageKey = `article_${props.articleId}_access`
        localStorage.setItem(storageKey, 'true')
        
        // 重置错误次数
        failedAttempts.value = 0
        
        // 触发解锁事件
        emit('unlocked', true)
      } else {
        // 密码错误
        failedAttempts.value++
        error.value = `密码错误 (${failedAttempts.value}/5)`
        passwordInput.value = ''
        
        if (failedAttempts.value >= 5) {
          // 临时锁定30分钟
          const lockKey = `article_${props.articleId}_locked`
          localStorage.setItem(lockKey, Date.now().toString())
        }
      }
    } else {
      throw new Error('文章不存在')
    }
  } catch (err) {
    console.error('验证密码失败:', err)
    error.value = '验证失败，请稍后重试'
  } finally {
    isVerifying.value = false
  }
}

// 检查是否被锁定
const checkLockStatus = () => {
  const lockKey = `article_${props.articleId}_locked`
  const lockTime = localStorage.getItem(lockKey)
  
  if (lockTime) {
    const lockDuration = 30 * 60 * 1000 // 30分钟
    const timePassed = Date.now() - parseInt(lockTime)
    
    if (timePassed < lockDuration) {
      const remainingTime = Math.ceil((lockDuration - timePassed) / 60000)
      error.value = `访问已锁定，请${remainingTime}分钟后再试`
      return true
    } else {
      // 锁定时间已过，清除锁定
      localStorage.removeItem(lockKey)
      failedAttempts.value = 0
    }
  }
  
  return false
}

// 初始化
checkLockStatus()
</script>