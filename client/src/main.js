import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '@/plugins/apexcharts'

import Users from './pages/Users.vue'
import Home from './pages/Home.vue'
import ChatSession from './pages/ChatSession.vue'
import Functions from './pages/Functions.vue'
import Guests from './pages/Guests.vue'

import timeComponent from './components/time-component.vue'

Vue.use(VueRouter)

Vue.use(BootstrapVue)

const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/users',
    component: Users
  },
  {
    path: '/chatsession',
    component: ChatSession
  },
  {
    path: '/functions',
    component: Functions
  },
  {
    path: '/guests',
    component: Guests
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

Vue.config.productionTip = false
Vue.component('time-component', timeComponent)

new Vue({
  el: '#app',
  router,
  render: h => h(App),
}).$mount('#app')