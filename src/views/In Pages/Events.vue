<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <h1>Event Calendar</h1>

    <!-- Input fields for event details -->
    <div>
      <v-text-field v-model="newEventTitle" placeholder="Event Title" label="Event Title" />
    </div>

    <div>
      <label for="eventDate">Event Date and Time:</label>
      <input type="datetime-local" id="eventDate" v-model="newEventDate" />
    </div>

    <div>
      <v-textarea v-model="newEventDesc" placeholder="Event Description" label="Event Description" />
    </div>

    <div>
      <v-btn color="green" variant="flat" @click="addEvent">Add Event</v-btn>
    </div>

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
          <v-btn variant="elevated" color="red" @click="deleteEvent">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


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
        description: null,
        event_id: null
      }
    };
  },
  async mounted() {
    await this.fetchUserData();
    // Load events from the database and populate the calendar
    const { data: events, error } = await supabase
      .from('Events')
      .select('*')
      .eq("school_id", this.school_id);

    console.log(events)

    if (error) {
      console.error(error);
    } else {
      // Populate events in the calendar
      this.calendarOptions.events = events.map(event => ({
        title: event.eventName,
        start: event.date,
        description: event.description,
        id: event.event_id
      }));
    }

  },
  methods: {
    handleEventClick(info) {
      const clickedEvent = info.event

      this.modalData.eventName = clickedEvent.title
      const eventDate = new Date(clickedEvent.start)
      const formattedDate = eventDate.toISOString().replace('T', ' ').replace('Z', '')
      this.modalData.date = formattedDate
      this.modalData.description =
        clickedEvent.extendedProps.description
      this.modalData.event_id = clickedEvent.id
      this.modal = true
    },
    async addEvent() {
      if (this.newEventTitle && this.newEventDate && this.school_id) {
        const { data: userExists } = await supabase
          .from('Users')
          .select('school_id') // Assuming 'id' is the primary key of the Users table
          .eq('school_id', this.school_id)
          .single();

        if (!userExists) {
          alert('Invalid school_id. Please select a valid school_id.');
          return;
        }

        const event = {
          title: this.newEventTitle,
          start: this.newEventDate,
        };

        if (this.newEventDesc) {
          event.description = this.newEventDesc;
        }

        // Add the new event to the FullCalendar
        this.$refs.calendar.getApi().addEvent(event);

        await this.insertData({
          date: this.newEventDate,
          eventName: this.newEventTitle,
          description: this.newEventDesc,
          school_id: this.school_id
        });

        // Clear input fields
        this.newEventTitle = '';
        this.newEventDate = '';
        this.newEventDesc = '';
      } else {
        alert('Please enter event title and date');
      }
    },
    async fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user && user.email) {
          const userEmail = user.email;

          const { data: userData, error: userError } = await supabase
            .from('Users')
            .select('school_id')
            .eq('userEmail', userEmail)
            .single();

          console.log("school id: " + userData.school_id)
          if (userError) {
            console.error('Error fetching user data:', userError);
          } else {

            this.school_id = userData.school_id; // Set the school_id property
          }
        } else {
          console.error('User email not found.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
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
    async deleteEvent() {
      const event_id = this.modalData.event_id;

      const calendarApi = this.$refs.calendar.getApi();
      const clickedEvent = calendarApi.getEventById(event_id);

      // Check if the event has already occurred
      const eventDate = new Date(clickedEvent.start);
      const currentDate = new Date();

      if (eventDate < currentDate) {
        this.$root.snackbar.show({ text: 'Cannot delete events that have already occured.', timeout: 10000, color: 'red' })
        return;
      }

      const { data: deletedData, error } = await supabase
        .from('Events')
        .delete()
        .eq('event_id', event_id)

      if (error) {
        console.error(error);
        this.$root.snackbar.show({ text: 'Error deleting event', timeout: 10000, color: 'red' });
      } else {
        console.log('Event deleted: ' + deletedData);
        this.$root.snackbar.show({ text: 'Event deleted successfully', timeout: 10000, color: 'green' });

        // Remove the event from the calendar
        const calendarApi = this.$refs.calendar.getApi();
        const eventToRemove = calendarApi.getEventById(event_id);
        if (eventToRemove) {
          eventToRemove.remove();
        }

        // Close the modal after deletion
        this.modal = false;
      }
    }
  },
};
</script>


