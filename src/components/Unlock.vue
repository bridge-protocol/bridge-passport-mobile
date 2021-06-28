<template>
    <v-container fill-height justify-center dark style="margin-top:-64px;">
        <v-container fill-height fluid v-if="loading">
            <v-row align="center"
                justify="center"
                class="mt-n4">
                <v-col>
                    <img src="../assets/spinner.gif"><br>
                    {{loadStatus}}
                </v-col>
            </v-row>
        </v-container>
        <v-card inverted v-if="!loading">
            <v-toolbar
                color="color-gradient"
                dark
                >
                <v-toolbar-title class="subtitle-1">Unlock Passport</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <div class="caption text-left mt-4 mb-4">
                    To unlock your passport, please provide the password you provided when it was created.
                </div>
                <v-row>
                    <v-col cols="12">
                    <v-text-field v-model="unlockPassword" outlined color="secondary" label="Password" type="password" required></v-text-field>
                    <div>{{ unlockErrorMessage }}</div>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="unload();">Unload Passport</v-btn>
                <v-btn color="button-light" @click="verifyUnlockPassword();">Unlock</v-btn>
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
            let passport = new this.$BridgeProtocol.Models.Passport();
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
                location.href="index.html";
            }
            else{
                this.unlockErrorMessage = "Invalid password, try again.";
            }
        },
        unload: function(){
            var storage = window.localStorage;
            storage.removeItem('passphrase');
            storage.removeItem('passport');
            location.href="index.html";
        }
    },
    mounted: function () {
        this.$nextTick(function () {
            this.init();
        });
    }
}
</script>