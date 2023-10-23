<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer">
      <v-list-item to="/home" title="Homepage" link></v-list-item>
      <v-divider></v-divider>
      <v-list-item to="/signin" title="Sign In"></v-list-item>
      <v-list-item to="/contact" title="Contact"></v-list-item>
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
      drawer: false
    })
  }
  </script>


  

