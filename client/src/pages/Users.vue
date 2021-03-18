<template>
  <div>
    <Header header="Berater Statistik"/> 
    <time-component v-on:date-changed="date = $event; refresh()"></time-component>
    <Card chart-type="bar" :new-series="sessionInterruptsSeries" :new-labels="sessionInterruptsLabels" card-text="Sitzungs-Unterbrechungen"/>
    <Card chart-type="bar" :new-series="frequencyOfAcceptanceSeries" :new-labels="frequencyOfAcceptanceLabels" card-text="Annahme-Rate"/>
    <Card chart-type="stacked" :new-series="usedFunctionsSeries" :new-labels="usedFunctionsLabels" card-text="Funktions-Nutzung"/>
  </div>
</template>

<script>
import Card from '../components/Card'
const axios = require('axios')
const sessionInterruptsURL = 'http://localhost:3000/users/getSessionInterrupts'
const frequencyOfAcceptanceURL = 'http://localhost:3000/users/getFrequencyOfAcceptance'
const usedFunctionsURL = 'http://localhost:3000/users/getUsedFunctions'
import Header from '../components/Header'
const time = require('../assets/time')

export default {
  name: 'users',
  components: {
    Card,
    Header
  },
  data() {
    return {
      sessionInterruptsSeries: [],
      sessionInterruptsLabels: [],
      frequencyOfAcceptanceSeries: [],
      frequencyOfAcceptanceLabels: [],
      usedFunctionsSeries: [],
      usedFunctionsLabels: [],
      error: [],
      date: {
        startDate: time.getSpecificDate('2020-11-01')[0],
        endDate: time.getSpecificDate('2020-11-07')[1],
      }
    }
  },
  methods: {
    // Anzahl der Sitzungsunterbrechungen
    getSessionInterrupts() {
        
      axios.get(sessionInterruptsURL, {
        params: {
          start: this.date.startDate,
            end: this.date.endDate,
        }
      }).then(res => {
        let countArr = []
        for(var element of res.data){
          countArr.push(element.count)
          // Anonymisierung des Beraters
          this.sessionInterruptsLabels.push(this.replace(element.username))
        }
        this.sessionInterruptsSeries.push({
            name: 'Anzahl',
            data: countArr
        })
      }).catch(e => {
        this.error.push(e)
      })
    },
    // Anzhal der vom Berater akzeptierten Sitzungen
    getFrequencyOfAcceptance() {
      axios.get(frequencyOfAcceptanceURL, {
        params: {
          start: this.date.startDate,
            end: this.date.endDate,
        }
      }).then(res => {
        let countArr = []
        for(var element of res.data){
          countArr.push(element.count)
          // Anonymisierung des Beraters
          this.frequencyOfAcceptanceLabels.push(this.replace(element.username))
        }
        this.frequencyOfAcceptanceSeries.push({
            name: 'Anzahl',
            data: countArr
        })
      }).catch(e => {
        this.error.push(e)
      })
    },
    // Anzeige der vom Berater benutzten Funktionen
    getUsedFunctions() {
      axios.get(usedFunctionsURL, {
        params: {
          start: this.date.startDate,
            end: this.date.endDate,
        }
      }).then(res => {
        for(var element of res.data[0]){
        // Daten Array füllen
          this.usedFunctionsSeries.push({
            name: element.name,
            data: element.values
          })
        }
        // Label Array füllen
        for(var name of res.data[1]){
            this.usedFunctionsLabels.push(name)
        }
      }).catch(e => {
        this.error.push(e)
      })
    },
    // leeren alle Arrays
    clearArrays(){
        this.usedFunctionsSeries.length = 0,
        this.sessionInterruptsSeries.length = 0
        this.frequencyOfAcceptanceSeries.length = 0,
        this.usedFunctionsLabels.length = 0,
        this.frequencyOfAcceptanceLabels.length = 0,
        this.sessionInterruptsLabels.length = 0
    },
    refresh() {
      this.clearArrays()
      this.getSessionInterrupts()
      this.getFrequencyOfAcceptance()
      this.getUsedFunctions()
    },
    // Anonymisierung der Berater
    // Hinweis: Funktion funktioniert nicht sobald str.length > 16 -> Evtl Abfrage einbauen sofern Username größer als 8 Zeichen sein darf
    replace(str) {
    let stringMaxLength = 8 // Maximal Länge des gespeicherten Usernames 
    // Erste Hälfte des Strings extrahieren
    str = str.substr(0, (str.length/2))
    let i = str.length
    // String bis zum 8. Zeichen mit * auffüllen
    for(i; i < stringMaxLength; i++){
      str = str + '*'
    }
    return str
    }
  },
  created() {
    this.refresh()
  }
}
</script>