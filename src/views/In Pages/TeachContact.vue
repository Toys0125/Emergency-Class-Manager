<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div>
        <v-card>
            <v-card-text>
                <v-row>
                    <v-col cols=12>
                        <v-text-field :disabled=true label="Principal" v-model="schools.principal" readonly></v-text-field>
                    </v-col>
                    <v-col cols=12>
                        <v-text-field :disabled=true label="Principal Email" v-model="schools.pEmail"
                            readonly></v-text-field>
                    </v-col>
                    <v-col cols=12>
                        <v-text-field :disabled=true label="Assistant Principal" v-model="schools.assistantPrincipal" readonly></v-text-field>
                    </v-col>
                    <v-col cols=12>
                        <v-text-field :disabled=true label="AP Email" v-model="schools.aEmail" readonly></v-text-field>
                    </v-col>
                    <v-col cols=12>
                        <v-text-field :disabled=true label="Assistant Principal 2" v-model="schools.assistantPrincipalTwo" readonly></v-text-field>
                    </v-col>
                    <v-col cols=12>
                        <v-text-field :disabled=true label="AP Email 2" v-model="schools.aEmailTwo" readonly></v-text-field>
                    </v-col>
                    <v-col cols=12>
                        <v-text-field :disabled=true label="Assistant Principal 3" v-model="schools.assistantPrincipalThree" readonly></v-text-field>
                    </v-col>
                    <v-col cols=12>
                        <v-text-field :disabled=true label="AP Email 3" v-model="schools.aEmailThree" readonly></v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </div>
</template>
  
<script setup>
import supabase from '@/supabase'
</script>
<script>
export default {
    data() {
        return {
            hasSaved: false,
            isEditing: null,
            unsavedChanges: false,
            schools: {
                principal: '',
                pEmail: '',
                assistantPrincipal: '',
                aEmail: '',
                assistantPrincipalTwo: '',
                aEmailTwo: '',
                assistantPrincipalThree: '',
                aEmailThree: '',
                schoolId: ''
            },
        };
    },
    mounted() {
        this.fetchUserData();
    },
    methods: {
        async fetchUserData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user && user.email) {
                    const userEmail = user.email;
                    console.log('Signed-in user email:', userEmail);

                    const { data: userData, error: userError } = await supabase
                        .from('Users')
                        .select('school_id')
                        .eq('userEmail', userEmail)
                        .single();

                    if (userError) {
                        console.error('Error fetching user data:', userError);
                    } else {
                        const { data: schoolData, error: schoolError } = await supabase
                            .from('Schools')
                            .select('*')
                            .eq('school_id', userData.school_id)
                            .single();

                        if (schoolError) {
                            console.error('Error fetching school data:', schoolError);
                        } else {
                            this.schools = {
                                principal: schoolData.principal,
                                pEmail: schoolData.pEmail,
                                assistantPrincipal: schoolData.assistantPrincipal,
                                aEmail: schoolData.assistantPrincipal,
                            };
                        }
                    }
                } else {
                    console.error('User email not found.');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        },

        toggleEditing() {
            this.isEditing = !this.isEditing;
        },
        async handleInput(field, value) {
            if (this.isEditing) {
                this.user[field] = value;
                this.unsavedChanges = true;
            }
        },
        async saveChanges() {
            const { data: { user } } = await supabase.auth.getUser();
            this.isEditing = !this.isEditing
            this.hasSaved = true
            const userEmail = user.email
            const { error } = await supabase
                .from('Users')
                .update([
                    {
                        fName: this.user.fName,
                        lName: this.user.lName,
                        phoneNum: this.user.phoneNum,
                        emergcyInfo: this.user.emergcyInfo,
                    },
                ])
                .eq('userEmail', userEmail);

            if (error) {
                console.error('Error saving changes:', error);
            } else {
                this.isEditing = false;
            }
            this.unsavedChanges = false;
        },
    },
};
</script>
  
  