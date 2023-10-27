// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '/',
        name: '',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "home" */ '@/views/Base Page/Home.vue')
      },
      {
        path: 'home',
        name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "home" */ '@/views/Base Page/Home.vue')
      },
      {
        path: 'test',
        name: 'Test',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "Test" */ '@/views/Base Page/Test.vue')
      },
      {
        path: 'signin',
        name: 'SignIn',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "SignIn" */ '@/views/Base Page/SignIn.vue')
      },
      {
        path: 'contact',
        name: 'Contact',
        component: () => import(/* webpackChunkName: "Contact" */ '@/views/Base Page/Contact.vue')
      },
      {
        path: 'users',
        name: 'Users',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "Test" */ '@/views/Users.vue')
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import(/* webpackChunkName: "Test" */ '@/views/In Pages/Dashboard.vue'),
      },
      {
        path: 'roster',
        name: 'Roster',
        component: () => import(/* webpackChunkName: "Test" */ '@/views/In Pages/Roster.vue'),
      },
      {
        path: 'events',
        name: 'Events',
        component: () => import(/* webpackChunkName: "Test" */ '@/views/In Pages/Events.vue'),
      },
      {
        path: 'account',
        name: 'Account',
        component: () => import(/* webpackChunkName: "Test" */ '@/views/In Pages/Account.vue'),
      },
      {
        path: 'events',
        name: 'Events',
        component: () => import(/* webpackChunkName: "Test" */ '@/views/In Pages/Events.vue'),
      },
      {
        path: 'account',
        name: 'Account',
        component: () => import(/* webpackChunkName: "Test" */ '@/views/In Pages/Account.vue'),
      },
      {
        path: 'modaltest',
        name: 'ModalTest',
        component: () => import(/* webpackChunkName: "Test" */ '@/views/In Pages/ModalTest.vue'),
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
