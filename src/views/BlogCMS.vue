<template>
  <div class="pt-20 pb-12" :class="isDark ? 'dark' : 'light'" style="font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
    <div class="container mx-auto px-4 max-w-6xl">
      
      <!-- 未认证状态 - 显示登录表单 -->
      <div v-if="!isAuthenticated" class="max-w-md mx-auto">
        <div class="glass-effect rounded-3xl p-8 text-center">
          <h1 class="text-3xl font-bold mb-6 title-reveal">
            博客管理后台
          </h1>
          
          <form @submit.prevent="handleAuth" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-left transition-colors" 
                     :class="isDark ? 'text-white' : 'text-gray-800'">
                管理员密码
              </label>
              <input 
                type="password" 
                v-model="password"
                required
                placeholder="请输入管理员密码"
                class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                :class="isDark 
                  ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
              />
            </div>
            
            <button 
              type="submit"
              :disabled="isLoading"
              class="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
              :class="isDark 
                ? 'bg-tokyo-night-blue hover:bg-tokyo-night-blue0 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'"
            >
              {{ isLoading ? '验证中...' : '登录管理后台' }}
            </button>
          </form>
          
          <p v-if="authError" class="mt-4 text-red-500 text-sm">
            {{ authError }}
          </p>
        </div>
      </div>

      <!-- 已认证状态 - 显示管理界面 -->
      <div v-else class="flex gap-6">
        <!-- 左侧菜单 - 固定在屏幕左侧 -->
        <div class="w-64 flex-shrink-0 fixed left-0 top-20 h-screen z-10">
          <div class="glass-effect rounded-r-2xl p-4 h-full">
            <h2 class="text-xl font-bold mb-6 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
              管理菜单
            </h2>
            <nav class="space-y-2">
              <button
                @click="activeTab = 'blog'"
                class="w-full text-left px-4 py-3 rounded-lg transition-all duration-300"
                :class="activeTab === 'blog'
                  ? (isDark ? 'bg-tokyo-night-blue text-white' : 'bg-blue-600 text-white')
                  : (isDark ? 'text-gray-300 hover:bg-tokyo-night-bg-highlight' : 'text-gray-700 hover:bg-gray-100')"
              >
                📝 文章管理
              </button>
              <button
                @click="activeTab = 'guestbook'"
                class="w-full text-left px-4 py-3 rounded-lg transition-all duration-300"
                :class="activeTab === 'guestbook'
                  ? (isDark ? 'bg-tokyo-night-blue text-white' : 'bg-blue-600 text-white')
                  : (isDark ? 'text-gray-300 hover:bg-tokyo-night-bg-highlight' : 'text-gray-700 hover:bg-gray-100')"
              >
                💬 留言管理
              </button>
              <button
                @click="activeTab = 'settings'"
                class="w-full text-left px-4 py-3 rounded-lg transition-all duration-300"
                :class="activeTab === 'settings'
                  ? (isDark ? 'bg-tokyo-night-blue text-white' : 'bg-blue-600 text-white')
                  : (isDark ? 'text-gray-300 hover:bg-tokyo-night-bg-highlight' : 'text-gray-700 hover:bg-gray-100')"
              >
                ⚙️ 系统设置
              </button>
            </nav>
            <div class="mt-6 pt-6 border-t" :class="isDark ? 'border-tokyo-night-bg-highlight' : 'border-gray-200'">
              <button 
                @click="logout"
                class="w-full px-4 py-2 rounded-lg font-medium border transition-all duration-300"
                :class="isDark 
                  ? 'border-tokyo-night-blue text-tokyo-night-cyan hover:bg-tokyo-night-blue hover:text-white' 
                  : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧内容区域 - 放大并左移 -->
        <div class="flex-1 min-w-0 ml-64 mr-0">
          <!-- 文章管理 -->
          <div v-if="activeTab === 'blog'">
            <div class="flex justify-between items-center mb-6">
              <h1 class="text-3xl font-bold title-reveal">
                文章管理
              </h1>
              <button 
                @click="showEditor = true; editingPost = null"
                class="px-6 py-2 rounded-lg font-medium transition-all duration-300"
                :class="isDark 
                  ? 'bg-tokyo-night-blue hover:bg-tokyo-night-blue0 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'"
              >
                📝 写新文章
              </button>
            </div>

            <!-- 文章列表 -->
            <div v-if="!showEditor" class="space-y-4">
          <div v-if="isLoading && blogPosts.length === 0" class="text-center py-12">
            <p class="transition-colors" :class="isDark ? 'text-gray-400' : 'text-gray-600'">加载中...</p>
          </div>
          <div v-else-if="blogPosts.length === 0" class="text-center py-12">
            <p class="transition-colors" :class="isDark ? 'text-gray-400' : 'text-gray-600'">还没有文章，点击"写新文章"开始创作吧！</p>
          </div>
          <div 
            v-else
            v-for="post in blogPosts" 
            :key="post.id"
            class="glass-effect rounded-2xl p-6 flex justify-between items-center"
          >
            <div class="flex-1">
              <h3 class="text-xl font-semibold mb-2 transition-colors" 
                  :class="isDark ? 'text-white' : 'text-gray-800'">
                {{ post.title }}
              </h3>
              <div class="flex gap-4 text-sm transition-colors" 
                   :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                <span>{{ post.date }}</span>
                <span>{{ post.status === 'published' ? '已发布' : '草稿' }}</span>
                <span>slug: {{ post.slug }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button 
                @click="editPost(post)"
                :disabled="isLoading"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                :class="isDark 
                  ? 'bg-tokyo-night-bg-highlight text-tokyo-night-cyan hover:bg-tokyo-night-blue' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'"
              >
                编辑
              </button>
              <button 
                @click="deletePost(post)"
                :disabled="isLoading"
                class="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50"
              >
                删除
              </button>
            </div>
          </div>
        </div>

            <!-- 博客编辑器 -->
            <BlogEditor 
              v-if="showEditor"
              :post="editingPost"
              :is-saving="isSaving"
              @save="savePost"
              @cancel="showEditor = false; editingPost = null"
            />
          </div>

          <!-- 留言管理 -->
          <div v-if="activeTab === 'guestbook'">
            <GuestbookAdmin />
          </div>

          <!-- 系统设置 -->
          <div v-if="activeTab === 'settings'">
            <div class="glass-effect rounded-3xl p-8">
              <h2 class="text-2xl font-bold mb-6 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
                系统设置
              </h2>
              
              <!-- 修改密码 -->
              <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
                  🔐 修改管理员密码
                </h3>
                
                <form @submit.prevent="handleChangePassword" class="space-y-4 max-w-md">
                  <!-- 当前密码 -->
                  <div>
                    <label class="block text-sm font-medium mb-2 transition-colors" 
                           :class="isDark ? 'text-white' : 'text-gray-800'">
                      当前密码
                    </label>
                    <input 
                      type="password" 
                      v-model="passwordForm.currentPassword"
                      required
                      placeholder="请输入当前密码"
                      class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      :class="isDark 
                        ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
                    />
                  </div>

                  <!-- 新密码 -->
                  <div>
                    <label class="block text-sm font-medium mb-2 transition-colors" 
                           :class="isDark ? 'text-white' : 'text-gray-800'">
                      新密码
                    </label>
                    <input 
                      type="password" 
                      v-model="passwordForm.newPassword"
                      required
                      placeholder="请输入新密码（至少6位）"
                      class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      :class="isDark 
                        ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
                    />
                  </div>

                  <!-- 确认新密码 -->
                  <div>
                    <label class="block text-sm font-medium mb-2 transition-colors" 
                           :class="isDark ? 'text-white' : 'text-gray-800'">
                      确认新密码
                    </label>
                    <input 
                      type="password" 
                      v-model="passwordForm.confirmPassword"
                      required
                      placeholder="请再次输入新密码"
                      class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      :class="isDark 
                        ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
                    />
                  </div>

                  <!-- 提交按钮 -->
                  <button 
                    type="submit"
                    :disabled="isChangingPassword"
                    class="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                    :class="isDark 
                      ? 'bg-tokyo-night-blue hover:bg-tokyo-night-blue0 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'"
                  >
                    {{ isChangingPassword ? '修改中...' : '修改密码' }}
                  </button>
                </form>

                <!-- 错误信息 -->
                <div v-if="passwordError" class="mt-4 p-3 rounded-lg border border-red-300 bg-red-50 text-red-600">
                  {{ passwordError }}
                </div>

                <!-- 成功信息 -->
                <div v-if="passwordSuccess" class="mt-4 p-3 rounded-lg border border-green-300 bg-green-50 text-green-600">
                  {{ passwordSuccess }}
                </div>
              </div>

              <!-- 系统信息 -->
              <div class="border-t pt-6" :class="isDark ? 'border-tokyo-night-bg-highlight' : 'border-gray-200'">
                <h3 class="text-xl font-semibold mb-4 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
                  📊 系统信息
                </h3>
                <div class="space-y-2 text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
                  <p><strong>版本：</strong> v1.0.0</p>
                  <p><strong>框架：</strong> Vue 3 + Vercel</p>
                  <p><strong>数据库：</strong> PostgreSQL</p>
                  <p><strong>最后更新：</strong> {{ new Date().toLocaleDateString() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTheme } from '../composables/useTheme'
import BlogEditor from '../components/BlogEditor.vue'
import GuestbookAdmin from '../components/GuestbookAdmin.vue'
import axios from 'axios'

const { isDark } = useTheme()

// API 基础路径
const API_BASE = '/api'

// 认证状态
const isAuthenticated = ref(false)
const password = ref('')
const authError = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

// 编辑器状态
const showEditor = ref(false)
const editingPost = ref(null)

// 活动标签页
const activeTab = ref('blog')

// 博客文章数据
const blogPosts = ref([])

// 修改密码相关
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const isChangingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

// 获取认证token
const getAuthToken = () => {
  return localStorage.getItem('blog_admin_token')
}

// 创建带认证头的axios实例
const createAuthHeaders = () => {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// 加载文章列表
const fetchPosts = async () => {
  try {
    isLoading.value = true
    const response = await axios.get(`${API_BASE}/posts`, {
      headers: createAuthHeaders()
    })
    if (response.data.success) {
      blogPosts.value = response.data.data.map(post => ({
        ...post,
        date: post.created_at ? new Date(post.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        tags: Array.isArray(post.tags) ? post.tags : []
      }))
    }
  } catch (error) {
    console.error('加载文章失败:', error)
    // 如果是401错误，说明token失效，需要重新登录
    if (error.response?.status === 401) {
      logout()
      alert('登录已过期，请重新登录')
    } else {
      alert('加载文章失败，请稍后重试')
    }
  } finally {
    isLoading.value = false
  }
}

// 检查认证状态
onMounted(async () => {
  const authToken = localStorage.getItem('blog_admin_token')
  if (authToken) {
    // 验证token有效性（简单检查，实际验证在API端）
    isAuthenticated.value = true
    await fetchPosts()
  }
})

// 处理认证
const handleAuth = async () => {
  isLoading.value = true
  authError.value = ''
  
  try {
    // 调用登录API进行认证
    const response = await axios.post(`${API_BASE}/auth/login`, {
      password: password.value
    })
    
    if (response.data.success) {
      // 保存JWT token
      localStorage.setItem('blog_admin_token', response.data.data.token)
      isAuthenticated.value = true
      password.value = ''
      await fetchPosts()
    } else {
      authError.value = response.data.error || '密码错误，请重试'
    }
  } catch (error) {
    console.error('登录失败:', error)
    authError.value = error.response?.data?.error || '认证失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 退出登录
const logout = () => {
  localStorage.removeItem('blog_admin_token')
  isAuthenticated.value = false
  showEditor.value = false
  blogPosts.value = []
}

// 编辑文章
const editPost = async (post) => {
  try {
    isLoading.value = true
    // 获取完整文章内容
    const response = await axios.get(`${API_BASE}/posts?slug=${post.slug}`, {
      headers: createAuthHeaders()
    })
    if (response.data.success) {
      editingPost.value = {
        ...response.data.data,
        tags: Array.isArray(response.data.data.tags) ? response.data.data.tags : []
      }
      showEditor.value = true
    }
  } catch (error) {
    console.error('加载文章详情失败:', error)
    alert('加载文章详情失败')
  } finally {
    isLoading.value = false
  }
}

// 保存文章
const savePost = async (postData) => {
  try {
    isSaving.value = true
    
    if (editingPost.value && editingPost.value.id) {
      // 更新现有文章
      const response = await axios.put(`${API_BASE}/posts`, {
        id: editingPost.value.id,
        slug: postData.slug,
        title: postData.title,
        content: postData.content,
        tags: postData.tags,
        status: postData.status
      }, {
        headers: createAuthHeaders()
      })
      
      if (response.data.success) {
        alert('文章更新成功！')
        await fetchPosts()
        // 触发博客更新事件，通知博客页面刷新
        window.dispatchEvent(new CustomEvent('blog-updated'))
      } else {
        throw new Error(response.data.error || '更新失败')
      }
    } else {
      // 创建新文章
      const response = await axios.post(`${API_BASE}/posts`, {
        slug: postData.slug,
        title: postData.title,
        content: postData.content,
        tags: postData.tags,
        status: postData.status
      }, {
        headers: createAuthHeaders()
      })
      
      if (response.data.success) {
        alert('文章创建成功！')
        await fetchPosts()
        // 刷新博客页面以显示最新数据
        window.dispatchEvent(new CustomEvent('blog-updated'))
      } else {
        throw new Error(response.data.error || '创建失败')
      }
    }
    
    showEditor.value = false
    editingPost.value = null
  } catch (error) {
    console.error('保存文章失败:', error)
    alert(error.response?.data?.error || error.message || '保存文章失败，请稍后重试')
  } finally {
    isSaving.value = false
  }
}

// 删除文章
const deletePost = async (post) => {
  if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
    return
  }
  
  try {
    isLoading.value = true
    const response = await axios.delete(`${API_BASE}/posts?id=${post.id}`, {
      headers: createAuthHeaders()
    })
    
    if (response.data.success) {
      alert('文章已删除')
      await fetchPosts()
      // 刷新博客页面以显示最新数据
      window.dispatchEvent(new CustomEvent('blog-updated'))
    } else {
      throw new Error(response.data.error || '删除失败')
    }
  } catch (error) {
    console.error('删除文章失败:', error)
    alert(error.response?.data?.error || error.message || '删除文章失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  // 清除之前的消息
  passwordError.value = ''
  passwordSuccess.value = ''
  
  // 前端验证
  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = '新密码长度至少为6位'
    return
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = '新密码与确认密码不匹配'
    return
  }
  
  try {
    isChangingPassword.value = true
    
    const response = await axios.post(`${API_BASE}/auth/change-password`, {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
      confirmPassword: passwordForm.value.confirmPassword
    }, {
      headers: createAuthHeaders()
    })
    
    if (response.data.success) {
      passwordSuccess.value = response.data.data.message
      // 显示环境变量信息
      if (response.data.data.envVar) {
        passwordSuccess.value += '\n\n请将以下环境变量添加到部署配置中以永久生效：\n' + response.data.data.envVar
      }
      
      // 清空表单
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      
      // 5秒后清除成功消息
      setTimeout(() => {
        passwordSuccess.value = ''
      }, 10000)
    } else {
      passwordError.value = response.data.error || '修改密码失败'
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    passwordError.value = error.response?.data?.error || error.message || '修改密码失败，请稍后重试'
  } finally {
    isChangingPassword.value = false
  }
}
</script>