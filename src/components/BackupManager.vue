<template>
  <div class="glass-effect rounded-3xl p-8">
    <h2 class="text-2xl font-bold mb-6 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
      💾 数据备份与恢复
    </h2>
    
    <!-- 备份区域 -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
        📥 数据备份
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <button 
          @click="backupData('posts')"
          :disabled="isBackingUp"
          class="p-4 rounded-lg border transition-all duration-300 disabled:opacity-50"
          :class="isDark 
            ? 'border-tokyo-night-blue text-tokyo-night-cyan hover:bg-tokyo-night-blue hover:text-white' 
            : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'"
        >
          <div class="text-lg font-semibold mb-1">📝 备份文章</div>
          <div class="text-sm opacity-80">导出所有文章数据</div>
        </button>
        
        <button 
          @click="backupData('messages')"
          :disabled="isBackingUp"
          class="p-4 rounded-lg border transition-all duration-300 disabled:opacity-50"
          :class="isDark 
            ? 'border-tokyo-night-blue text-tokyo-night-cyan hover:bg-tokyo-night-blue hover:text-white' 
            : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'"
        >
          <div class="text-lg font-semibold mb-1">💬 备份留言</div>
          <div class="text-sm opacity-80">导出所有留言数据</div>
        </button>
        
        <button 
          @click="backupData('all')"
          :disabled="isBackingUp"
          class="p-4 rounded-lg border transition-all duration-300 disabled:opacity-50"
          :class="isDark 
            ? 'border-tokyo-night-blue text-tokyo-night-cyan hover:bg-tokyo-night-blue hover:text-white' 
            : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'"
        >
          <div class="text-lg font-semibold mb-1">📦 全部备份</div>
          <div class="text-sm opacity-80">导出所有数据</div>
        </button>
      </div>
      
      <!-- 备份状态 -->
      <div v-if="isBackingUp" class="p-3 rounded-lg border border-blue-300 bg-blue-50 text-blue-600">
        正在备份数据，请稍候...
      </div>
      
      <div v-if="backupSuccess" class="p-3 rounded-lg border border-green-300 bg-green-50 text-green-600">
        {{ backupSuccess }}
      </div>
      
      <div v-if="backupError" class="p-3 rounded-lg border border-red-300 bg-red-50 text-red-600">
        {{ backupError }}
      </div>
    </div>

    <!-- 恢复区域 -->
    <div class="border-t pt-6" :class="isDark ? 'border-tokyo-night-bg-highlight' : 'border-gray-200'">
      <h3 class="text-xl font-semibold mb-4 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
        📤 数据恢复
      </h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2 transition-colors" 
                 :class="isDark ? 'text-white' : 'text-gray-800'">
            选择备份文件
          </label>
          <input 
            type="file" 
            ref="fileInput"
            accept=".sql"
            @change="handleFileSelect"
            class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            :class="isDark 
              ? 'bg-tokyo-night-bg-highlight border-tokyo-night-blue text-white' 
              : 'bg-white border-gray-300 text-gray-900'"
          />
          <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
            请选择之前备份的SQL文件
          </p>
        </div>
        
        <div v-if="selectedFile" class="p-4 rounded-lg border" 
             :class="isDark ? 'border-tokyo-night-bg-highlight bg-tokyo-night-bg-highlight/50' : 'border-gray-200 bg-gray-50'">
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium">📄 {{ selectedFile.name }}</span>
            <button 
              @click="clearFile"
              class="text-red-500 hover:text-red-700 transition-colors"
            >
              ✕ 清除
            </button>
          </div>
          <div class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
            文件大小: {{ formatFileSize(selectedFile.size) }}
          </div>
        </div>
        
        <!-- 恢复说明 -->
        <div v-if="selectedFile && backupDataPreview">
          <div class="p-3 rounded-lg border" 
               :class="isDark ? 'border-tokyo-night-bg-highlight bg-tokyo-night-bg-highlight/50' : 'border-gray-200 bg-gray-50'">
            <p class="text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
              <strong>恢复说明：</strong>SQL文件将按顺序执行所有语句，包括清空数据和插入数据。
              请确保您了解将要执行的操作。
            </p>
          </div>
        </div>
        
        <button 
          @click="restoreData"
          :disabled="!selectedFile || isRestoring"
          class="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
          :class="isDark 
            ? 'bg-tokyo-night-blue hover:bg-tokyo-night-blue0 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'"
        >
          {{ isRestoring ? '恢复中...' : '🔄 开始恢复' }}
        </button>
        
        <!-- 恢复状态 -->
        <div v-if="isRestoring" class="p-3 rounded-lg border border-blue-300 bg-blue-50 text-blue-600">
          正在恢复数据，请稍候...
        </div>
        
        <div v-if="restoreSuccess" class="p-3 rounded-lg border border-green-300 bg-green-50 text-green-600">
          {{ restoreSuccess }}
        </div>
        
        <div v-if="restoreError" class="p-3 rounded-lg border border-red-300 bg-red-50 text-red-600">
          {{ restoreError }}
        </div>
        
        <!-- 恢复结果详情 -->
        <div v-if="restoreResults" class="p-4 rounded-lg border" 
             :class="isDark ? 'border-tokyo-night-bg-highlight' : 'border-gray-200'">
          <h4 class="font-semibold mb-2">执行结果详情：</h4>
          <div class="space-y-2 text-sm">
            <div>
              <strong>执行统计：</strong>
              <div class="ml-4 mt-1">
                <div class="text-green-600">✓ 成功执行语句：{{ restoreResults.executedStatements }} 条</div>
                <div v-if="restoreResults.errors.length > 0" class="text-red-600">
                  ✗ 执行失败语句：{{ restoreResults.errors.length }} 条
                </div>
              </div>
            </div>
            <div v-if="restoreResults.errors.length > 0">
              <strong>错误详情：</strong>
              <ul class="ml-4 mt-1">
                <li v-for="(error, index) in restoreResults.errors" :key="index" 
                    class="text-red-600 mb-2">
                  <div class="font-mono text-xs bg-red-50 p-2 rounded">
                    {{ error.statement }}
                  </div>
                  <div class="text-xs">错误：{{ error.error }}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import axios from 'axios'

