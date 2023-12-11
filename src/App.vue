<template>
  <router-view />
  <snackbar ref="snackbar" />
</template>

<script setup>
import snackbar from './components/snackbar.vue'
import supabase from './supabase'
</script>
<script>
export default {
  data: () => ({
    session: {},
    iamAdmin: null,
    school_id: null
  }),
  components: {
    snackbar
  },
  mounted() {
    this.$root.snackbar = this.$refs.snackbar
    this.$root.userData = this.userData
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
    },
    async userData() {
      if (this.localuserData != null) return this.localuserData
      await this.fetchUserData()
        .then((data) => {
          //console.log(data)
          this.localuserData = data
        })
        .catch(() => {
          this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
        })
      //console.log('Skipped fetch', this.localuserData)
      return this.localuserData
    }
  },
  methods: {
    async fetchUserData() {
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser()

        if (user && user.email) {
          const userEmail = user.email

          const { data: userData, error: userError } = await supabase
            .from('Users')
            .select('*')
            .eq('userEmail', userEmail)
            .single()

          //console.log("school id: " + userData.school_id)
          //console.log("is currently admin:",userData.admin)
          if (userError) {
            console.error('Error fetching user data:', userError)
          } else {
            return userData
          }
        } else {
          console.log('User email not found.')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
  }
}
</script>
