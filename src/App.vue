<template>
  <router-view/>
  <snackbar ref="snackbar" />
</template>

<script setup>
import snackbar from './components/snackbar.vue'
import supabase from './supabase'
</script>
<script>
export default {
  data: () => ({
    session: {}
  }),
  components: {
    snackbar
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
  methods: {}
}
</script>
