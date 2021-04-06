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
        <v-container  class="justify-center text-center" v-if="!loading && !scan">
            <v-app-bar
            app
            clipped-left
            color="color-gradient"
            v-if="!loading"
            >
            <h3 style="width: 100%; text-align:center;">Import Bridge Passport</h3>
            </v-app-bar>
            <center>
                <img src="../assets/scan-qr-icon.png" style="width:70%;">
                <p style="text-align:justify; width:70%; margin: 20px 0px 30px 0px;">
                    Open your Bridge Passport Browser Extension and click "Send to Mobile" to generate your handoff QR code.  Click below to scan the QR code and import your Bridge Identity.
                </p>
            </center>
            <v-btn class="button-light" @click="doScan">Scan QR Code</v-btn>
        </v-container>
        <div class="scan-qr-overlay" v-if="!loading && scan">
            <div class="scan-qr-header color-gradient">
                Scan QR Code
                <span class="scan-qr-cancel">
                    <i class="mdi mdi-close" style="font-size:16px;"></i>
                </span>
            </div>
            <div class="scan-qr-target"></div>
            <div class="scan-qr-footer color-gradient"></div>
         </div>
    </v-container>
</template>

<script>
export default {
    props: ['qr'],
    data: function() {
        return {
            loading: false,
            scan: false,
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
                        let res = await app.$BridgeProtocol.Services.RequestRelay.getRequest(app.qr);
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
        async doScan(){
            this.scan = true;
            let code = await this.$QrCodeScanner.scan();
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