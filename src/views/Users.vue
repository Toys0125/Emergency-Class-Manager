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
        :items-per-page-options="itemsPerPageOptions"
        @update:options="loadRows"
      >
        <template v-slot:item.admin="{ value }"
          ><v-checkbox
            width="10px"
            prepend-icon="verified_user"
            :model-value="value"
            :disabled="true"
          ></v-checkbox
        ></template>
        <template v-slot:item.edit="value"
          ><v-btn color="green" @click="editRow(value)">Edit</v-btn></template
        >
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
                label="First Name"
              />

              <v-text-field v-model="modalData.lName" placeholder="Last Name" label="Last Name" />
            </v-row>
            <v-autocomplete
              v-model="searchData.selected"
              placeholder="Search for school"
              :items="searchData.rows"
              @update:search="schoolSearch"
              :loading="searchData.loading"
              item-title="school"
              no-filter
              return-object
              @onkeyup.enter="updateSchool"
            ></v-autocomplete>
            <v-btn v-show="modalData.school_id != searchData.selected.school_id" @click="updateSchool">Change Schools</v-btn>
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
   //console.log(count)
    return count
  },
  async fetch({ page = 0, itemsPerPage = 50, sortBy = 'desc' }) {
    var from = (page - 1) * itemsPerPage
    var to = page * itemsPerPage - 1
    //console.log(from, to)
    const { data, error } = await supabase.rpc('getusers').range(from, to)
    //console.log(data)
    if (error) {
      console.error(error)
      this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
      throw error
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
    //console.log(response)
    if (response.error) {
      console.error(response.error)
      this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
      throw response.error
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
  },
  async getSuperAdmin(userEmail) {
    const response = await supabase.from('Users').select('superAdmin').eq('userEmail', userEmail)
    //console.log(response)
    if (response.error) {
      console.error(response.error)
      this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
      throw response.error
    }
    return response.data[0].superAdmin
  },
  async searchSchools({ text = '' }) {
    const { data, error } = await supabase.rpc('searchschools', { searchtext: text }).range(0, 5)
    //console.log(data)
    if (error) {
      console.error(error)
      throw error
    }
    return { rows: data }
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
      { title: 'School', key: 'school', align: 'end' },
      { title: 'admin', key: 'admin', align: 'end', sortable: false, width: '15%' },
      { title: 'Edit', key: 'edit', align: 'end' }
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
      userEmail: null,
      fName: null,
      lName: null,
      school: null,
      school_id: null,
      admin: null
    },
    searchData: {
      selected: null,
      rows: [],
      text: '',
      loading: false
    },
    iamsuperAdmin: null
  }),
  computed: {
    superadmin() {
      return this.iamsuperAdmin
    }
  },
  mounted() {
    this.getSuperAdmin()
  },
  methods: {
    async getSuperAdmin() {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        this.$root.snackbar.show({ text: 'Auth Error', timeout: 5000, color: 'red' })
        return false
      }
      if (data.session == null) return false
      console.log('Super admin log', data.session.user.email)
      this.iamsuperAdmin = await supabaseRetrive.getSuperAdmin(data.session.user.email)
    },
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
          //console.log(rows)
          this.rows = rows
          this.loading = false
          this.$root.snackbar.show({ text: 'Loaded', timeout: 2000, color: 'blue' })
        })
      } else {
        this.searchRows()
      }
      //console.log(this.$root.snackbar)
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
    async schoolSearch(searchtext) {
      if (searchtext.length > 3) {
        if (this.searchData.text != searchtext) {
          this.searchData.loading = true
          this.searchData.text = searchtext
          await Promise.all([supabaseRetrive.searchSchools({ text: this.searchData.text })])
            .then((data) => {
              //console.log(data)
              this.searchData.rows = data[0].rows
              this.searchData.loading = false
            })
            .catch(() => {
              this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
              this.searchData.loading = false
            })
        }
      }
    },
    editRow(data) {
      //console.log(data)
      //Provided data is value.item.{columns}
      this.model = true

      this.modalData.userEmail = data.item.userEmail
      this.modalData.fName = data.item.fName
      this.modalData.lName = data.item.lName
      this.modalData.school = data.item.school
      this.modalData.school_id = data.item.school_id
      this.modalData.admin = data.item.admin
      this.searchData.selected = { school_id: data.item.school_id, school: data.item.school }
    },
    submit() {}
  }
}
</script>
