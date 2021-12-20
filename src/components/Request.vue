<template>
     <v-container fill-height fluid align-start justify-center dark class="ma-0 pa-0">
        <v-app-bar
            app
            clipped-left
            color="color-gradient"
            >
            <h3 style="width: 100%; text-align:center; margin-left: 36px;">Request Identification Claims</h3>
            <v-icon @click="cancel" style="float:right;">mdi-close</v-icon>
        </v-app-bar>
        <v-container fill-height fluid align-center justify-center v-if="loading" style="margin-top:-64px;">
            <div style="width:100%; text-align:center;">
                <img src="../assets/spinner.gif">
                <div>{{loadStatus}}</div>
            </div>
        </v-container>
        <v-container fill-height fluid align-start v-if="!loading && !dialog && !response" style="margin-top:64px;">
            <div style="width:100%;">
                <p class="subheading text-justify">
                    Choose the identity claims you want to request.
                </p>
                <v-subheader class="pl-0 ml-0 mt-n2 caption">Anonymous Claim Types</v-subheader>
                <v-divider class="my-n1"></v-divider>
                <v-checkbox
                    v-model="claims"
                    label="Over 18"
                    value="100001"
                    dense
                    class="mb-n6"
                ></v-checkbox>
                <v-checkbox
                    v-model="claims"
                    label="Over 21"
                    value="100002"
                    dense
                    class="mb-n6"
                ></v-checkbox>
                <v-checkbox
                    v-model="claims"
                    label="Country"
                    value="100003"
                    dense
                    class="mb-n6"
                ></v-checkbox>
                <v-checkbox
                    v-model="claims"
                    label="State / Province"
                    value="100004"
                    dense
                    class="mb-n6"
                ></v-checkbox>
                <v-checkbox
                    v-model="claims"
                    label="Watchlist Clear"
                    value="100005"
                    dense
                    class="mb-n6"
                ></v-checkbox>
                <v-checkbox
                    v-model="claims"
                    label="COVID-19 Vaccinated"
                    value="100006"
                    dense
                ></v-checkbox>

                <v-subheader class="pl-0 ml-0 mt-n1 caption">Private Claim Types</v-subheader>
                <v-divider class="my-n1"></v-divider>
                <v-checkbox
                    v-model="claims"
                    label="Photo"
                    value="0"
                    dense
                    class="mb-n6"
                ></v-checkbox>
                <v-checkbox
                    v-model="claims"
                    label="First Name"
                    value="1"
                    dense
                    class="mb-n6"
                ></v-checkbox>
                <v-checkbox
                    v-model="claims"
                    label="Last Name"
                    value="2"
                    dense
                    class="mb-n6"
                ></v-checkbox>
                <v-checkbox
                    v-model="claims"
                    label="E-mail Address"
                    value="3"
                    dense
                    class="mb-n6"
                ></v-checkbox>
                <v-checkbox
                    v-model="claims"
                    label="Date of Birth"
                    value="4"
                    dense
                    class="mb-n6"
                ></v-checkbox>
                <v-checkbox
                    v-model="claims"
                    label="Phone Number"
                    value="5"
                    dense
                    class="mb-6"
                ></v-checkbox>
                <v-alert
                    dense
                    outlined
                    type="error"
                    v-if="error"
                    style="font-size: .9em"
                    >
                    {{errorMessage}}
                </v-alert>
                <div style="width:100%; text-align:center;">
                    <v-btn
                        class="button-light mr-1"
                        @click="showQR"
                    >
                        Request Claims
                    </v-btn>
                </div>
            </div>
        </v-container>
        <v-container v-if="!loading && !dialog && response" style="position:absolute; top:0px; left:0px;">
            <v-expansion-panels>
                <v-alert
                    border="left"
                    colored-border
                    type="info"
                    elevation="2"
                    class="caption text-left mt-2"
                    v-if="claims.length == 0"
                    >
                    No digital identity verified claims found.  To add verified claims, use the Bridge Passport Browser Extension and re-import your passport with the added claims.
                </v-alert>
                <v-expansion-panel
                v-for="(claim) in claims"
                :key="claim.id"
                class="mb-1 ml-0 px-0 py-0"
                @click="claimSelected(claim)"
                >
                    <v-expansion-panel-header class="py-0">
                        <v-row>
                            <v-col cols="auto"><v-img src="./img/bridge-token-white.png" height="40" width="40"></v-img></v-col>
                            <v-col cols="auto">
                                <div class="mb-1 title-2" v-text="claim.claimTypeName"></div>
                                <div class="caption" v-text="claim.claimValue"></div>
                            </v-col>
                        <v-row>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="py-0">
                        <v-container fluid>
                            <v-subheader class="pl-0 ml-0 caption">
                                Claim Details 
                            </v-subheader>
                            <v-divider class="mb-2"></v-divider>
                            <v-row dense>
                                <v-col cols="2" class="text-left">Verified:</v-col>
                                <v-col cols="auto">{{claim.verifiedOn}}</v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="2" class="text-left">Expires: </v-col>
                                <v-col cols="auto">{{claim.expireDate}}</v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="2" class="text-left">Issuer:</v-col>
                                <v-col cols="auto">{{claim.signedByName}}</v-col>
                            </v-row>
                        </v-container>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
            <v-btn
                @click="cancel"
                class="button-light mt-4"
            >
                Done
            </v-btn>
        </v-container>
        <v-dialog
        v-model="dialog"
        persistent
        fullscreen
        >
        <v-card fill-height justify-center dark>
            <v-toolbar
                color="color-gradient"
                dark
                class="text-center"
                >
                <h3 style="width: 100%; text-align:center;">Claims Request Code</h3>
            </v-toolbar>
            <v-card-text>
            <p class="mt-6">Scan this QR Code with the target Bridge Mobile Passport App to request identification claims.</p>
            <center>
                <div style="background-color:white; height:260px; width:260px; padding-top: 5px;">
                    <img :src="qr" v-if="qr != null">
                </div>
            </center>

            <div class="text-center m-6">
                <img src="../assets/spinner.gif" class="mt-2">
                <div class="mb-2">Waiting for response...</div>
                <v-btn
                    @click="closeQR"
                    style="width: 70%;"
                >
                Cancel
                </v-btn>
            </div>
            </v-card-text>
        </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
