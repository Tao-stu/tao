<template>
  <div class="pt-28 pb-12" id="home-anchor" style="font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
    <div class="container mx-auto px-4">
      <!-- Hero Section -->
      <section id="home-hero" class="mb-16">
        <div class="flex flex-col gap-8 mb-8">
          <div class="flex flex-wrap items-center gap-6">
            <!-- 圆形Logo -->
            <img src="/img/LOGO.jpg" alt="Logo" class="w-32 h-32 rounded-full ring-4 ring-tokyo-night-blue shadow-2xl animate-scale-in" />

            <div class="flex flex-col gap-3 text-left">
              <div class="flex flex-wrap items-center gap-3">
                <span class="text-4xl md:text-5xl font-semibold signature-reveal">
                  Hello, I'm Tao~
                </span>
              </div>
              <p class="text-xl italic animate-fade-in transition-colors max-w-2xl" :class="isDark ? 'text-white' : 'text-gray-700'">
                若非心胸宽广如海，人生如何能保持风平浪静。
              </p>
            </div>
          </div>

          <a 
            href="#about-section" 
            class="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-tokyo-night-blue/40 text-sm tracking-wide transition-all hover:scale-105 w-fit"
            :class="isDark ? 'text-tokyo-night-cyan hover:bg-tokyo-night-bg-highlight' : 'text-blue-700 hover:bg-blue-50'"
          >
            了解更多
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      <!-- 关于我卡片 -->
      <section id="about-section" class="mb-12">
        <div class="glass-effect rounded-3xl p-8 card-hover scroll-animate">
          <h2 class="text-3xl font-bold mb-6">
            <span class="title-reveal">关于我 | About Me</span>
          </h2>
          
          <div class="mb-8">
            <h3 class="text-xl font-semibold mb-4 transition-colors" :class="isDark ? 'text-tokyo-night-cyan' : 'text-blue-600'">自我介绍 | Profile</h3>
            <p class="text-lg transition-colors" :class="isDark ? 'text-white' : 'text-gray-700'">
              专业信息安全，主攻各种环境部署、CTF、服务器运维、渗透测试方向
            </p>
          </div>
          
          <div class="mb-4">
            <h3 class="text-xl font-semibold mb-4 transition-colors" :class="isDark ? 'text-tokyo-night-cyan' : 'text-blue-600'">基础信息 | Basic Info</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center gap-3 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
                <span class="text-2xl">🇨🇳</span>
                <span>中国山东省滨州市 | BinZhou, Shandong, China</span>
              </div>
              <div class="flex items-center gap-3 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
                <span class="text-2xl">🎂</span>
                <span>丙戌年正月十九 | 2006.02.16</span>
              </div>
              <div class="flex items-center gap-3 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
                <span class="text-2xl">📚</span>
                <span>SDCIT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 我的技能卡片 -->
      <section class="mb-12">
        <div class="glass-effect rounded-3xl p-8 card-hover scroll-animate scroll-animate-delay-1">
          <h2 class="text-3xl font-bold mb-6">
            <span class="title-reveal">我的技能 | My Skills</span>
          </h2>
          
          <!-- 操作系统 -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold mb-4 transition-colors" :class="isDark ? 'text-tokyo-night-cyan' : 'text-blue-600'">操作系统 | OS</h3>
            <div class="flex flex-wrap gap-3">
              <img src="https://img.shields.io/badge/Windows-0078D6?logo=microsoft&logoColor=white" alt="Windows" class="h-8" />
              <img src="https://img.shields.io/badge/Linux-FCC624?logo=linux&logoColor=black" alt="Linux" class="h-8" />
            </div>
          </div>
          
          <!-- 常用开发语言 -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold mb-4 transition-colors" :class="isDark ? 'text-tokyo-night-cyan' : 'text-blue-600'">常用开发语言 | Common Programming Languages</h3>
            <div class="flex flex-wrap gap-3">
              <img src="https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white" alt="Python" class="h-8" />
              <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white" alt="HTML5" class="h-8" />
              <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript" class="h-8" />
              <img src="https://img.shields.io/badge/PHP-777BB4?logo=php&logoColor=white" alt="PHP" class="h-8" />
              <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker" class="h-8" />
            </div>
          </div>
        </div>
      </section>

      
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '../composables/useTheme'
import { useScrollAnimation } from '../composables/useScrollAnimation'

const { isDark } = useTheme()
useScrollAnimation()

</script>

<style scoped>
/* 艺术签名 - 根据主题动态变色 */
.dark .signature-text {
  background: linear-gradient(135deg, #7aa2f7 0%, #bb9af7 50%, #7dcfff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #7aa2f7;
  animation: gradientShift 3s ease infinite;
  background-size: 200% 200%;
}

.light .signature-text {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #2563eb;
  animation: gradientShift 3s ease infinite;
  background-size: 200% 200%;
}

/* 区段标题样式 */
.dark .section-title {
  background: linear-gradient(90deg, #7aa2f7, #7dcfff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #7aa2f7;
}

.light .section-title {
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #2563eb;
}

.dark .section-title-alt {
  background: linear-gradient(90deg, #bb9af7, #9d7cd8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #bb9af7;
}

.light .section-title-alt {
  background: linear-gradient(90deg, #7c3aed, #6d28d9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #7c3aed;
}

.dark .section-title-orange {
  background: linear-gradient(90deg, #ff9e64, #e0af68);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #ff9e64;
}

.light .section-title-orange {
  background: linear-gradient(90deg, #f59e0b, #d97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #f59e0b;
}

/* 音乐盒背景 */
.dark .music-box-bg {
  background: linear-gradient(135deg, #bb9af7, #9d7cd8);
}

.light .music-box-bg {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
}

/* 进度条 */
.dark .progress-bar {
  background: linear-gradient(90deg, #7aa2f7, #7dcfff);
}

.light .progress-bar {
  background: linear-gradient(90deg, #2563eb, #3b82f6);
}

/* 边框主题 */
.dark .border-theme {
  border-color: rgba(122, 162, 247, 0.3);
}

.light .border-theme {
  border-color: rgba(37, 99, 235, 0.3);
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>

