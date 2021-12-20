<template>
    <v-container fill-height fluid align-start justify-center dark class="ma-0 pa-0">
        <v-toolbar
            app
            clipped-left
            color="color-gradient"
            >
            <h3 style="width: 100%; text-align:center; margin-left: 24px;">Identification Claims Request</h3>
            <v-icon @click="cancel" style="float:right;">mdi-close</v-icon>
        </v-toolbar>
         <v-container fill-height fluid align-center justify-center v-if="loading" style="margin-top:-64px;">
            <div style="width:100%; text-align:center;">
                <img src="../assets/spinner.gif">
                <div>{{loadStatus}}</div>
            </div>
        </v-container>
        <v-container fill-height fluid align-center justify-center v-if="!loading && !requestLoaded && !requestSent" style="margin-top:-64px;">
            <center>
                <img src="../assets/scan-qr2-icon.png" style="width:70%;">
                <p style="text-align:justify; width:90%; margin: 20px 0px 30px 0px;">
                    Align your mobile device over the device making the request to capture the QR code.  Once scanned, you will be prompted to choose which information to present.
                </p>
                <v-btn 
                    class="button-light" 
                    @click="scan"
                >
                Scan QR Code
                </v-btn>
            </center>
        </v-container>
        <v-container fill-height fluid align-start justify-center mt-4 pt-0 mx-2 text-left v-if="!loading && requestLoaded  && !requestSent">
            <div>
                <v-alert
                    border="left"
                    colored-border
                    type="warning"
                    elevation="0"
                    class="text-left caption text-wrap mx-n6 mt-n4"
                    v-if="!messageValid"
                    >
                    Request integrity check failed.  This request may be forged, proceed with caution.
                </v-alert>
                <p class="subheading">
                    You have been asked to provide information about your identity.  Select the information you want to include in your response by checking the boxes.
                </p>
                <v-subheader class="pl-0 ml-0 mt-n4 caption">Requesting Passport Identity</v-subheader>
                <v-divider class="my-n1"></v-divider>
                <v-container fluid class="mx-0 px-0 mt-2 mb-n2 py-0">
                    <v-row>
                        <v-col cols="auto">
                            <span v-if="requestingPassport.known"><v-icon small color="success">mdi-check-decagram</v-icon> {{requestingPassport.name}}</span><span v-if="!requestingPassport.known"><v-icon small color="warning">mdi-alert</v-icon> Unknown Passport ({{requestingPassport.id}})</span> 
                        </v-col>
                    </v-row>
                </v-container>
                <v-subheader class="pl-0 ml-0 mt-0 caption">Requested Claims</v-subheader>
                <v-divider class="my-n1"></v-divider>
                <v-container fluid v-if="!requestedClaimTypes || requestedClaimTypes.length == 0">
                    No Claims Requested
                </v-container>
                <v-container fluid
                    v-for="(claimType) in requestedClaimTypes"
                    :key="claimType.id">
                        <v-checkbox v-model="selectedClaimTypes" :label="claimType.name" :value="claimType.id" :disabled="!claimType.claim" class="px-0 mt-0 mb-n8"></v-checkbox>
                </v-container>
                <div class="mt-8 text-center">
                    <v-alert
                        dense
                        outlined
                        type="error"
                        v-if="error"
                        style="font-size: .9em"
                        >
                        {{errorMessage}}
                    </v-alert>
                    <div>
                        <v-btn
                            class="button-light"
                            @click="sendClaims"
                        >
                            Send Claims
                        </v-btn>
                        <v-btn
                            @click="cancel"
                        >
                            Cancel
                        </v-btn>
                    </div>
                </div>  
            </div>
        </v-container>
        <v-container fill-height fluid justify-center text-center v-if="!loading && requestSent" style="margin-top:-64px;">
            <div>
                <v-container class="mb-4">
                    <v-icon small color="success">mdi-check-decagram</v-icon> Identity Claim(s) Sent Successfully.
                </v-container>
                <v-btn
                    @click="cancel"
                >
                    Done
                </v-btn>
            </div>
        </v-container>
    </v-container>
