<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer">
      <v-list-item to="/account" title="Account" link></v-list-item>
      <v-divider></v-divider>
      <v-list-item to="/roster" title="Roster"></v-list-item>
      <v-list-item to="/events" title="Events"></v-list-item>
      <v-list-item to="/contact" title="Contact Info"></v-list-item>
      <v-list-item to="/classes" title="Classes"></v-list-item>
      <v-list-item to="/adminpanel" title="Admin Panel"></v-list-item>
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

<script>
  export default {
    data: () => ({
      drawer: false,
    }),
  }
</script>
