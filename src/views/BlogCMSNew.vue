<template>
  <div class="pt-28 pb-12" :class="isDark ? 'dark' : 'light'" style="font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
    <div v-if="!authorized" class="container mx-auto px-4 max-w-md">
      <div class="glass-effect rounded-3xl p-8 space-y-6 text-center">
        <h2 class="text-2xl font-bold">Manage 登录</h2>
        <p class="text-sm text-gray-500 dark:text-gray-300">请输入访问密码</p>
        <input
          v-model="passwordInput"
          type="password"
          class="w-full px-4 py-3 rounded-2xl bg-transparent border border-gray-300/40 dark:border-white/10 focus:ring-2 focus:ring-tokyo-night-cyan outline-none"
          placeholder="输入密码"
          @keyup.enter="handleLogin"
        />
        <label class="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input type="checkbox" v-model="rememberPassword" class="w-4 h-4 text-tokyo-night-cyan rounded border-gray-300 focus:ring-tokyo-night-cyan" />
          记住密码（仅当前设备）
        </label>
        <div class="space-y-3">
          <button
            class="w-full h-12 px-6 rounded-xl bg-gradient-to-r from-tokyo-night-blue to-tokyo-night-cyan text-white shadow-lg hover:shadow-xl transition-all text-base font-medium"
            @click="handleLogin"
          >
            进入管理
          </button>
        </div>
        <p v-if="authError" class="text-red-500 text-sm">{{ authError }}</p>
      </div>
    </div>

    <div v-else class="container mx-auto px-4 max-w-5xl space-y-8">
      <header class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p class="text-sm uppercase tracking-[0.4em] text-tokyo-night-dark5">Manage</p>
          <h1 class="text-4xl font-bold mt-2">{{ isEdit ? '编辑文章' : '新建文章' }}</h1>
          <p class="text-gray-500 dark:text-gray-300 mt-2">
            {{ isEdit ? '更新文章内容并保存同步到博客列表。' : '填写以下信息，保存后自动发布到博客列表。' }}
          </p>
        </div>
        <router-link
          to="/cms"
          class="h-12 px-6 rounded-xl border border-tokyo-night-cyan/50 text-tokyo-night-cyan hover:bg-tokyo-night-bg-highlight transition-all duration-300 text-base font-medium inline-flex items-center justify-center"
        >
          返回管理
        </router-link>
      </header>

      <section class="glass-effect rounded-3xl p-8 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">标题 *</label>
            <input
              v-model="form.title"
              type="text"
              class="w-full px-4 py-3 rounded-2xl bg-transparent border border-gray-300/40 dark:border-white/10 focus:ring-2 focus:ring-tokyo-night-cyan outline-none"
              :disabled="loadingArticle || saving"
              placeholder="请输入文章标题"
            />
          </div>

          <div class="space-y-4">
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">地点</label>
            <input
              v-model="form.location"
              type="text"
              class="w-full px-4 py-3 rounded-2xl bg-transparent border border-gray-300/40 dark:border-white/10 focus:ring-2 focus:ring-tokyo-night-cyan outline-none"
              :disabled="loadingArticle || saving"
              placeholder="如：中国 山东 滨州"
            />
          </div>
        </div>

        <div class="space-y-4">
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">摘要</label>
          <textarea
            v-model="form.summary"
            rows="3"
            class="w-full px-4 py-3 rounded-2xl bg-transparent border border-gray-300/40 dark:border-white/10 focus:ring-2 focus:ring-tokyo-night-cyan outline-none resize-none"
            :disabled="loadingArticle || saving"
            placeholder="用于列表预览的简介"
          ></textarea>
        </div>

        <div class="space-y-4">
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">正文内容</label>
          <textarea
            v-model="form.content"
            rows="12"
            class="w-full px-4 py-3 rounded-2xl bg-transparent border border-gray-300/40 dark:border-white/10 focus:ring-2 focus:ring-tokyo-night-cyan outline-none"
            :disabled="loadingArticle || saving"
            placeholder="支持 Markdown 内容"
          ></textarea>
        </div>

        <div class="flex items-center gap-3">
          <input id="published" v-model="form.published" type="checkbox" class="w-4 h-4 text-tokyo-night-cyan rounded border-gray-300 focus:ring-tokyo-night-cyan" :disabled="loadingArticle || saving" />
          <label for="published" class="text-sm text-gray-600 dark:text-gray-300">立即发布</label>
        </div>

        <div class="flex items-center gap-3">
          <button
            class="h-12 px-6 rounded-xl border transition-all text-base font-medium"
            :disabled="saving || loadingArticle"
            @click="resetForm"
          >
            {{ isEdit ? '恢复内容' : '重置' }}
          </button>
          <button
            class="h-12 px-6 rounded-xl bg-gradient-to-r from-tokyo-night-blue to-tokyo-night-cyan text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-base font-medium"
            :disabled="saving || loadingArticle || !form.title.trim() || !form.content.trim()"
            @click="submitForm"
          >
            {{ saving ? '保存中...' : (isEdit ? '保存修改' : '保存文章') }}
          </button>
        </div>

        <p v-if="message" class="text-green-500">{{ message }}</p>
        <p v-if="formError" class="text-red-500">{{ formError }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useScrollAnimation } from '../composables/useScrollAnimation'
