<template>
  <router-view />
  <snackbar ref="snackbar"/>
</template>

<script setup>
  import snackbar from './components/snackbar.vue';
</script>
<script>
export default {
  components:{
    snackbar
  },
  mounted() {
    this.$root.snackbar = this.$refs.snackbar
    console.log(this.$root.snackbar)
  }
}
</script>
