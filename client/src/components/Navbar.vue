<template>
    
    <div>  
    <b-navbar type="dark" fixed="top" variant="dark">
        <router-link to="/">
        <img id="logo" src="../assets/logo.png">
         </router-link>
         <router-link to="/" id="headerLink">
        <p class="header">Novus<span class="header2">Statistics </span></p>
        </router-link>
        <div class="vl"></div>
        <b-navbar-nav id="nav_body">
            <router-link tag="b-nav-item" to="/">Home</router-link>
            <router-link tag="b-nav-item" to="/chatsession">Sitzungen</router-link>
            <router-link tag="b-nav-item" to="/functions">Funktionen</router-link>
            <router-link tag="b-nav-item" to="/users">Berater</router-link>
            <router-link tag="b-nav-item" to="/guests">Kunden</router-link>
        </b-navbar-nav>
    </b-navbar>    
    
    <p class="timeString" :v-model="heute">{{heute.toLocaleDateString('de-DE')}}</p>
    </div>
</template>

<script>
export default {
    data(){
        return {
            heute: new Date()
        }
    }
}
</script>

<style scoped>
#headerLink:hover{
    color: blue;
    text-decoration: none;
}

.timeString {
    text-align: right;
    margin-top: 100px;
    margin-right: 70px;
    color: #343a40;
    font-size: 18px;
    font-weight: bold;
    display:block
}

.header {
    color:#7EF6B6;
    font-size: 28px;
    font-family: 'Franklin Gothic Medium';
    margin: 0 auto;
    margin-left: 25px;
    margin-right: 0px;
}

.header2 {
    color: #ffffff;
    font-size: 26px;
    font-family: 'Arial Narrow';
    margin: 0 auto;
    margin-left: 0px;
    margin-right: 25px;
}

.vl {
  border-left: 2px solid #FFFFFF;
  height: 50px;
  margin-right: 15px;
}
</style>