const { isDark } = useTheme()

// 状态变量
const isBackingUp = ref(false)
const isRestoring = ref(false)
const backupSuccess = ref('')
const backupError = ref('')
const restoreSuccess = ref('')
const restoreError = ref('')
const restoreResults = ref(null)

// 文件相关
const fileInput = ref(null)
const selectedFile = ref(null)
const backupDataPreview = ref(null)
const restoreType = ref('all')

// API 基础路径
const API_BASE = '/api'

// 获取认证token
const getAuthToken = () => {
  return localStorage.getItem('blog_admin_token')
}

// 创建带认证头的axios实例
const createAuthHeaders = () => {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// 备份数据
const backupData = async (type) => {
  isBackingUp.value = true
  backupSuccess.value = ''
  backupError.value = ''
  
  try {
    const response = await axios.get(`${API_BASE}/backup`, {
      headers: createAuthHeaders(),
      responseType: 'blob'
    })
    
    // 创建下载链接
    const blob = new Blob([response.data], { type: 'application/sql' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 从响应头获取文件名，如果没有则使用默认名称
    const contentDisposition = response.headers['content-disposition']
    let filename = `backup_${type}_${new Date().toISOString().split('T')[0]}.sql`
    
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
    
    backupSuccess.value = `备份成功！文件已下载为 ${filename}`
  } catch (error) {
    console.error('备份失败:', error)
    backupError.value = error.response?.data?.error || error.message || '备份失败，请稍后重试'
  } finally {
    isBackingUp.value = false
  }
}

// 处理文件选择
const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (!file.name.endsWith('.sql')) {
    restoreError.value = '请选择SQL格式的备份文件'
    return
  }
  
  selectedFile.value = file
  
  // 预览备份文件内容
  try {
    const text = await file.text()
    if (!text.trim().toLowerCase().includes('insert into') && !text.trim().toLowerCase().includes('--')) {
      throw new Error('不是有效的SQL备份文件')
    }
    backupDataPreview.value = { sqlContent: text }
    restoreError.value = ''
  } catch (error) {
    restoreError.value = '备份文件格式错误，请选择有效的SQL备份文件'
    backupDataPreview.value = null
  }
}

// 清除选择的文件
const clearFile = () => {
  selectedFile.value = null
  backupDataPreview.value = null
  restoreResults.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 恢复数据
const restoreData = async () => {
  if (!selectedFile.value || !backupDataPreview.value) return
  
  isRestoring.value = true
  restoreSuccess.value = ''
  restoreError.value = ''
  restoreResults.value = null
  
  try {
    const response = await axios.post(`${API_BASE}/restore`, {
      sqlContent: backupDataPreview.value.sqlContent
    }, {
      headers: createAuthHeaders()
    })
    
    if (response.data.success) {
      const results = response.data.results
      restoreSuccess.value = `SQL文件执行完成！已执行 ${results.executedStatements} 条语句${results.errors.length > 0 ? `，其中 ${results.errors.length} 条执行失败` : ''}`
      restoreResults.value = results
      
      // 触发页面刷新事件
      window.dispatchEvent(new CustomEvent('blog-updated'))
      window.dispatchEvent(new CustomEvent('guestbook-updated'))
    } else {
      throw new Error(response.data.error || '恢复失败')
    }
  } catch (error) {
    console.error('恢复失败:', error)
    restoreError.value = error.response?.data?.error || error.message || '恢复失败，请稍后重试'
  } finally {
    isRestoring.value = false
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>