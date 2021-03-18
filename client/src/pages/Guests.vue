<!-- Vue File für die Kunden Dimension -->

<template>
  <div>
    <Header header="Kunden Statistik" />
    <time-component v-on:date-changed="date = $event; refresh()"></time-component>
    <Card :n=type.length chart-type="pie" :new-series="pieSeries" :new-labels="pieLabels" card-text="Systemdiagnose" :new-names="statsNames" :new-pie-size="420"/>
    <Card chart-type="line" :new-series="statsSeries" :new-labels="statsValues" card-text="Kundenaufkommen" :new-title="['Kunden Anzahl kumuliert', 'pro Tag']" />
    <Card :n=1 chart-type="pie" :new-series="[inviteSeries]" :new-labels="[inviteLabels]" card-text="Screen-Sharing Annahme" :new-names="['Screen-Sharing']" 
    :new-pie-size="550"/>
  </div>
</template>

<script>
// Siehe ChatSession.vue
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
      // Definieren der lokal genutzten Variablen und Arrays
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
      // Nutzung der Browser, Betriebssysteme, Kamera, Mikrofon und Lautsprecher
      getUseCounts() {
      for (let i = 0; i < this.type.length; i++) {
        axios.get(getUseCountURL, {
          params: {
            start: this.date.startDate,
            end: this.date.endDate,
            i: i
          }
        }).then(res => {
          if(res.data.length !== 0){ // Wenn es abgefragte Daten gibt
            res.data.forEach(element => { // Schleife über alle Elemente
              this.pieSeries[i].push(element.count) // Belege die lokal erstellten Variable mit den erhaltenen Daten
              if (element._id) { // Wenn das Element ID nicht leer ist bzw. wenn es ein Element ID gibt (ab hier geht es z.B. um eine Kamera oder ein Mikrofon)
                if (element._id === 'false') // Überprüfe, ob das Element ID false ist
                  this.pieLabels[i].push('Besitzt nicht') // Wenn ja, belege das Array an dieser Stelle mit 'Besitzt nicht'
               else if (element._id === 'true') // Falls das Element ID true ist
                  this.pieLabels[i].push('Besitzt') // Belege das Array an dieser Stelle mit 'Besitzt'
                else
                  this.pieLabels[i].push(element._id) // Sonst fülle mit diesem Element ID
              } else
              this.pieLabels[i].push('k.A.') // Falls das Element ID doch leer ist belege es mit 'keine Angabe'
          });
          } else {
            this.pieSeries[i].push()
          }
          
          
        }).catch(e => {
          this.error.push(e)
        })
      }
    },
    // Statistik über die erfassten Gäste
    getStats() {
      axios.get(getStatsURL, {
        params: {
          start: this.date.startDate,
          end: this.date.endDate
        }
      }).then(res => {
        this.statsValues = res.data[1]
        // Boolean zum test, ob das Array ein reines 0 Array ist
        let zero = true
        let dataArray = []
        for (var elem of res.data[0]) {
          dataArray.push(elem)
          if(elem[1] != 0){
              zero = false
          } 
        }
        // Wenn Array nur aus 0 besteht, wird das Array geleert (Zur Anzeige von "Keine Daten" im Diagramm)
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
    // Annahme / Ablehnung der Screensharing Einladung
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
          // Wenn es keinen Wert zu Angenommen oder Abgelehnt gibt hat das res Array weniger als 2 Werte gespeichert
          // Dann werden die fehlenden Werte mit einer 0 aufgefüllt
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
      // Leeren der Tortendiagramme
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