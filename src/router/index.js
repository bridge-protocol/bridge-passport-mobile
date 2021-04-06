import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import About from '@/components/About'
import Scan from '@/components/Scan'
import Open from '@/components/Open'
import Unlock from '@/components/Unlock'
import Request from '@/components/Request'
import Identity from '@/components/Identity'

Vue.use(Router)

export default new Router({
  routes: [
                    {
                        path: '/',
                        redirect: '/home'
                    }, {
                        path: '/home',
                        component: Home
                    }, {
                        path: '/about',
                        component: About
                    },
                    {
                        path: '/scan',
                        component: Scan,
                        props: route => ({ qr: route.query.qr })
                    },
                    {
                        path: '/open',
                        component: Open
                    },
                    {
                        path: '/unlock',
                        component: Unlock
                    },
                    {
                        path: '/request',
                        component: Request
                    },
                    {
                        path: '/identity',
                        component: Identity,
                        props: route => ({ qr: route.query.qr })
                    }
                ]
})
