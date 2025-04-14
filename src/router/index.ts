import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:username',
      name: 'home',
      component: () => import('@/views/UserView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import("@/views/LoginView.vue"),
      meta: {
        hideHeader: true
      },
    }
  ],
})

export default router
