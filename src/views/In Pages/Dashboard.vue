<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div>
    <h1 v-if="userData && userData.fName">Welcome to your Dashboard, {{ userData.fName }}!</h1>
    <h1 v-else>Welcome to your Dashboard!</h1>
    <h2>Upcoming events:</h2>
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
        no-data-text="No Upcoming Events"
      >
      </v-data-table-server>
      <v-dialog v-model="model">
        <v-card>
          <v-card-text>
            <v-row no-gutters>
              <v-text-field
                v-model="modalData.eventName"
                placeholder="EventName"
                label="Event Name"
                readonly
              />
            </v-row>
            <v-row no-gutters
              ><v-text-field
                v-model="modalData.date"
                placeholder="Date and Time"
                label="Date and Time"
                readonly
              />
            </v-row>
            <v-row no-gutters>
              <v-textarea
                v-model="modalData.description"
                placeholder="Description"
                label="Description"
                readonly
              />
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="model = false" color="green" variant="flat">Okay </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-responsive>
  </v-container>
</template>

<script setup>
import supabase from '@/supabase'
import { ref, onMounted } from 'vue'
import { VDataTableServer } from 'vuetify/lib/labs/components.mjs'

const userData = ref(null)

onMounted(async () => {
  userData.value = await supabaseRetrive.fetchUserData()
})

</script>
<script>
const supabaseRetrive = {
  async fetchUserData() {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (user && user.email) {
        const userEmail = user.email

        const { data: userData, error: userError } = await supabase
          .from('Users')
          .select('*')
          .eq('userEmail', userEmail)
          .single()

        console.log('Admin?: ', userData.admin)
        console.log('school id: ' + userData.school_id)
        console.log('first name: ' + userData.fName)
        if (userError) {
          console.error('Error fetching user data:', userError)
        } else {
          return userData
        }
      } else {
        console.error('User email not found.')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  },
  formatDate(dateString) {
    const formattedDate = dateString.replace('T', ' ').replace(/\+\d{2}:\d{2}/, '')
    return formattedDate
  },
  async count(school_id) {
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)

    const { count, error } = await supabase
      .from('Events')
      .select('*', { count: 'exact', head: true })
      .gte('date', currentDate.toISOString()) // Greater than or equal to the start of the day
      .lt('date', endDate.toISOString())
      .eq('school_id', school_id)
    if (error) {
      console.error(error)
      throw error
    }
    return count
  },
  async fetch({ page = 0, itemsPerPage = 50, sortBy = 'date', school_id }) {
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)
    var from = (page - 1) * itemsPerPage
    var to = page * itemsPerPage
    console.log(from, to)

    try {
      const { data, error } = await supabase
        .from('Events')
        .select('*')
        .order('date', { ascending: true })
        .gte('date', currentDate.toISOString())
        .lt('date', endDate.toISOString())
        .eq('school_id', school_id)
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
          return sortOrder === 'date' ? bValue - aValue : aValue - bValue
        })
      }
      return { rows: data }
    } catch (error) {
      console.error('Error in fetch method:', error)
      throw error
    }
  },
  async search({ page = 0, itemsPerPage = 50, sortBy = 'date', text = '' }) {
    var from = (page - 1) * itemsPerPage
    var to = page * itemsPerPage
    console.log(from, to)
    const { data, error } = await supabase.rpc('searchusers', text).range(from, to)
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
        return sortOrder === 'date' ? bValue - aValue : aValue - bValue
      })
    }
    return { rows: data }
  }
}

export default {
  data: () => ({
    fName: '',
    itemsPerPage: 5,
    headers: [
      {
        title: `Today's Events`,
        align: 'center',
        sortable: true,
        key: 'eventName'
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
      eventName: null,
      date: null,
      description: null
    },
    localuserData: null
  }),
  computed: {
  },
  methods: {
    async loadRows({ page, itemsPerPage, sortBy }) {
      this.loading = true
      const userData = await this.$root.userData;
      if (this.totalrows == 0) {
        await supabaseRetrive
          .count(await userData.school_id)
          .then((count) => {
            this.totalrows = count
          })
          .catch(() => {
            this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
          })
      }
      console.log('School id:', userData.school_id)
      this.options = { page: page, rowsPerPage: itemsPerPage, sortBy: sortBy }
      if (this.search.length < 3) {
        supabaseRetrive
          .fetch({ page, itemsPerPage, sortBy, school_id: userData.school_id })
          .then(({ rows }) => {
            this.rows = rows
            this.loading = false
            this.$root.snackbar.show({ text: 'Loaded', timeout: 2000, color: 'blue' })
          })
          .catch(() => {
            this.rows = []
            this.loading = false
            this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
          })
      } else {
        this.searchRows()
      }
    },
    searchRows() {
      if (this.search.length < 3) return
      supabaseRetrive
        .search({
          page: this.options.page,
          rowsPerPage: this.options.rowsPerPage,
          sortBy: this.options.sortBy,
          text: this.search
        })
        .catch(() => {
          this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
        })
    },
    editRow(data, data2) {
      this.model = true

      this.modalData.eventName = data2.item.eventName
      this.modalData.date = supabaseRetrive.formatDate(data2.item.date)
      this.modalData.description = data2.item.description
    },
    showModal() {
      this.modal = false
    }
  }
}
</script>
