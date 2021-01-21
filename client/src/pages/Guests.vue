<template>
  <div class="full-width">
    <p class="topHeader">Kunden Statistik</p>
    <time-component v-on:date-changed="date = $event; refresh()"></time-component>
    <Card :n=type.length chart-type="pie" :new-series="pieSeries" :new-labels="pieLabels" card-text="Systemdiagnose" :new-names="statsNames" />
    <Card chart-type="line" :new-series="statsSeries" :new-labels="statsValues" card-text="Kundenaufkommen"/>
    <Card :n=1 chart-type="pie" :new-series="[inviteSeries]" :new-labels="[inviteLabels]" card-text="Screen-Sharing Annahme" :new-names="['Screen-Sharing']"/>
  </div>

</template>

<script>
const axios = require('axios')
const getUseCountURL = 'http://localhost:3000/guests/getUseCounts'
const getStatsURL = 'http://localhost:3000/guests/getStats'
const inviteStatsURL = 'http://localhost:3000/guests/getInviteStats'
const time = require('../assets/time')
import Card from '../components/Card'

export default {
  name: 'guests',
  components: {
    Card
  },
  data() {
    return {
      collapse1: {
        show: false
      },
      collapse2: {
        show: false
      },
      collapse3: {
        show: false
      },
      pieSeries: [
        [],
        [],
        [],
        [],
        []
      ],
      pieLabels: [
        [],
        [],
        [],
        [],
        []
      ],
      lineSeries: [],
      lineLabels: [],
      dataSeries: [],
      statsSeries: [],
      statsValues: [],

      inviteSeries: [],
      inviteLabels: ['Angenommen', 'Abgelehnt'],
      inviteStats: [],
      error: [],
      selected: 0,
      type: [0, 1, 2, 3, 4],
      statsNames: [
        'Browser',
        'Betriebssystem',
        'Kamera',
        'Mikrofon',
        'Lautsprecher'
      ],
      date: {
        startDate: time.getSpecificDate('2020-11-01')[0],
        endDate: time.getSpecificDate('2020-11-07')[1]
      }
    }
  },
  methods: {

      getUseCounts() {
      for (let i = 0; i < this.type.length; i++) {
        axios.get(getUseCountURL, {
          params: {
            start: this.date.startDate,
            end: this.date.endDate,
            i: i
          }
        }).then(res => {
          if(res.data.length !== 0){
            res.data.forEach(element => {
              this.pieSeries[i].push(element.count)
              if (element._id) {
                if (element._id === 'false')
                  this.pieLabels[i].push('Besitzt nicht')
               else if (element._id === 'true')
                  this.pieLabels[i].push('Besitzt')
                else
                  this.pieLabels[i].push(element._id)
              } else
              this.pieLabels[i].push('k.A.')
          });
          } else {
            this.pieSeries[i].push()
          }
          
          
        }).catch(e => {
          this.error.push(e)
        })
      }
    },

    getStats() {
      axios.get(getStatsURL, {
        params: {
          start: this.date.startDate,
          end: this.date.endDate
        }
      }).then(res => {
        this.statsValues = res.data[1]
        for (var elem of res.data[0]) {
          this.dataSeries.push(elem)
        }
        this.statsSeries = [{
          name: "Kunden",
          data: this.dataSeries
        }]

      }).catch(e => {
        this.error.push(e)
      })
    },

    getInviteStats() {
      axios.get(inviteStatsURL, {
        params: {
          start: this.date.startDate,
          end: this.date.endDate
        }
      }).then(res => {
        let countData = []
        for (var invite of res.data) {
          countData.push(invite.count)
          if (res.data.length < 2) {
            countData.push(0)
          }
        }
          this.inviteSeries = countData
      }).catch(e => {
        this.error.push(e)
      })
    },

    refresh() {
      for (let i = 0; i < this.pieLabels.length; i++) {
        this.pieSeries[i].length = 0
        this.pieLabels[i].length = 0
      }
      this.statsSeries.length = 0
      this.dataSeries.length = 0
      this.inviteSeries.length = 0

      this.getInviteStats()
      this.getUseCounts()
      this.getStats()
    },
    resize() {
            window.dispatchEvent(new Event('resize'))
    },
  },
  mounted() {
    this.resize()
  },
  created() {

    this.refresh()

  }
}
</script>

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
  color: #ffffff;
}

table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td,
th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}

.p-1 {
  background-color: #444444;
}

.full-width {
  padding-right: 50px;
  padding-left: 50px;
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

button.page-link {
  display: inline-block;
}

button.page-link {
  font-size: 20px;
  color: #29b3ed;
  font-weight: 500;
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

.topHeader {
  text-align: center;
  color: #343a40;
  font-size: 50px;
  font-weight: bold;
}

</style>
