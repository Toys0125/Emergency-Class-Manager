<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer">
      <v-list-item title="Homepage" link></v-list-item>
      <v-divider></v-divider>
      <v-list-item to="/test" title="Test Page Nav"></v-list-item>
      <v-list-item to="/" title="Empty"></v-list-item>
      <v-list-item to="/" title="Empty"></v-list-item>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title>Emergcy Class Manager</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
const drawer = ref(null)
</script>

<script>
export default {
  data: () => ({ drawer: null })
}
</script>
