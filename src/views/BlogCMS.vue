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
      <div v-else>
        <!-- 移动端菜单按钮 -->
        <div class="mb-4 md:hidden">
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-between"
            :class="isDark 
              ? 'bg-tokyo-night-blue text-white' 
              : 'bg-blue-600 text-white'"
          >
            <span>管理菜单</span>
            <svg 
              class="w-5 h-5 transition-transform duration-300" 
              :class="{ 'rotate-180': showMobileMenu }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div class="flex flex-col md:flex-row gap-4">
          <!-- 左侧菜单 - 块元素左对齐 -->
          <div 
            class="w-full md:w-44 flex-shrink-0 transition-all duration-300"
            :class="showMobileMenu ? 'block' : 'hidden md:block'"
          >
            <div class="glass-effect rounded-2xl p-3 md:sticky md:top-20">
              <h2 class="text-lg font-bold mb-3 transition-colors text-left hidden md:block" :class="isDark ? 'text-white' : 'text-gray-800'">
                管理菜单
              </h2>
            <nav class="space-y-1">
              <button
                @click="activeTab = 'blog'; showMobileMenu = false"
                class="w-full text-left px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium"
                :class="activeTab === 'blog'
                  ? (isDark ? 'bg-tokyo-night-blue text-white' : 'bg-blue-600 text-white')
                  : (isDark ? 'text-gray-300 hover:bg-tokyo-night-bg-highlight' : 'text-gray-700 hover:bg-gray-100')"
              >
                📝 文章
              </button>
              <button
                @click="activeTab = 'guestbook'; showMobileMenu = false"
                class="w-full text-left px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium"
                :class="activeTab === 'guestbook'
                  ? (isDark ? 'bg-tokyo-night-blue text-white' : 'bg-blue-600 text-white')
                  : (isDark ? 'text-gray-300 hover:bg-tokyo-night-bg-highlight' : 'text-gray-700 hover:bg-gray-100')"
              >
                💬 留言
              </button>
              <button
                @click="activeTab = 'backup'; showMobileMenu = false"
                class="w-full text-left px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium"
                :class="activeTab === 'backup'
                  ? (isDark ? 'bg-tokyo-night-blue text-white' : 'bg-blue-600 text-white')
                  : (isDark ? 'text-gray-300 hover:bg-tokyo-night-bg-highlight' : 'text-gray-700 hover:bg-gray-100')"
              >
                💾 备份
              </button>
              <button
                @click="activeTab = 'settings'; showMobileMenu = false"
                class="w-full text-left px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium"
                :class="activeTab === 'settings'
                  ? (isDark ? 'bg-tokyo-night-blue text-white' : 'bg-blue-600 text-white')
                  : (isDark ? 'text-gray-300 hover:bg-tokyo-night-bg-highlight' : 'text-gray-700 hover:bg-gray-100')"
              >
                ⚙️ 设置
              </button>
            </nav>
            <div class="mt-4 pt-3 border-t" :class="isDark ? 'border-tokyo-night-bg-highlight' : 'border-gray-200'">
              <button 
                @click="logout"
                class="w-full px-3 py-2 rounded-lg font-medium border transition-all duration-300 text-sm"
                :class="isDark 
                  ? 'border-tokyo-night-blue text-tokyo-night-cyan hover:bg-tokyo-night-blue hover:text-white' 
                  : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'"
              >
                退出登录
              </button>
            </div>
            </div>
          </div>

          <!-- 右侧内容区域 - 占比更大 -->
          <div class="flex-1 min-w-0">
            <!-- 文章管理 -->
            <div v-if="activeTab === 'blog'">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 class="text-2xl sm:text-3xl font-bold title-reveal">
                  文章管理
                </h1>
                <button 
                  @click="showEditor = true; editingPost = null"
                  class="w-full sm:w-auto px-6 py-2 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base"
                  :class="isDark 
                    ? 'bg-tokyo-night-blue hover:bg-tokyo-night-blue0 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'"
                >
                  📝 写新文章
                </button>
              </div>

            <!-- 文章列表 -->
            <div v-if="!showEditor" class="space-y-4">
              <!-- 搜索和筛选 -->
              <div class="glass-effect rounded-2xl p-4">
                <div class="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="text"
                    v-model="searchQuery"
                    placeholder="搜索文章标题或内容..."
                    class="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    :class="isDark 
                      ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
                  />
                  <select 
                    v-model="statusFilter"
                    class="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    :class="isDark 
                      ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white' 
                      : 'bg-white border-gray-300 text-gray-900'"
                  >
                    <option value="">全部状态</option>
                    <option value="published">已发布</option>
                    <option value="draft">草稿</option>
                  </select>
                </div>
              </div>

              <!-- 加载状态 -->
              <div v-if="isLoading && blogPosts.length === 0" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2" 
                     :class="isDark ? 'border-tokyo-night-cyan' : 'border-blue-600'"></div>
                <p class="mt-4 transition-colors" :class="isDark ? 'text-gray-400' : 'text-gray-600'">加载中...</p>
              </div>
              
              <!-- 空状态 -->
              <div v-else-if="filteredPosts.length === 0" class="text-center py-12">
                <p class="transition-colors" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                  {{ searchQuery || statusFilter ? '没有找到匹配的文章' : '还没有文章，点击"写新文章"开始创作吧！' }}
                </p>
              </div>
              
              <!-- 文章列表 -->
              <div 
                v-else
                v-for="post in filteredPosts" 
                :key="post.id"
                class="glass-effect rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all"
              >
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div class="flex-1 min-w-0">
                      <h3 class="text-lg sm:text-xl font-semibold mb-2 transition-colors break-words" 
                          :class="isDark ? 'text-white' : 'text-gray-800'">
                        {{ post.title }}
                      </h3>
                      <div class="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm transition-colors mb-2" 
                           :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                        <span class="flex items-center gap-1">
                          📅 {{ post.date }}
                        </span>
                        <span class="flex items-center gap-1" 
                              :class="post.status === 'published' 
                                ? (isDark ? 'text-green-400' : 'text-green-600') 
                                : (isDark ? 'text-yellow-400' : 'text-yellow-600')">
                          {{ post.status === 'published' ? '✓ 已发布' : '📝 草稿' }}
                        </span>
                        <span v-if="post.slug" class="hidden sm:inline-flex items-center gap-1">
                          🔗 {{ post.slug || '无' }}
                        </span>
                      </div>
                      <!-- 标签显示 -->
                      <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
                        <span 
                          v-for="tag in post.tags" 
                          :key="tag"
                          class="px-2 py-1 text-xs rounded-full"
                          :class="isDark 
                            ? 'bg-tokyo-night-blue/20 text-tokyo-night-cyan border border-tokyo-night-blue/30' 
                            : 'bg-blue-100 text-blue-600 border border-blue-200'"
                        >
                          {{ tag }}
                        </span>
                      </div>
                      <!-- 摘要预览 -->
                      <p v-if="post.summary" class="mt-2 text-sm line-clamp-2 transition-colors" 
                         :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                        {{ post.summary }}
                      </p>
                    </div>
                    <div class="flex gap-2 w-full sm:w-auto">
                      <button 
                        @click="editPost(post)"
                        :disabled="isLoading"
                        class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                        :class="isDark 
                          ? 'bg-tokyo-night-bg-highlight text-tokyo-night-cyan hover:bg-tokyo-night-blue' 
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'"
                      >
                        ✏️ 编辑
                      </button>
                      <button 
                        @click="deletePost(post)"
                        :disabled="isLoading"
                        class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        🗑️ 删除
                      </button>
                    </div>
                  </div>
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

          <!-- 备份恢复 -->
          <div v-if="activeTab === 'backup'">
            <div class="glass-effect rounded-3xl p-4 sm:p-6 md:p-8">
              <h2 class="text-xl sm:text-2xl font-bold mb-6 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
                数据备份与恢复
              </h2>
              
              <!-- 数据备份 -->
              <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
                  💾 备份数据
                </h3>
                <p class="mb-4 text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
                  备份所有文章和留言数据，下载为SQL文件
                </p>
                <button 
                  @click="handleBackup"
                  :disabled="isBackingUp"
                  class="px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                  :class="isDark 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'"
                >
                  {{ isBackingUp ? '备份中...' : '📥 下载数据备份' }}
                </button>
                
                <!-- 备份错误信息 -->
                <div v-if="backupError" class="mt-4 p-3 rounded-lg border border-red-300 bg-red-50 text-red-600">
                  {{ backupError }}
                </div>
                
                <!-- 备份成功信息 -->
                <div v-if="backupSuccess" class="mt-4 p-3 rounded-lg border border-green-300 bg-green-50 text-green-600">
                  {{ backupSuccess }}
                </div>
              </div>

              <!-- 数据恢复 -->
              <div class="border-t pt-6" :class="isDark ? 'border-tokyo-night-bg-highlight' : 'border-gray-200'">
                <h3 class="text-xl font-semibold mb-4 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
                  📤 恢复数据
                </h3>
                <p class="mb-4 text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
                  从备份文件恢复数据（此操作将覆盖现有数据，请谨慎操作）
                </p>
                <div class="space-y-4 max-w-md">
                  <div>
                    <label class="block text-sm font-medium mb-2 transition-colors" 
                           :class="isDark ? 'text-white' : 'text-gray-800'">
                      选择备份文件
                    </label>
                    <input 
                      type="file" 
                      ref="backupFile"
                      accept=".sql"
                      class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium"
                      :class="isDark 
                        ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white file:bg-tokyo-night-blue file:text-white' 
                        : 'bg-white border-gray-300 text-gray-900 file:bg-blue-600 file:text-white'"
                    />
                  </div>
                  <button 
                    @click="handleRestore"
                    :disabled="isRestoring || !backupFile?.files?.length"
                    class="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                    :class="isDark 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-orange-600 hover:bg-orange-700 text-white'"
                  >
                    {{ isRestoring ? '恢复中...' : '🔄 恢复数据' }}
                  </button>
                </div>
                
                <!-- 恢复错误信息 -->
                <div v-if="restoreError" class="mt-4 p-3 rounded-lg border border-red-300 bg-red-50 text-red-600">
                  {{ restoreError }}
                </div>
                
                <!-- 恢复成功信息 -->
                <div v-if="restoreSuccess" class="mt-4 p-3 rounded-lg border border-green-300 bg-green-50 text-green-600">
                  {{ restoreSuccess }}
                </div>
              </div>
            </div>
          </div>

          <!-- 系统设置 -->
          <div v-if="activeTab === 'settings'">
            <div class="glass-effect rounded-3xl p-4 sm:p-6 md:p-8">
              <h2 class="text-xl sm:text-2xl font-bold mb-6 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
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

