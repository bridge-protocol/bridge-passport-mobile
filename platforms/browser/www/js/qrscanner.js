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
    }
}

var qrCodeScanner = new QRCodeScanner();
