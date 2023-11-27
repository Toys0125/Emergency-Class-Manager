<!-- eslint-disable vue/valid-v-slot -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-responsive>
    <v-row class="pa-md-4 mx-lg-auto">
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
        <template v-slot:item.isPrimary="value"
          ><v-checkbox
            width="10px"
            :model-value="value.item.isPrimary"
            @update:model-value="setPrimary(value.item)"
          ></v-checkbox>
        </template>
        <template v-slot:item.edit="value"
          ><v-btn color="red" variant="outlined" @click="removeRow(value.item)"
            >Remove</v-btn
          ></template
        >
      </v-data-table-server>
    </v-row>
    <v-row>
      <v-autocomplete
        v-model="searchData.selected"
        placeholder="Search for users"
        :items="searchData.rows"
        @update:search="userSearch"
        :loading="searchData.loading"
        item-title="fName"
        no-filter
        return-object
        @onkeyup.enter="addTeacher"
        ><template v-slot:selection="{ item }">
          <p>
            {{ item?.raw?.fName + '\t' + item?.raw?.lName }}
          </p>
        </template>
        <template v-slot:item="{ props, item }">
          <v-list-item
            v-bind="props"
            :title="item?.raw?.fName + '\t' + item?.raw?.lName"
          ></v-list-item> </template
      ></v-autocomplete>
    </v-row>
    <v-row v-show="searchData.selected" class="pa-md-4 mx-lg-auto"
      ><v-spacer></v-spacer>
      <v-btn color="primary" outlined align-end :onclick="addTeacher">Add User</v-btn></v-row
    >
  </v-responsive>
  <Confirmation ref="confirm"></Confirmation>
</template>

<script setup>
import supabase from '@/supabase'
import { VDataTableServer } from 'vuetify/lib/labs/components.mjs'
import Confirmation from '@/components/Confirmation.vue'
</script>