</template>

<script>
export default {
    props: ['qr'],
    data: function() {
        return {
            qrcode: null,
            id: null,
            loading: false,
            loadStatus: "Please Wait",
            requestLoaded: false,
            requestMessage: null,
            messageValid: false,
            requestingPassport: null,
            requestedClaimTypes: [],
            selectedClaimTypes: [],
            requestSent: false,
            error: false,
            errorMessage: "An error occurred"
        }
    },
    methods:{
        async init(){
            
        },
        scan(){
            let app = this;
            this.loading = true;
            setTimeout(async function(){
                $("#app_wrapper").hide();
                $(".scan-qr-overlay").show();
                var qr = await app.$QrCodeScanner.scan();
                app.$QrCodeScanner.cancel();
                $("#app_wrapper").show();
                $(".scan-qr-overlay").hide();

                //alert("Code Found: " + qr);
                if(qr == null || qr == 'undefined' || qr.length == 0){
                    app.loading = false;
                    return;
                }
                
                app.qr = qr;
                app.loading = true;
                app.loadStatus = "Decrypting and Validating Request"; 
                app.id = app.qr;
            
                try{
                    let req = await app.$BridgeProtocol.Services.RequestRelay.getRequest(app.id);
                    //console.log("Request: " + JSON.stringify(req));

                    app.requestMessage = await app.$BridgeMobile.validateAuthRequest(req.request);
                    //console.log("Message: " + app.requestMessage)

                    app.messageValid = app.requestMessage.signatureValid;

                    let passportContext = await app.$BridgeMobile.getPassportContext();
                    let requestingPassport = await app.$BridgeMobile.getPassportDetails(passportContext.passport, passportContext.passphrase, app.requestMessage.passportId);
                    requestingPassport.name = requestingPassport.id;
                    requestingPassport.known = false;
                    if(requestingPassport.partnerName && requestingPassport.partnerName.length > 0){
                        requestingPassport.name = requestingPassport.partnerName;
                        requestingPassport.known = true;
                    }
                    app.requestingPassport = requestingPassport;
                    
                    let requestedClaimTypes = await app.$BridgeMobile.getClaimTypes(app.requestMessage.payload.claimTypes);
                    if(requestedClaimTypes){
                        for(let i=0; i<requestedClaimTypes.length; i++){
                            let claim = app.getClaimByTypeId(passportContext.passport,requestedClaimTypes[i].id);
                            requestedClaimTypes[i].claim = claim != null;
                        }
                    }
                    app.requestedClaimTypes = requestedClaimTypes;
                    app.requestLoaded = true;
                    app.loading = false;
                }   
                catch(err){
                    alert("Error: " + err.message);
                    console.log("Error: " + err.message);
                }
            }, 500);
        },
        getClaimByTypeId(passport, id){
            for(let i=0; i<passport.claims.length; i++){
                if(passport.claims[i].typeId == id)
                    return passport.claims[i];
            }

            return null;
        },
        async sendClaims(){
            if(this.selectedClaimTypes.length == 0){
                this.error = true;
                this.errorMessage = "You must select at least one claim type.";
                return;
            }
            this.loading = true;
            this.loadStatus = "Encrypting Claims";

            try{
                let passportContext = await this.$BridgeMobile.getPassportContext();
                let response = await this.$BridgeMobile.createAuthResponse(passportContext.passport, passportContext.passphrase, this.requestMessage, this.selectedClaimTypes); 

                this.loadStatus = "Sending Response";
                let req = await this.$BridgeProtocol.Services.RequestRelay.createResponse(this.id, response);
                this.requestSent = true;
                this.loading = false;
            }
            catch(err){
                alert("Error sending response: " + err.message);
            }

        },
        cancel(){
            this.$router.push({ path: '/', query: { } });
            this.$router.go(1);
        }
    },
    mounted: function () {
        this.$nextTick(async function () {
            await this.init();
        });
    }
}
</script>