<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar >
      <v-btn icon="mdi-account"></v-btn>

      <v-toolbar-title class="font-weight-light">
        My Account
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon @click="isEditing = !isEditing">
        <v-fade-transition leave-absolute>
          <v-icon v-if="isEditing">mdi-close</v-icon>

          <v-icon v-else>mdi-pencil</v-icon>
        </v-fade-transition>
      </v-btn>
    </v-toolbar>
    <v-card>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field label="First Name" v-model="user.fName" :readonly="!isEditing" @input="handleInput('fName, user.fName')"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field label="Last Name" v-model="user.lName" :readonly="!isEditing" @input="handleInput('lName, user.lName')"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field :disabled=true label="Email" v-model="user.userEmail" readonly></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field :required=false label="Phone Number" v-model="user.phoneNum" :readonly="!isEditing" @input="handleInput('phoneNum, user.phoneNum')"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field :required=false label="Emergency Contact Information" v-model="user.emergcyInfo" :readonly="!isEditing" @input="handleInput('emergcyInfo, user.emergcyInfo')"></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>

    <v-card-actions>
      <v-spacer></v-spacer>

      <v-btn :disabled="!isEditing" @click="saveChanges"> Save </v-btn>
    </v-card-actions>

    <v-snackbar
      v-model="hasSaved"
      :timeout="2000"
      attach
      position="absolute"
      location="bottom left"
    >
      Your profile has been updated
    </v-snackbar>
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
      hasSaved: false,
      isEditing: null,
      user: {
        fName: '',
        lName: '',
        userEmail: '',
        phoneNum: '',
        emergcyInfo: '',
      },
    };
  },
  mounted() {
    this.fetchUserData();
  },
  methods: {
    async fetchUserData() {
      const { data, error } = await supabase
        .from('Users')
        .select('fName, lName, userEmail, phoneNum, emergcyInfo')
        .eq('userEmail', 'hoskinskatie1@gmail.com'); 
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
        this.user[field] = value;
      }
    },
    async saveChanges() {
      this.isEditing = !this.isEditing
      this.hasSaved = true
      const { error } = await supabase
        .from('Users') 
        .update([
          {
            fName: this.user.fName,
            lName: this.user.lName,
            phoneNum: this.user.phoneNum,
            emergcyInfo: this.user.emergcyInfo,
          },
        ])
        .eq('userEmail', 'hoskinskatie1@gmail.com'); 

      if (error) {
        console.error('Error saving changes:', error);
      } else {
        this.isEditing = false; 
      }
    },
  },
};
</script>

