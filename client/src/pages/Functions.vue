<template>
    <div class="full-width">
        <p class="topHeader">Funktions Statistik</p>
        <time-component v-on:date-changed="date = $event; refresh()"></time-component>
        <div>
            <Card chart-type="doubleBar" :arr-series="[series, stackedSeries]" :arr-labels="[labArr, labArr]" :new-stack-bool="[false, true]" card-text="Nutzungs Häufigkeit"/>
 
            <b-card no-body class="mb-1">
                <b-card-header header-tag="header" class="p-1" role="tab">
                    <b-button block @click="collapse2.show = !collapse2.show" variant="dark">Nutzungs Dauer
                    </b-button>
                </b-card-header>
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
import de from "apexcharts/dist/locales/de.json"
import Card from '../components/Card'

const time = require('../assets/time')
var labArr = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

export default {
    name: 'chatsessions',
    components: {
        Card
    },
    data() {
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

        getBusyTimes() {

            axios.get(getBusyTimesURL, {
                params: {
                    start: this.date.startDate,
                    end: this.date.endDate,
                }
            }).then(res => {
                let valArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                let i = 0
                let zero = true
                for (var elem of labArr) {
                    for (var el of res.data) {
                        if (elem == el._id) {
                            valArr[i] = el.count
                            zero = false
                        }
                    }
                    i++
                }
                if(zero) valArr.length = 0
                this.series = [{
                    name: 'Nutzungen',
                    data: valArr
                }]
            }).catch(e => {
                this.error.push(e)
            })
        },
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

        calcEachDay(array, funcIndex) {
            axios.get(calcEachDayURL, {
                params: {
                    start: this.date.startDate,
                    end: this.date.endDate,
                    index: funcIndex
                }
            }).then(val => {
                for (var elem of val.data) {
                    let zero = true
                    for(var data of elem.data){
                        if(data[1] != 0) zero = false
                    }
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

        populateFunctionSeries() {
            this.clearFunctionArrays()
            for (var i = 0; i < 4; i++) {
                this.calcEachDay(this.functionSeries[i], i)
            }
        },

        populateFunctionStats() {
            for (var i = 0; i < 4; i++) {
                this.calcTotalDurations(this.functionStats[i], i)
            }
        },

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

<style>
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
    background-color: #343a40;
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
