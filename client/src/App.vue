<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <Guestcomp/>
  </div>
</template>

<script>
//import NovusStatistics from './components/NovusStatistics.vue'
import Guestcomp from './components/guestcomp.vue'
export default {
  name: 'App',
  components: {
    Guestcomp
    //NovusStatistics
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
