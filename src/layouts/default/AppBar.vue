<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer
        v-model="drawer"
        :rail="rail"
        permanent
        @click="rail = false"
      >
        <v-list-item
          prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
          title="John Leider"
          nav
        >
          <template v-slot:append>
            <v-btn
              variant="text"
              icon="mdi-chevron-left"
              @click.stop="rail = !rail"
            ></v-btn>
          </template>
        </v-list-item>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-home-city" title="Account" value="account"></v-list-item>
          <v-list-item prepend-icon="mdi-account" title="Roster" value="roster"></v-list-item>
          <v-list-item prepend-icon="mdi-events" title="Events" value="events"></v-list-item>
          <v-list-item prepend-icon="mdi-contact-info" title="Contact Info" value="contactInfo"></v-list-item>
          <v-list-item prepend-icon="mdi-classes" title="Classes" value="classes"></v-list-item>
          <v-list-item prepend-icon="mdi-admin-panel" title="Admin Panel" value="adminpanel"></v-list-item>
          <v-list-item prepend-icon="mdi-sign-out" title="Sign Out" value="signout"></v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main style="height: 250px"></v-main>
    </v-layout>
  </v-card>
</template>

<script setup>
  //
</script>
