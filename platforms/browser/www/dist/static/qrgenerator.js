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

var QRCodeGenerator = new QRCodeGenerator();
