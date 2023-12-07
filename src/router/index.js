// Composables
import { createRouter, createWebHistory } from 'vue-router'
import supabase from '@/supabase'

let localUser

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '/',
        name: '',
        component: () => import(/* webpackChunkName: "home" */ '@/views/Base Page/Home.vue')
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import(/* webpackChunkName: "home" */ '@/views/Base Page/Home.vue')
      },
      {
        path: 'test',
        name: 'Test',
        component: () => import(/* webpackChunkName: "Test" */ '@/views/Base Page/Test.vue')
      },
      {
        path: 'signin',
        name: 'SignIn',
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
        component: () => import(/* webpackChunkName: "Users" */ '@/views/Users.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () =>
          import(/* webpackChunkName: "Dashboard" */ '@/views/In Pages/Dashboard.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'roster',
        name: 'Roster',
        component: () => import(/* webpackChunkName: "Roster" */ '@/views/In Pages/Roster.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'account',
        name: 'Account',
        component: () => import(/* webpackChunkName: "Account" */ '@/views/In Pages/Account.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'events',
        name: 'Events',
        component: () => import(/* webpackChunkName: "Events" */ '@/views/In Pages/Events.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'teachevents',
        name: 'TeacherEvents',
        component: () =>
          import(/* webpackChunkName: "TeacherEvents" */ '@/views/In Pages/TeacherEvents.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'classes',
        name: 'Classes',
        component: () => import(/* webpackChunkName: "Classes" */ '@/views/In Pages/Classes.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'teachContact',
        name: 'TeachContact',
        component: () =>
          import(/* webpackChunkName: "Classes" */ '@/views/In Pages/TeachContact.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'studentManager',
        name: 'StudentManager',
        component: () =>
          import(/* webpackChunkName: "Classes" */ '@/views/In Pages/AddStudents.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})


async function getUser(next) {
	localUser = await supabase.auth.getSession();
	if (localUser.data.session == null) {
		next('/signin')
	}
	else {
		next();
	}
}

router.beforeEach((to, from, next) => {
	if (to.meta.requiresAuth) {
		getUser(next);
	}
	else {
		next();
	}
})

export default router
