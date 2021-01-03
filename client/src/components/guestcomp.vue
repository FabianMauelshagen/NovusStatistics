<template>
  <div class="container">
    <h1>Chatevents</h1>
    <p class="error" v-if="error">{{ error }}</p>
    <button v-on:click="refresh">Click</button>
    <select v-model="selected">
        <option disabled value="">Please select one</option>
        <option>0</option>
        <option>1</option>
        <option>2</option>
    </select>
    <span>Selected: {{ selected }}</span>
    <table>
      <tr>
        <th>Wert</th>
        <th>Count</th>
      </tr>
      <tr v-for="(elem, index) in getUseCounts"
      v-bind:index="index"
      v-bind:key="index">
        <td>{{ elem._id }}</td>
        <td>{{ elem.count }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
const axios = require('axios')
const getUseCountURL = 'http://localhost:3000/guests/getUseCounts'
const getStatsURL = 'http://localhost:3000/guests/getStats'

export default {
  name: 'guests',
  data() {
    return {
      getUseCounts: [],
      getStats: [] ,
      error: '',
      selected: 0
    }
  },
    methods:{
        refresh: function(){
            axios.get(getUseCountURL, {
                params: {
                    i: this.selected
                }
                }).then(res => {
                this.getUseCounts = res.data
                }).catch(e => {
                this.error.push(e)
            })
        }
    },
  created() {
    axios.get(getStatsURL).then(res => {
      this.getStats = res.data
    }).catch(e => {
      this.error.push(e)
    })
    axios.get(getUseCountURL, {
        params: {
            i: this.selected
        }
    }).then(res => {
    this.getUseCounts = res.data
    }).catch(e => {
    this.error.push(e)
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
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
</style>
