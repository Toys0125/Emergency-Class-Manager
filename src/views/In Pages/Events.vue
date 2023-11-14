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
      <input type="date" id="eventDate" v-model="newEventDate" />
    </div>

    <div>
      <label for="eventTime">Event Time:</label>
      <input type="time" id="scheduledTime" v-model="newEventTime" />
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
        weekends: true,
        events: [],
        timeZone: 'America/Chicago'
      },
      newEventTitle: '',
      newEventDate: '',
      newEventTime: '',
      newEventDesc: '',
    };
  },
  async mounted() {
    // Load events from the database and populate the calendar
    const { data: events, error } = await supabase
      .from('Events')
      .select('*');

    console.log(events)
    
    if (error) {
      console.error(error);
    } else {
      const d = new Date().toISOString()
      console.log(d);
      // Populate events in the calendar

      this.calendarOptions.events = events.map(event => ({
        title: event.eventName,
        start: new Date(event.date).toISOString(),
      }));
    }
  },
  methods: {
    async addEvent() {
      if (this.newEventTitle && this.newEventDate) {
        const dateTimeString = `${this.newEventDate}T${this.newEventTime}`;
        const eventDate = new Date(dateTimeString)
        const event = {
          title: this.newEventTitle,
          //It likes this & this works
          start: eventDate.toISOString()
        };

        if (this.newEventDesc) {
          event.description = this.newEventDesc;
        }

        // Add the new event to the FullCalendar
        this.$refs.calendar.getApi().addEvent(event);

        await this.insertData({
          date: this.newEventDate,
          eventName: this.newEventTitle,
          scheduledTime: this.newEventTime,
          description: this.newEventDesc,
        });

        // Clear input fields
        this.newEventTitle = '';
        this.newEventDate = '';
        this.newEventTime = '';
        this.newEventDesc = '';
      } else {
        alert('Please enter event title and date');
      }
    },
    async insertData(data) {
      const { data: insertedData, error } = await supabase
        .from('Events')
        .insert([data]);
      if (error) {
        console.error(error)
        this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
      } else {
        console.log('Data inserted:', insertedData);
        this.$root.snackbar.show({ text: 'Data inserted into table', timeout: 10000, color: 'green' })
      }
    },
  },
};
</script>


