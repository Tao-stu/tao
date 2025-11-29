<template>
  <footer class="mt-20 py-12 glass-effect-dark relative" style="font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
    <div class="container mx-auto px-4">
      <div class="text-tokyo-night-fg text-center md:text-left space-y-6">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-4">
          <img src="/img/LOGO.jpg" alt="Logo" class="w-16 h-16 rounded-full ring-2 ring-tokyo-night-blue" />
          <div>
            <h3 class="text-2xl font-bold text-tokyo-night-cyan">Tao</h3>
            <p class="text-sm text-tokyo-night-fg-dark">若非心胸宽广如海，人生如何能保持风平浪静。</p>
          </div>
        </div>
        
        <!-- 友情链接 -->
        <div class="border-t border-tokyo-night-bg-highlight pt-6">
          <h4 class="text-lg font-semibold text-tokyo-night-cyan mb-4 text-center md:text-left">友情链接</h4>
          <div class="flex flex-wrap justify-center md:justify-start gap-4">
            <a 
              href="https://dazd.me" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass-effect hover:bg-tokyo-night-blue/20 transition-all duration-300 hover:scale-105 group"
            >
              <svg class="w-4 h-4 text-tokyo-night-cyan group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
              </svg>
              <span class="text-tokyo-night-fg group-hover:text-white">DaZiDian</span>
            </a>
            
            <a 
              href="https://5ime.cn" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass-effect hover:bg-tokyo-night-blue/20 transition-all duration-300 hover:scale-105 group"
            >
              <svg class="w-4 h-4 text-tokyo-night-cyan group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
              </svg>
              <span class="text-tokyo-night-fg group-hover:text-white">5ime</span>
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右下角 Powered By -->
    <div class="absolute bottom-4 right-4 text-xs text-tokyo-night-fg-dark opacity-70 hover:opacity-100 transition-opacity duration-300">
      Powered By <span class="text-tokyo-night-cyan font-semibold">DaZiDian</span>
    </div>
  </footer>
</template>

<style scoped>
/* 保持页脚排版 */
</style>

