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
      @click="addEmail"
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
      email: email.value,
      options: {
        shouldCreateUser: true
      }
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
  data() {
    return {
      email: '',
    };
  },
  methods: {
    async addEmail() {
      // Check if the email already exists in the database
      const { data: existingUser, error: queryError } = await supabase
        .from('Users')
        .select('*')
        .eq('userEmail', this.email);

      if (queryError) {
        console.error(queryError);
        this.$root.snackbar.show({ text: 'Error checking email in the database', timeout: 10000, color: 'red' });
      } else {
        // Email doesn't exist in the database, insert it
        if (existingUser.length === 0) {
          await this.insertData({ userEmail: this.email });
          this.$root.snackbar.show({ text: 'Email inserted into the database', timeout: 10000, color: 'green' });
        }

        // Proceed to sign in with the email
        try {
          const { error } = await supabase.auth.signInWithOtp({
            email: this.email
          });
          if (error) {
            throw error;
          }
          alert('Check your email for the login link!');
        } catch (error) {
          if (error instanceof Error) {
            alert(error.message);
          }
        }
      }
    },
    async insertData(data) {
      const { data: insertedData, error } = await supabase
        .from('Users')
        .insert(data);
      if (error) {
        console.error(error);
        this.$root.snackbar.show({ text: 'Error inserting email into the database', timeout: 10000, color: 'red' });
      } else {
        console.log('Data inserted:', insertedData);
      }
    }
  }
}
</script>
