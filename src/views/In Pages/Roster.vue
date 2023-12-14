<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-responsive class="fill-width"
    ><v-select
      v-model="classSelection"
      :items="classes"
      item-title="Classes.className"
      item-value="Classes.className"
      :loading="classesLoading"
      label="Classes"
      persistent-hint
      return-object
      single-line
      :onchange="changeclass"
      :disabled="disableEdit"
    ></v-select>
    <div class="text-center" v-show="classSelection == null"><p>Select Class First</p></div>
  </v-responsive>
  <div v-if="classSelection">
    <v-responsive class="fill-width">
      <v-text-field
        v-model="search"
        placeholder="Search Here"
        :onchange="searchRows"
      ></v-text-field>
    </v-responsive>
    <v-container class="fill-height">
      <v-responsive class="align-center text-center fill-height">
        <v-data-table-server
          v-model:items-per-page="options.itemsPerPage"
          :headers="headers"
          :items-length="totalLoadedrows"
          :items="rows"
          :loading="loading"
          class="elevation-1"
          @update:options="loadRows"
        >
          <template v-slot:item.presence="{ item }">
            <v-select
              v-model="item.presence"
              :items="presenceOptions"
              label="Select"
              outlined
              dense
              :disabled="disableEdit"
              @update:model-value="changePresence(item)"
            ></v-select>
          </template>
          <template v-slot:item.date="{ item }">
            <p>{{ Date.parse(item.date).toLocaleString() }}</p>
          </template>
        </v-data-table-server>
        <div class="pt-3">
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
                :title="item?.raw?.id_number + '\t' + item?.raw?.fName + '\t' + item?.raw?.lName"
              ></v-list-item> </template
          ></v-autocomplete>
        </div>
        <div v-show="searchData.selected" class="text-right">
          <v-btn color="primary" outlined align-end :onclick="addStudent" class="flex-grow-0"
            >Add Temp Student</v-btn
          >
        </div>
        <div class="text-right">
          <v-btn color="green" @click="submition = true">Submition dialog</v-btn>
        </div>
        <v-dialog v-model="submition" max-width="800px"
          ><EventDialog
            :passedData="userData"
            @onsubmit="submitTable"
            @closeModal="submition = false"
          ></EventDialog>
        </v-dialog>
      </v-responsive>
    </v-container>
  </div>
  <Confirmation ref="confirm"></Confirmation>
</template>

<script setup>
import supabase from '@/supabase'
import Confirmation from '@/components/Confirmation.vue'
import { VDataTableServer } from 'vuetify/lib/labs/components.mjs'
import EventDialog from '@/components/EventDialog.vue'