import { useRouter, useRoute } from 'vue-router'

useScrollAnimation()
const { isDark } = useTheme()
const router = useRouter()
const route = useRoute()

const API_URL = '/api/posts'
const PASSWORD = '20060216'
const REMEMBER_KEY = 'cms_manage_remember'

const saving = ref(false)
const message = ref('')
const formError = ref('')
const loadingArticle = ref(false)
const authorized = ref(false)
const passwordInput = ref('')
const rememberPassword = ref(false)
const authError = ref('')

const form = reactive({
  title: '',
  summary: '',
  content: '',
  location: '',
  published: true
})

const articleId = computed(() => {
  const id = route.query.id
  return id ? Number(id) : null
})

const isEdit = computed(() => !!articleId.value)

const populateForm = (data) => {
  form.title = data.title || ''
  form.summary = data.summary || ''
  form.content = data.content || ''
  form.location = data.location || ''
  form.published = !!data.published
}

const loadArticle = async () => {
  if (!articleId.value) return
  loadingArticle.value = true
  formError.value = ''
  try {
    const response = await fetch(`${API_URL}?id=${articleId.value}`)
    
    // 检查响应是否为JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('服务器响应格式错误，请检查API配置')
    }
    
    const result = await response.json()
    if (!response.ok || !result.success) throw new Error(result.error || '加载文章失败')
    populateForm(result.data)
  } catch (err) {
    console.error('CMS load article error:', err)
    formError.value = err.message || '加载文章失败'
  } finally {
    loadingArticle.value = false
  }
}

const resetForm = () => {
  if (isEdit.value) {
    loadArticle()
    return
  }
  populateForm({
    title: '',
    summary: '',
    content: '',
    location: '',
    published: true
  })
  formError.value = ''
  message.value = ''
}

const handleLogin = () => {
  if (passwordInput.value === PASSWORD) {
    authorized.value = true
    authError.value = ''
    if (rememberPassword.value) {
      localStorage.setItem(REMEMBER_KEY, '1')
    } else {
      localStorage.removeItem(REMEMBER_KEY)
    }
  } else {
    authError.value = '密码错误，请重试'
  }
}



const initAuth = () => {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(REMEMBER_KEY) === '1') {
    authorized.value = true
  }
}

const submitForm = async () => {
  formError.value = ''
  message.value = ''
  if (!form.title.trim() || !form.content.trim()) {
    formError.value = '标题和正文内容不能为空'
    return
  }

  saving.value = true
  try {
    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      content: form.content.trim(),
      location: form.location.trim(),
      published: form.published
    }

    const method = isEdit.value ? 'PUT' : 'POST'
    const url = isEdit.value ? `${API_URL}?id=${articleId.value}` : API_URL

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    // 检查响应是否为JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('服务器响应格式错误，请检查API配置')
    }
    
    const result = await response.json()
    if (!response.ok || !result.success) throw new Error(result.error || '保存失败')

    message.value = isEdit.value ? '文章已更新，正在返回...' : '文章创建成功，正在返回...'
    setTimeout(() => {
    router.push('/cms')
    }, 1200)
  } catch (err) {
    formError.value = err.message || '保存失败'
  } finally {
    saving.value = false
  }
}

watch([authorized, articleId], ([auth]) => {
  if (auth && articleId.value) {
    loadArticle()
  }
})

onMounted(() => {
  initAuth()
  if (authorized.value && articleId.value) {
    loadArticle()
  }
})
</script>

