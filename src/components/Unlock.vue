<template>
    <v-container fill-height justify-center dark>
        <v-overlay :value="loading">
            <v-progress-circular
                :size="50"
                color="primary"
                indeterminate
                ></v-progress-circular>
        </v-overlay>
        <v-card inverted v-if="!loading">
            <v-toolbar
                color="color-gradient"
                dark
                >
                <v-toolbar-title class="subtitle-1">Unlock Passport</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <div class="caption text-justify mt-4">
                    To unlock your passport, please provide the password you provided when it was created.
                </div>
                <v-row>
                    <v-col cols="12">
                    <v-text-field v-model="unlockPassword" outlined color="secondary" label="Password" type="password" required></v-text-field>
                    <div>{{ unlockErrorMessage }}</p>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="unload();">Unload Passport</v-btn>
                <v-btn color="accent" @click="verifyUnlockPassword();">Unlock</v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
export default {
    props: [],
    data: function() {
        return {
            loading: true,
            passportContent: null,
            unlockPassword: null,
            unlockErrorMessage: null
        }
    },
    methods:{
        init(){
            var storage = window.localStorage;
            this.passportContent = storage.getItem('passport');
            this.loading = false;
        },
        verifyUnlockPassword: async function(){
            let passport = new BridgeProtocol.Models.Passport();
            let success = false;
            try{
                success = await passport.open(this.passportContent, this.unlockPassword);
            }
            catch(err){
                console.log(err.message);
            }

            if(success){
                var storage = window.localStorage;
                storage.setItem('passport', this.passportContent);
                storage.setItem('passphrase', this.unlockPassword);
                location.href="app.html";
            }
            else{
                this.unlockErrorMessage = "Invalid password, try again.";
            }
        },
        unload: function(){
            var storage = window.localStorage;
            storage.removeItem('passphrase');
            storage.removeItem('passport');
            location.href="app.html";
        }
    },
    mounted: function () {
        this.$nextTick(function () {
            this.init();
        });
    }
}
</script>