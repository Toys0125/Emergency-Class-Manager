<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div>
        <v-card class="w-50 mx-auto" align:center>
            <v-card-text>
                <v-row no-gutters>
                    <v-col cols=12>
                        Principal
                        <v-text-field :label="schools.principal" v-model="schools.pEmail"
                            readonly @click="openEmail(schools.pEmail)" class="email-text-field"></v-text-field>
                    </v-col>
                    <v-col v-if="schools.aEmail" cols=12>
                        Assistant Principal
                        <v-text-field :label="schools.assistantPrincipal" v-model="schools.aEmail" 
                            readonly @click="openEmail(schools.aEmail)" class="email-text-field"></v-text-field>
                    </v-col>
                    <v-col v-if="schools.aEmailTwo" cols=12>
                        Assistant Principal
                        <v-text-field :label="schools.assistantPrincipalTwo" v-model="schools.aEmailTwo" 
                            readonly @click="openEmail(schools.aEmailTwo)" class="email-text-field"></v-text-field>
                    </v-col>
                    <v-col v-if="schools.aEmailThree" cols=12>
                        Assistant Principal
                        <v-text-field :label="schools.assistantPrincipalThree" v-model="schools.aEmailThree" 
                            readonly @click="openEmail(schools.aEmailThree)" class="email-text-field"></v-text-field>
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
        openEmail(email) {
      window.location.href = `mailto:${email}`;
    },
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
                                aEmail: schoolData.aEmail,
                                assistantPrincipalTwo: schoolData.assistantPrincipalTwo,
                                aEmailTwo: schoolData.aEmailTwo,
                                assistantPrincipalThree: schoolData.assistantPrincipalThree,
                                aEmailThree: schoolData.aEmailThree
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
    },
};
</script>
  
<style scoped>
    .email-text-field {
  cursor: pointer;
  text-decoration: underline;
  align-content: start;
}
</style>