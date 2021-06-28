<template>
    <v-app id="bridge-passport">
        <router-view></router-view>
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
            var storage = window.localStorage;
            let passport = storage.getItem('passport');
            let passphrase = storage.getItem('passphrase');

            this.passportLoaded = passport != null;
            this.passportUnlocked = passphrase != null;

            if(!this.passportLoaded)
                this.navigate('/open');
            else if(this.passportLoaded && !this.passportUnlocked)
                this.navigate('/unlock');
            else
                this.navigate('/home');
        },
        navigate(path, query){
            this.$router.push({ path, query });
            this.$router.go(1);
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