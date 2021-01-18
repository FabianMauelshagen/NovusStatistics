<template>
  <div id="app">
    <div id="nav">
      <b-navbar type="dark" fixed="top" variant="dark">
        <img id="logo" src="./assets/logo.png">
        <b-navbar-nav id="nav_body">
          <router-link tag="b-nav-item" to="/">Home</router-link>
          <router-link tag="b-nav-item" to="/guests">Guests</router-link>
          <router-link tag="b-nav-item" to="/chatsession">Chatsession</router-link>
          <router-link tag="b-nav-item" to="/functions">Functions</router-link>
          <router-link tag="b-nav-item" to="/time">Time</router-link>
          <router-link tag="b-nav-item" to="/users">Users</router-link>
        </b-navbar-nav>
      </b-navbar>
    </div>
    <router-view/>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
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

#nav {
  margin-bottom: 130px;
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
}
</style>