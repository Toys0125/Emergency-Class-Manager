<template>
    <v-dialog v-model="showModal">
      <v-card>
        <v-card-title>Event Details</v-card-title>
        <v-card-text>
          <div>
            <strong>Event Name:</strong> {{ eventDetails.eventName }}
            <!-- Add other event details here -->
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closeModal">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  export default {
    props: {
      showModal: Boolean,
      eventDetails: Object,
    },
    methods: {
      closeModal() {
        this.$emit('close');
      },
    },
  };
  </script>