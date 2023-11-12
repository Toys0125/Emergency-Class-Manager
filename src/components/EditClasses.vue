<!-- eslint-disable vue/valid-v-slot -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-card>
    <v-card-text>
      <v-container>
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
            v-if="modalData.class_id != null"
          >
            <template v-slot:item.id_number="{ value }"
              ><p class="d-flex justify-left">{{ value }}</p></template
            >
            <template v-slot:item.edit="value"
              ><v-btn color="red" variant="outlined" @click="removeRow(value.item)">Remove</v-btn></template
            >
          </v-data-table-server>
        </v-row>
        <v-row>
          <v-col width="10%" align-self="start">
            <v-autocomplete placeholder="Id Number"></v-autocomplete>
          </v-col>
          <v-col>
            <v-autocomplete placeholder="First Name"></v-autocomplete>
          </v-col>
          <v-col>
            <v-autocomplete placeholder="Last Name"></v-autocomplete>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions class="d-flex align-end flex-column">
      <v-btn color="primary" outlined>Submit</v-btn>
    </v-card-actions>
  </v-card>
  <Confirmation ref="confirm"></Confirmation>
</template>

<script setup>
import supabase from '@/supabase'
import Confirmation from '@/components/Confirmation.vue'
import { VDataTableServer } from 'vuetify/lib/labs/components.mjs'
</script>

<script>
const supabaseRetrive = {
  async count(class_id) {
    const { count, error } = await supabase
      .from('Perm Roaster')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', class_id)
    if (error) {
      console.error(error)
      this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
    }
    console.log(count)
    return count
  },
  async fetch({ page = 0, itemsPerPage = 50, sortBy = 'desc', class_id = null }) {
    var from = (page - 1) * itemsPerPage
    var to = page * itemsPerPage - 1
    console.log(from, to)
    const { data, error } = await supabase
      .rpc('permstudents', { varclass_id: class_id })
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
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Edit Class',
  props: { passedData: Object },
  data: () => ({
    itemsPerPage: 5,
    headers: [
      { title: 'ID Number', key: 'id_number', align: 'left', width: '20%' },
      { title: 'First Name', key: 'fName', align: 'end' },
      { title: 'Last Name', key: 'lName', align: 'end' },
      { title: 'Buttons', key: 'edit', align: 'end' }
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
      className: null
    },
    editItem: false
  }),
  methods: {
    loadRows({ page, itemsPerPage, sortBy }) {
      this.loading = true
      if (this.totalrows == 0) {
        supabaseRetrive.count(this.modalData.class_id).then((count) => {
          this.totalrows = count
        })
      }
      this.options = { page: page, itemsPerPage: itemsPerPage, sortBy: sortBy }
      if (this.search.length < 3) {
        supabaseRetrive
          .fetch({ page, itemsPerPage, sortBy, class_id: this.modalData.class_id })
          .then(({ rows }) => {
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
    async saveChanges() {
      const { error } = await supabase.from('Perm Roaster').insert([
        {
          class_id: this.modalData.class_id
        }
      ])

      if (error) {
        console.error('Error saving changes:', error)
      } else {
        this.isEditing = false
      }
    },
    async removeRow(rowdata) {
      console.log(rowdata)
      if (
        await this.$refs.confirm.open('Confirm', 'Are you sure you want to delete this record?')
      ) {
        //this.rows.splice(this.rows.findIndex(rowdata),1)
        console.log("Delete row.")
        const {error} = await supabase.from('Perm roaster').delete().eq('class_id',this.modalData.class_id).eq('student_id',rowdata.student_id)
        if (error) {
          console.error('Error Deleting row from supabase', error)
          this.$root.snackbar.show({ text:'Error Removing Student', color:'Red', timeout:5000})
        }
        else{
          const index = this.rows.findIndex(rowdata)
          this.rows.splice(index)
        }
      }
    }
  },
  mounted() {
    this.modalData = this.passedData
    console.log('Mounted', this.passedData)
  }
}
</script>
