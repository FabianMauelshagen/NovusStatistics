import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '@/plugins/apexcharts'

// Import aller Vue-Komponenten bzw. Konfigurationsdateien
import Users from './pages/Users.vue'
import Home from './pages/Home.vue'
import ChatSession from './pages/ChatSession.vue'
import Functions from './pages/Functions.vue'
import Guests from './pages/Guests.vue'

import timeComponent from './components/time-component.vue'
// Benutze VueRouter Plugin
Vue.use(VueRouter)
// Benutze BootstrapVue Plugin
Vue.use(BootstrapVue)
// Benutze BootstrapVueIcons Plugin
Vue.use(BootstrapVueIcons)
// Erstellen von Routen
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

//Vue Router in den History-Modus setzen, um das Hash-Zeichen loszuwerden
const router = new VueRouter({
  routes,
  mode: 'history'
})
// Anzeige der Meldung des Produktionsmodus
Vue.config.productionTip = false
Vue.component('time-component', timeComponent)

// Initialisieren des Vue Objekts
new Vue({
  el: '#app',
  router,
  render: h => h(App),
}).$mount('#app')