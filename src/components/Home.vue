<template>
    <v-container fill-height justify-center>
        <div>
            <img src="../assets/bridge-passport.png">
            <div class="mt-2">
                {{passportId}}
            </div>
            
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
        }
    },
    mounted: function () {
        this.$nextTick(function () {
            this.init();
        });
    }
}
</script>