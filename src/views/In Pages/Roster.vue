<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-responsive class="fill-width">
    <v-text-field v-model="search" placeholder="Search Here" :onchange="searchRows"></v-text-field>
  </v-responsive>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items-length="totalrows"
        :items="rows"
        :loading="loading"
        class="elevation-1"
        item-value="name"
        @update:options="loadRows"
      >
        <template v-slot:item.id_number="{ value }"><p class="d-flex justify-left">{{ value }}</p></template>
      </v-data-table-server>
    </v-responsive>
  </v-container>
</template>

<script setup>
import supabase from '@/supabase'
import { VDataTableServer } from 'vuetify/lib/labs/components.mjs'
</script>
<script>

const supabaseRetrive = {
  async count() {
    const { count, error } = await supabase
      .from('Students')
      .select('*', { count: 'exact', head: true })
    if (error) {
      console.error(error)
      this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
    }
    console.log(count)
    return count
  },
  async fetch({ page = 0, itemsPerPage = 50, sortBy = 'desc' }) {
    var from = (page - 1) * itemsPerPage
    var to = page * itemsPerPage - 1
    console.log(from, to)
    const { data, error } = await supabase
      .from('Students')
      .select('*')
      .range(from, to)
    console.log(data)
    if (error) {
      console.error(error)
      this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
    }
    if (sortBy.length) {
      const sortKey = sortBy[0].key
      const sortOrder = sortBy[0].order
      data.sort((a, b) => {
        const aValue = a[sortKey]
        const bValue = b[sortKey]
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
      })
    }
    return { rows: data }
  },
  async search({ page = 0, itemsPerPage = 50, sortBy = 'desc', text = '' }) {
    var from = (page - 1) * itemsPerPage
    var to = page * itemsPerPage-1
    console.log(from, to)
    const { data, error } = await supabase.rpc('searchroster', { searchtext: text }).range(from, to)
    console.log(data)
    if (error) {
      console.error(error)
      this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
    }
    if (sortBy.length) {
      const sortKey = sortBy[0].key
      const sortOrder = sortBy[0].order
      data.sort((a, b) => {
        const aValue = a[sortKey]
        const bValue = b[sortKey]
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
      })
    }
    return { rows: data }
  }
}

export default {
  data: () => ({
    itemsPerPage: 5,
    headers: [
      { title: 'ID Number', key: 'id_number', align: 'left' ,width:'20%' },
      { title: 'First Name', key: 'fName', align: 'end' },
      { title: 'Last Name', key: 'lName', align: 'end' },
      { title: 'removed', key: 'removed', align: 'end' }
    ],
    rows: [],
    loading: true,
    totalrows: 0,
    search: '',
    options: { page: 1, itemsPerPage: 5, sortBy: {} },
    itemsPerPageOptions:[{value: 1, title: '1'},{value: 5, title: '5'},{value: 10, title: '10'},{value: 20, title: '20'}],
    }),
  methods: {
    loadRows({ page, itemsPerPage, sortBy }) {
      this.loading = true
      if (this.totalrows == 0) {
        this.totalrows = supabaseRetrive.count().then((count) => {
          this.totalrows = count
        })
      }
      this.options = { page: page, rowsPerPage: itemsPerPage, sortBy: sortBy }
      if (this.search.length < 3) {
        supabaseRetrive.fetch({ page, itemsPerPage, sortBy }).then(({ rows }) => {
          this.rows = rows
          this.loading = false
          this.$root.snackbar.show({ text: 'Loaded', timeout: 2000, color: 'blue' })
        })
      } else {
        this.searchRows()
      }
      console.log(this.$root.snackbar)
    },
    searchRows() {
      if (this.search.length < 3) return
      this.loading = true

      supabaseRetrive
        .search({
          page: this.options.page,
          rowsPerPage: this.options.itemsPerPage,
          sortBy: this.options.sortBy,
          text: this.search
        })
    },
    
  }
}
</script>
