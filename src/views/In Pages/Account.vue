<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-card
    class="mx-auto"
    color="blue-darken-2"
    max-width="500"
  >
    <v-toolbar flat color="blue-darken-1">
      <v-btn icon="mdi-account"></v-btn>

      <v-toolbar-title class="font-weight-light">
        User Profile
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn
        icon
        @click="isEditing = !isEditing"
      >
        <v-fade-transition leave-absolute>
          <v-icon v-if="isEditing">mdi-close</v-icon>

          <v-icon v-else>mdi-pencil</v-icon>
        </v-fade-transition>
      </v-btn>
    </v-toolbar>

    <v-card-text>
      <v-text-field
        :disabled="true"
        base-color="white"
        label="Email"
        readonly
      ></v-text-field>

      <v-text-field
        :disabled="!isEditing"
        base-color="white"
        label="First Name"
      ></v-text-field>

      <v-text-field
        :disabled="!isEditing"
        base-color="white"
        label="Last Name"
      ></v-text-field>

      <v-text-field
      :disabled="!isEditing"
      base-color="white"
      label="Phone Number"
      ></v-text-field>

      <v-text-field
        :disabled="!isEditing"
        base-color="white"
        label="Emergency Contact"
      ></v-text-field>

      <v-autocomplete
        :disabled="true"
        :items="states"
        :custom-filter="customFilter"
        base-color="white"
        item-title="name"
        label="School"
        readonly
      ></v-autocomplete>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <v-spacer></v-spacer>

      <v-btn
        :disabled="!isEditing"
        @click="save"
      >
        Save
      </v-btn>
    </v-card-actions>

    <v-snackbar
      v-model="hasSaved"
      :timeout="2000"
      attach
      position="absolute"
      location="bottom left"
    >
      Your profile has been updated
    </v-snackbar>
  </v-card>
</template>

<script>
  export default {
    data: () => ({
      hasSaved: false,
      isEditing: null,
      schools: [
        { name: 'Barkers Mill Elem.', id: 1 },
        { name: 'Barksdale Elem.', id: 2 },
        { name: 'Barksdale Elem. Spanish Em.', id: 3 },
        { name: 'Burt Elementaryy', id: 4 },
        { name: 'Byrns L. Darden Elem.', id: 5 },
        { name: 'Carmel Elem.', id: 6 },
        { name: 'Cumberland Heights Elem.', id: 7 },
        { name: 'East Montgomery Elem.', id: 8 },
        { name: 'Glenellen Elem.', id: 9 },
        { name: 'Hazelwood Elem.', id: 10 },
        { name: 'Kenwood Elem.', id: 11 },
        { name: 'Kirkwood Elem.', id: 12 },
        { name: 'Liberty Elem.', id: 13 },
        { name: 'Minglewood Elem.', id: 14 },
        { name: 'Montgomery Central Elem.', id: 15 },
        { name: 'Moore Magnet Elem.', id: 16 },
        { name: 'Norman Smith Elem.', id: 17 },
        { name: 'Northeast Elem.', id: 18 },
        { name: 'Oakland Elem.', id: 19 },
        { name: 'Pisgah Elem.', id: 20 },
        { name: 'Ringgold Elem.', id: 21 },
        { name: 'Rossview Elem.', id: 22 },
        { name: 'St. Bethlehem Elem.', id: 23 },
        { name: 'Sango Elem.', id: 24 },
        { name: 'West Creek Elem.', id: 25 },
        { name: 'Woodlawn Elem.', id: 26 },
      ],
    }),

    methods: {
      customFilter (itemTitle, queryText, item) {
        const textOne = item.raw.name.toLowerCase()
        const textTwo = item.raw.abbr.toLowerCase()
        const searchText = queryText.toLowerCase()

        return textOne.indexOf(searchText) > -1 ||
          textTwo.indexOf(searchText) > -1
      },
      save () {
        this.isEditing = !this.isEditing
        this.hasSaved = true
      },
    },
  }
</script>