<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-card>
    <v-layout>
      <v-app-bar class="grow" app>
        <Default />
      </v-app-bar>
      <!-- <v-system-bar color="deep-purple darken-3"></v-system-bar> -->
      <v-main style="height: 600px">
        <v-card-item>
          <v-card-text>
            <div>
              <div class="text-overline mb-1"></div>
              <div class="text-h6 mb-1">Emergency Class Manager</div>
              <div class="text-caption"></div>
              Emergency Class Manager is an interactive website that allows
              teachers and administration to keep track of students during drills
              or emergency situations.
            </div>
          </v-card-text>
        </v-card-item>
      </v-main>
    </v-layout>
  </v-card>
</template>

<script setup>
import Default from '@/layouts/default/Default.vue'
</script>
<script>
export default {
  Default
}
</script>


