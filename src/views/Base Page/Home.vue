<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-card>
    <v-layout>
      <!-- <v-system-bar color="deep-purple darken-3"></v-system-bar> -->

      <v-app-bar color="primary" prominent>
        <v-app-bar-nav-icon
          variant="text"
          @click.stop="drawer = !drawer"
        ></v-app-bar-nav-icon>

        <v-toolbar-title>Home</v-toolbar-title>

        <v-spacer></v-spacer>
      </v-app-bar>

      <v-navigation-drawer v-model="drawer">
      <v-list-item to="/signin" title="Sign In"></v-list-item>
      <v-list-item to="/contact" title="Contact"></v-list-item>
      <v-list-item to="/register" title="Register"></v-list-item>
    </v-navigation-drawer>

      <v-main style="height: 600px">
        <v-card-item>
          <div>
            <div class="text-overline mb-1"></div>
            <div class="text-h6 mb-1">Emergency Class Manager</div>
            <div class="text-caption"></div>
            Emergency Class Manager is an interactive website that allows
            teachers and administration to keep track of students during drills
            or emergency situations.
          </div>
        </v-card-item>
      </v-main>
    </v-layout>
  </v-card>
</template>

<script>
  export default {
    data: () => ({
      drawer: false,
      group: null,
      items: [
        {
          title: 'Sign In',
          value: 'signin',
        },
        {
          title: 'Register',
          value: 'register',
        },
        {
          title: 'Contact',
          value: 'contact',
        },
      ],
    }),

    watch: {
      group() {
        this.drawer = false
      },
    },
  }
</script>
