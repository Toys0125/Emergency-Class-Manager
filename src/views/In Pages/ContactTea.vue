<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/valid-v-slot -->
<template>
    <div>
      <h1>Contact:</h1>
    </div>
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
          :items-per-page-options="itemsPerPageOptions"
          @update:options="loadRows"
          @click:row="editRow"
        >
        </v-data-table-server>
        <v-dialog v-model="model">
          <v-card>
            <v-card-text>
              <v-text-field
                v-model="modalData.pEmail"
                placeholder="Principal Email"
                label="Principal Email"
                readonly
              />
            </v-card-text>
            <v-card-actions>
              <v-btn @click="model=false" color="green" variant="flat">Okay </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
        .from('Schools')
        .select('principal', { count: 'exact', head: true })
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
        .from('Schools')
        .select('*')
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
      itemsPerPage: 5,
      headers: [
        {
          title: 'Contact Info',
          align: 'center',
          sortable: true,
          key: 'principal'
        }
      ],
      rows: [],
      loading: true,
      totalrows: 0,
      search: '',
      options: { page: 1, itemsPerPage: 5, sortBy: {} },
      itemsPerPageOptions: [
        { value: 1, title: '1' },
        { value: 5, title: '5' },
        { value: 10, title: '10' },
        { value: 20, title: '20' }
      ],
      model: false,
      modalData: {
        pEmail: null,
      }
    }),
    methods: {
      loadRows({ page, itemsPerPage, sortBy }) {
        this.loading = true
        if (this.totalrows == 0) {
          supabaseRetrive.count().then((count) => {
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
        supabaseRetrive.search({
          page: this.options.page,
          rowsPerPage: this.options.rowsPerPage,
          sortBy: this.options.sortBy,
          text: this.search
        })
      },
      editRow(data, data2) {
        //console.log(data)
        //console.log(data2)
        this.model = true
  
        this.modalData.pEmail = data2.item.pEmail
        this.modalData.date = data2.item.date
        this.modalData.description = data2.item.description
      },
      showModal() {
        this.modal = false
      }
    }
  }
  </script>
  