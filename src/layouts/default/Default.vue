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
    </v-app-bar>

    <v-main>
      <v-container class="fill-height">
      <v-responsive class="align-center text-center fill-height">
        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :items-length="totalItems"
          :items="serverItems"
          :loading="loading"
          class="elevation-1"
          item-value="name"
          @update:options="loadItems"
        ></v-data-table-server>
      </v-responsive>
    </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  import { VDataTableServer } from 'vuetify/lib/labs/components.mjs'
</script>

<script>
const desserts = [
    {
      StudentID: 'Frozen Yogurt',
      lName: 'hi',
      fName: 'hi',
    },
    {
      StudentID: 'Jelly bean',
      lName: 'hi',
      fName: 'hi',
    },
    {
      StudentID: 'KitKat',
      lName: 'hi',
      fName: 'hi',
    },
    {
      StudentID: 'Eclair',
      lName: 'hi',
      fName: 'hi'
    },
    {
      StudentID: 'Gingerbread',
      lName: 'hi',
      fName: 'hi',
    },
    {
      StudentID: 'Ice cream sandwich',
      lName: 'hi',
      fName: 'hi',
    },
  ]
  
  const FakeAPI = {
    async fetch({ page, itemsPerPage, sortBy }) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const start = (page - 1) * itemsPerPage
          const end = start + itemsPerPage
          const items = desserts.slice()
  
          if (sortBy.length) {
            const sortKey = sortBy[0].key
            const sortOrder = sortBy[0].order
            items.sort((a, b) => {
              const aValue = a[sortKey]
              const bValue = b[sortKey]
              return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
            })
          }
  
          const paginated = items.slice(start, end)
  
          resolve({ items: paginated, total: items.length })
        }, 500)
      })
    }
  }
  
  export default {
    data: () => ({
      itemsPerPage: 5,
      headers: [
        { title: 'Student ID', key: 'StudentID', align: 'end' },
        { title: 'Last Name', key: 'lName',  align: 'end' },
        { title: 'First Name', key: 'fName', align: 'end' },
        { title: 'Presence', key: 'presence', align: 'end'}
      ],
      serverItems: [],
      loading: true,
      totalItems: 0
    }),
    methods: {
      loadItems({ page, itemsPerPage, sortBy }) {
        this.loading = true
        FakeAPI.fetch({ page, itemsPerPage, sortBy }).then(({ items, total }) => {
          this.serverItems = items
          this.totalItems = total
          this.loading = false
          this.$root.snackbar.show({ text: 'Loaded', timeout:2000,color:"blue"})
        })
      },
    }
  }
  </script>