// 移动端菜单显示状态
const showMobileMenu = ref(false)

// 博客文章数据
const blogPosts = ref([])
const searchQuery = ref('')
const statusFilter = ref('')

// 修改密码相关
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const isChangingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

// 备份相关
const isBackingUp = ref(false)
const backupError = ref('')
const backupSuccess = ref('')

// 恢复相关
const isRestoring = ref(false)
const restoreError = ref('')
const restoreSuccess = ref('')
const backupFile = ref(null)



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
  console.log('[BlogCMS] fetchPosts 开始执行')
  try {
    isLoading.value = true
    const response = await axios.get(`${API_BASE}/posts`, {
      headers: createAuthHeaders()
    })
    
    console.log('[BlogCMS] fetchPosts API 响应', {
      success: response.data.success,
      postsCount: response.data.data?.length || 0,
      status: response.status
    })
    
    if (response.data.success) {
      blogPosts.value = response.data.data.map(post => ({
        ...post,
        date: post.created_at ? new Date(post.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        tags: Array.isArray(post.tags) ? post.tags : []
      }))
      
      console.log('[BlogCMS] 文章列表已更新', {
        count: blogPosts.value.length,
        posts: blogPosts.value.map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug
        }))
      })
    }
  } catch (error) {
    console.error('[BlogCMS] 加载文章失败:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    // 如果是401错误，说明token失效，需要重新登录
    if (error.response?.status === 401) {
      logout()
      alert('登录已过期，请重新登录')
    } else {
      alert('加载文章失败，请稍后重试')
    }
  } finally {
    isLoading.value = false
    console.log('[BlogCMS] fetchPosts 执行完成')
  }
}

