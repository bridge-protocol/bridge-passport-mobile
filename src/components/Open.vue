<template>
    <v-container id="container" fill-height justify-center dark>
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
                <img src="../assets/scan-qr-icon.png" style="width:70%;">
                <p style="text-align:justify; width:70%; margin: 20px 0px 30px 0px;">
                    Open your Bridge Passport Browser Extension and click "Send to Mobile" to generate your handoff QR code.  Click below to scan the QR code and import your Bridge Identity.
                </p>
            </center>
            <v-btn class="button-light" @click="scan">Scan QR Code</v-btn>
        </v-container>
    </v-container>
</template>

<script>
export default {
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
                        let res = await app.$BridgeProtocol.Services.RequestRelay.getRequest(app.qrscan);
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
        async scan(){
            let app = this;
            setTimeout(async function(){
                try{
                    //$("body").hide();
                    $("#app_wrapper").hide();
                    $(".scan-qr-overlay").show();

                    var code = await app.$QrCodeScanner.scan();
                    app.$QrCodeScanner.cancel();
                    
                    $("#app_wrapper").show();
                    $(".scan-qr-overlay").hide();

                    let res = await app.$BridgeProtocol.Services.RequestRelay.getRequest(code);
                    if(res && res.request){
                        var storage = window.localStorage;
                        await storage.setItem('passport', res.request);
                        app.$router.push({ path: '/unlock' });
                    }
                    else
                        app.$router.push({ path: '/open', query: { } });
                }   
                catch(err){
                    alert("Error: " + err.message);
                    console.log("Error: " + err.message);
                }
            }, 500);
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