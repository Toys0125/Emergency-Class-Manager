<template>
    <div>
    <h2>Add Student</h2>

    <!-- Input fields for event details -->
    <div>
      <v-text-field v-model="id_number" placeholder="Student ID Number" label="Student ID Number" />
    </div>

    <div>
      <v-text-field v-model="fName" placeholder="Student First Name" label="Student First Name" />
    </div>

    <div>
      <v-text-field v-model="lName" placeholder="Student Last Name" label="Student Last Name" />
    </div>
    <div>
      <v-btn color="green" variant="flat" @click="addStudent">Add Student</v-btn>
    </div>
  </div>
</template>
<script>
import supabase from '@/supabase'

export default {
  data() {
    return {
      id_number: '',
      fName: '',
      lName: '',
      school_id: ''
    };
  },
  async mounted() {
    await this.fetchUserData();
  },
  methods: {
    async addStudent() {
  if (!this.id_number || !this.fName || !this.lName || !this.school_id) {
    alert('Please fill in all the required fields.');
    return;
  }

  const { data: userExists, error: userError } = await supabase
    .from('Users')
    .select('school_id')
    .eq('school_id', this.school_id)
    .single();

  if (userError) {
    console.error('Error checking school_id:', userError);
    this.$root.snackbar.show({ text: 'Error checking school_id', timeout: 10000, color: 'red' });
    return;
  }

  if (!userExists) {
    alert('Invalid school_id. Please select a valid school_id.');
    return;
  }

  // Proceed with student insertion
  await this.insertData({
    id_number: this.id_number,
    fName: this.fName,
    lName: this.lName,
    school_id: this.school_id
  });

  // Clear input fields
  this.id_number = '';
  this.fName = '';
  this.lName = '';
  this.school_id = '';
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
        .from('Students')
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