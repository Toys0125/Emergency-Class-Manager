// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: 'home',
        name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "home" */ '@/views/Base Page/Home.vue'),
      },
      {
        path: 'test',
        name: 'Test',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "Test" */ '@/views/Base Page/Test.vue'),
      },
      {
        path: 'signin',
        name: 'SignIn',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "SignIn" */ '@/views/Base Page/SignIn.vue'),
      },
      {
        path: 'contact',
        name: 'Contact',
        component: () => import(/* webpackChunkName: "Contact" */ '@/views/Base Page/Contact.vue')
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import(/* webpackChunkName: "Contact" */ '@/views/Base Page/Register.vue')
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
