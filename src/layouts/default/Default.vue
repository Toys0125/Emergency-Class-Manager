<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer">
      <v-list-item to="/home" title="Homepage" link></v-list-item>
      <v-divider></v-divider>
      <v-list-item v-show="session" to="/test" title="Test Page Nav"></v-list-item>
      <v-list-item v-show="session" to="/Users" title="Users"></v-list-item>
      <v-list-item to="/" title="Empty"></v-list-item>
      <v-list-item v-show="session" @click="signOut" title="Sign Out" />
      <v-list-item v-show="!session" to="/signin" title="Sign in" />
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title>Emergency Class Manager</v-app-bar-title>

      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import supabase from '@/supabase'

/*import { ref } from 'vue'
const drawer = ref(null)*/
</script>

<script>
export default {
  data: () => ({
    drawer: false,
    session: null
  }),
  mounted() {
    supabase.auth.getSession().then(({ data }) => {
      this.session = data.session
    })

    supabase.auth.onAuthStateChange((_, _session) => {
      this.session = _session
    })
  },
  methods: {
    async signOut(){
      await supabase.auth.signOut()
      console.log("signed out")
      this.session = null
      console.log(this.session)
    }
  }
}
</script>
