<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-responsive>Click to edit a row of data</v-responsive>
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
        :items-per-page-options="itemsPerPageOptions"
        @update:options="loadRows"
        @click:row="editRow"
      >
        <template v-slot:item.admin="{ value }"
          ><v-checkbox prepend-icon="verified_user" :model-value="value"></v-checkbox
        ></template>
      </v-data-table-server>
      <v-dialog v-model="model">
        <v-card>
          <v-card-text>
            <v-text-field
              v-model="modalData.userEmail"
              placeholder="UserEmail"
              label="User Email"
            />
            <v-row
              ><v-text-field
                v-model="modalData.fName"
                placeholder="First Name"
                label="First Name" />

              <v-text-field v-model="modalData.lName" placeholder="Last Name" label="Last Name"
            /></v-row>

            <v-checkbox v-model="modalData.admin" label="is Admin" :disabled="!superadmin" />
          </v-card-text>
          <v-card-actions>
            <v-btn color="green" variant="flat">Submit</v-btn>
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
      .from('Users')
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
    var to = page * itemsPerPage
    console.log(from, to)
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .range(from, to)
      .neq('removed', true)
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
    var to = page * itemsPerPage - 1
    const response = await supabase.rpc('searchusers', { searchtext: text }).range(from, to)
    console.log(response)
    if (response.error) {
      console.error(response.error)
      this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
    }
    if (sortBy.length) {
      const sortKey = sortBy[0].key
      const sortOrder = sortBy[0].order
      response.data.sort((a, b) => {
        const aValue = a[sortKey]
        const bValue = b[sortKey]
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
      })
    }
    return { rows: response.data }
  }
}

export default {
  data: () => ({
    itemsPerPage: 5,
    headers: [
      {
        title: 'userEmail',
        align: 'start',
        sortable: false,
        key: 'userEmail'
      },
      { title: 'First Name', key: 'fName', align: 'end' },
      { title: 'Last Name', key: 'lName', align: 'end' },
      { title: 'admin', key: 'admin', align: 'end', sortable: false }
    ],
    rows: [],
    loading: true,
    totalrows: 0,
    search: '',
    options: { page: 1, itemsPerPage: 5, sortBy: {} },
    itemsPerPageOptions:[{value: 1, title: '1'},{value: 5, title: '5'},{value: 10, title: '10'},{value: 20, title: '20'}],
    model: false,
    modalData: {
      userEmail: null,
      fName: null,
      lName: null,
      admin: null
    }
  }),
  computed: {
    superadmin() {
      return true
      //Need to implement
    }
  },
  methods: {
    loadRows({ page, itemsPerPage, sortBy }) {
      this.loading = true
      if (this.totalrows == 0) {
        supabaseRetrive.count().then((count) => {
          this.totalrows = count
        })
      }
      this.options = { page: page, itemsPerPage: itemsPerPage, sortBy: sortBy }
      if (this.search.length < 3) {
        supabaseRetrive.fetch({ page, itemsPerPage, sortBy }).then(({ rows }) => {
          console.log(rows)
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
          rowsPerPage: this.options.rowsPerPage,
          sortBy: this.options.sortBy,
          text: this.search
        })
        .then(({ rows }) => {
          console.log(rows)
          this.rows = rows
          this.loading = false
        })
    },
    editRow(data, data2) {
      //console.log(data)
      //console.log(data2)
      this.model = true

      this.modalData.userEmail = data2.item.userEmail
      this.modalData.fName = data2.item.fName
      this.modalData.lName = data2.item.lName
      this.modalData.admin = data2.item.admin
    },
    submit() {}
  }
}
</script>