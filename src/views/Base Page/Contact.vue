<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-container>
      <v-row align="center" justify="center">
          <v-card
            class="mx-auto"
            max-width="344"
          >
          
            <v-card-item>
              <div>
                <div class="text-caption">Katie Hoskins</div>
                <v-text-field hint="Click to open email"
                            persistent-hint readonly @click="openEmail('hoskinskatie1@gmail.com', 'ECM Inquiry')"
                            class="email-text-field">
                            hoskinskatie1@gmail.com</v-text-field>
              </div>

              <div>
                <div class="text-caption">Tanya Peacock</div>
                <v-text-field hint="Click to open email"
                            persistent-hint readonly @click="openEmail('nighteskye25@gmail.com', 'ECM Inquiry')"
                            class="email-text-field">
                            nighteskye25@gmail.com</v-text-field>
              </div>

              <div>
                <div class="text-caption">Marcus Stange</div>
                <v-text-field hint="Click to open email"
                            persistent-hint readonly @click="openEmail('marcus.g.stange@gmail.com', 'ECM Inquiry')"
                            class="email-text-field">
                            marcus.g.stange@gmail.com</v-text-field>
              </div>
            </v-card-item>
  
          </v-card>
      </v-row>
    </v-container>
  </template>

<script>
export default {
    methods: {
        openEmail(email, subject = 'Default Subject') {
            const windowRef = window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}`, '_blank');
            windowRef.focus();
        },
      }
    }
  </script>

<style scoped>
.email-text-field {
    cursor: pointer;
    align-content: start;
}</style>