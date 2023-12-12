<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12">
        <!-- Adjust the column width to take the full width of the container -->
        <v-card class="text-center" style="width: 100%;">
          <v-img
            src="src/assets/IMG_2734.jpeg-PhotoRoom.png-PhotoRoom.png"
            alt="Emergency Image"
            class="mb-3 smaller-image"
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
          <v-btn class="mt-1 less-wide-button">
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
  // Add any necessary data, methods, or lifecycle hooks here
};
</script>

<style scoped>
/* Add any custom styles here */
.smaller-image {
  max-width: 200px; /* Adjust the max-width to your preference */
  max-height: 150px; /* Adjust the max-height to your preference */
  margin: 0 auto; /* Center the image horizontally */
  display: block; /* Make the image a block element to center it */
}
.less-wide-button {
}

.slogan {
  font-size: 1.2rem; /* Adjust the font size to make the slogan stand out */
  font-weight: bold; /* Optionally make the text bold */
  color: white; /* Optionally set a specific color */
}
</style>
