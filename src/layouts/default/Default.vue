<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer">
      <v-list>
        <v-list-item v-show="!session" to="/" title="Homepage" link></v-list-item>
        <v-divider></v-divider>
        <v-list-item v-show="!session" to="/signin" title="Sign in" />
        <v-list-item v-show="!session" to="/contact" title="Contact" />
        <v-list-item v-show="session" to="/dashboard" title="Home" />
        <v-list-item v-show="session" to="/roster" title="Roster" />
        <v-list-item v-show="session" to="/account" title="Account" />
        <v-list-item v-show="session" to="/teachevents" title="Teacher Events" />
        <v-list-item v-show="session" to="/teachcontact" title="Contact Info" />
        <v-list-group v-show="isAdmin && session" title="Admin Section">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Admin Section"></v-list-item>
          </template>
          <v-list-item to="/Users" title="Users"> </v-list-item>
          <v-list-item to="/events" title="Events" />
          <v-list-item to="/classes" title="Classes" />
          <v-list-item to="/reports" title="Reports" />
        </v-list-group>
        <v-list-item v-show="session" @click="signOut" to="/" title="Sign Out" />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar class="d-flex">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title class="align-self-center"><router-link to="/dashboard">
      <v-img
        class="align-self-center"
        src="@/assets/IMG_2734.jpeg-PhotoRoom.png-PhotoRoom.png"
        height="100px"
        width="150px"
        to="/dashboard"
      ></v-img>
      </router-link></v-app-bar-title>
      
      <v-spacer></v-spacer>

      
      <v-switch class="align-self-baseline" inset v-bind:prepend-icon="darkMode ? 'mdi-weather-night' : 'mdi-weather-sunny'"
        v-model="darkMode" color="primary" @change="toggleTheme($event)"></v-switch>
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
import { ref } from 'vue'
import { useTheme } from 'vuetify/lib/framework.mjs'
const theme = useTheme()
const darkMode = ref(false)

const toggleTheme = (setValue = undefined) => {
  console.log(setValue)
  console.log(darkMode.value)
  if (setValue == 'turn Dark') {
    theme.global.name.value = setValue ? 'dark' : 'light'
    console.log('Setting Darkmode')
  } else {
    theme.global.name.value = darkMode.value == true ? 'dark' : 'light'
    localStorage.setItem('DarkMode', darkMode.value)
  }
  console.log(`Current theme is dark? ${theme.global.current.value.dark}`)
}
if (typeof window === 'object') {
  if (localStorage.getItem('DarkMode')) {
    console.log('Dark Mode settings Found', localStorage.getItem('DarkMode'))
    const cookieValue = localStorage.getItem('DarkMode') === 'true'
    toggleTheme(cookieValue ? 'turn Dark' : undefined)
    darkMode.value = true
  }
}
/*import { ref } from 'vue'
const drawer = ref(null)*/
</script>

<script>
export default {
  data: () => ({
    drawer: false,
    session: null,
    iamAdmin: null,
    darkMode: false
  }),
  created() {
    //this.darkMode=this.$vuetify.theme.current.dark
  },
  mounted() {
    supabase.auth.getSession().then(({ data }) => {
      this.session = data.session
    })

    supabase.auth.onAuthStateChange((_, _session) => {
      this.session = _session
    })
  },
  computed: {
    isAdmin() {
      if (this.iamAdmin != null) return this.iamAdmin
      this.iamAdmin = true
      return true
    }
  },
  methods: {
    async signOut() {
      await supabase.auth.signOut()
      console.log('signed out')
      this.session = null
    }
  }
}
</script>
<style scoped>
:deep() .v-table .v-table__wrapper>table>thead>tr>th:not(:last-child) {
  border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

:deep() .v-table .v-table__wrapper>table>tbody>tr>td:not(:last-child),
.v-table .v-table__wrapper>table>tbody>tr>th:not(:last-child) {
  border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>