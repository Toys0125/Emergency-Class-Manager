<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div>
    <h1>
      Welcome to your Dashboard.
    </h1>
    <h2>
      Upcoming events:
    </h2>
  </div>
  <v-responsive class="fill-width">
    <v-text-field v-model="search" placeholder="Search Here" :onchange="searchRows"></v-text-field>
  </v-responsive>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">
      <v-data-table-server
        v-model:items-per-page="rowsPerPage"
        :headers="headers"
        :items-length="totalrows"
        :items="rows"
        :loading="loading"
        class="elevation-1"
        item-value="name"
        @update:options="loadRows"
      >
        <template v-slot:item.admin="{ value }"><v-checkbox prepend-icon="verified_user" :model-value="value"></v-checkbox></template>
      </v-data-table-server>
    </v-responsive>
  </v-container>
</template>

<script setup>
import supabase from '@/supabase'
import { VDataTableServer } from 'vuetify/lib/labs/components.mjs'
</script>
<script>
let date = new Date().toJSON();
const supabaseRetrive = {
  async count() {
    const { count, error } = await supabase
      .from('Events')
      .select('*', { count: 'exact', head: true })
    if (error) {
      console.error(error)
      this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
    }
    console.log(count)
    return count
  },
  async fetch({ page = 0, itemsPerPage = 50, sortBy = 'date' }) {
    var from = (page - 1) * itemsPerPage
    var to = page * itemsPerPage
    console.log(from, to)
    const { data, error } = await supabase
      .from('Events')
      .select('*')
      .order('date', {ascending:true})
      .eq('date', date)
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
        return sortOrder === 'date' ? bValue - aValue : aValue - bValue
      })
    }
    return { rows: data }
  },
  async search({ page = 0, itemsPerPage = 50, sortBy = 'date', text = '' }) {
    var from = (page - 1) * itemsPerPage
    var to = page * itemsPerPage
    console.log(from, to)
    const { data, error } = await supabase.rpc('searchusers', text).range(from, to)
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
        return sortOrder === 'date' ? bValue - aValue : aValue - bValue
      })
    }
    return { rows: data }
  }
}

export default {
  data: () => ({
    rowsPerPage: 5,
    headers: [
      {
        title: 'Event',
        align: 'start',
        sortable: true,
        key: 'eventName'
      },
      { title: 'Date', key: 'date', align: 'end' },
      { title: 'Time', key: 'scheduledTime', align: 'end'},
      { title: 'Description', key: 'description', align: 'end' }
    ],
    rows: [],
    loading: true,
    totalrows: 0,
    search: '',
    options: { page: 1, rowsPerPage: 5, sortBy: {} }
  }),
  methods: {
    loadRows({ page, rowsPerPage, sortBy }) {
      this.loading = true
      if (this.totalrows == 0) {
        this.totalrows = supabaseRetrive.count()
      }
      this.options = { page: page, rowsPerPage: rowsPerPage, sortBy: sortBy }
      if (this.search.length < 3) {
        supabaseRetrive.fetch({ page, rowsPerPage, sortBy }).then(({ rows }) => {
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
      supabaseRetrive.search({
        page: this.options.page,
        rowsPerPage: this.options.rowsPerPage,
        sortBy: this.options.sortBy,
        text: this.search
      })
    }
  }
}
</script>
