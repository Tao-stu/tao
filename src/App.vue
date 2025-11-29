<template>
  <div id="app" class="min-h-screen theme-transition" :class="isDark ? 'dark tokyo-night-bg' : 'light-bg'" style="font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
    <!-- 顶部导航栏 -->
    <NavBar />

    <!-- 页面内容 -->
    <main class="min-h-screen">
      <router-view v-slot="{ Component }">
        <transition name="page-transition" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部信息栏 -->
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import { useTheme } from './composables/useTheme'

const { isDark, initTheme } = useTheme()

onMounted(() => {
  // 初始化主题
  initTheme()
})
</script>

<style scoped>
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.4s ease;
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>

