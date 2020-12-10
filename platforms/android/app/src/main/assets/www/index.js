var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: async function() { 
        this.receivedEvent('deviceready');

        const urlParams = new URLSearchParams(window.location.search);
        const qrScan = urlParams.get('s');
        const qrType = urlParams.get('t');

        let code;
        if(qrScan){
            $(".loading").hide();
            $(".scan-qr-overlay").show();
            $(".scan-qr-cancel").click(function(){
                location.href="app.html?t=" + qrType + "&v=" + code;
            });
            code = await qrCodeScanner.scan();
        }

        location.href="app.html?t=" + qrType + "&v=" + code;
    },
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};

app.initialize();