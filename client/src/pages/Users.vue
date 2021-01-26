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
    getUsedFunctions() {
      axios.get(usedFunctionsURL, {
        params: {
          start: this.date.startDate,
            end: this.date.endDate,
        }
      }).then(res => {
        for(var element of res.data[0]){
          this.usedFunctionsSeries.push({
            name: element.name,
            data: element.values
          })
        }
        for(var name of res.data[1]){
            this.usedFunctionsLabels.push(name)
        }
      }).catch(e => {
        this.error.push(e)
      })
    },
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
    replace(str) {
    str = str.substr(0, (str.length/2))
    let i = str.length
    for(i; i < 8; i++){
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