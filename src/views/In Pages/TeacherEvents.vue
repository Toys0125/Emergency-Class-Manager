<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <h1>Event Calendar</h1>

    <!-- FullCalendar component to display events -->
    <FullCalendar :options="calendarOptions" ref="calendar" />

    <v-dialog v-model="modal" persistent max-width="600px">
      <v-card>
        <v-card-title> Event Details </v-card-title>
        <v-card-text>
          <v-text-field v-model="modalData.eventName" label="Event Name"></v-text-field>
          <v-text-field v-model="modalData.date" label="Event Date and Time"></v-text-field>
          <v-text-field v-model="modalData.description" label="Event Description"></v-text-field>
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
    // Load events from the database and populate the calendar
    await this.fetchUserData()
    const { data: events, error } = await supabase
      .from('Events')
      .select('*')
      .eq('school_id', this.school_id)

    console.log(events)

    if (error) {
      console.error(error)
    } else {
      // Populate events in the calendar
      this.calendarOptions.events = events.map((event) => ({
        title: event.eventName,
        start: event.date
      }))
    }
  },
  methods: {
    handleEventClick(info) {
      // Extract event details from the clicked event
      const clickedEvent = info.event

      // Set modalData properties based on the clicked event
      this.modalData.eventName = clickedEvent.title
      const eventDate = new Date(clickedEvent.start)
      const formattedDate = eventDate.toISOString().replace('T', ' ').replace('Z', '')
      this.modalData.date = formattedDate
      this.modalData.description =
        clickedEvent.extendedProps.description || 'No description available' // Assuming you have a description property in your events

      // Open the modal
      this.modal = true
    },
    async fetchUserData() {
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
    }
  }
}
</script>
