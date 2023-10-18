<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div>
      <v-img
        class="mx-auto my-6"
        max-width="228"
      ></v-img>
  
      <v-card
        class="mx-auto pa-12 pb-8"
        elevation="8"
        max-width="448"
        rounded="lg"
      >
        <div class="text-subtitle-1 text-medium-emphasis">Account</div>
  
        <v-text-field
          density="compact"
          placeholder="Email address"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
        ></v-text-field>
  
        <v-card class="mb-12" color="surface-variant" variant="tonal">
          <v-card-text class="text-medium-emphasis text-caption">
            Enter your email address associated with Emergency Class Manager to
            receive a link to register your account.
          </v-card-text>
        </v-card>
  
        <v-btn block class="mb-8" color="blue" size="large" variant="tonal">
          Log In
        </v-btn>
  
        <v-card-text class="text-center">
          <a
            class="text-blue text-decoration-none"
            href="#"
            rel="noopener noreferrer"
            target="_blank"
          >
            Sign up now <v-icon icon="mdi-chevron-right"></v-icon>
          </a>
        </v-card-text>
      </v-card>
    </div>
  </template>
  
  <script>
    export default {
      data: () => ({
        visible: false,
      }),
    }
  </script>