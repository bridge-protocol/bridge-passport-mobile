<template>
    <v-container fill-height justify-center>
        <div>
            <img src="./img/bridge-passport.png">
            <div class="mt-2">
                {{passportId}}
            </div>
            
        </div>
    </v-container>
</template>

<script>
module.exports = {
    data: function() {
        return {
            passportId: null
        }
    },
    methods: {
        init: async function()
        {
            var context = await BridgeMobile.getPassportContext();
            if(context.passport)
                this.passportId = context.passport.id;
        }
    },
    mounted: function () {
        this.$nextTick(function () {
            this.init();
        });
    }
}
</script>