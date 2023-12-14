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
        <v-btn color="red" variant="flat" @click="openConfirmDialog">Delete Student</v-btn>
      </div>
      <v-dialog v-model="confirmDialog" max-width="400">
        <v-card>
          <v-card-title>Confirm Deletion</v-card-title>
          <v-card-text>
            Are you sure you want to delete this student?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" @click="deleteStudent" color="green">Yes</v-btn>
            <v-btn variant="flat" @click="cancelDelete" color="red">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
      confirmDialog: false,
    };
  },
  async mounted() {
    this.userData = await this.$root.userData
    this.school_id = this.userData.school_id
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
        
        window.location.reload(true);

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
        this.confirmDialog = true;

        this.id_number = '';
        this.fName = '';
        this.lName = '';
        this.$root.snackbar.show({ text: 'Student has been deleted', timeout: 10000, color: 'green' });
        window.location.reload(true);
        this.tab == 'two'
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
    openConfirmDialog() {
    this.confirmDialog = true;
  },

  async confirmDelete() {
    // Perform actual delete logic here
    await this.deleteStudent();
    
    // Close the confirmation dialog
    this.confirmDialog = false;
  },

  cancelDelete() {
    // Close the confirmation dialog without deleting
    this.confirmDialog = false;
  },
  },
};
</script>