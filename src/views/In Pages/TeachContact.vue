<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div>
        <v-card class="w-50 mx-auto" align:center>
            <v-card-text>
                <v-row dense>
                    <v-col cols=12>
                        <h3>Principal</h3>
                        <v-text-field :label="schools.principal" v-model="schools.pEmail" hint="Click to open email"
                            persistent-hint readonly @click="openEmail(schools.pEmail, 'Event Feedback')"
                            class="email-text-field"></v-text-field>
                    </v-col>
                    <v-col v-if="schools.aEmail" cols=12>
                        <h3>Assistant Principal</h3>
                        <v-text-field :label="schools.assistantPrincipal" v-model="schools.aEmail"
                            hint="Click to open email" persistent-hint readonly @click="openEmail(schools.aEmail, 'Event Feedback')"
                            class="email-text-field"></v-text-field>
                    </v-col>
                    <v-col v-if="schools.aEmailTwo" cols=12>
                        <h3>Assistant Principal</h3>
                        <v-text-field :label="schools.assistantPrincipalTwo" v-model="schools.aEmailTwo"
                            hint="Click to open email" persistent-hint readonly @click="openEmail(schools.aEmailTwo, 'Event Feedback')"
                            class="email-text-field"></v-text-field>
                    </v-col>
                    <v-col v-if="schools.aEmailThree" cols=12>
                        <h3>Assistant Principal</h3>
                        <v-text-field :label="schools.assistantPrincipalThree" v-model="schools.aEmailThree"
                            hint="Click to open email" persistent-hint readonly @click="openEmail(schools.aEmailThree, 'Event Feedback')"
                            class="email-text-field"></v-text-field>
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
        openEmail(email, subject = 'Default Subject') {
            const windowRef = window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}`, '_blank');
            windowRef.focus();
        },
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
    align-content: start;
}</style>