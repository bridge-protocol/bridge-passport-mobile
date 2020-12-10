$(function(){
    try{
        Vue.use(Vuetify);
        Vue.use(VueRouter);
        Vue.component('bridge-passport-app', httpVueLoader('./components/App.vue'));
        var app = new Vue({
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
            router: new VueRouter({
                routes: [
                    {
                        path: '/',
                        redirect: '/home'
                    }, {
                        path: '/home',
                        component: httpVueLoader('./components/Home.vue')
                    }, {
                        path: '/about',
                        component: httpVueLoader('./components/About.vue')
                    },
                    {
                        path: '/scan',
                        component: httpVueLoader('./components/Scan.vue'),
                        props: route => ({ qr: route.query.qr })
                    },
                    {
                        path: '/open',
                        component: httpVueLoader('./components/Open.vue')
                    },
                    {
                        path: '/unlock',
                        component: httpVueLoader('./components/Unlock.vue')
                    },
                    {
                        path: '/request',
                        component: httpVueLoader('./components/Request.vue')
                    },
                    {
                        path: '/identity',
                        component: httpVueLoader('./components/Identity.vue'),
                        props: route => ({ qr: route.query.qr })
                    }
                ]
            })
        });
    }
    catch(err){
        alert(err);
    }
});
