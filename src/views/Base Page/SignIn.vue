<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <VForm validate-on="sumbit lazy" @submit.prevent="handleLogin">
    <h1 class="header">Supabase + Vue 3</h1>
    <p class="description">Sign in or register via magic link with your email below</p>
    <v-text-field v-model="email" label="Email" type="email"></v-text-field>
    <v-btn
      :loading="loading"
      type="submit"
      block
      class="mt-2"
      :text="loading ? 'Loading' : 'Send magic link'"
    ></v-btn>
  </VForm>
</template>

<script setup>
import supabase from '@/supabase'
import { ref } from 'vue'
import { VForm } from 'vuetify/lib/components/index.mjs'

const loading = ref(false)
const email = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value
    })
    if (error) throw error
    alert('Check your email for the login link!')
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>
<script>
export default {
}
</script>