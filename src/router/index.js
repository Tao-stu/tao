import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Blog from '../views/Blog.vue'
import Article from '../views/Article.vue'
import BlogCMS from '../views/BlogCMS.vue'

import Guestbook from '../views/Guestbook.vue'
import GuestbookNew from '../views/GuestbookNew.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '主页 - Tao' }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { title: '关于 - Tao' }
  },
  {
    path: '/blog',
    name: 'Blog',
    component: Blog,
    meta: { title: '文章 - Tao' }
  },
  {
    path: '/article/:slug?',
    name: 'Article',
    component: Article,
    meta: { title: '文章详情 - Tao' }
  },
  {
    path: '/cms',
    name: 'BlogCMS',
    component: BlogCMS,
    meta: { title: 'CMS - Tao' }
  },

  {
    path: '/guestbook',
    name: 'Guestbook',
    component: Guestbook,
    meta: { title: '留言 - Tao' }
  },
  {
    path: '/guestbook/new',
    name: 'GuestbookNew',
    component: GuestbookNew,
    meta: { title: '发表留言 - Tao' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    return { top: 0, behavior: 'smooth' }
  }
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Tao - TaoWeb'
  next()
})

export default router

