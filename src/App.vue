<template>
    <v-app id="bridge-passport">
        <v-app-bar
        app
        clipped-left
        color="color-gradient"
        v-if="passportLoaded && passportUnlocked"
        >
        <v-tabs dark>
            <v-tab><router-link to="/identity" class="router-link">Identity</router-link></v-tab>
            <v-tab><router-link to="/scan" class="router-link">Scan</router-link></v-tab>
            <v-tab><router-link to="/request" class="router-link">Request</router-link></v-tab>
        </v-tabs>
        <v-spacer></v-spacer>
        <v-menu close-on-click offset-y small dark>
            <template v-slot:activator="{ on }">
            <v-btn
                icon
                v-on="on"
            >
                <v-icon small color="white">mdi-dots-vertical</v-icon>
            </v-btn>
            </template>
            <v-list dense>
            <v-subheader inset>Passport Options</v-subheader>
            <v-divider inset></v-divider>
            <v-list-item two-line @click="lock">
                <v-list-item-icon>
                <v-icon>mdi-lock</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                <v-list-item-title>Lock Passport</v-list-item-title>
                <v-list-item-subtitle>
                    Clear your passphrase but keep the passport json cached for future use
                </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
            <v-list-item two-line @click="unload">
                <v-list-item-icon>
                <v-icon>mdi-close</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                <v-list-item-title>Unload Passport</v-list-item-title>
                <v-list-item-subtitle>
                    Clear your passphrase and clear the cached the passport json
                </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
            <v-divider inset></v-divider>
                <router-link to="/about" class="router-link">
                    <v-list-item>
                            <v-list-item-icon>
                                <v-icon>mdi-information</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>About Bridge Passport</v-list-item-title>
                            </v-list-item-content>
                    </v-list-item>
                </router-link>
            </v-list>
        </v-menu>
        </v-app-bar>
        <v-main>
        <v-container
            fluid
            class="fill-height justify-center text-center inverted"
        >
            <v-overlay :value="loading">
                <v-progress-circular
                    :size="50"
                    color="primary"
                    indeterminate
                ></v-progress-circular>
            </v-overlay>
            <router-view></router-view>
        </v-container>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'bridge-passport-app',
    data: function() {
        return {
            name: 'App',
            qr: null,
            loading: true,
            passport: null,
            passportLoaded: false,
            passportUnlocked: false
        }
    },
    methods:{
        openUrl(url){
            window.open(url);
        },
        init: async function(){
            const urlParams = new URLSearchParams(window.location.search);
            const qrType = urlParams.get('t');
            const qrValue = urlParams.get('v');

            if(qrValue){
                this.qr = qrValue;
                if(qrType == "passport"){
                    let res = await this.$BridgeProtocol.Services.RequestRelay.getRequest(this.qr);
                    if(res && res.request){
                        var storage = window.localStorage;
                        await storage.setItem('passport', res.request);
                        this.$router.push({ path: '/unlock' });
                    }
                    else
                        this.$router.push({ path: '/open', query: { } });
                }
                else if(qrType == "auth")
                    this.$router.push({ path: '/scan', query: { qr: qrValue } });

                this.$router.go(1);
            }
            
            var storage = window.localStorage;
            let passport = storage.getItem('passport');
            let passphrase = storage.getItem('passphrase');

            this.passportLoaded = passport != null;
            this.passportUnlocked = passphrase != null;

            if(!this.passportLoaded){
                this.$router.push({ path: '/open', query: { } });
                this.$router.go(1);
            }
            else if(this.passportLoaded && !this.passportUnlocked){
                this.$router.push({ path: '/unlock', query: { } });
                this.$router.go(1);
            }

            this.loading = false;
        },
        unload: function(){
            var storage = window.localStorage;
            storage.removeItem('passphrase');
            storage.removeItem('passport');
            location.href="app.html";
        },
        lock: function(){
            var storage = window.localStorage;
            storage.removeItem('passphrase');
            location.href="app.html";
        }
    },
    created () {
      this.$vuetify.theme.dark = true;
      this.$vuetify.theme.primary = '#673ab7';
    },
    mounted: function () {
        this.$nextTick(function () {
            this.init();
        });
    }
}
</script>