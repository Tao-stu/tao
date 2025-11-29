<template>
  <nav 
    class="fixed top-0 left-0 right-0 z-40 transition-all duration-300 nav-font"
    :class="{ 'glass-effect shadow-lg': scrolled, 'bg-transparent': !scrolled }"
  >
    <div class="container relative mx-auto px-4 py-4">
      <!-- 右上角控制区 -->
      <div class="absolute top-4 right-4 flex items-center gap-2 md:gap-3">
        <button
          @click="toggleTheme"
          class="theme-toggle-btn p-2 rounded-lg transition-all duration-300 border border-transparent"
          :class="isDark ? 'hover:bg-tokyo-night-bg-highlight text-tokyo-night-cyan' : 'hover:bg-gray-200 text-blue-700'"
          :title="isDark ? '切换到白昼模式' : '切换到黑夜模式'"
        >
          <transition name="icon-fade" mode="out-in">
            <svg v-if="isDark" key="moon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
            <svg v-else key="sun" class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </transition>
        </button>

        <!-- 移动端菜单按钮 -->
        <button 
          @click="toggleMobileMenu"
          class="p-2 rounded-lg transition-all duration-300 md:hidden border border-transparent"
          :class="isDark ? 'hover:bg-tokyo-night-bg-highlight text-tokyo-night-fg' : 'hover:bg-gray-200 text-gray-800'"
        >
          <svg 
            class="w-6 h-6 transition-transform duration-300"
            :class="{ 'rotate-90': mobileMenuOpen }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              v-if="!mobileMenuOpen"
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path 
              v-else
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="flex flex-col items-center gap-4 md:gap-6">
        <!-- 桌面端导航 -->
        <div class="hidden md:flex items-center justify-center nav-pill space-x-8 px-8 py-2">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.hash ? { path: link.path, hash: link.hash } : link.path"
            class="link-underline text-lg font-bold tracking-wide transition-colors"
            :class="[
              { 'active': isActive(link.path) },
              isDark ? 'text-tokyo-night-fg hover:text-tokyo-night-cyan' : 'text-gray-800 hover:text-blue-600'
            ]"
          >
            {{ link.name }}
          </router-link>
        </div>
      </div>
      
        <!-- 移动端菜单 -->
      <transition name="slide-down">
        <div 
          v-if="mobileMenuOpen" 
          class="md:hidden mt-4 rounded-2xl p-2 overflow-hidden mobile-menu-glass"
        >
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.hash ? { path: link.path, hash: link.hash } : link.path"
            @click="closeMobileMenu"
            class="block py-3 px-4 rounded-xl font-bold transition-all duration-300 my-2"
            :class="[
              isActive(link.path) 
                ? (isDark ? 'bg-tokyo-night-bg-highlight text-tokyo-night-cyan' : 'bg-blue-100 text-blue-600')
                : (isDark ? 'hover:bg-tokyo-night-bg-highlight text-tokyo-night-fg' : 'hover:bg-gray-200 text-gray-800')
            ]"
          >
            {{ link.name }}
          </router-link>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'

const route = useRoute()
const scrolled = ref(false)
const mobileMenuOpen = ref(false)
const { isDark, toggleTheme } = useTheme()

const navLinks = [
  { name: '主页', path: '/' },
  { name: '文章', path: '/blog' },
  { name: '留言', path: '/guestbook' },
  { name: '关于', path: '/about' },
]

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const isActive = (path) => {
  return route.path === path
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.slide-down-enter-active {
  animation: slideDownIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-down-leave-active {
  animation: slideDownOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideDownIn {
  0% {
    opacity: 0;
    transform: translateY(-20px) scaleY(0.8);
    transform-origin: top;
  }
  100% {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
}

@keyframes slideDownOut {
  0% {
    opacity: 1;
    transform: translateY(0) scaleY(1);
    transform-origin: top;
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scaleY(0.8);
  }
}

/* 链接下划线动画 - Tokyo Night */
.link-underline {
  position: relative;
  display: inline-block;
}

.link-underline::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: -4px;
  left: 0;
  background: linear-gradient(90deg, #7aa2f7, #7dcfff);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s ease;
}

.link-underline:hover::after {
  transform: scaleX(1);
}

.link-underline.active::after {
  animation: pulseLine 1.5s ease-in-out infinite;
  transform: scaleX(1);
}

@keyframes pulseLine {
  0%, 100% {
    transform: scaleX(0.8);
    opacity: 0.8;
  }
  50% {
    transform: scaleX(1);
    opacity: 1;
  }
}

/* 主题切换图标动画 */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.3s ease;
}

.icon-fade-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0);
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle-btn:hover svg {
  transform: rotate(20deg) scale(1.1);
  transition: transform 0.3s ease;
}

/* 白昼模式下的链接下划线 */
.light .link-underline::after {
  background: linear-gradient(90deg, #2563eb, #3b82f6);
}

/* 移动端菜单毛玻璃效果 */
.mobile-menu-glass {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.dark .mobile-menu-glass {
  background: rgba(26, 27, 38, 0.95);
  border: 1px solid rgba(122, 162, 247, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.light .mobile-menu-glass {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(37, 99, 235, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.nav-font {
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  letter-spacing: 0.05em;
}

.nav-font .link-underline,
.nav-font .logo-text {
  font-feature-settings: 'palt' 1;
}

.nav-pill {
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-radius: 9999px;
  border: 1px solid rgba(122, 162, 247, 0.3);
  background: rgba(15, 18, 30, 0.35);
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.25);
}

.light .nav-pill {
  border-color: rgba(37, 99, 235, 0.2);
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.15);
}

/* LOGO文字样式 */
.dark .logo-text {
  background: linear-gradient(90deg, #7aa2f7, #7dcfff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #7aa2f7;
}

.light .logo-text {
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #2563eb;
}
</style>

