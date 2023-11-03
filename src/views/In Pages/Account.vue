<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <h1>My Account</h1>
    <v-card>
      <v-card-title>Account Information</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field label="First Name" v-model="user.fName" :readonly="!isEditing" @input="handleInput('fName')"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field label="Last Name" v-model="user.lName" :readonly="!isEditing" @input="handleInput('lName')"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field label="Email" v-model="user.userEmail" readonly></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field label="Phone Number" v-model="user.phoneNum" :readonly="!isEditing" @input="handleInput('phoneNum')"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field label="Emergency Contact Information" v-model="user.emergcyInfo" :readonly="!isEditing" @input="handleInput('emergcyInfo')"></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="toggleEditing" color="primary">{{ isEditing ? 'Save' : 'Edit' }}</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import supabase from '@/supabase'
</script>
<script>
export default {
  data() {
    return {
      user: {
        fName: '',
        lName: '',
        userEmail: '',
        phoneNum: '',
        emergcyInfo: '',
      },
      isEditing: false,
    };
  },
  mounted() {
    // Fetch user data from Supabase and populate the user object
    this.fetchUserData();
  },
  methods: {
    async fetchUserData() {
      // Use Supabase client to query user data based on the authenticated user's email
      // Replace 'supabaseClient' with your actual Supabase client instance
      const { data, error } = await supabase
        .from('Users') // Replace with your actual table name
        .select('fName, lName, userEmail, phoneNum, emergcyInfo')
        .eq('userEmail', 'hoskinskatie1@gmail.com'); // Replace with the authenticated user's email
      if (error) {
        console.error('Error fetching user data:', error);
      } else {
        this.user = data[0];
      }
    },
    toggleEditing() {
      this.isEditing = !this.isEditing;
    },
    async handleInput(field, value) {
      if (this.isEditing) {
        // When in edit mode, update the user object with the input value
        // For simplicity, we assume there's no validation here (add validation as needed)
        this.user[field] = value;
      }
    },
    async saveChanges() {
      // Implement the logic to save the changes to the Supabase database
      // Use the Supabase client to update the user data
      // For example:
      const { error } = await supabase
        .from('Users') // Replace with your actual table name
        .update([
          {
            fName: this.user.fName,
            lName: this.user.lName,
            phoneNum: this.user.phoneNum,
            emergcyInfo: this.user.emergcyInfo,
          },
        ])
        .eq('userEmail', 'hoskinskatie1@gmail.com'); // Replace with the authenticated user's email

      if (error) {
        console.error('Error saving changes:', error);
      } else {
        // Changes saved successfully
        this.isEditing = false; // Disable editing mode after saving
      }
    },
  },
};
</script>

