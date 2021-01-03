<template>
  <div class="container">
    <h1>Chatevents</h1>
    <p class="error" v-if="error">{{ error }}</p>
    <table>
      <tr>
        <th>Type</th>
        <th>Time</th>
      </tr>
      <tr v-for="(elem, index) in chatevents"
      v-bind:index="index"
      v-bind:key="elem._id">
        <td>{{ elem.type }}</td>
        <td>{{ elem.hours }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
const axios = require('axios')
const chatEventsUrl = 'http://localhost:3000/chatevents/getTime'

export default {
  name: 'chatevents',
  data() {
    return {
      chatevents: [],
      error: ''
    }
  },
  created() {
    axios.get(chatEventsUrl).then(res => {
      this.chatevents = res.data
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
