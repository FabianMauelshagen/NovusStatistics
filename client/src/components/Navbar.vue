<template>
    
    <div>  
    <b-navbar type="dark" fixed="top" variant="dark">
        <img id="logo" src="../assets/logo.png">
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
.timeString {
    text-align: right;
    margin-top: 100px;
    margin-right: 70px;
    color: #343a40;
    font-size: 18px;
    display:block
}
</style>