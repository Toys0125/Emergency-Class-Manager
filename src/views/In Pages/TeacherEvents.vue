<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <h1>Event Calendar</h1>

    <FullCalendar :options="calendarOptions" ref="calendar" />

    <v-dialog v-model="modal" persistent max-width="600px">
      <v-card>
        <v-card-title> Event Details </v-card-title>
        <v-card-text>
          <v-text-field v-model="modalData.eventName" label="Event Name" readonly></v-text-field>
          <v-text-field v-model="modalData.date" label="Event Date and Time" readonly></v-text-field>
          <v-text-field v-model="modalData.description" label="Event Description" readonly></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="elevated" color="green" @click="modal = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import supabase from '@/supabase'

export default {
  components: {
    FullCalendar
  },
  data() {
    return {
      modal: false,
      calendarOptions: {
        plugins: [dayGridPlugin],
        initialView: 'dayGridMonth',
        weekends: true,
        events: [],
        timeZone: 'auto',
        eventClick: this.handleEventClick
      },
      newEventTitle: '',
      newEventDate: '',
      newEventDesc: '',
      school_id: '',
      modalData: {
        eventName: null,
        date: null,
        description: null
      }
    }
  },
  async mounted() {
    this.userData = await this.$root.userData
    this.school_id = this.userData.school_id
    const { data: events, error } = await supabase
      .from('Events')
      .select('*')
      .eq('school_id', this.school_id)

    console.log(events)

    if (error) {
      console.error(error)
    } else {
      this.calendarOptions.events = events.map((event) => ({
        title: event.eventName,
        start: event.date,
        description: event.description
      }))
    }
  },
  methods: {
    handleEventClick(info) {
      const clickedEvent = info.event
      console.log(clickedEvent);

      this.modalData.eventName = clickedEvent.title
      const eventDate = new Date(clickedEvent.start)
      const formattedDate = eventDate.toISOString().replace('T', ' ').replace('Z', '')
      this.modalData.date = formattedDate
      this.modalData.description = clickedEvent.extendedProps.description

      this.modal = true
    },
  }
}
</script>
