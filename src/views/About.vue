<template>
  <div class="pt-28 pb-12" :class="isDark ? 'dark' : 'light'" style="font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
    <div class="container mx-auto px-4">
      <!-- 页面标题 -->
      <div class="text-center mb-12 animate-fade-in">
        <h1 class="text-5xl font-bold mb-4 title-reveal">
          关于 | ABOUT ME
        </h1>
      </div>

      <!-- 毛玻璃卡片网格布局 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
        <!-- 国家/地区卡片 -->
        <div 
          class="glass-effect rounded-3xl p-8 card-hover scroll-animate relative overflow-hidden group card-with-bg"
        >
          <div 
            class="card-bg-image"
            :style="{ backgroundImage: `url(/img/BinZhou.png)` }"
          ></div>
          <div class="relative z-10">
            <h3 class="text-2xl font-bold mb-4 transition-colors" :class="isDark ? 'text-tokyo-night-cyan' : 'text-blue-600'">国家或地区 | Country/Region</h3>
            <div class="space-y-2 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
              <p class="text-xl font-semibold">🇨🇳 中华人民共和国 | People's Republic of CHINA</p>
              <p class="text-lg">📍 山东省滨州市 | BinZhou, Shandong</p>
            </div>
          </div>
        </div>

        <!-- 个人信息卡片 -->
        <div 
          class="glass-effect rounded-3xl p-8 card-hover scroll-animate scroll-animate-delay-1 relative overflow-hidden group card-with-bg"
        >
          <div 
            class="card-bg-image"
            :style="{ backgroundImage: `url(/img/info personal.png)` }"
          ></div>
          <div class="relative z-10">
            <h3 class="text-2xl font-bold mb-4 transition-colors" :class="isDark ? 'text-tokyo-night-cyan' : 'text-blue-600'">个人信息 | Personal Info</h3>
            <div class="space-y-3 text-lg transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
              <p>🎂 2006.2.16</p>
              <p>🩸 A</p>
              <p>👀 5.1 / 5.0</p>
            </div>
          </div>
        </div>

        <!-- 设备信息卡片 - 占据更大空间 -->
        <div 
          class="glass-effect rounded-3xl p-8 card-hover scroll-animate scroll-animate-delay-2 relative overflow-hidden group card-with-bg md:col-span-2 lg:col-span-1 lg:row-span-2"
        >
          <div 
            class="card-bg-image"
            :style="{ 
              backgroundImage: `url(/img/Devices.png)`, 
              backgroundSize: '80%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center 60%'
            }"
          ></div>
          <div class="relative z-10">
            <h3 class="text-2xl font-bold mb-6 transition-colors" :class="isDark ? 'text-tokyo-night-cyan' : 'text-blue-600'">我的设备 | My Devices</h3>
            
            <div class="space-y-6">
              <!-- 笔记本 -->
              <div>
                <p class="font-bold text-lg mb-2 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">💻 ThinkBook 16 G6 IRL</p>
                <ul class="space-y-1 text-sm ml-4 transition-colors" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
                  <li>• Intel Core i7-13650HX</li>
                  <li>• NVIDIA GeForce RTX 4050 Laptop 6GB</li>
                  <li>• DDR5 16GB ×2 @ 5600MHz</li>
                  <li>• Samsung PM9A1 NVMe 1TB</li>
                  <li>• 额留 M.2 扩展插槽</li>
                </ul>
              </div>

              <!-- 手机 -->
              <div>
                <p class="font-bold text-lg mb-2 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">📱 Redmi K70</p>
                <p class="text-sm ml-4 transition-colors" :class="isDark ? 'text-gray-300' : 'text-gray-600'">黑色 16GB + 512GB</p>
              </div>

              <!-- 穿戴 -->
              <div>
                <p class="font-bold text-lg mb-2 transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">⌚ 小米手环 9 NFC</p>
                <p class="text-sm ml-4 transition-colors" :class="isDark ? 'text-gray-300' : 'text-gray-600'">全天候健康监测 · NFC 支付 · 典雅黑</p>
              </div>

              <!-- 外设 -->
              <div>
                <p class="font-bold transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">🎧 Xiaomi Air4 SE</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 诗歌卡片 - 占据更大空间 -->
        <div 
          class="glass-effect rounded-3xl p-8 card-hover scroll-animate scroll-animate-delay-3 md:col-span-2"
        >
          <div class="text-center mb-6">
            <p class="text-lg italic transition-colors" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
              推荐一段非常好听又有深度的歌：
            </p>
          </div>
          
          <div class="space-y-4 leading-relaxed text-center transition-colors" :class="isDark ? 'text-white' : 'text-gray-800'">
            <p>你怎能对 患者剥夺掉无感</p>
            <p>只留下些念想又不可逆转</p>
            <p>我用过偏执极端的手段</p>
            <p>像生死不惧的混蛋</p>
            <p class="text-xl font-bold pt-2 signature-reveal">
              病历上肆意拉扯来回写满
            </p>
            <p>揪不出左心房被嵌入的子弹</p>
            <p>其实所有的顽疾 都有隐瞒</p>
            <p>是我自愿想一直 与你有关</p>
          </div>
                   
          <div class="text-right mt-6 text-sm italic transition-colors" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
            —— 薛之谦《顽疾》
          </div>
        </div>
      </div>
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

/* 页面标题 */
.dark .about-title {
  background: linear-gradient(90deg, #7aa2f7, #7dcfff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #7aa2f7;
}

.light .about-title {
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #2563eb;
}

/* 诗歌高亮文字 */
.dark .poem-highlight {
  background: linear-gradient(90deg, #7aa2f7, #7dcfff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #7aa2f7;
}

.light .poem-highlight {
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #2563eb;
}

/* 卡片背景图片悬浮效果 */
.card-with-bg .card-bg-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 0.6s ease, transform 0.6s ease;
  transform: scale(1.1);
}

.dark .card-with-bg:hover .card-bg-image {
  opacity: 0.25;
  transform: scale(1);
}

.light .card-with-bg:hover .card-bg-image {
  opacity: 0.15;
  transform: scale(1);
}
</style>

