<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12">
        <!-- Adjust the column width to take the full width of the container -->
        <v-card class="text-center" style="width: 100%;">
          <v-img
            src="@/assets/Emergency_Class_Manager_Logo.svg"
            alt="Emergency Image"
            class="my-3 smaller-image"
          ></v-img>
          <v-card-title class="headline text-center">
            Welcome to Emergency Class Manager
          </v-card-title>
          <v-card-text class="text-center">
            <div class="body-1">
              Emergency Class Manager is a powerful website used to allow teachers and
              administration to efficiently manage students during drills or
              emergency situations, stay organized, and keep everyone safe.
            </div>
            <div class="subtitle-1 mt-4 slogan">
              <strong>Emergency Ready, Student-Focused</strong>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-row justify="center">
          <v-btn class="mt-1">
            <router-link to="/signin" style="text-decoration: none; color: inherit;">
              Sign In/Register
            </router-link>
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'HomePage',
};
</script>

<style scoped>
.smaller-image {
  max-width: 200px;
  max-height: 150px;
  margin: 0 auto;
  display: block; 
}

.slogan {
  font-size: 1.2rem;
  font-weight: bold;
}
</style>
