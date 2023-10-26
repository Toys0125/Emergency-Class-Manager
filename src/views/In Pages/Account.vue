<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div>
      <h1>Welcome to Your Dashboard</h1>
      <div>
        <h2>Events</h2>
      </div>
      <div>
          <li>Today's events: Event A, Event B.</li>
      </div>
    </div>
  </template>
  
  <script setup>
  import AppBar from '@/layouts/default/AppBar.vue'
  </script>
  <script>
  export default {
    AppBar
  }
  </script>