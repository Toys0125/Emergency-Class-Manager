<template>
    <v-app>
      <div class="d-flex justify-center mt-2">
        <v-date-picker v-model="date" readonly></v-date-picker>
      </div>
    </v-app>
  </template>
  <script>
  export default {
    name: 'App',
    data: () => ({
      date: null,
    }),
  };
  </script>