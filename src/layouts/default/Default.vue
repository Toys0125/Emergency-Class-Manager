<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer">
      <v-list-item title="Homepage" link></v-list-item>
      <v-divider></v-divider>
      <v-list-item link title="List Item 1"></v-list-item>
      <v-list-item link title="List Item 2"></v-list-item>
      <v-list-item link title="List Item 3"></v-list-item>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title>Emergcy Class Manager</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <sorted-table :values="values">
        <thead>
          <tr>
            <th scope="col" style="text-align: left; width: 10rem;">
              <sort-link name="id">Last</sort-link>
            </th>
            <th scope="col" style="text-align: left; width: 10rem;">
              <sort-link name="id">First</sort-link>
            </th>
            <th scope="col" style="text-align: left; width: 10rem;">
              <sort-link name="id">Student Id</sort-link>
            </th>
            <th scope="col" style="text-align: left; width: 10rem;">
              <sort-link name="id">Presence</sort-link>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="values in database" :key=""><!--need variable names from database-->
            <td>{{ last }}</td>
            <td>{{ first }}</td>
            <td>{{ id }}</td>
            <td>{{ presence }}</td> <!--should be the dropdown menu-->
          </tr>
        </tbody>
      </sorted-table>
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
