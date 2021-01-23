<template>
  <div id="app">
    <div id="nav">
      <Navbar/>
    </div>
    <router-view/>
  </div>
</template>

<script>
import Navbar from './components/Navbar'

export default {
  name: 'App',
  components: {
    Navbar
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

#nav{
  margin-bottom: 50px;
}

#logo {
  height: 50px;
  width: 50px;
}

#nav_body {
  margin-left: 20px;
}

body {
    overflow-y: scroll;
    background-image: url('./assets/main.png');
    background-size: cover;
}

.navbar-dark .navbar-nav .nav-link{
  color: white !important;
  font-weight: bold;
}

.navbar-dark .navbar-nav .nav-link:hover{
  color: #7EF6B6 !important;
}

.form-control {
  font-weight: bold !important
}
</style>