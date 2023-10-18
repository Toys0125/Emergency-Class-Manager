<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-snackbar
    v-model="snackBar"
    :color="snackBarColor"
    :multi-line="mode === 'multi-line'"
    :timeout="snackBarTimeout"
    :vertical="mode === 'vertical'"
    >{{ snackBarText }}</v-snackbar
  >
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'snackbar',
  data: () => ({
    snackbarColor: 'green',
    snackBarText: 'Success!',
    snackBar: false,
    snackBarColor: 'green',
    snackBarTimeout: 2000,
    defaultSnackBarTimeout: 2000,
    defaultSuccessSnackBarText: 'Success!',
    defaultSuccessSnackBarColor: 'green',
    mode: false
  }),
  methods: {
    show(snackbarOptions) {
      this.snackBarColor =
        snackbarOptions.color === undefined ? this.defaultSuccessSnackBarColor : snackbarOptions.color

      this.snackBarText =
        snackbarOptions.text === undefined ? this.defaultSuccessSnackBarText : snackbarOptions.text
      this.snackBarTimeout = parseInt(
        snackbarOptions.timeout === undefined || snackbarOptions.timeout === 0
          ? this.defaultSnackBarTimeout
          : snackbarOptions.timeout
      )
      this.mode = snackbarOptions.mode
      this.snackBar = true
      console.log('Snack bar show')
    }
  }
}
</script>
