<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-responsive class="fill-width">
    <v-text-field v-model="search" placeholder="Search Here" :onchange="searchRows"></v-text-field>
  </v-responsive>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items-length="totalrows"
        :items="rows"
        :loading="loading"
        class="elevation-1"
        @update:options="loadRows"
      >
        <template v-slot:item.presence="{ item }">
          <v-select
            v-model="item.presence"
            :items="presenceOptions"
            label="Select"
            outlined
            dense
          ></v-select>
        </template>
      </v-data-table-server>
      <v-dialog v-model="model" persistent max-width="600px">
        <v-card>
          <v-card-title> Add New Student </v-card-title>
          <v-card-text>
            <v-autocomplete
              v-model="modalData.selectedStudent"
              :items="studentIds"
              label="Select ID Number"
              @input="updateStudentInfo"
            ></v-autocomplete>

            <v-text-field v-model="modalData.fName" label="First Name"></v-text-field>
            <v-text-field v-model="modalData.lName" label="Last Name"></v-text-field>
            <!-- Add more fields as needed -->
          </v-card-text>
          <v-card-actions>
            <v-btn color="blue darken-1" @click="addStudent">Add Student</v-btn>
            <v-btn color="grey darken-1" @click="model = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <div class="text-right">
        <v-btn color="blue" @click="openModal">Add Student</v-btn>
        <v-btn color="green" @click="submitTable">Submit</v-btn>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import supabase from '@/supabase'
import { VDataTableServer } from 'vuetify/lib/labs/components.mjs'
import { ref } from 'vue'

const presenceOptions = ['Present', 'Absent', 'Missing', 'Visiting']
const model = ref(false)
const openModal = () => {
  model.value = true
}
</script>
<script>
const supabaseRetrive = {
  async fetchStudentIds() {
    const { data, error } = await supabase
      .from('Students')
      .select('id_number');
    if (error) {
      console.error(error);
      this.$root.snackbar.show({ text: 'Error fetching student IDs', timeout: 10000, color: 'red' });
      return [];
    }
    const studentIds = data.map(student => student.id_number);
  return studentIds;
  },
  async count() {
    const { count, error } = await supabase
      .from('Students')
      .select('*', { count: 'exact', head: true })
    if (error) {
      console.error(error)
      this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
    }
    console.log(count)
    return count
  },
  async fetch({ page = 0, itemsPerPage = 50, sortBy = 'desc' }) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user && user.email) {
      const userEmail = user.email;

      const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('*')
        .eq('userEmail', userEmail)
        .single();

        console.log('User Data:', userData);

      if (userError) {
        console.error('Error fetching user data:', userError);
        return { rows: [], total: 0 }; 
      }

      const classId = userData && userData.class_id ? userData.class_id : null;

      if (!classId) {
        console.error('Class ID not found for the user.');
        return { rows: [], total: 0 };
      }

      var from = (page - 1) * itemsPerPage;
      var to = page * itemsPerPage - 1;

      const { data: studentsData, error: studentsError } = await supabase
        .from('Students')
        .select('*')
        .eq('class_id', classId) 
        .range(from, to);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        return { rows: [], total: 0 };
      }

      if (sortBy.length) {
        const sortKey = sortBy[0].key;
        const sortOrder = sortBy[0].order;
        studentsData.sort((a, b) => {
          const aValue = a[sortKey];
          const bValue = b[sortKey];
          return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
        });
      }

      return { rows: studentsData, total: studentsData.length };
    } else {
      console.error('User email not found.');
      return { rows: [], total: 0 };
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return { rows: [], total: 0 };
  }
},
  async search({ page = 0, itemsPerPage = 50, sortBy = 'desc', text = '' }) {
    var from = (page - 1) * itemsPerPage
    var to = page * itemsPerPage - 1
    console.log(from, to)
    const { data, error } = await supabase
      .rpc('searchstudents', { searchtext: text })
      .range(from, to)
    console.log(data)
    if (error) {
      console.error(error)
      this.$root.snackbar.show({ text: 'Error check log', timeout: 10000, color: 'red' })
    }
    if (sortBy.length) {
      const sortKey = sortBy[0].key
      const sortOrder = sortBy[0].order
      data.sort((a, b) => {
        const aValue = a[sortKey]
        const bValue = b[sortKey]
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
      })
    }
    return { rows: data }
  }
}

export default {
  data: () => ({
    itemsPerPage: 5,
    headers: [
      { title: 'ID Number', key: 'id_number', align: 'left', width: '20%' },
      { title: 'First Name', key: 'fName', align: 'end' },
      { title: 'Last Name', key: 'lName', align: 'end' },
      { title: 'Presense', value: 'presence', align: 'end' }
    ],
    rows: [],
    loading: true,
    totalrows: 0,
    search: '',
    options: { page: 1, itemsPerPage: 5, sortBy: {} },
    itemsPerPageOptions: [
      { value: 1, title: '1' },
      { value: 5, title: '5' },
      { value: 10, title: '10' },
      { value: 20, title: '20' }
    ],
    modalData: {
      selectedStudent: null,
      id_number: null,
      fName: null,
      lName: null,
      loading: false
    }
  }),
  async mounted() {
    this.studentIds = await supabaseRetrive.fetchStudentIds();
  },
  methods: {
    async fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user && user.email) {
          const userEmail = user.email;

          const { data: userData, error: userError } = await supabase
            .from('Users')
            .select('school_id')
            .eq('userEmail', userEmail)
            .single();

            console.log("school id: " + userData.school_id)
          if (userError) {
            console.error('Error fetching user data:', userError);
          } else {
            
            this.school_id = userData.school_id; // Set the school_id property
          }
        } else {
          console.error('User email not found.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },
    updateStudentInfo() {
      const selectedStudent = this.rows.find(student => student.id_number === this.modalData.selectedStudent);

      if (selectedStudent) {
        this.modalData.fName = selectedStudent.fName;
        this.modalData.lName = selectedStudent.lName;
      }
      else {
    this.modalData.fName = null;
    this.modalData.lName = null;
  }
    },
    addStudent() {
      if (!this.modalData.fName || !this.modalData.lName) {
        this.$root.snackbar.show({ text: 'Please fill in all fields', timeout: 3000, color: 'red' })
        return
      }
      const newStudent = {
        id_number: this.modalData.selectedStudent,
        fName: this.modalData.fName,
        lName: this.modalData.lName,
        presence: 'Visiting'
      }
      this.rows.push(newStudent)
      this.model = false
      this.modalData = { selectedStudent: null, fName: null, lName: null, loading: false }

      this.$root.snackbar.show({
        text: 'Student added successfully',
        timeout: 3000,
        color: 'green'
      })
    },
    loadRows({ page, itemsPerPage, sortBy }) {
      this.loading = true
      if (this.totalrows == 0) {
        this.totalrows = supabaseRetrive.count().then((count) => {
          this.totalrows = count
        })
      }
      this.options = { page: page, rowsPerPage: itemsPerPage, sortBy: sortBy }
      if (this.search.length < 3) {
        supabaseRetrive.fetch({ page, itemsPerPage, sortBy }).then(({ rows }) => {
          this.rows = rows
          this.loading = false
          this.$root.snackbar.show({ text: 'Loaded', timeout: 2000, color: 'blue' })
        })
      } else {
        this.searchRows()
      }
      console.log(this.$root.snackbar)
    },
    searchRows() {
      if (this.search.length < 3) return
      this.loading = true

      supabaseRetrive.search({
        page: this.options.page,
        rowsPerPage: this.options.itemsPerPage,
        sortBy: this.options.sortBy,
        text: this.search
      })
    }
  }
}
</script>
