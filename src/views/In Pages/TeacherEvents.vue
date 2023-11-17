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
        events: [],
        timeZone: 'auto'
      },
      newEventTitle: '',
      newEventDate: '',
      newEventDesc: '',
      school_id: '',
    };
  },
  async mounted() {
    // Load events from the database and populate the calendar
    await this.fetchUserData();
    const { data: events, error } = await supabase
      .from('Events')
      .select('*')
      .eq('school_id', this.school_id);

    console.log(events)
    
    if (error) {
      console.error(error);
    } else {
      // Populate events in the calendar
      this.calendarOptions.events = events.map(event => ({
        title: event.eventName,
        start: event.date,
      }));
    }
  },
  methods: {
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
  }
};
</script>

