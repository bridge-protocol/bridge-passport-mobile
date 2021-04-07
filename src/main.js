// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App'
import router from './scripts/router'
import BridgeMobile from './scripts/bridge'
import QRCodeGenerator from './scripts/qrgenerator'
import QRCodeScanner from './scripts/qrscanner'

function initVue(){
    Vue.config.productionTip = false
    Vue.use(Vuetify)
    Vue.prototype.$BridgeProtocol = BridgeProtocol;
    Vue.prototype.$BridgeMobile = BridgeMobile;
    Vue.prototype.$QrCodeGenerator = new QRCodeGenerator();
    Vue.prototype.$QrCodeScanner = new QRCodeScanner();
    
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
        console.log('deviceready');
        $(".loading").hide();
        //Init the App UI
        initVue();
        //Init the scan UI
        $(".scan-qr-cancel").click(function(){
            $("#app_wrapper").show();
            $(".scan-qr-overlay").hide();
            window.QRScanner.destroy(function(status){
              console.log(status);
            });
        });
    },
  };
app.initialize();