<!-- eslint-disable vue/valid-v-slot -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-card>
    <v-tabs v-model="tab" bg-color="primary" v-show="modalData.class_id != null">
      <v-tab value="one">Students</v-tab>
      <v-tab value="two">Teachers</v-tab>
    </v-tabs>
    <v-card-text>
      <v-window v-model="tab">
        <v-window v-model="tab">
          <v-responsive v-show="modalData.class_id == null"><p>Create new class</p></v-responsive>
          <v-window-item value="one">
            <v-responsive v-show="modalData.class_id != null"><p>Editing Class</p></v-responsive>
            <v-text-field
              v-model="modalData.className"
              placeholder="Class Name Here"
              label="Class name"
              :rules="[
                (v) => !!v || 'Name is required',
                (v) => (v && v.length > 4) || 'Must be more than 4 characters'
              ]"
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
                  ><v-btn color="red" variant="outlined" @click="removeRow(value.item)"
                    >Remove</v-btn
                  ></template
                >
              </v-data-table-server>
            </v-row>
            <v-row v-show="modalData.class_id != null">
              <v-autocomplete
                v-model="searchData.selected"
                placeholder="Search for student"
                :items="searchData.rows"
                @update:search="studentSearch"
                :loading="searchData.loading"
                item-title="fName"
                no-filter
                return-object
                @onkeyup.enter="addStudent"
                ><template v-slot:selection="{ item }">
                  <p>
                    {{ item?.raw?.id_number + '\t' + item?.raw?.fName + '\t' + item?.raw?.lName }}
                  </p>
                </template>
                <template v-slot:item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :title="
                      item?.raw?.id_number + '\t' + item?.raw?.fName + '\t' + item?.raw?.lName
                    "
                  ></v-list-item> </template
              ></v-autocomplete>
            </v-row>
            <v-row v-show="searchData.selected"
              ><v-spacer></v-spacer>
              <v-btn color="primary" outlined align-end :onclick="addStudent"
                >Add User</v-btn
              ></v-row
            >
          </v-window-item>
        </v-window>
      </v-window>
    </v-card-text>
    <v-card-actions class="d-flex align-end flex-column">
      <div v-show="tab == 'one'">
        <v-btn
          :color="addedRows.length > 0 ? 'green' : 'primary'"
          outlined
          v-show="modalData.class_id != null"
          :onclick="saveChanges"
          >Submit</v-btn
        >
        <v-btn
          :color="
            modalData.className != null && modalData.className.length > 4 ? 'green' : 'primary'
          "
          outlined
          v-show="modalData.class_id == null"
          :onclick="createClass"
          >Create Class</v-btn
        >
      </div>
      <div v-show="tab == 'two'"></div>
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
  async search({ page = 0, itemsPerPage = 50, sortBy = 'desc', text = '', class_id = 0 }) {
    var from = (page - 1) * itemsPerPage
    var to = page * itemsPerPage - 1
    console.log(from, to)
    const { data, error } = await supabase
      .rpc('searchpermstudents', { searchtext: text, varclass_id: class_id })
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
  async searchStudents({ text = '' }) {
    const { data, error } = await supabase.rpc('searchstudents', { searchtext: text }).range(0, 5)
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
    async studentSearch(searchtext) {
      if (searchtext.length > 3) {
        if (this.searchData.text != searchtext) {
          this.loading = true
          this.searchData.loading = true
          this.searchData.text = searchtext
          await Promise.all([
            supabaseRetrive.searchStudents({ text: this.searchData.text }),
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
        newrows.push({ class_id: this.modalData.class_id, student_id: element.student_id })
      })
      const { error } = await supabase.from('Perm Roaster').insert(newrows)

      if (error) {
        console.error('Error saving changes:', error)
        errorcheck = true
        this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
      }
      if (
        this.modalData.className.length > 4 &&
        this.modalData.className != this.passedData.className
      ) {
        const { error } = await supabase
          .from('Classes')
          .update({ className: this.modalData.className })
          .eq('class_id', this.modalData.class_id)

        if (error) {
          console.error('Error Class Name changes:', error)
          errorcheck = true
          this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
        }
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
    async createClass() {
      if (this.modalData.className.length < 4) return
      const { error } = await supabase
        .from('Classes')
        .insert({ className: this.modalData.className })

      if (error) {
        console.error('Error saving changes:', error)
        this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
      } else {
        this.$root.snackbar.show({
          text: 'Succesfully made class',
          timeout: 10000,
          color: 'green'
        })
        this.$emit('onsubmit')
      }
    },
    addStudent() {
      var exists = this.rows.find(
        (value) => value.student_id == this.searchData.selected.student_id
      )
      if (!exists) {
        this.addedRows.push(this.searchData.selected)
        this.rows.push(this.searchData.selected)
      } else {
        this.$root.snackbar.show({
          text: 'Student Already in list.',
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
    }
  },
  mounted() {
    this.modalData = this.passedData
    console.log('Mounted', this.passedData)
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
