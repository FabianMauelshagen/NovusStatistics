<template>
    <div>
        <b-container>
            <b-row>
                <b-col>
                    <router-link class="rectangle" to="/guests"></router-link>
                </b-col>
                <b-col>
                    <router-link class="rectangle" to="/chatsession"></router-link>
                </b-col>
                <b-col>
                    <router-link class="rectangle" to="/functions"></router-link>
                </b-col>
                <b-col>
                    <router-link class="rectangle" to="/time"></router-link>
                </b-col>
                <b-col>
                    <router-link class="rectangle" to="/users"></router-link>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<style scoped>
.rectangle {
    height: 250px;
    display: block;
    background-color:  #343a40;
}
</style>