const presenceOptions = ['Present', 'Absent', 'Missing', 'Visiting']
</script>
<script>
const supabaseRetrive = {
  async fetchStudentIds() {
    const { data, error } = await supabase.from('Students').select('id_number')
    if (error) {
      console.error(error)
      this.$root.snackbar.show({ text: 'Error fetching student IDs', timeout: 10000, color: 'red' })
      return []
    }
    const studentIds = data.map((student) => student.id_number)
    return studentIds
  },
  async count({ class_id }) {
    const { count, error } = await supabase
      .from('Perm Roaster')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', class_id)
    if (error) {
      console.error(error)
      throw error
    }
    //console.log(count)
    return count
  },
  async fetch({ page = 0, itemsPerPage = 50, /*sortBy = 'desc',*/ class_id }) {
    var from = (page - 1) * itemsPerPage
    var to = page * itemsPerPage - 1

    const { data: studentsData, error: studentsError } = await supabase
      .rpc('permstudents', { varclass_id: class_id })
      .range(from, to)

    if (studentsError) {
      console.error('Error fetching students:', studentsError)
      throw studentsError
    }

    /*if (sortBy.length) {
      const sortKey = sortBy[0].key
      const sortOrder = sortBy[0].order
      studentsData.sort((a, b) => {
        const aValue = a[sortKey]
        const bValue = b[sortKey]
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
      })
    }*/

    return { rows: studentsData, total: studentsData.length }
  },
  /*async fetchload({ from = 0, to = 0, sortBy = 'desc', class_id }) {
    const { data: studentsData, error: studentsError } = await supabase
      .from('Students')
      .select('*')
      .eq('class_id', class_id)
      .range(from, to)

    if (studentsError) {
      console.error('Error fetching students:', studentsError)
      throw studentsError
    }

    if (sortBy.length) {
      const sortKey = sortBy[0].key
      const sortOrder = sortBy[0].order
      studentsData.sort((a, b) => {
        const aValue = a[sortKey]
        const bValue = b[sortKey]
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
      })
    }

    return { rows: studentsData, total: studentsData.length }
  },*/
  async search({ page = 0, itemsPerPage = 50, sortBy = 'desc', text = '', class_id }) {
    var from = (page - 1) * itemsPerPage
    var to = page * itemsPerPage - 1
    console.log(from, to)
    const { data, error } = await supabase
      .rpc('searchpermstudents', { searchtext: text, varclass_id: class_id })
      .range(from, to)
    console.log(data)
    if (error) {
      console.error(error)
      throw error()
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
    return data
  },
  async searchStudents({ text = '' }) {
    const { data, error } = await supabase.rpc('searchstudents', { searchtext: text }).range(0, 5)
    //console.log(data)
    if (error) {
      console.error(error)
      throw error
    }
    return { rows: data }
  },
  async getClasses({ userEmail }) {
    console.log(userEmail)
    const { data, error } = await supabase
      .from('Teacher Classes')
      .select('isPrimary,Classes!inner(class_id,className)')
      .eq('userEmail', userEmail)
      .eq('Classes.removed', false)
    console.log('classes', data)
    if (error) {
      console.error(error)
      throw error
    }
    data.sort((a, b) => {
      if (b.isPrimary == a.isPrimary)
        return a.Classes.className.toLowerCase().localeCompare(b.Classes.className.toLowerCase())
      else
        return (
          b.isPrimary - a.isPrimary ||
          a.Classes.className.toLowerCase().localeCompare(b.Classes.className.toLowerCase())
        )
    })

    return data
  },
  async getClass({ class_id }) {
    const { data, error } = await supabase
      .from('Classes')
      .select('className')
      .eq('class_id', class_id)
      .single()
    if (error) {
      console.error(error)
      throw error
    }
    console.log(data)
    return data
  },
  async getEvent({ event_id }) {
    const { data, error } = await supabase
      .from('Events')
      .select('eventName')
      .eq('event_id', event_id)
      .single()
    if (error) {
      console.error(error)
      throw error
    }
    console.log(data)
    return data
  },
  async getEventData({ class_id, event_id }) {
    const { data, error } = await supabase
      .from('Event Roaster')
      .select('Students!inner(id_number,fName,lName),status,date')
      .eq('class_id', class_id)
      .eq('event_id', event_id)
    if (error) {
      console.error(error)
      throw error
    }
    data.sort((a, b) => {
      return a.Students.lName.toLowerCase().localeCompare(b.Students.lName.toLowerCase())
    })
    return data
  }
}
export default {
  data: () => ({
    itemsPerPage: 10,
    headers: [
      { title: 'ID Number', key: 'id_number', align: 'left', width: '20%' },
      { title: 'First Name', key: 'fName', align: 'end' },
      { title: 'Last Name', key: 'lName', align: 'end' },
      { title: 'Presense', value: 'presence', align: 'end' }
    ],
    rows: [],
    currentLoaded: [],
    allrows: [],
    loading: true,
    totalrows: 0,
    totalLoadedrows: 0,
    search: '',
    options: { page: 1, itemsPerPage: 10, sortBy: {} },
    itemsPerPageOptions: [
      { value: 10, title: '10' },
      { value: 20, title: '20' },
      { value: 50, title: '50' },
      { value: 100, title: '100' }
    ],
    disableEdit: false,
    modalData: {
      selectedStudent: null,
      id_number: null,
      fName: null,
      lName: null,
      loading: false
    },
    addedRows: [],
    searchData: {
      selected: null,
      rows: [],
      text: '',
      loading: false
    },
    classSelection: null,
    classes: [],
    classesLoading: true,
    userData: null,
    submition: false
  }),
  async mounted() {
    console.log(this.$route.query)
    this.userData = await this.$root.userData
    this.setupLoad()
    this.studentIds = await supabaseRetrive.fetchStudentIds()
  },
  methods: {
    async setupLoad() {
      this.classesLoading = true
      var query = this.$route.query
      if ('class_id' in query && 'event_id' in query) {
        this.disableEdit = true
        this.loading = true
        this.headers = [
          { title: 'ID Number', key: 'id_number', align: 'left', width: '20%' },
          { title: 'First Name', key: 'fName', align: 'end' },
          { title: 'Last Name', key: 'lName', align: 'end' },
          { title: 'Presense', value: 'presence', align: 'end' },
          { title: 'date', value: 'date', align: 'end' }
        ]
        await Promise.all([
          supabaseRetrive.getClass({ class_id: query.class_id }),
          supabaseRetrive.getEvent({ event_id: query.event_id }),
          supabaseRetrive.getEventData({ class_id: query.class_id, event_id: query.event_id })
        ]).then((data) => {
          var localClass = data[0]
          localClass.className = localClass.className + '\t' + data[1].eventName
          this.classes.push(localClass)
          this.classSelection = this.classes[0]
          this.classesLoading = false
          this.loading = false
          this.currentLoaded = data[2]
          this.allrows = data[2]
          this.totalrows = this.currentLoaded.length
          this.rows = this.localfetch({ page:this.options.page, itemsPerPage:this.options.itemsPerPage, sortBy: this.options.sortBy })
        })
        return
      }
      await supabaseRetrive
        .getClasses({ userEmail: this.userData.userEmail })
        .then((classes) => {
          this.classesLoading = false
          this.classes = classes
          console.log(this.classes)
          if (this.classes.length == 1) {
            this.classSelection = classes[0]
          }
        })
        .catch(() => {
          this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
          this.classesLoading = true
          this.classes = []
        })
    },
    changePresence(data) {
      console.log(data)
      var index = this.currentLoaded.indexOf(data)
      if (~index) this.currentLoaded[index] = data
      index = this.addedRows.indexOf(data)
      if (~index) this.addedRows[index] = data
      index = this.allrows.indexOf(data)
      if (~index) this.allrows[index] = data
    },
    /*async fetchUserData() {
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser()

        if (user && user.email) {
          const userEmail = user.email

          const { data: userData, error: userError } = await supabase
            .from('Users')
            .select('school_id')
            .eq('userEmail', userEmail)
            .single()

          console.log('school id: ' + userData.school_id)
          if (userError) {
            console.error('Error fetching user data:', userError)
          } else {
            this.school_id = userData.school_id // Set the school_id property
          }
        } else {
          console.error('User email not found.')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    },*/
    /*updateStudentInfo() {
      const selectedStudent = this.rows.find(
        (student) => student.id_number === this.modalData.selectedStudent
      )

      if (selectedStudent) {
        this.modalData.fName = selectedStudent.fName
        this.modalData.lName = selectedStudent.lName
      } else {
        this.modalData.fName = null
        this.modalData.lName = null
      }
    },*/
    async studentSearch(searchtext) {
      if (searchtext.length > 3) {
        if (this.searchData.text != searchtext) {
          this.searchData.loading = true
          this.searchData.text = searchtext
          await Promise.all([
            supabaseRetrive.searchStudents({ text: this.searchData.text }),
            this.searchRows()
          ])
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
    async addStudent() {
      var exists = this.rows.find(
        (value) => value.student_id === this.searchData.selected.student_id
      )
      if (!exists) {
        this.addedRows.push(this.searchData.selected)
        this.rows.push(this.searchData.selected)
        this.allrows.push(this.searchData.selected)
        this.totalLoadedrows++
      } else {
        this.$root.snackbar.show({
          text: 'Student already in the list.',
          timeout: 5000,
          color: 'yellow'
        })
      }

      this.searchData.selected = null
      this.rows = this.localfetch({
        page: this.options.page,
        itemsPerPage: this.options.itemsPerPage,
        sortBy: this.options.sortBy
      })
    },
    async loadRows({ page, itemsPerPage, sortBy }) {
      this.loading = true
      if (this.totalrows == 0) {
        await supabaseRetrive
          .count({ class_id: this.classSelection.Classes.class_id })
          .then((count) => {
            this.totalrows = count
            this.totalLoadedrows = count
          })
          .catch(() => {
            this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
          })
      }
      this.options = { page: page, itemsPerPage: itemsPerPage, sortBy: sortBy }
      if (this.search.length < 3) {
        if (
          this.currentLoaded.length < page * itemsPerPage &&
          this.currentLoaded.length != this.totalrows
        ) {
          supabaseRetrive
            .fetch({ page, itemsPerPage, class_id: this.classSelection.Classes.class_id })
            .then(({ rows }) => {
              /* console.log(
                'CurrentLoaded amount',
                ((this.currentLoaded.length - ((page - 1) * itemsPerPage))*-1)
              ) */
              this.currentLoaded = this.currentLoaded.concat(
                rows.splice(
                  page == 1
                    ? this.currentLoaded.length
                    : (this.currentLoaded.length - (page - 1) * itemsPerPage) * -1
                )
              )
              console.log(this.currentLoaded)
              this.allrows = JSON.parse(JSON.stringify(this.currentLoaded.concat(this.addedRows)))
              this.rows = this.localfetch({ page, itemsPerPage, sortBy })
              this.loading = false
              this.$root.snackbar.show({ text: 'Loaded', timeout: 2000, color: 'blue' })
            })
            .catch(() => {
              this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
              this.loading = true
            })
        } else {
          console.log('Local load', this.allrows)
          this.rows = this.localfetch({ page, itemsPerPage, sortBy })
          this.loading = false
          this.$root.snackbar.show({ text: 'Loaded', timeout: 2000, color: 'blue' })
        }
      } else {
        this.searchRows()
      }
    },
    localfetch({ page = 0, itemsPerPage = 50, sortBy = 'desc' }) {
      console.log(sortBy)
      var from = (page - 1) * itemsPerPage
      var to = page * itemsPerPage
      console.log(from, to)
      var studentsData = this.allrows.slice(0)
      if (sortBy.length) {
        const sortKey = sortBy[0].key
        const sortOrder = sortBy[0].order
        studentsData.sort((a, b) => {
          const aValue = a[sortKey]
          const bValue = b[sortKey]
          return sortOrder === 'desc'
            ? bValue.toString().toLowerCase().localeCompare(aValue.toString().toLowerCase())
            : aValue.toString().toLowerCase().localeCompare(bValue.toString().toLowerCase())
        })
      }
      studentsData = studentsData.slice(from, to)
      //console.log(studentsData)
      //console.log(this.allrows)

      return studentsData
    },
    searchRows() {
      console.log('Search initiated...')
      if (this.search.length < 3) return
      this.loading = true

      supabaseRetrive
        .search({
          page: this.options.page,
          rowsPerPage: this.options.itemsPerPage,
          sortBy: this.options.sortBy,
          text: this.search,
          class_id: this.classSelection.Classes.class_id
        })
        .then((rows) => {
          console.log(rows)
          this.rows = rows.concat(
            this.addedRows.filter((value) => {
              console.log(value)
              return (
                value.fName.toLowerCase().includes(this.search.toLowerCase()) ||
                value.lName.toLowerCase().includes(this.search.toLowerCase()) ||
                value.id_number.toString().includes(this.search.toLowerCase())
              )
            })
          )
          this.loading = false
        })
    },
    changeclass() {
      this.options.page = 1
      this.currentLoaded = []
      this.loadRows()
    },
    async submitTable(event_id) {
      if (
        await this.$refs.confirm.open('Confirm', 'Are you sure you want to submit to Database?')
      ) {
        console.log('Confirmed')

        var submitArray = JSON.parse(JSON.stringify(this.allrows))
        var missingPresence = []
        console.log(submitArray)
        console.log(this.currentLoaded)
        submitArray.forEach(async (x) => {
          if (x.presence === undefined) {
            missingPresence.push(x)
          }
        })
        if (
          await this.$refs.confirm.open(
            'Set to present?',
            missingPresence.length.toString() +
              ' are Missing Presence Do you want to set to Presnet?'
          )
        ) {
          missingPresence.forEach((x) => {
            x.presence = 'Present'
          })
        }

        if (this.currentLoaded.length != this.totalrows) {
          var lastLenght = this.totalrows - this.currentLoaded.length
          var amountOfPasses = Math.ceil((this.totalrows - lastLenght) / 100)
          var promisesList = []
          for (var i = Math.floor(this.currentLoaded.length/100)+1; amountOfPasses >= i; i++) {
            promisesList.push(
              supabaseRetrive.fetch({
                page: i,
                itemsPerPage: 100,
                class_id: this.classSelection.Classes.class_id
              })
            )
          }
          console.log(promisesList)
          await Promise.all(promisesList).then((data) => {
            var remaining = (this.currentLoaded.length % 100)
            var lastList = data[0]
            console.log(lastList,remaining)
            lastList = lastList.rows.splice(remaining)
            lastList.forEach((element) => {
              element.presence = 'Present'
            })
            submitArray = submitArray.concat(lastList)
            for (var i = 1; i < data.length; i++) {
              var element = data[i].rows
              element.forEach((x) => {
                x.presence = 'Present'
              })
              submitArray = submitArray.concat(element)
            }
          })
        }
        submitArray.forEach((x) => {
          x.event_id = event_id
          x.class_id = this.classSelection.Classes.class_id
          delete x.fName
          delete x.lName
          delete x.id_number
        })
        console.log(submitArray)
        const { error } = await supabase.from('Event Roaster').insert(submitArray)
        this.submition = false
        if (error) {
          if (error.code == "23505") {
            console.log("Duplicate keys", error)
            this.$root.snackbar.show({ text: 'Event already submitted', timeout: 10000, color: 'yellow' })
          }
          console.error(error)
          this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
          return
        }
        this.$root.snackbar.show({ text: 'Submitted to database', timeout: 2000, color: 'green' })
      }
      /**/
    }
  }
}
</script>
