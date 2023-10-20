<template>
  <router-view v-if="session" :session="session" />
  <Auth v-else />
  <snackbar ref="snackbar" />
</template>

<script setup>
import snackbar from './components/snackbar.vue'
import Auth from './components/Auth.vue'
import supabase from './supabase'
import { ref } from 'vue'
import { onMounted } from 'vue'
const session = ref()

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })

  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
  })
})
</script>
<script>
export default {
  components: {
    snackbar,
    Auth
  },
  mounted() {
    this.$root.snackbar = this.$refs.snackbar
    console.log(this.$root.snackbar)
  },
  computed:{
    async checkSession() {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        this.$root.snackbar.show({ text: 'Auth Error', timeout: 5000, color: 'red' })
        return false
      }
      if (data.session == null) return false
      console.log(data.session)
      return true
    }
  },
  methods: {

  }
}
</script>
