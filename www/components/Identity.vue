<template>
    <v-container fill-height align-start text-center class="mx-0 my-0 px-0 py-0" ref="mainContainer">
        <v-container v-if="refreshing" fill-height align-middle class="mx-0 my-0 px-0 py-0">
            <v-progress-circular
                indeterminate
                color="secondary"
                style="margin-left: 48%;"
            >
            <div class="pt-4 mt-12 text-no-wrap">
                {{loadStatus}}
            </div>
            </v-progress-circular>
        </v-container>
        <v-container v-if="!refreshing" px-0 py-0 mx-0 my-0 style="position:relative; top:10px; left:0px;'">
            <v-expansion-panels>
                <v-expansion-panel @click="passportDetail">
                    <v-expansion-panel-header class="left-border-color-primary pt-1 pb-1">
                        <v-row>
                            <v-col cols="auto"><v-img src="./img/bridge-token-white.png" height="40" width="40"></v-img></v-col>
                            <v-col cols="8">
                                <div class="mb-1 title-2">Id</div>
                                <div class="caption" v-text="passportId" style="word-break: break-all;"></div>
                            </v-col>
                        <v-row>
                    </v-expansion-panel-header>
                     <v-expansion-panel-content class="left-border-color-primary">
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
                v-for="(claim,i) in claims"
                :key="claim.id"
                @click="claimSelected(claim)"
                >
                    <v-expansion-panel-header class="left-border-color-primary pt-1 pb-1">
                        <v-row>
                            <v-col cols="auto"><v-img src="./img/bridge-token-white.png" height="40" width="40"></v-img></v-col>
                            <v-col cols="auto">
                                <div class="mb-1 title-2" v-text="claim.claimTypeName"></div>
                                <div class="caption" v-text="claim.claimValue"></div>
                            </v-col>
                        <v-row>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="left-border-color-primary">
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
module.exports = {
    name: 'passport-details',
    components: {

    },
    data: function() {
        return {
            loadStatus: "Loading Bridge Identity",
            mainContainerHeight: 690,
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

                app.passportContext = await BridgeMobile.getPassportContext();
                app.passportId = app.passportContext.passport.id;
                app.publicKey = app.passportContext.passport.publicKey;
                app.version = BridgeMobile.passportVersion();

                app.neoWallet = app.passportContext.passport.getWalletForNetwork("neo");
                app.ethWallet = app.passportContext.passport.getWalletForNetwork("eth");
                await app.refreshClaims();
                app.mainContainerHeight = app.$refs.mainContainer.clientHeight;
            }, 500);
        },
        refreshClaims: async function(){
            this.refreshing = true;
            this.loadStatus = "Decrypting Identity Claims";
            this.claims = [];
            let passportContext = await BridgeMobile.getPassportContext();
            let decryptedClaims = await passportContext.passport.getDecryptedClaims(null, passportContext.passphrase);

            //Update with all the user friendly info
            this.claims = await BridgeMobile.getFullClaimsInfo(decryptedClaims);

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
            return BridgeMobile.getReadableDate(date);
        },
        openUrl: function(url){
            window.open(url);
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