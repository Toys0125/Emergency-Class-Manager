<!-- eslint-disable vue/valid-v-slot -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-card>
    <v-card-text>
      <v-responsive><p>Select an event</p></v-responsive>
      <v-autocomplete
        v-model="selectedEvent"
        :items="events"
        placeholder="Loading events"
        item-title="eventName"
        :loading="loading"
        no-data-text="No events currently"
        return-object
      >
        <template v-slot:selection="{ item }">
          <p>
            {{ item?.raw?.eventName + '\t' + new Date(item?.raw?.date) }}
          </p>
        </template>
        <template v-slot:item="{ props, item }">
          <v-list-item
            v-bind="props"
            :title="item?.raw?.eventName + '\t' + new Date(item?.raw?.date)"
          ></v-list-item>
        </template>
      </v-autocomplete>
    </v-card-text>
    <v-card-actions class="d-flex align-end flex-column">
        <div><v-btn
        :color="selectedEvent != null ? 'green' : 'primary'"
        outlined
        v-show="events.length != 0"
        :onclick="submitEvent"
        >Submit</v-btn
      >
      <v-btn color="red" outlined :onclick="closeModal">Close</v-btn></div>
      
    </v-card-actions>
  </v-card>
</template>

<script setup>
import supabase from '@/supabase'
</script>

<script>
const supabaseRetrive = {
  async fetch({ school_id = null }) {
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)
    const { data, error } = await supabase
      .from('Events')
      .select('*')
      .order('date', { ascending: true })
      .gte('date', currentDate.toISOString())
      .lt('date', endDate.toISOString())
      .eq('school_id', school_id)
    console.log(data)
    if (error) {
      console.error(error)
      throw error
    }
    return { rows: data }
  }
}

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Event Dialog',
  props: { passedData: Object },
  data: () => ({
    events: [],
    loading: true,
    modalData: null,
    selectedEvent: null
  }),
  methods: {
    loadEvents() {
      this.loading = true
      supabaseRetrive
        .fetch({ school_id: this.modalData.school_id })
        .then(({ rows }) => {
          //console.log(rows)
          this.events = rows
          this.selectedEvent = this.events[this.events.length - 1]
          this.loading = false
          this.$root.snackbar.show({ text: 'Events Loaded', timeout: 2000, color: 'blue' })
        })
        .catch(() => {
          this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
        })
      //console.log(this.$root.snackbar)
    },
    async submitEvent() {
      this.$emit('onsubmit', this.selectedEvent.event_id)
    },
    async closeModal() {
      this.$emit('closeModal')
    }
  },
  async mounted() {
    this.modalData = this.passedData
    console.log('Mounted', this.passedData)
    this.loadEvents()
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
