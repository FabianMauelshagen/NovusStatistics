<template>
  <div>
    <Header header="Kunden Statistik" />
    <time-component v-on:date-changed="date = $event; refresh()"></time-component>
    <Card :n=type.length chart-type="pie" :new-series="pieSeries" :new-labels="pieLabels" card-text="Systemdiagnose" :new-names="statsNames" :new-pie-size="450"/>
    <Card chart-type="line" :new-series="statsSeries" :new-labels="statsValues" card-text="Kundenaufkommen" :new-title="['Kunden Anzahl kumuliert', 'pro Tag']" />
    <Card :n=1 chart-type="pie" :new-series="[inviteSeries]" :new-labels="[inviteLabels]" card-text="Screen-Sharing Annahme" :new-names="['Screen-Sharing']" 
    :new-pie-size="550"/>
  </div>
</template>

<script>
const axios = require('axios')
const getUseCountURL = 'http://localhost:3000/guests/getUseCounts'
const getStatsURL = 'http://localhost:3000/guests/getStats'
const inviteStatsURL = 'http://localhost:3000/guests/getInviteStats'
const time = require('../assets/time')
import Card from '../components/Card'
import Header from '../components/Header'

export default {
  name: 'guests',
  components: {
    Card,
    Header
  },
  data() {
    return {
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
        let zero = true
        let dataArray = []
        for (var elem of res.data[0]) {
          dataArray.push(elem)
          if(elem[1] != 0){
              zero = false
          } 
        }
        if(zero){
          dataArray.length = 0
        }
        this.statsSeries = [{
          name: "Kunden",
          data: dataArray
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