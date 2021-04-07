// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App'
import router from './router'

var BridgeMobile = {
    async getPassportContext() {
        var storage = window.localStorage;
        let passphrase = storage.getItem('passphrase');
        let passportContent = storage.getItem('passport');

        let passport;
        if(passportContent != null)
            passport = new BridgeProtocol.Models.Passport();
        if(passportContent != null && passphrase != null){
            await passport.open(passportContent, passphrase);
        }
        return { passport, passphrase };
    },
    setPassport(passport) {
        var storage = window.localStorage;
        storage.setItem('passport', passport);
    },
    setPassphrase(passphrase) {
        var storage = window.localStorage;
        storage.setItem('passphrase', passphrase);
    },
    clearPassport() {
        var storage = window.localStorage;
        storage.removeItem('passport');
        storage.removeItem('passphrase');
    },
    clearPassphrase() {
        var storage = window.localStorage;
        storage.removeItem('passphrase');
    },
    version(){
        var manifestData = chrome.runtime.getManifest();
        return manifestData.version;
    },
    passportVersion(){
        return BridgeProtocol.Constants.passportVersion;
    },
    createRandom(){
        return Math.random().toString(36).substr(2);
    },
    async getWalletBalances(wallet){
        let balances = await BridgeProtocol.Services.Blockchain.getBalances(wallet.network, wallet.address);
        let gas = 0;
        let brdg = 0;
        if(balances){
            for(let i=0; i<balances.length; i++){
                if(balances[i].asset.toLowerCase() === "gas"){
                    gas = balances[i].balance;
                }
                else if(balances[i].asset.toLowerCase() == "eth"){
                    gas = balances[i].balance;
                }
                if(balances[i].asset.toLowerCase() == "brdg"){
                    brdg = balances[i].balance;
                }
            }
        }
        return { gas, brdg };
    },
    getReadableDate(date, includeTime){
        date = new Date(date * 1000); 
        let res = date.toLocaleDateString();
        if(includeTime)
            res += " " + date.toLocaleTimeString();
        return res;
    },
    getReadableString(str) {
        let camelMatch = /([A-Z])/g;
        str = str.replace(camelMatch, " $1");
    
        str = str.charAt(0).toUpperCase() + str.slice(1);
    
        return str;
    },
    async getClaimType(claimTypeId){
        return await BridgeProtocol.Services.Claim.getType(claimTypeId);
    },
    async getClaimTypes(claimTypeIds){
        if(!claimTypeIds)
            return [];

        let claimTypes = [];
        for(let i=0; i<claimTypeIds.length; i++){
            let claimType = await this.getClaimType(claimTypeIds[i]);
            if(claimType)
                claimTypes.push(claimType);
        }
        return claimTypes;
    },
    async getFullClaimsInfo(claims){
        if(!claims)
            return null;

        //Update the claims information
        for(let i=0; i<claims.length; i++)
            claims[i] = await this.getFullClaimInfo(claims[i]);

        return claims;
    },
    async getFullClaimInfo(claim){
        //Assingn a unique id
        claim.id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        claim.verifiedOn = this.getReadableDate(claim.createdOn);

        //Find the expiration date
        if(claim.expiresOn == 0)
            claim.expireDate = "Never";
        else{
            claim.expireDate = this.getReadableDate(claim.expiresOn);
        }

        //Set the claim type name
        claim.claimTypeName = claim.claimTypeId;
        let claimType = await BridgeProtocol.Services.Claim.getType(claim.claimTypeId);
        if(claimType)
            claim.claimTypeName = claimType.name;

        //Get the id it was signed by
        claim.signedById = await BridgeProtocol.Utils.Crypto.getPassportIdForPublicKey(claim.signedByKey);
        claim.signedByName = claim.signedById;
        let partner = await BridgeProtocol.Services.Partner.getPartner(claim.signedById);
        if(partner)
            claim.signedByName = partner.name;

        return claim;
    },
    async getPassportDetails(passport, password, passportId){
        return await BridgeProtocol.Services.Passport.getDetails(passport, password, passportId);
    },
    async createAuthRequest(passport, password, token, requiredClaimTypes){
        return await BridgeProtocol.Messaging.Auth.createPassportChallengeRequest(passport, password, token, requiredClaimTypes, []);
    },
    async validateAuthRequest(request){
        return await BridgeProtocol.Messaging.Auth.verifyPassportChallengeRequest(request);
    },
    async createAuthResponse(passport, password, message, claimTypes){
        //Retrieve the requested claims
        let claims = await passport.getDecryptedClaims(claimTypes, password);
    
        //Get the requested blockchain addresses
        let addresses = [];
    
        //Find the claims they asked for and sign and send the response
        //Optionally add networks (neo, eth) to provide blockcahin addresses in the response
        return await BridgeProtocol.Messaging.Auth.createPassportChallengeResponse(passport, password, message.publicKey, message.payload.token, claims, addresses); 
    },
    async validateAuthResponse(passport, password, token, response){
        return await BridgeProtocol.Messaging.Auth.verifyPassportChallengeResponse(passport, password, response, token);
    },
    async waitGetAuthResponse(id){
        return new Promise(function (resolve, reject) {
            (async function waitForComplete(){
                let res = await BridgeProtocol.Services.RequestRelay.getResponse(id);
                if(res && res.response){
                    console.log("Response found");
                    return resolve(res.response);
                }
                console.log("Response not found. Waiting and retrying.");
                setTimeout(waitForComplete, 5000);
            })();
        });
    },
    async waitVerifyPayment(network, transactionId, from, to, amount, identifier){
        return new Promise(function (resolve, reject) {
            (async function waitForComplete(){
                let res = await BridgeProtocol.Services.Blockchain.verifyPayment(network, transactionId, from, to, amount, identifier);
                if(res.complete){
                    console.log("Transaction found and complete");
                    return resolve(res.success);
                }
                console.log("Transaction not complete. Waiting and retrying.");
                setTimeout(waitForComplete, 15000);
            })();
        });
    },
    async getBlockchainClaimPublishStatus(passport, passphrase, wallet, claimTypeId){
        let publishStatus = {
            status: 0,
            text: this.getClaimPublishStatusText(0)
        };

        let pendingStatus = await this.getPendingClaimPublishStatus(passport, passphrase, wallet.network, claimTypeId);
        if(pendingStatus)
            publishStatus = pendingStatus;

        if(publishStatus.status != 2 && publishStatus.status != 3){
            let res = await BridgeProtocol.Services.Blockchain.getClaim(wallet.network, claimTypeId, wallet.address);
            if(res && res.claim && res.verified){
                publishStatus.status = 1;
                publishStatus.text = res.claim.value;
            }
        }

        return publishStatus;
    },
    async getPendingClaimPublishStatus(passport, passphrase, network, claimTypeId){
        let pendingList = await BridgeProtocol.Services.Claim.getPendingClaimPublishList(passport, passphrase);

        for(let i=0; i<pendingList.length; i++){
            if(pendingList[i].claimTypeId === claimTypeId && pendingList[i].network.toLowerCase() === network.toLowerCase())
            {
                let status = 2;
                if(network.toLowerCase() === "neo" && pendingList[i].status == 9)
                    status = 3;

                return {
                    id: pendingList[i].id,
                    status,
                    text: this.getClaimPublishStatusText(status, pendingList[i].network),
                    txId: pendingList[i].claimPublishTransactionId
                };
            } 
        }

        return null;
    },
    getClaimPublishStatusText(status, network){
        let text;
        switch(status) {
            case 1:
                text = "Published";
                break;
            case 2:
                if(network && network.toLowerCase() === "eth")
                    text = "Pending Publish";
                else
                    text = "Pending Publish Approval";
                break;
            case 3:
                text = "Publishing Approved";
                break;
            default:
                text = "Not Published";
        }
        return text;
    }
};

