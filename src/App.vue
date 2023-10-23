<template>
  <router-view v-if="session" :session="session" />
  <v-container v-else>
    <Auth />
  </v-container>
  <snackbar ref="snackbar" />
</template>

<script setup>
import snackbar from './components/snackbar.vue'
import Auth from './components/Auth.vue'
import supabase from './supabase'
import { onMounted } from 'vue'

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    this.session = data.session
  })

  supabase.auth.onAuthStateChange((_, _session) => {
    this.session = _session
  })
})
</script>
<script>
export default {
  data: () => ({
    session:{}
  }),
  components: {
    snackbar,
    Auth
  },
  mounted() {
    this.$root.snackbar = this.$refs.snackbar
  },
  computed: {
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
