<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <h1>Event Calendar</h1>

    <!-- Input fields for event details -->
    <div>
      <v-text-field v-model="newEventTitle" placeholder="Event Title" label="Event Title" />
    </div>

    <div>
      <label for="eventDate">Event Date:</label>
      <input type="datetime-local" id="eventDate" v-model="newEventDate" />
    </div>

    <div>
      <v-textarea v-model="newEventDesc" placeholder="Event Description"  label="Event Description" />
    </div>

    <div>
      <v-btn color="green" variant="flat" @click="addEvent">Add Event</v-btn>
    </div>

    <!-- FullCalendar component to display events -->
    <FullCalendar :options="calendarOptions" ref="calendar" />
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
      calendarOptions: {
        plugins: [dayGridPlugin],
        initialView: 'dayGridMonth',
        weekends: true
      },
      newEventTitle: '',
      newEventDate: '',
      newEventDesc: ''
    }
  },
  methods: {
    async addEvent() {
      if (this.newEventTitle && this.newEventDate) {
        const event = {
          eventName: this.newEventTitle,
          start: new Date(this.newEventDate)
        }

        if (this.newEventDesc) {
          event.description = this.newEventDesc
        }

        // Add the new event to the FullCalendar
        this.$refs.calendar.getApi().addEvent(event)

        await this.insertData({
          date: this.newEventDate,
          eventName: this.newEventTitle,
          description: this.newEventDesc
        })

        // Clear input fields
        this.newEventTitle = ''
        this.newEventDate = ''
        this.newEventDesc = ''
      } else {
        alert('Please enter event title and date')
      }
    },
    async insertData(data) {
      const { data: insertedData, error } = await supabase.from('Events').insert([data])
      if (error) {
        console.error(error)
        this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
      } else {
        console.log('Data inserted:', insertedData)
        this.$root.snackbar.show({
          text: 'Data inserted into table',
          timeout: 10000,
          color: 'green'
        })
      }
    }
  }
}
</script>