// 筛选后的文章列表
const filteredPosts = computed(() => {
  let filtered = blogPosts.value
  
  // 按状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(post => post.status === statusFilter.value)
  }
  
  // 按搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(post => 
      post.title?.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query) ||
      post.summary?.toLowerCase().includes(query) ||
      post.slug?.toLowerCase().includes(query) ||
      (Array.isArray(post.tags) && post.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }
  
  return filtered
})

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
  console.log('[BlogCMS] editPost 开始执行', {
    postId: post.id,
    postSlug: post.slug,
    postTitle: post.title,
    postObject: post
  })
  
  try {
    isLoading.value = true
    
    // 获取完整文章内容 - 优先使用 id，如果没有 id 且有 slug 则使用 slug
    let response
    let fetchMethod = ''
    
    if (post.id) {
      // 优先使用 id 获取，更可靠
      fetchMethod = 'by_id'
      console.log('[BlogCMS] 使用 ID 获取文章', { id: post.id, url: `${API_BASE}/posts?id=${post.id}` })
      response = await axios.get(`${API_BASE}/posts?id=${post.id}`, {
        headers: createAuthHeaders()
      })
    } else if (post.slug && post.slug !== 'null' && post.slug !== 'undefined' && post.slug.trim() !== '') {
      // 使用 slug 获取（仅当 slug 有效时）
      fetchMethod = 'by_slug'
      const encodedSlug = encodeURIComponent(post.slug)
      console.log('[BlogCMS] 使用 slug 获取文章', { slug: post.slug, encodedSlug, url: `${API_BASE}/posts?slug=${encodedSlug}` })
      response = await axios.get(`${API_BASE}/posts?slug=${encodedSlug}`, {
        headers: createAuthHeaders()
      })
    } else {
      // 既没有 id 也没有有效的 slug，无法编辑
      console.error('[BlogCMS] 文章标识无效，无法编辑', {
        hasId: !!post.id,
        hasSlug: !!post.slug,
        slugValue: post.slug,
        slugType: typeof post.slug
      })
      alert('文章标识无效，无法编辑。请确保文章有 ID 或有效的 slug。')
      isLoading.value = false
      return
    }
    
    console.log('[BlogCMS] API 响应接收', {
      method: fetchMethod,
      success: response.data.success,
      hasData: !!response.data.data,
      status: response.status,
      responseData: response.data
    })
    
    if (response.data.success && response.data.data) {
      const articleData = response.data.data
      console.log('[BlogCMS] 文章数据解析', {
        id: articleData.id,
        title: articleData.title,
        slug: articleData.slug,
        contentLength: articleData.content?.length || 0,
        hasContent: !!articleData.content,
        isEncrypted: articleData.is_encrypted,
        tags: articleData.tags,
        summary: articleData.summary,
        location: articleData.location,
        cover: articleData.cover
      })
      
      // 注意：由于API已经根据认证状态返回完整内容，这里不需要额外获取
      // 如果内容被截断（以...结尾），说明可能是未认证访问，但编辑时应该有认证
      if (articleData.is_encrypted && articleData.content && articleData.content.endsWith('...')) {
        console.warn('[BlogCMS] 文章内容被截断，可能是认证问题', {
          contentPreview: articleData.content.substring(0, 100)
        })
      }
      
      // 确保所有字段都有正确的默认值，特别是 content
      const postData = {
        id: articleData.id,
        title: articleData.title || '',
        slug: articleData.slug || null,
        summary: articleData.summary || '',
        content: articleData.content || '',
        location: articleData.location || '',
        cover: articleData.cover || '',
        tags: Array.isArray(articleData.tags) ? [...articleData.tags] : [],
        status: articleData.status || (articleData.published ? 'published' : 'draft'),
        is_encrypted: articleData.is_encrypted || false,
        access_password: articleData.access_password || null
      }
      
      console.log('[BlogCMS] 准备设置 editingPost', {
        id: postData.id,
        title: postData.title,
        contentLength: postData.content?.length || 0,
        hasContent: !!postData.content,
        tagsCount: postData.tags.length
      })
      
      // 先显示编辑器，然后设置数据，确保组件已经挂载
      showEditor.value = true
      
      // 使用 nextTick 确保组件已经渲染后再设置数据
      await nextTick()
      
      editingPost.value = postData
      
      console.log('[BlogCMS] editingPost 设置完成', {
        id: editingPost.value.id,
        title: editingPost.value.title,
        slug: editingPost.value.slug,
        contentLength: editingPost.value.content?.length || 0,
        tagsCount: editingPost.value.tags?.length || 0,
        hasContent: !!editingPost.value.content
      })
      
      console.log('[BlogCMS] 编辑器已显示，数据已设置')
    } else {
      console.error('[BlogCMS] 文章数据格式错误', { response: response.data })
      throw new Error('文章数据格式错误')
    }
  } catch (error) {
    console.error('[BlogCMS] 加载文章详情失败:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    })
    alert(error.response?.data?.error || error.message || '加载文章详情失败')
  } finally {
    isLoading.value = false
    console.log('[BlogCMS] editPost 执行完成')
  }
}

