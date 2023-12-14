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
          <v-card-title class="small-title">Event Submissions</v-card-title>
          <v-simple-table v-if="modalData.classIdsSubmitted.length > 0">
            <template v-slot:default>
              <thead>

                <tr>

                  <th>Class ID</th>
                  <th>Class Name</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="classInfo in modalData.classIdsSubmitted" :key="classInfo.id">
                  <td>
                    <a :href="generateRosterURL(classInfo.id)" target="_blank">{{ classInfo.id }}</a>
                  </td>
                  <td>
                    <a>{{ classInfo.name }}</a>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>

          <p v-else>
            No submissions available.
          </p>
        </v-card-text>
        <v-card-actions class="justify-end">
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
          <v-spacer></v-spacer>
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
      classNames: {},
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
    async handleEventClick(info) {
      const clickedEvent = info.event;

      const eventId = clickedEvent.id;
      try {
        const { data: roasterData, error: roasterError } = await supabase
          .from('Event Roaster')
          .select('class_id')
          .eq('event_id', eventId);

        if (roasterError) {
          console.error('Error fetching roaster data:', roasterError);
        } else {
          const classIdsSubmittedSet = new Set(roasterData.map((roaster) => roaster.class_id));

          const classIdToNameMap = await this.fetchClassNames(Array.from(classIdsSubmittedSet));

          const classIdsSubmittedWithNames = Array.from(classIdsSubmittedSet).map((classId) => ({
            id: classId,
            name: classIdToNameMap[classId],
          }));

          this.modalData = {
            eventName: clickedEvent.title,
            date: new Date(clickedEvent.start).toISOString().replace('T', ' ').replace('Z', ''),
            description: clickedEvent.extendedProps.description,
            event_id: eventId,
            classIdsSubmitted: classIdsSubmittedWithNames,
          };

          console.log('Class IDs submitted to the event:', classIdsSubmittedWithNames);
        }
      } catch (error) {
        console.error('Error fetching roaster data:', error);
      }

      this.modal = true;
    },

    async fetchClassNames(classIds) {
      const { data: classNames, error } = await supabase
        .from('Classes')
        .select('class_id, className')
        .in('class_id', classIds);

      if (error) {
        console.error('Error fetching class names:', error);
        return [];
      } else {
        return classNames.reduce((acc, curr) => {
          acc[curr.class_id] = curr.className;
          return acc;
        }, {});
      }
    },

    async addEvent() {
      //school_id check
      if (this.newEventTitle && this.newEventDate && this.school_id) {
        const { data } = await supabase
          .from('Users')
          .select('school_id')
          .eq('school_id', this.school_id)

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
      this.confirmDeleteDialog = false;
    },
    openConfirmDeleteDialog() {
      this.confirmDeleteDialog = true;
    },
    generateRosterURL(classId) {
      const event_id = this.modalData.event_id;
      return `https://manager.toysland.pw/roster?class_id=${encodeURIComponent(classId)}&event_id=${encodeURIComponent(event_id)}`;
    },
  },
};
</script>

<style scoped>
.small-title {
  font-size: 16px;
}
</style>
