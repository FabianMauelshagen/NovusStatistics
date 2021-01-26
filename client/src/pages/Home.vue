<template>
    <div>
        <b-container class="homeCont">
            <b-row>
                <b-col>
                    <router-link to="/chatsession">
                    
                        <div class="center">
                          <div class="hexagon">
                              <img src="../assets/chat_color.png" alt="">
                          </div>
                        </div>
                    </router-link>
                    <p class="routeName">Sitzungen</p>
                </b-col>
                <b-col>
                    <router-link to="/functions">
                        <div class="center">
                          <div class="hexagon">
                              <img src="../assets/share_color.png" alt="">
                          </div>
                        </div>
                    </router-link>
                    <p class="routeName">Funktionen</p>
                </b-col>
                <b-col>
                    <router-link to="/users">
                        <div class="center">
                          <div class="hexagon">
                              <img src="../assets/headset_color.png" alt="">
                          </div>
                        </div>
                    </router-link>
                    <p class="routeName">Berater</p>
                </b-col>
                <b-col>
                    <router-link to="/guests">
                        <div class="center">
                          <div class="hexagon">
                              <img src="../assets/guests_color.png" alt="">
                          </div>
                        </div>
                    </router-link>
                    <p class="routeName">Kunden</p>
                </b-col>
            </b-row>
        </b-container>
    
    </div>
</template>

<style scoped>

.homeCont {
    padding-top: 50px;    
}

img {
  z-index:1;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}

.hexagon {
    width: 161.25px;
    height: 250px;
    background-image: linear-gradient(90deg, #3c4249, #343a40);
    border-radius: 25px;
    transition: transform 400ms ease;
}

.hexagon:hover {
    transform: rotate(30deg);
}

.hexagon:before,
.hexagon:after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: inherit;
    height: inherit;
    background-image: inherit;
    border-radius: inherit;
}

.hexagon:before {
    transform: rotate(60deg);
}

.hexagon:after {
    transform: rotate(-60deg);
}

.center {
   transform: translate(25%, 80%); 
}

.routeName {
    font-size: 30px;
    font-weight: bold;
    color: #343a40;
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    transform: translate(7%, 550%);
}

</style>