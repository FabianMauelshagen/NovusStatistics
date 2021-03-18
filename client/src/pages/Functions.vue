<!-- Vue File für die Funktions Dimension -->

<template>
    <div>
        <Header header="Funktions Statistik" />
        <time-component v-on:date-changed="date = $event; refresh()"></time-component>
        <div>
            <Card chart-type="doubleBar" :arr-series="[series, stackedSeries]" :arr-labels="[labArr, labArr]" :new-stack-bool="[false, true]" card-text="Nutzungs Häufigkeit"
            :new-title="['Stündliche Nutzung kumuliert - Gesamt', 'Stündliche Nutzung kumuliert - Einzeln']"
            />
 
            <b-card no-body class="mb-1">
                    <b-button block @click="collapse2.show = !collapse2.show; resize()" variant="dark">Nutzungs Dauer</b-button>
                <b-collapse v-model="collapse2.show" id="collapse-2" class="mt-2">
                    <b-card-body id="chart" v-for="(elem, i) in functionStats" v-bind:key="i" v-bind:index="i">
                        <div>
                            <apexchart ref="chart" type="line" height="300" :options="functionLineOptions"
                                :series="functionSeries[i]">
                            </apexchart>
                        </div>
                        <b-row>
                            <b-col>
                                <p :v-model="elem[0]"><b>Gesamt: {{elem[0]}}</b></p>
                            </b-col>
                            <b-col>
                                <p :v-model="elem[1]"><b>Min:
                                        {{  new Date(elem[1]).toLocaleTimeString('de-DE', {timeZone: 'UTC'}) }}</b></p>
                            </b-col>
                            <b-col>
                                <p :v-model="elem[2]"><b>Max:
                                        {{ new Date(elem[2]).toLocaleTimeString('de-DE', {timeZone: 'UTC'}) }}</b></p>
                            </b-col>
                            <b-col>
                                <p :v-model="elem[3]"><b>Durchschnitt:
                                        {{ new Date(elem[3]).toLocaleTimeString('de-DE', {timeZone: 'UTC'}) }}</b></p>
                            </b-col>
                        </b-row>
                    </b-card-body>
                </b-collapse>
            </b-card>

        </div>
    </div>
</template>

<script>
const axios = require('axios')
const getBusyTimesURL = 'http://localhost:3000/functions/getBusyTimes'
const getBusyTimesLoopURL = 'http://localhost:3000/functions/getBusyTimesLoop'
const calcEachDayURL = 'http://localhost:3000/functions/calcEachDay'
const calcTotalURL = 'http://localhost:3000/functions/calcTotal'

// Import des Deutschen Sprachpakets für die ApexCharts
import de from "apexcharts/dist/locales/de.json"

import Card from '../components/Card'
import Header from '../components/Header'

// Import der Zeit Funktionen
const time = require('../assets/time')

// Initialisieren des Stunden Arrays
var labArr = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

