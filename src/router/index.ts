import {createRouter, createWebHistory} from 'vue-router'


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'index',
            component: () => import('@/views/HomeView.vue')
        },
        {
            path: '/org/:orgId',
            name: 'org',
            component: () => import('@/views/OrganizationVue.vue')
        },
        {
            path: '/@:username',
            name: 'bank',
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
