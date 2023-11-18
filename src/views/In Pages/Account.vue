<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar>
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
            <v-text-field :disabled=true label="Email" v-model="user.userEmail" readonly></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field :disabled=true label="School" v-model="user.school" readonly :loading="loading"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field label="First Name" v-model="user.fName" :readonly="!isEditing" :rules="firstNameRules"
              @input="handleInput('fName', user.fName)"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field label="Last Name" v-model="user.lName" :readonly="!isEditing"
              @input="handleInput('lName', user.lName)"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field :required=false label="Phone Number" v-model="user.phoneNum" :readonly="!isEditing"
              @input="handleInput('phoneNum', user.phoneNum)"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field :required=false label="Emergency Contact Information" v-model="user.emergcyInfo"
              :readonly="!isEditing" @input="handleInput('emergcyInfo', user.emergcyInfo)"></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        
        <v-btn :disabled="!isEditing" color=green variant="elevated" @click="saveChanges"> Save </v-btn>
      </v-card-actions>

      <v-snackbar v-model="hasSaved" :timeout="2000" attach position="absolute" location="bottom left">
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
      unsavedChanges: false,
      formDirty: false,
      user: {
        fName: '',
        lName: '',
        userEmail: '',
        phoneNum: '',
        emergcyInfo: '',
        school: '',
      },
      loading: false,
      submitloading: false
    };
  },
  mounted() {
    this.fetchUserData();
  },
  methods: {
    resetForm() {
          this.$refs.form.reset();
        },
    async fetchUserData() {
      try {
        this.loading = true;
        // Get the signed-in user's data
        const { data: { user } } = await supabase.auth.getUser();

        // Check if the user object exists and has an email property
        if (user && user.email) {
          const userEmail = user.email;
          console.log('Signed-in user email:', userEmail);

          const { data, error } = await supabase
            .from('Users')
            .select('userEmail, fName, lName, phoneNum, emergcyInfo, school:Schools(school)')
            .eq('userEmail', userEmail);

          if (error) {
            console.error('Error fetching user data:', error);
          } else if (data.length > 0) {
            const userWithSchool = data[0];

            this.user = {
              ...userWithSchool,
              school: userWithSchool.school.school
            }
            this.loading = false
          }
        } else {
          console.error('User email not found.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },
    toggleEditing() {
      this.isEditing = !this.isEditing;
    },
    async handleInput(field, value) {
      if (this.isEditing) {
        this.user[field] = value;
        this.unsavedChanges = true;
        this.formDirty = true;
        console.log(this.formDirty);
      }
    },
    async saveChanges() {
      this.submitloading = true
      const { data: { user } } = await supabase.auth.getUser();
      this.isEditing = !this.isEditing
      this.hasSaved = true
      const userEmail = user.email
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
        .eq('userEmail', userEmail);

      if (error) {
        console.error('Error saving changes:', error);
      } else {
        this.isEditing = false;
        this.submitloading = false;
      }
      this.formDirty = false;
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.$data.formDirty) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
};
</script>