export default {
    name: 'chatsessions',
    components: {
        Card,
        Header
    },
    data() {
        // Definieren der lokal genutzten Variablen und Arrays
        return {
            labArr: labArr,
            collapse2: {
                show: false
            },
            series: [],
            stackedSeries: [],
            singleSeries: [],
            error: [],
            date: {
                startDate: time.getSpecificDate('2020-11-01')[0],
                endDate: time.getSpecificDate('2020-11-07')[1]
            },
            // Konfigurationseinstellung des Diagramms
            functionLineOptions: {
                chart: {
                    locales: [de],
                    defaultLocale: "de",
                },
                subtitle: {
                    text: 'in Minuten',
                },
                xaxis: {
                    type: 'datetime',
                    labels: {
                        datetimeFormatter: {
                            year: 'yyyy',
                            month: 'MMM \'yy',
                            day: 'dddd, dd.MMM.',
                            hour: 'HH:mm'
                        },
                    }
                },
                theme: {
                    mode: 'light',
                    palette: 'palette3'
                },
                legend: {
                    position: 'right',
                    horizontalAlign: 'right'
                },
                noData: {
                    text: 'Keine Daten verfügbar',
                    align: 'center',
                    verticalAlign: 'middle',
                    style: {
                        fontSize: '20px',
                    }
                }
            },
            functionSeries: [
                [],
                [],
                [],
                [],
            ],
            functionNames: ['Co-Browsing', 'Video-Chat', 'Screen-Sharing', 'Whiteboard'],

            functionStats: [
                [],
                [],
                [],
                [],
            ],
        }
    },
    methods: {
        // Anzeige der Zeitenspanne, in der die Funktionen verwendet worden sind (bzw. wie lange bestimmte Funktionen benutzt worden sind)
        getBusyTimes() {
            axios.get(getBusyTimesURL, {
                params: {
                    start: this.date.startDate,
                    end: this.date.endDate,
                }
            }).then(res => {
                let valArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                let i = 0
                // Boolean zum test, ob valArr ein reines 0 Array ist
                let zero = true
                // Wenn das Element aus dem Stunden Array labArr mit einem Element aus res.data übereinstimmt wird der Wert in das Werte Array geschrieben
                // Außerdem wird die zero Variable auf false gesetzt, da es dann kein reines 0 Array mehr ist
                for (var elem of labArr) {
                    for (var el of res.data) {
                        if (elem == el._id) {
                            valArr[i] = el.count
                            zero = false
                        }
                    }
                    i++
                }
                // Löschen des Arrays, damit im Diagramm "Keine Daten" angezeigt wird
                if(zero) valArr.length = 0
                this.series = [{
                    name: 'Nutzungen',
                    data: valArr
                }]
            }).catch(e => {
                this.error.push(e)
            })
        },

        // Füllen des Stacked Bar Charts, Loop der getBusyTimes Funktion für alle Funktionen
        getBusyTimesLoop() {
            axios.get(getBusyTimesLoopURL, {
                params: {
                    start: this.date.startDate,
                    end: this.date.endDate,
                }
            }).then(res => {
                for (var elem of res.data) {
                    this.stackedSeries.push({
                        name: elem.name,
                        data: elem.valArr
                    })
                }
            }).catch(e => {
                this.error.push(e)
            })
        },
        // Berechnung der Dauer der Funktionen für einzelne Tage über eine Zeitspanne
        calcEachDay(array, funcIndex) {
            axios.get(calcEachDayURL, {
                params: {
                    start: this.date.startDate,
                    end: this.date.endDate,
                    index: funcIndex
                }
            }).then(val => {
                for (var elem of val.data) {
                    // Boolean für noData
                    let zero = true
                    for(var data of elem.data){
                        if(data[1] != 0) zero = false
                    }
                    // Leeren des Arrays falls es keine Daten enthält (Zur Anzeige von "Keine Daten" im Diagramm)
                    if(!zero){
                        array.push({
                            name: elem.name,
                            data: elem.data
                        })
                    } else {
                        array.push({
                            name: '',
                            data: []
                        })
                    }
                    
                }

            }).catch(e => {
                this.error.push(e)
            })
        },
        //
        calcTotalDurations(array, funcIndex) {
            axios.get(calcTotalURL, {
                params: {
                    start: this.date.startDate,
                    end: this.date.endDate,
                    index: funcIndex
                }
            }).then(val => {
                for (var elem of val.data) {
                    array.push(elem)
                }
            }).catch(e => {
                this.error.push(e)
            })
        },
        // Ausfüllen der Series des Diagramms
        populateFunctionSeries() {
            this.clearFunctionArrays()
            for (var i = 0; i < 4; i++) {
                this.calcEachDay(this.functionSeries[i], i)
            }
        },
        // Ausfüllen der Labels des Diagramms
        populateFunctionStats() {
            for (var i = 0; i < 4; i++) {
                this.calcTotalDurations(this.functionStats[i], i)
            }
        },
        // Leeren alle Arrays
        clearFunctionArrays() {
            for (var elem of this.functionSeries) {
                elem.length = 0
            }
            for (var elemTwo of this.functionStats) {
                elemTwo.length = 0
            }

        },

        refresh() {
            this.stackedSeries.length = 0
            this.getBusyTimes()
            this.getBusyTimesLoop()
            this.populateFunctionSeries()
            this.populateFunctionStats()

        },

        resize() {
            window.dispatchEvent(new Event('resize'))
        },
    },
    mounted() {
        this.resize()
        for (var i = 0; i < this.functionSeries.length; i++) {
            this.$refs.chart[i].updateOptions({
                title: {
                    text: this.functionNames[i]
                }
            })
        }

    },
    created() {
        this.refresh()
    },
    computed: {
        /* rows() {
            
        } */
    },

}
</script>
