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
        <template v-slot:item.presence="{ item }">
          <v-select
            v-model="item.presence"
            :items="presenceOptions"
            label="Select"
            outlined
            dense
          ></v-select>
        </template>
      </v-data-table-server>
      <v-dialog v-model="model" persistent max-width="600px">
        <v-card>
          <v-card-title> Add New Student </v-card-title>
          <v-card-text>
            <v-text-field v-model="modalData.id_number" label="ID Number"></v-text-field>
            <v-text-field v-model="modalData.fName" label="First Name"></v-text-field>
            <v-text-field v-model="modalData.lName" label="Last Name"></v-text-field>
            <!-- Add more fields as needed -->
          </v-card-text>
          <v-card-actions>
            <v-btn color="blue darken-1" @click="addStudent">Add Student</v-btn>
            <v-btn color="grey darken-1" @click="model = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <div class="text-right">
        <v-btn color="primary" @click="openModal">Add Student</v-btn>
        <v-btn color="green" @click="submitTable">Submit</v-btn>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import supabase from '@/supabase'
import { VDataTableServer } from 'vuetify/lib/labs/components.mjs'
import { ref } from 'vue'

const presenceOptions = ['Present', 'Absent', 'Missing', 'Visiting']
const model = ref(false)
const openModal = () => {
  model.value = true // Assuming model is a ref
}
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
    const { data, error } = await supabase.from('Students').select('*').range(from, to)
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
    console.log(from, to)
    const { data, error } = await supabase
      .rpc('searchstudents', { searchtext: text })
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
  }
}

export default {
  data: () => ({
    itemsPerPage: 5,
    headers: [
      { title: 'ID Number', key: 'id_number', align: 'left', width: '20%' },
      { title: 'First Name', key: 'fName', align: 'end' },
      { title: 'Last Name', key: 'lName', align: 'end' },
      { title: 'Presense', value: 'presence', align: 'end' }
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
    modalData: {
      id_number: null,
      fName: null,
      lName: null,
      loading: false
    }
  }),
  methods: {
    addStudent() {
    // Check if the required fields are filled in
    if (!this.modalData.id_number || !this.modalData.fName || !this.modalData.lName) {
      this.$root.snackbar.show({ text: 'Please fill in all fields', timeout: 3000, color: 'red' });
      return;
    }

    // Create a new student object
    const newStudent = {
      id_number: this.modalData.id_number,
      fName: this.modalData.fName,
      lName: this.modalData.lName,
      presence: 'Visiting',
    };
    this.rows.push(newStudent);
    this.model = false;
    this.modalData = { id_number: null, fName: null, lName: null, loading: false };

    this.$root.snackbar.show({ text: 'Student added successfully', timeout: 3000, color: 'green' });
  },
    editRow(data) {
      //console.log(data)
      //Provided data is value.item.{columns}
      this.model = true
      this.passedData = data.item
      this.modalData.id_number = data.item.userEmail
      this.modalData.fName = data.item.fName
      this.modalData.lName = data.item.lName
    },
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

      supabaseRetrive.search({
        page: this.options.page,
        rowsPerPage: this.options.itemsPerPage,
        sortBy: this.options.sortBy,
        text: this.search
      })
    }
  }
}
</script>
