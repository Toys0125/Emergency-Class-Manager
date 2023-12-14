<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <h1>Event Calendar</h1>

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
          <v-btn variant="elevated" color="red" @click="openConfirmDeleteDialog">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDeleteDialog" max-width="400">
  <v-card>
    <v-card-title>Confirm Deletion</v-card-title>
    <v-card-text>
      Are you sure you want to delete this event?
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer> <!-- Add this spacer to push the buttons to the right -->
      <v-btn variant="elevated" color="green" @click="deleteEvent">Yes</v-btn>
      <v-btn variant="elevated" color="red" @click="cancelDelete">Cancel</v-btn>
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
      confirmDeleteDialog: false,
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
    const { data: events, error } = await supabase
      .from('Events')
      .select('*')
      .eq("school_id", this.school_id);

    console.log(events)

    if (error) {
      console.error(error);
    } else {
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
        const { data } = await supabase
          .from('Users')
          .select('school_id') 
          .eq('school_id', this.school_id)
          .single();

        if (!data) {
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

        this.$refs.calendar.getApi().addEvent(event);
        console.log("school_id before insertion: " + this.school_id);
        await this.insertData({
          date: this.newEventDate,
          eventName: this.newEventTitle,
          description: this.newEventDesc,
          school_id: this.school_id
        });

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

            this.school_id = userData.school_id;
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
      this.confirmDeleteDialog = true;

      const calendarApi = this.$refs.calendar.getApi();
      const clickedEvent = calendarApi.getEventById(event_id);

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

        const calendarApi = this.$refs.calendar.getApi();
        const eventToRemove = calendarApi.getEventById(event_id);
        if (eventToRemove) {
          eventToRemove.remove();
        }

        this.modal = false;
        this.confirmDeleteDialog = false;
      }
    },

  cancelDelete() {
    // Close the confirmation dialog without deleting
    this.confirmDeleteDialog = false;
  },
  openConfirmDeleteDialog() {
    // Open the confirmation dialog
    this.confirmDeleteDialog = true;
  },
  },
};
</script>


