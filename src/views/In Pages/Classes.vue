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
        <template v-slot:item.id_number="{ value }"
          ><p class="d-flex justify-left">{{ value }}</p></template
        >
        <template v-slot:item.edit="value"
          ><v-btn color="green" @click="editRow(value.item)">Edit</v-btn></template
        >
      </v-data-table-server>
    </v-responsive>
    <v-dialog max-width="80%" v-model="model">
      <EditClasses :passedData="modalData" @onsubmit="refresh"></EditClasses>
    </v-dialog>
  </v-container>
  <v-responsive class="d-flex align-end flex-column"
    ><v-btn class="d-flex align-center" color="green" @click="addRow()"
      >Add Class</v-btn
    ></v-responsive
  >
</template>

<script setup>
import EditClasses from '@/components/EditClasses.vue'
import supabase from '@/supabase'
import { VDataTableServer } from 'vuetify/lib/labs/components.mjs'
</script>
<script>
const supabaseRetrive = {
  async count() {
    const { count, error } = await supabase
      .from('Classes')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', this.school_id)
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
    const { data, error } = await supabase.from('Classes').select('*').range(from, to)
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
      .rpc('searchclasses', { searchtext: text })
      .range(from, to)
    //console.log(data)
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
      { title: 'Class Name', key: 'className', align: 'left' },
      { title: 'Edit', key: 'edit', align: 'end', width: '20%' }
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
    school_id: null,
    modalData: {
      class_id: null,
      className: null
    }
  }),
  methods: {
    async fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user && user.email) {
          const userEmail = user.email;

          const { data: userData, error: userError } = await supabase
            .from('Users')
            .select('school_id')
            .eq('userEmail', userEmail)
            .single();

            console.log("school id: " + userData.school_id)
          if (userError) {
            console.error('Error fetching user data:', userError);
          } else {
            
            this.school_id = userData.school_id; // Set the school_id property
          }
        } else {
          console.error('User email not found.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
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
      if (this.search.length < 2) return
      console.log('Searching')
      supabaseRetrive.search({
        page: this.options.page,
        rowsPerPage: this.options.rowsPerPage,
        sortBy: this.options.sortBy,
        text: this.search
      })
    },
    editRow(data2) {
      //console.log(data2)
      this.modalData.class_id = data2.class_id
      this.modalData.className = data2.className
      this.model = true
    },
    addRow() {
      //console.log(data)
      //console.log(data2)

      this.modalData.class_id = null
      this.modalData.className = ''
      this.model = true
    },
    refresh() {
      this.model = false;
      this.loadRows();
    }
  }
}
</script>