<script>
const supabaseRetrive = {
  async count(class_id) {
    const { count, error } = await supabase
      .from('Teacher Classes')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', class_id)
    if (error) {
      console.error(error)
      throw error
    }
    console.log(count)
    return count
  },
  async fetch({ page = 0, itemsPerPage = 50, sortBy = 'desc', class_id = null }) {
    var from = (page - 1) * itemsPerPage
    var to = page * itemsPerPage - 1
    console.log(from, to)
    const { data, error } = await supabase
      .rpc('getteachers', { varclass_id: class_id })
      .select('*')
      .range(from, to)
    console.log(data)
    if (error) {
      console.error(error)
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
  async search({ page = 0, itemsPerPage = 50, sortBy = 'desc', text = '', class_id = 0 }) {
    var from = (page - 1) * itemsPerPage
    var to = page * itemsPerPage - 1
    console.log(from, to)
    const { data, error } = await supabase
      .rpc('searchteachers', { searchtext: text, varclass_id: class_id })
      .range(from, to)
    console.log('Search data:', data)
    if (error) {
      console.error(error)
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
  async searchUsers({ text = '' }) {
    const { data, error } = await supabase.rpc('searchusers', { searchtext: text }).range(0, 5)
    //console.log(data)
    if (error) {
      console.error(error)
      throw error
    }
    return { rows: data }
  }
}

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Edit Class',
  props: { passedData: Object },
  expose: ['saveChanges'],
  data: () => ({
    itemsPerPage: 5,
    headers: [
      { title: 'User Email', key: 'usersEmail', align: 'left', width: '20%' },
      { title: 'First Name', key: 'fName', align: 'end' },
      { title: 'Last Name', key: 'lName', align: 'end' },
      { title: 'is Primary', key: 'isPrimary', align: 'start', width: '5%' },
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
    addedRows: [],
    searchData: {
      selected: null,
      rows: [],
      text: '',
      loading: false
    },
    tab: 1
  }),
  methods: {
    loadRows({ page, itemsPerPage, sortBy }) {
      this.loading = true
      console.log(this.modalData.class_id)
      if (this.totalrows == 0) {
        supabaseRetrive
          .count(this.modalData.class_id)
          .then((count) => {
            this.totalrows = count
          })
          .catch(() => {
            this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
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
          .catch(() => {
            this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
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
    async userSearch(searchtext) {
      if (searchtext.length > 3) {
        if (this.searchData.text != searchtext) {
          this.loading = true
          this.searchData.loading = true
          this.searchData.text = searchtext
          await Promise.all([
            supabaseRetrive.searchUsers({ text: this.searchData.text }),
            supabaseRetrive.search({
              page: this.options.page,
              rowsPerPage: this.options.rowsPerPage,
              sortBy: this.options.sortBy,
              text: this.search,
              class_id: this.modalData.class_id
            })
          ])
            .then((data) => {
              //console.log(data)
              this.searchData.rows = data[0].rows
              this.rows = data[1].rows
              this.loading = false
              this.searchData.loading = false
            })
            .catch(() => {
              this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
              this.searchData.loading = false
            })
        }
      }
    },
    async saveChanges() {
      var newrows = []
      var errorcheck = false
      this.addedRows.forEach((element) => {
        newrows.push({
          class_id: this.modalData.class_id,
          userEmail: element.userEmail,
          isPrimary: element.isPrimary
        })
      })
      const { error } = await supabase.from('Teacher Classes').insert(newrows)

      if (error) {
        console.error('Error saving changes:', error)
        errorcheck = true
        this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
      }
      if (!errorcheck) {
        this.$root.snackbar.show({
          text: 'Changes Succesfully made',
          timeout: 10000,
          color: 'green'
        })
        this.$emit('onsubmit')
      }
    },
    async addTeacher() {
      var exists = this.rows.find(
        (value) => value.student_id == this.searchData.selected.student_id
      )
      if (!exists) {
        this.addedRows.push(this.searchData.selected)
        this.rows.push(this.searchData.selected)

        try {
      await supabase.from('Teacher Classes').insert([
        {
          class_id: this.modalData.class_id,
          userEmail: this.searchData.selected.userEmail,
          isPrimary: this.searchData.selected.isPrimary
        }
      ]);

      this.$root.snackbar.show({ text: 'Teacher added successfully', timeout: 2000, color: 'green' });
    } catch (error) {
      console.error('Error adding teacher to the database:', error);
      this.$root.snackbar.show({ text: 'Error adding teacher to the database', timeout: 5000, color: 'red' });
    }
  } else {
        this.$root.snackbar.show({
          text: 'User Already in list.',
          timeout: 5000,
          color: 'yellow'
        })
      }
      this.searchData.selected = null
    },
    async removeRow(rowdata) {
      console.log(rowdata)
      if (this.addedRows.includes(rowdata)) {
        if (
          await this.$refs.confirm.open(
            'Confirm',
            'Are you sure you want to delete this added record?'
          )
        ) {
          this.addedRows.splice(this.addedRows.indexOf(rowdata), 1)
          return
        }
      }
      if (
        await this.$refs.confirm.open('Confirm', 'Are you sure you want to delete this record?')
      ) {
        //this.rows.splice(this.rows.findIndex(rowdata),1)
        console.log('Delete row.')
        const { error } = await supabase
          .from('Perm Roaster')
          .delete()
          .eq('class_id', this.modalData.class_id)
          .eq('student_id', rowdata.student_id)
        if (error) {
          console.error('Error Deleting row from supabase', error)
          this.$root.snackbar.show({ text: 'Error Removing Student', color: 'Red', timeout: 5000 })
        } else {
          const index = this.rows.indexOf(rowdata)
          this.rows.splice(index)
        }
      }
    },
    async setPrimary(rowdata) {
      console.log(rowdata)
      rowdata.isPrimary = !rowdata.isPrimary
      if (this.addedRows.includes(rowdata)) {
        if (
          await this.$refs.confirm.open(
            'Confirm',
            'Are you sure you want to change primary teacher?'
          )
        ) {
          this.addedRows[
            this.addedRows.findIndex((value) => (value.userEmail = rowdata.userEmail))
          ].isPrimary = rowdata.isPrimary
          return
        }
      }
      if (
        await this.$refs.confirm.open('Confirm', 'Are you sure you want to change primary teacher?')
      ) {
        //this.rows.splice(this.rows.findIndex(rowdata),1)
        //console.log('Delete row.')
        const { error } = await supabase
          .from('Teacher Classes')
          .update({ isPrimary: rowdata.isPrimary })
          .eq('class_id', this.modalData.class_id)
          .eq('userEmail', rowdata.userEmail)
        if (error) {
          console.error('Error updating row from supabase', error)
          this.$root.snackbar.show({ text: 'Error updating Primary', color: 'Red', timeout: 5000 })
        } else {
          console.log('changed value')
          const index = this.rows.indexOf(rowdata)
          this.rows[index].isPrimary = rowdata.isPrimary
        }
      }
    }
  },
  mounted() {
    this.modalData = this.passedData
    console.log('Mounted', this.modalData)
  },
  beforeRouteLeave(to, from, next) {
    if (this.addedRows.length > 0) {
      const answer = window.confirm('Do you really want to leave? you have unsaved changes!')
      if (answer) {
        next()
      } else {
        next(false)
      }
    }
  }
}
</script>
