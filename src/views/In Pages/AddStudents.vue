<template>
  <div>
    <v-tabs v-model="tab" bg-color="primary">
      <v-tab value="one">Add Student</v-tab>
      <v-tab value="two">Delete Student</v-tab>
    </v-tabs>

    <!-- Add Student Tab -->
    <div v-if="tab === 'one'">
      <div>
        <v-text-field v-model="id_number" placeholder="ID" label="Student ID Number" />
      </div>

      <div>
        <v-text-field v-model="fName" placeholder="First Name" label="Student First Name" />
      </div>

      <div>
        <v-text-field v-model="lName" placeholder="Last Name" label="Student Last Name" />
      </div>
      <div>
        <v-btn color="green" variant="flat" @click="addStudent">Add Student</v-btn>
      </div>
    </div>

    <!-- Delete Student Tab -->
    <div v-if="tab === 'two'">
      <div>
        <v-text-field v-model="id_number" placeholder="ID" label="Student ID Number" />
      </div>

      <div>
        <v-text-field v-model="fName" placeholder="First Name" label="Student First Name" />
      </div>

      <div>
        <v-text-field v-model="lName" placeholder="Last Name" label="Student Last Name" />
      </div>
      <div>
        <v-btn color="red" variant="flat" @click="deleteStudent">Delete Student</v-btn>
      </div>
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
      school_id: '',
      removed: false,
      tab: 'one',
    };
  },
  async mounted() {
    await this.fetchUserData();
  },
  methods: {
    async addStudent() {
      if (!this.id_number || !this.fName || !this.lName) {
        alert('Please fill in all the required fields.');
        return;
      }

      const { data: existingStudent, error: studentNoExist } = await supabase
        .from('Students')
        .select('id_number')
        .eq('id_number', this.id_number)
        .eq('school_id', this.school_id)
        .single();

      if (studentNoExist) {
        await this.insertData({
          id_number: this.id_number,
          fName: this.fName,
          lName: this.lName,
          school_id: this.school_id,
          removed: this.removed
        });

        this.id_number = '';
        this.fName = '';
        this.lName = '';
        this.school_id = '';
        this.$root.snackbar.show({ text: 'Student has been added', timeout: 10000, color: 'green' });
        return;
      }

      if (existingStudent) {
        this.$root.snackbar.show({ text: 'Student already exists with that id number', timeout: 10000, color: 'red' });
        return;
      }

      const { data: userExists, error: userError } = await supabase
        .from('Users')
        .select('school_id')
        .eq('school_id', this.school_id)
        .single();

      if (userError) {
        this.$root.snackbar.show({ text: 'Error checking school_id', timeout: 10000, color: 'red' });
        return;
      }

      if (!userExists) {
        alert('Invalid school_id. Please select a valid school_id.');
        return;
      }
    },
    async deleteStudent() {
      const { data: existingStudent, error: studentNoExist } = await supabase
        .from('Students')
        .select('id_number')
        .eq('id_number', this.id_number)
        .eq('school_id', this.school_id)
        .single();

      if (existingStudent) {
        await this.updateData({
          removed: true
        });

        this.id_number = '';
        this.fName = '';
        this.lName = '';
        this.$root.snackbar.show({ text: 'Student has been deleted', timeout: 10000, color: 'green' });
        return;
      }

      if (studentNoExist) {
        this.$root.snackbar.show({ text: 'Student could not be deleted', timeout: 10000, color: 'red' });
        return;
      }

      const { data: userExists, error: userError } = await supabase
        .from('Users')
        .select('school_id')
        .eq('school_id', this.school_id)
        .single();

      if (userError) {
        this.$root.snackbar.show({ text: 'Error checking school_id', timeout: 10000, color: 'red' });
        return;
      }

      if (!userExists) {
        alert('Invalid school_id. Please select a valid school_id.');
        return;
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
    async updateData(data) {
      const { data: insertedData, error } = await supabase
        .from('Students')
        .update([data])
        .eq('id_number', this.id_number);
      if (error) {
        console.error(error)
        this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
      } else {
        console.log('Data updated:', insertedData);
        this.$root.snackbar.show({ text: 'Data updated', timeout: 10000, color: 'green' })
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