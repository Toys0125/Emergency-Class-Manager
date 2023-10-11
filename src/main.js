import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://xfpbhkpdcvwytubbvjdp.supabase.co', import.meta.env.APIKEY)

const app = createApp(App)

app.use(router)

app.mount('#app')