export default {
    props: [],
    data: function() {
        return {
            loading: false,
            loadStatus: "Please Wait",
            error: false,
            errorMessage: "An error occurred",
            qr: null,
            dialog: false,
            claims: [],
            token: null,
            response: null,
            lastSelectedClaim: ""
        }
    },
    methods:{
        async init(){

        },
        async showQR()
        {
            if(this.claims.length == 0){
                this.error = true;
                this.errorMessage = "You must select at least one claim type.";
                return;
            }

            let app = this;
            setTimeout(async function(){
                app.loading = true;
                app.loadStatus = "Generating request code";

                let context = await app.$BridgeMobile.getPassportContext();
                app.token = app.$BridgeMobile.createRandom();
                let authRequest = await app.$BridgeMobile.createAuthRequest(context.passport, context.passphrase, app.token, app.claims);
                let req = await app.$BridgeProtocol.Services.RequestRelay.createRequest(2, authRequest);
                if(!req && !req.id){
                    app.loading = false;
                    return;
                }

                app.qr = await app.$QrCodeGenerator.create(req.id);
                app.dialog = true;
                app.loading = false;

                let response = await app.$BridgeMobile.waitGetAuthResponse(req.id);
                app.dialog = false;
                app.loading = true;
                app.loadStatus = "Response received";
                setTimeout(async function(){
                    app.loadStatus = "Decrypting and validating response";
                    let context = await app.$BridgeMobile.getPassportContext();
                    app.response = await app.$BridgeMobile.validateAuthResponse(context.passport, context.passphrase, app.token, response);
                    app.claims = await app.$BridgeMobile.getFullClaimsInfo(app.response.claims);
                    console.log(JSON.stringify(app.response));
                    app.loading = false;
                }, 1000);
            }, 500);
        },
        closeQR(){
            this.qr = null;
            this.dialog = false;
        },
        cancel(){
            this.$router.push({ path: '/home', query: { } });
            this.$router.go(1);
        },
        claimSelected: async function(claim){
            this.polling = false;
            if(this.lastSelectedClaim == claim.claimTypeId){
                this.lastSelectedClaim = "";
            }
            else{
                this.lastSelectedClaim = claim.claimTypeId;
            }
        },
        getDate(date){
            return app.$BridgeMobile.getReadableDate(date);
        }
    },
     mounted: function () {
        this.$nextTick(function () {
            this.init();
        });
    }
}
</script>