// 保存文章
const savePost = async (postData) => {
  console.log('[BlogCMS] savePost 开始执行', {
    isEditing: !!(editingPost.value && editingPost.value.id),
    editingPostId: editingPost.value?.id,
    postData: {
      title: postData.title,
      slug: postData.slug,
      contentLength: postData.content?.length || 0,
      tags: postData.tags,
      status: postData.status,
      summary: postData.summary,
      location: postData.location,
      cover: postData.cover
    }
  })
  
  try {
    isSaving.value = true
    
    // 清理 slug：将空字符串、'null'、'undefined' 转换为 null
    const originalSlug = postData.slug
    const cleanSlug = (postData.slug && 
                       postData.slug !== 'null' && 
                       postData.slug !== 'undefined' && 
                       postData.slug.trim() !== '') 
                      ? postData.slug.trim() 
                      : null
    
    console.log('[BlogCMS] slug 清理', {
      originalSlug,
      cleanSlug,
      slugType: typeof originalSlug,
      isEmpty: !originalSlug || originalSlug.trim() === ''
    })
    
    if (editingPost.value && editingPost.value.id) {
      // 更新现有文章
      const updateData = {
        id: editingPost.value.id,
        slug: cleanSlug,
        title: postData.title,
        content: postData.content,
        tags: postData.tags,
        status: postData.status,
        summary: postData.summary || '',
        location: postData.location || '',
        cover: postData.cover || ''
      }
      
      console.log('[BlogCMS] 准备更新文章', {
        url: `${API_BASE}/posts`,
        method: 'PUT',
        data: {
          ...updateData,
          contentLength: updateData.content?.length || 0
        }
      })
      
      const response = await axios.put(`${API_BASE}/posts`, updateData, {
        headers: createAuthHeaders()
      })
      
      console.log('[BlogCMS] 更新文章 API 响应', {
        success: response.data.success,
        status: response.status,
        responseData: response.data
      })
      
      if (response.data.success) {
        console.log('[BlogCMS] 文章更新成功')
        alert('文章更新成功！')
        await fetchPosts()
        // 触发博客更新事件，通知博客页面刷新
        window.dispatchEvent(new CustomEvent('blog-updated'))
      } else {
        console.error('[BlogCMS] 文章更新失败', { error: response.data.error })
        throw new Error(response.data.error || '更新失败')
      }
    } else {
      // 创建新文章
      const createData = {
        slug: cleanSlug,
        title: postData.title,
        content: postData.content,
        tags: postData.tags,
        status: postData.status,
        summary: postData.summary || '',
        location: postData.location || '',
        cover: postData.cover || ''
      }
      
      console.log('[BlogCMS] 准备创建文章', {
        url: `${API_BASE}/posts`,
        method: 'POST',
        data: {
          ...createData,
          contentLength: createData.content?.length || 0
        }
      })
      
      const response = await axios.post(`${API_BASE}/posts`, createData, {
        headers: createAuthHeaders()
      })
      
      console.log('[BlogCMS] 创建文章 API 响应', {
        success: response.data.success,
        status: response.status,
        responseData: response.data
      })
      
      if (response.data.success) {
        console.log('[BlogCMS] 文章创建成功')
        alert('文章创建成功！')
        await fetchPosts()
        // 刷新博客页面以显示最新数据
        window.dispatchEvent(new CustomEvent('blog-updated'))
      } else {
        console.error('[BlogCMS] 文章创建失败', { error: response.data.error })
        throw new Error(response.data.error || '创建失败')
      }
    }
    
    showEditor.value = false
    editingPost.value = null
    console.log('[BlogCMS] 编辑器已关闭')
  } catch (error) {
    console.error('[BlogCMS] 保存文章失败:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      requestData: error.config?.data,
      stack: error.stack
    })
    alert(error.response?.data?.error || error.message || '保存文章失败，请稍后重试')
  } finally {
    isSaving.value = false
    console.log('[BlogCMS] savePost 执行完成')
  }
}

