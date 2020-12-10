<template>
    <v-container fill-height justify-center dark>
        <v-overlay :value="loading">
            <v-progress-circular
                indeterminate
                color="secondary"
                style="margin-left: 48%;"
            >
            <div class="pt-4 mt-12 text-no-wrap">
                {{loadStatus}}
            </div>
            </v-progress-circular>
        </v-overlay>
        <v-container  class="justify-center text-center" v-if="!loading">
            <v-app-bar
            app
            clipped-left
            color="color-gradient"
            v-if="!loading"
            >
            <h3 style="width: 100%; text-align:center;">Import Bridge Passport</h3>
            </v-app-bar>
            <center>
                <img src="./img/scan-qr-icon.png" style="width:70%;">
                <p style="text-align:justify; width:70%; margin: 20px 0px 30px 0px;">
                    Open your Bridge Passport Browser Extension and click "Send to Mobile" to generate your handoff QR code.  Click below to scan the QR code and import your Bridge Identity.
                </p>
            </center>

            <v-btn class="button-light" @click="scan">Scan QR Code</v-btn>
        </v-container>
    </v-container>
</template>

<script>
module.exports = {
    props: ['qr'],
    data: function() {
        return {
            loading: false,
            loadStatus: "Please Wait",
            passport: null
        }
    },
    methods:{
        init(){
            let app = this;
            setTimeout(async function(){
                if(app.qr)
                {
                    app.loading = true;
                    try{
                        let res = await BridgeProtocol.Services.RequestRelay.getRequest(app.qr);
                        app.passport = res.request;
                        app.loading = false;
                    }
                    catch(err){
                        alert(err.message);
                        app.loading = false;
                    }
                }
            },500);
        },
        scan(){
            location.href="index.html?s=true&t=passport";
        }
    },
    mounted: async function()
    {
        this.$nextTick(function () {
            this.init();
        });
    }
}
</script>