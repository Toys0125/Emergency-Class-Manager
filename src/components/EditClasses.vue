<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-card>
    <v-card-text>
      <v-responsive v-show="modalData.class_id == null"><p>Create new class</p></v-responsive>
      <v-responsive v-show="modalData.class_id != null"><p>Editing Class</p></v-responsive>
      <v-text-field
        v-model="modalData.className"
        placeholder="Class Name Here"
        label="Class name"
      />
      <v-row>
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
          v-show="modalData.class_id != null"
        >
          <template v-slot:item.id_number="{ value }"
            ><p class="d-flex justify-left">{{ value }}</p></template
          >
          <template v-slot:item.edit="value"
            ><v-btn color="green" @click="editRow(value.item)">Edit</v-btn></template
          >
        </v-data-table-server>
      </v-row>
    </v-card-text>
    <v-card-actions class="d-flex align-end flex-column">
      <v-btn color="green" variant="flat">Submit</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import supabase from '@/supabase'
import { VDataTableServer } from 'vuetify/lib/labs/components.mjs'
</script>

<script>
const supabaseRetrive = {
  async count() {
    const { count, error } = await supabase
      .from('Classes')
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
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Edit Class',
  props: { passedData: Object },
  data: () => ({
    itemsPerPage: 5,
    headers: [
      { title: 'ID Number', key: 'id_number', align: 'left', width: '20%' },
      { title: 'First Name', key: 'fName', align: 'end' },
      { title: 'Last Name', key: 'lName', align: 'end' }
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
      class_id: null,
      className: null,
      itemsPerPage: 5,
      headers: [
        { title: 'Class Name', key: 'className', align: 'left' },
        { title: 'Edit', key: 'edit', align: 'end', width: '20%' }
      ],
      rows: [],
      loading: true,
      totalrows: 0,
      options: { page: 1, itemsPerPage: 5, sortBy: {} }
    }
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
      if (this.search.length < 2) return
      console.log('Searching')
      supabaseRetrive.search({
        page: this.options.page,
        rowsPerPage: this.options.rowsPerPage,
        sortBy: this.options.sortBy,
        text: this.search
      })
    },
    async saveChanges() {
      const { error } = await supabase
        .from('Users') 
        .insert([
          {
            className:this.modalData.className
          },
        ])

      if (error) {
        console.error('Error saving changes:', error);
      } else {
        this.isEditing = false; 
      }
    },
  },
  mounted() {
    this.modalData = this.passedData
  }
}
</script>
