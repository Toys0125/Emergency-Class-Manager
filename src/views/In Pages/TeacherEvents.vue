<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <h1>Event Calendar</h1>

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
        events: []
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
      // Populate events in the calendar
      this.calendarOptions.events = events.map(event => ({
        title: event.eventName,
        //It does not like this .-.
        //start: new Date(event.date),
        //start: new Date(event.date + 'T' + event.scheduledTime),
        //start: new Date(event.date + event.scheduledTime),
        //start: new Date(`${event.date} + 'T' + ${event.scheduledTime}`)
        //start: new Date(`${event.date} + ${event.scheduledTime}`)
        //start: new Date(event.date, event.scheduledTime)
        start: new Date(`${event.date} ${event.scheduledTime}`),
      }));
    }
  },
  methods: {
    async addEvent() {
      if (this.newEventTitle && this.newEventDate) {
        const event = {
          title: this.newEventTitle,
          //It likes this & this works
          start: new Date(this.newEventDate + 'T' + this.newEventTime),
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
  }
};
</script>