// 删除文章
const deletePost = async (post) => {
  console.log('[BlogCMS] deletePost 开始执行', {
    postId: post.id,
    postTitle: post.title
  })
  
  if (!confirm(`确定要删除文章《${post.title}》吗？\n\n此操作不可撤销！`)) {
    console.log('[BlogCMS] 用户取消删除')
    return
  }
  
  try {
    isLoading.value = true
    const response = await axios.delete(`${API_BASE}/posts?id=${post.id}`, {
      headers: createAuthHeaders()
    })
    
    console.log('[BlogCMS] deletePost API 响应', {
      success: response.data.success,
      status: response.status,
      responseData: response.data
    })
    
    if (response.data.success) {
      console.log('[BlogCMS] 文章删除成功')
      alert('文章已删除')
      await fetchPosts()
      // 刷新博客页面以显示最新数据
      window.dispatchEvent(new CustomEvent('blog-updated'))
    } else {
      throw new Error(response.data.error || '删除失败')
    }
  } catch (error) {
    console.error('[BlogCMS] 删除文章失败:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    alert(error.response?.data?.error || error.message || '删除文章失败，请稍后重试')
  } finally {
    isLoading.value = false
    console.log('[BlogCMS] deletePost 执行完成')
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

// 处理数据备份
const handleBackup = async () => {
  try {
    isBackingUp.value = true
    backupError.value = ''
    backupSuccess.value = ''
    
    // 调用备份API
    const response = await axios.get(`${API_BASE}/backup`, {
      headers: createAuthHeaders(),
      responseType: 'blob' // 重要：设置响应类型为blob以处理文件下载
    })
    
    // 创建下载链接
    const blob = new Blob([response.data], { type: 'application/sql' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 从响应头获取文件名，如果没有则使用默认名称
    const contentDisposition = response.headers['content-disposition']
    let filename = `backup_${new Date().toISOString().split('T')[0]}.sql`
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '')
      }
    }
    
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    backupSuccess.value = `数据备份成功！文件已下载为 ${filename}`
    
    // 3秒后清除成功消息
    setTimeout(() => {
      backupSuccess.value = ''
    }, 3000)
    
  } catch (error) {
    console.error('备份失败:', error)
    backupError.value = error.response?.data?.error || error.message || '备份失败，请稍后重试'
  } finally {
    isBackingUp.value = false
  }
}

// 处理数据恢复
const handleRestore = async () => {
  try {
    isRestoring.value = true
    restoreError.value = ''
    restoreSuccess.value = ''
    
    if (!backupFile.value?.files?.length) {
      restoreError.value = '请选择备份文件'
      return
    }
    
    const file = backupFile.value.files[0]
    const text = await file.text()
    
    // 验证备份文件格式
    if (!text.trim().toLowerCase().includes('insert into') && !text.trim().toLowerCase().includes('--')) {
      restoreError.value = '备份文件格式不正确，请选择有效的SQL备份文件'
      return
    }
    
    // 调用恢复API
    const response = await axios.post(`${API_BASE}/restore`, { sqlContent: text }, {
      headers: createAuthHeaders()
    })
    
    if (response.data.success) {
      const results = response.data.results
      restoreSuccess.value = `数据恢复成功！已执行 ${results.executedStatements} 条SQL语句${results.errors.length > 0 ? `，其中 ${results.errors.length} 条执行失败` : ''}`
      
      // 刷新文章列表
      await fetchPosts()
      
      // 清空文件选择
      backupFile.value.value = ''
      
      // 3秒后清除成功消息
      setTimeout(() => {
        restoreSuccess.value = ''
      }, 5000)
    } else {
      restoreError.value = response.data.error || '恢复失败'
    }
    
  } catch (error) {
    console.error('恢复失败:', error)
    if (error instanceof SyntaxError) {
      restoreError.value = '备份文件格式错误，请选择有效的SQL文件'
    } else {
      restoreError.value = error.response?.data?.error || error.message || '恢复失败，请稍后重试'
    }
  } finally {
    isRestoring.value = false
  }
}


</script>