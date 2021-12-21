
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
        let claims = await this.getDecryptedClaims(passport, password, claimTypes);
     
        //Get the requested blockchain addresses
        let addresses = [];
    
        //Find the claims they asked for and sign and send the response
        //Optionally add networks (neo, eth) to provide blockcahin addresses in the response
        return await BridgeProtocol.Messaging.Auth.createPassportChallengeResponse(passport, password, message.publicKey, message.payload.token, claims, addresses); 
    },
    async getDecryptedClaims(passport, password, claimTypes){
        let claims = [];

        for(let i=0; i<claimTypes.length; i++){
            let claim = this.getClaimByTypeId(passport, claimTypes[i]);
            console.log(claimTypes[i] + claim);
            if(claim){
                let decrypted = await claim.decrypt(passport.privateKey, password);
                console.log(JSON.stringify(decrypted));
                if(decrypted)
                    claims.push(decrypted);
            }
        }
        return claims;
    },
    getClaimByTypeId(passport, id){
        for(let i=0; i<passport.claims.length; i++){
            if(passport.claims[i].typeId == id)
                return passport.claims[i];
        }
        return null;
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
    }
};

export default BridgeMobile;
  