<template>
    <v-container fill-height fluid align-start justify-center dark class="ma-0 pa-0">
        <v-app-bar
            app
            clipped-left
            color="color-gradient"
            >
            <h3 style="width: 100%; text-align:center; margin-left: 24px;">My Bridge Identity</h3>
            <v-icon @click="close" style="float:right;">mdi-close</v-icon>
        </v-app-bar>
        <v-container fill-height fluid align-center justify-center v-if="refreshing">
            <div style="width:100%; text-align:center;">
                <img src="../assets/spinner.gif">
                <div>{{loadStatus}}</div>
            </div>
        </v-container>
        <v-container fill-height fluid align-start v-if="!refreshing" class="mx-0 px-0" style="margin-top:48px;">
            <v-expansion-panels>
                <v-expansion-panel @click="passportDetail">
                    <v-expansion-panel-header class="left-border-color-primary pt-4 pb-4">
                        <v-row>
                            <v-col cols="auto"><v-img src="./img/bridge-token-white.png" height="40" width="40"></v-img></v-col>
                            <v-col cols="6">
                                <div class="mb-1 title-2">Passport Id</div>
                                <div class="caption" v-text="passportId" style="overflow: hidden; text-overflow: ellipsis; width:200px;"></div>
                            </v-col>
                        <v-row>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="left-border-color-primary pt-0 pb-0">
                        <v-subheader class="pl-0 ml-0 caption">Passport Details</v-subheader>
                        <v-divider class="mb-2"></v-divider>
                        <v-row class="mb-n4">
                            <v-col cols="2" class="text-left">Version:</v-col>
                            <v-col cols="auto" class="text-left">{{version}}</v-col>
                        </v-row>
                        <v-row class="mb-n4">
                            <v-col cols="2" class="text-left">Id:</v-col>
                            <v-col cols="auto" class="text-left">{{passportId}}</v-col>
                        </v-row>
                    </v-expansion-panel-content>
                </v-expansion-panel>
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
                @click="claimSelected(claim)"
                >
                    <v-expansion-panel-header class="left-border-color-primary pt-4 pb-4">
                        <v-row>
                            <v-col cols="auto"><v-img src="./img/bridge-token-white.png" height="40" width="40"></v-img></v-col>
                            <v-col cols="8">
                                <div class="mb-1 title-2" v-text="claim.claimTypeName"></div>
                                <div class="caption" v-text="claim.claimValue" v-if="claim.claimTypeId != 0"></div>
                            </v-col>
                        <v-row>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="left-border-color-primary">
                        <v-container fluid>
                            <v-img v-if="claim.claimTypeId == 0" :src="claim.claimValue" width="80"></v-img>
                            <v-subheader class="pl-0 ml-0 caption">
                                Claim Details 
                            </v-subheader>
                            <v-divider class="mb-2"></v-divider>
                            <v-row dense>
                                <v-col cols="2" class="text-left">Verified:</v-col>
                                <v-col cols="auto">{{claim.verifiedOn}}</v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="2" class="text-left">Expires:</v-col>
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
        </v-container>
     </v-container>
</template>

<script>
export default {
    name: 'passport-details',
    components: {

    },
    data: function() {
        return {
            loadStatus: "Loading Bridge Identity",
            passportId: "",
            passportDetailSelected: false,
            passportNeoLoading: false,
            passportEthLoading: false,
            passportNeoPending: false,
            passportEthPending: false,
            passportNeoPublished: false,
            passportEthPublished: false,
            version: null,
            publicKey: "",
            lastSelectedClaim: "",
            neoWallet: null,
            ethWallet: null,
            neoWait: false,
            ethWait: false,
            refreshing: true,
            claims: [],
            publishClaim: null,
            publishDialog: false,
            publishClaimDialog: false,
            polling: false,
            neoPublishing: false
        }
    },
    methods: {
        init: async function(){
            let app = this;
            setTimeout(async function(){
                app.refreshing = true;
                app.passportId = "";
                app.publicKey = "";

                app.passportContext = await app.$BridgeMobile.getPassportContext();
                app.passportId = app.passportContext.passport.id;
                app.publicKey = app.passportContext.passport.publicKey;
                app.version = app.$BridgeMobile.passportVersion();

                app.neoWallet = app.passportContext.passport.getWalletForNetwork("neo");
                app.ethWallet = app.passportContext.passport.getWalletForNetwork("eth");
                await app.refreshClaims();
            }, 500);
        },
        refreshClaims: async function(){
            this.refreshing = true;
            this.loadStatus = "Decrypting Identity Claims";
            this.claims = [];
            let passportContext = await this.$BridgeMobile.getPassportContext();
            let decryptedClaims = await passportContext.passport.getDecryptedClaims(null, passportContext.passphrase);

            //Update with all the user friendly info
            this.claims = await this.$BridgeMobile.getFullClaimsInfo(decryptedClaims);

            this.refreshing = false;
        },
        passportDetail: async function(){
            this.polling = false;
            this.passportDetailSelected = !this.passportDetailSelected;
            if(this.passportDetailSelected){
                await this.refreshPassportDetail();
            }
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
            return this.$BridgeMobile.getReadableDate(date);
        },
        openUrl: function(url){
            window.open(url);
        },
        close(){
            this.$router.push({ path: '/', query: { } });
            this.$router.go(1);
        }
    },
    mounted: async function()
    {
        this.$nextTick(function () {
            this.init();
        });
    }
};
</script>