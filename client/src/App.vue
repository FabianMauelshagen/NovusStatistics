<template>
  <div class="bg">
    <div id="app">
      <div id="nav">
        <Navbar />
      </div>
      <router-view />
    </div>
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

<style>#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  width: 80%;
  margin: auto;
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

body,
html {
  height: 100%;
  margin: 0;
}

.bg {
  background-image: url('./assets/main.png');
  min-height: 100%;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
}

.navbar-dark .navbar-nav .nav-link {
  color: white !important;
  font-weight: bold;
}

.navbar-dark .navbar-nav .nav-link:hover {
  color: #7EF6B6 !important;
}

.form-control {
  font-weight: bold !important
}

.btn.btn-dark.btn-block {
  background-color: #343a40;
  border: none;
  height: 45px;
}

.btn.btn-dark.btn-block:hover {
  background-color: #3c4249;
  border: none;
  color: #7EF6B6;
}

.btn.btn-dark.btn-block:active {
  background-color: #3c4249 !important;
  color: #7EF6B6 !important;
}

.tbtn {
  background-color: #343a40 !important;
  margin: 2px;
  margin-bottom: 5px;
  font-weight: bold;
  border: none !important;
}

.tbtn:active {
  background-color: #3c4249 !important;
  color: #7EF6B6 !important;
}

.tbtn:disabled, .tbtn:hover {
    background-color: #7EF6B6 !important;
    color: #343a40 !important;
    border: none;
}

.pickBtn {
  margin-bottom: 5px;
}

.page-link {
    background-color: #343a40 !important;
    color: white !important;
}

.page-item.disabled .page-link {
  background-color: #3c4249 !important;
}

.page-item.active .page-link {
  background-color: #7EF6B6 !important;
  color: #343a40 !important;
  border-color: white !important;
}

.page-link:hover {
  background-color:  #7EF6B6 !important;
  color: #343a40 !important;
}

.page-link:focus {
  box-shadow: 0 0 0 0.2rem #7EF6B6 !important;
}

ul {
    list-style-type: none;
    padding: 0;
}

a {
    color: #ffffff;
}

table {
    font-family: arial, sans-serif;
    border-collapse: collapse;
    width: 100%;
}

td, th {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
}

tr:nth-child(even) {
    background-color: #dddddd;
}

.btn.btn-info.btn-block.collapsed,
.btn.btn-info.btn-block.not-collapsed {
    background-color: #343a40;
    color: #ffffff;
    border: none;
    box-shadow: none;
}

.btn:focus {
    box-shadow: none
}

span {
    margin-left: 20px;
}

button {
    font-weight: bold!important;
}

.offset {
    width: 500px !important;
    margin: 20px auto;
}

.list-group {
    max-height: 600px;
    margin-bottom: 20px;
    overflow: auto;
    border: 1px solid #ddd;
}

.topP {
    margin-top: 40px;
}

.table-striped > tbody > tr:nth-child(2n+1) > td, .table-striped > tbody > tr:nth-child(2n+1) > th {
   background-color: rgb(255, 255, 255);
}

.table-striped > tbody > tr:nth-child(2n) > td, .table-striped > tbody > tr:nth-child(2n) > th {
   background-color: #eeeeee;
}
</style>