var QRCodeGenerator = class QRCodeGenerator{
    create = async(text) => {
        return new Promise(function(resolve, reject){
            let options = {
                width: 250,
                height: 250,
                colorDark: "#000000",
                colorLight: "#ffffff",
            };

            cordova.plugins.qrcodejs.encode('TEXT_TYPE', text, (base64EncodedQRImage) => {
                resolve(base64EncodedQRImage);
                }, (err) => {
                reject(err);
                }, options);
        });
    }
}


var QRCodeScanner = class QRCodeScanner{
    scan = async () => {
        return new Promise(function(resolve, reject){
            window.QRScanner.show(function(status){
                console.log(status);
                var callback = function(err, contents){
                    if(err){
                        console.log("Error: " + err);
                        reject(err);
                    }

                    console.log("Code found: " + contents);
                        resolve(contents);
                    };
                    
                    window.QRScanner.scan(callback);
            });
        });
    };

    hide = () => {
        window.QRScanner.hide();
    }
}



function initVue(){
    Vue.config.productionTip = false
    Vue.use(Vuetify)
    Vue.prototype.$QrCodeGenerator = new QRCodeGenerator();
    Vue.prototype.$QrCodeScanner = new QRCodeScanner();
    Vue.prototype.$BridgeProtocol = BridgeProtocol;
    Vue.prototype.$BridgeMobile = BridgeMobile;

    /* eslint-disable no-new */
    new Vue({
    el: '#app',
    vuetify: new Vuetify({
        theme: {
        themes: {
            dark: {
            primary: '#904099',
            secondary: '#6155a3',
            accent: '#3c7fc6',
            info: '#6155a3',
            error: '#b71c1c'
            }
        }
        }
    }),
    router,
    components: { App },
    template: '<App/>'
    });

    console.log("Vue initialized");
}

var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: async function() { 
        this.receivedEvent('deviceready');
        $(".loading").hide();

        const urlParams = new URLSearchParams(window.location.search);
        const qrScan = urlParams.get('s');
        const qrType = urlParams.get('t');

        let code;
        if(qrScan){
            $("#wrapper").hide();
            $(".scan-qr-overlay").show();
            $(".scan-qr-cancel").click(function(){
                location.href="index.html";
            });
            let qrCodeScanner = new QRCodeScanner();
            code = await qrCodeScanner.scan();
            $(".scan-qr-overlay").hide();
            location.href="index.html?t=" + qrType + "&v=" + code;
        }
        initVue();
    },
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
  };
  
app.initialize();