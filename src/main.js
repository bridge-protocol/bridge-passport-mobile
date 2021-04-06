// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App'
import router from './router'

Vue.config.productionTip = false
Vue.use(Vuetify)

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
                            error: '#b71c1c',
                        },
                    },
                },
            }),
  router,
  components: { App },
  template: '<App/>'
})
