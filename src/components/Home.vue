<template>
    <v-container fill-height fluid align-start justify-center dark class="ma-0 pa-0">
        <v-app-bar color="color-gradient">
            <v-tabs dark active-class="nothing">
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
        <div style="margin-top:-100px; text-align:center;">
            <img src="../assets/bridge-passport.png" class="mt-n4">
            <div style="margin-top: 6px;">{{passportId}}</div>
        </div>
    </v-container>
</template>

<script>
export default {
    data: function() {
        return {
            passportId: null
        }
    },
    methods: {
        init: async function()
        {
            var context = await this.$BridgeMobile.getPassportContext();
            if(context.passport)
                this.passportId = context.passport.id;
        },
        unload: async function(){
            var storage = window.localStorage;
            await storage.removeItem('passphrase');
            await storage.removeItem('passport');
            this.navigate('/open');
        },
        lock: async function(){
            var storage = window.localStorage;
            await storage.removeItem('passphrase');
            this.navigate('/unlock');
        },
        navigate(path, query){
            this.$router.push({ path, query });
            this.$router.go(1);
        }
    },
    mounted: function () {
        this.$nextTick(function () {
            this.init();
        });
    }
}
</script>