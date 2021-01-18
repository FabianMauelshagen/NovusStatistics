<template>
    <div class="full-width">
        <p class="topHeader">ChatSession Statistik</p>
        <time-component v-on:date-changed="date = $event; refresh()"></time-component>
        <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
                <b-button block @click="collapse1.show = !collapse1.show" variant="dark">Allgemein</b-button>
            </b-card-header>
            <b-collapse v-model="collapse1.show" id="collapse-1" class="mt-2">
                <b-card-body>
                    <b-row>
                        <b-col>
                            <b-table striped hover :items="usedFunctions" :fields="tableHeaders" :per-page="perPage"
                                :current-page="currentPage"></b-table>
                            <b-pagination v-model="currentPage" :total-rows="rows" :per-page="perPage" pills>
                            </b-pagination>
                        </b-col>
                        <b-col>
                            <div id="chart" align="center">
                                <apexchart type="pie" width="450" :options="gaChartOptions" :series="gaSeries">
                                </apexchart>
                            </div>
                            <p :v-model="avgStats[0]"><b>Sitzungen:</b> {{avgStats[0]}} </p>

                            <p :v-model="avgStats[1]"><b>Gäste Gesamt:</b> {{avgStats[1]}} <span
                                    :v-model="avgStats[2]"><b>Pro Sitzung:</b>
                                    {{avgStats[2]}}</span></p>

                            <p :v-model="avgStats[3]"><b>Berater Gesamt:</b> {{avgStats[3]}} <span
                                    :v-model="avgStats[4]"><b>Pro Sitzung:</b>
                                    {{avgStats[4]}}</span></p>
                        </b-col>
                    </b-row>
                </b-card-body>
            </b-collapse>
        </b-card>

        <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
                <b-button block @click="collapse2.show = !collapse2.show" variant="dark">Behandelte Themen</b-button>
            </b-card-header>
            <b-collapse v-model="collapse2.show" id="collapse-2" class="mt-2">
                <b-card-body>
                    <b-row>
                        <b-col>
                            <b-list-group>
                                <b-list-group-item><b>Seltenste Themen</b></b-list-group-item>
                                <b-list-group-item v-for="(elem, index) in minStats[0]" v-bind:index="index"
                                    v-bind:key="index">{{elem}}</b-list-group-item>
                                <b-list-group-item><b>Anzahl: {{minStats[1]}}</b></b-list-group-item>
                            </b-list-group>
                            <b-list-group>
                                <b-list-group-item><b>Häufigste Themen</b></b-list-group-item>
                                <b-list-group-item v-for="(elem, index) in maxStats[0]" v-bind:index="index"
                                    v-bind:key="index">{{elem}}</b-list-group-item>
                                <b-list-group-item><b>Anzahl: {{maxStats[1]}}</b></b-list-group-item>
                            </b-list-group>
                        </b-col>
                        <b-col>
                            <div id="chart" align="center">
                                <apexchart type="pie" width="700" :options="ratingOptions" :series="ratings">
                                </apexchart>
                            </div>
                        </b-col>
                        <b-col>
                            <b-list-group>
                                <b-list-group-item><b>Nicht genutz</b></b-list-group-item>
                                <b-list-group-item v-for="(elem, index) in ratingStats[2]" v-bind:index="index"
                                    v-bind:key="index">{{elem}}</b-list-group-item>
                            </b-list-group>
                        </b-col>
                    </b-row>

                </b-card-body>
            </b-collapse>
        </b-card>

        <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
                <b-button block @click="collapse3.show = !collapse3.show" variant="dark">ChatSession Dauer</b-button>
            </b-card-header>
            <b-collapse v-model="collapse3.show" id="collapse-3" class="mt-2">
                <b-card-body>
                    <div id="chart" align="center">
                        <apexchart :height="600" :options="chartOptions" :series="series">
                        </apexchart>
                    </div>
                    <b-row>
                        <b-col>
                            <p :v-model="durationStats[0]"><b>Gesamt: {{durationStats[0]}}</b></p>
                        </b-col>
                        <b-col>
                            <p :v-model="durationStats[1]"><b>Durchschnitt: {{durationStats[1]}}</b></p>
                        </b-col>
                        <b-col>
                            <p :v-model="durationStats[2]"><b>Min: {{durationStats[2]}}</b></p>
                        </b-col>
                        <b-col>
                            <p :v-model="durationStats[3]"><b>Max: {{durationStats[3]}}</b></p>
                        </b-col>
                    </b-row>
                </b-card-body>
            </b-collapse>
        </b-card>
    </div>
</template>

<script>
const axios = require('axios')
const getDurationsURL = 'http://localhost:3000/chatsessions/getDurations'
const getAvgStatsURL = 'http://localhost:3000/chatsessions/getAvgStats'
const getUsedFunctionsURL = 'http://localhost:3000/chatsessions/getUsedFunctions'
const ratingsAggregateURL = 'http://localhost:3000/chatsessions/ratingsAggregate'

const time = require('../assets/time')
import de from "apexcharts/dist/locales/de.json"


String.prototype.allReplace = function (obj) {
    var retStr = this
    for (var x in obj) {
        retStr = retStr.replace(new RegExp(x, 'g'), obj[x])
    }
    return retStr
}

export default {
    name: 'chatsessions',
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
            series: [],
            gaSeries: [],
            avgStats: [],
            minStats: [],
            maxStats: [],
            ratingStats: [],
            ratingOptions: {
                title: {
                    text: "Themen Nutzung",
                    align: 'center'
                },
                theme: {
                    mode: 'light',
                    palette: 'palette3'
                },
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                },
                labels: [],
            },
            ratings: [],
            currentPage: 1,
            perPage: 9,
            gaChartOptions: {
                title: {
                    text: "Anzahl Gäste und Berater",
                    align: 'center'
                },
                theme: {
                    mode: 'light',
                    palette: 'palette3'
                },
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                },
                labels: [],
            },
            durationStats: [],
            durationSeries: [],
            chartOptions: {
                chart: {
                    type: 'area',
                    zoom: {
                        enabled: true
                    },
                    locales: [de],
                    defaultLocale: "de",
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'straight'
                },
                title: {
                    text: 'ChatSession Dauer (In Minuten)',
                    align: 'left'
                },
                grid: {
                    row: {
                        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                        opacity: 0.5
                    },
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
                yaxis: {
                    tickAmount: 20
                },
                theme: {
                    palette: 'palette6'
                },
                markers: {
                    size: 4,
                    colors: '#f3f3f3',
                    strokeColors: '#2e2e2e',
                },
                labels: {
                    show: true,
                    formatter: (val) => {
                        return new Date(val);
                    }
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.7,
                        opacityTo: 0.9,
                        stops: [50, 100]
                    }
                },

            },
            usedFunctions: [],
            tableHeaders: [{
                    key: "_id",
                    sortable: false,
                    label: "Sitzungs ID"
                },
                {
                    key: "createdAt",
                    sortable: true,
                    label: "Datum",
                },
                {
                    key: "type",
                    sortable: false,
                    label: "Funktion",
                },
                {
                    key: "timestamp",
                    sortable: false,
                    label: "Uhrzeit",
                }
            ],
            error: [],
            date: {
                startDate: time.getSpecificDate('2020-11-01')[0],
                endDate: time.getSpecificDate('2020-11-07')[1]
            }
        }
    },
    methods: {


        getDurations() {
            axios.get(getDurationsURL, {
                params: {
                    start: this.date.startDate,
                    end: this.date.endDate
                }
            }).then(res => {
                let arr = []
                this.durationStats = res.data[1]
                for (var elem of res.data[0]) {
                    let time = new Date(elem.createdAt)
                    let dur = new Date(elem.duration)
                    arr.push([time.getTime(), Math.ceil(dur / 60000)])
                }
                this.series = [{
                    name: "Minuten",
                    data: arr
                }]
                this.durationSeries = [{
                    name: "ChatSessions",
                    data: this.series
                }]

            }).catch(e => {
                this.error.push(e)
            })
        },

        getAvgStats() {
            axios.get(getAvgStatsURL, {
                params: {
                    start: this.date.startDate,
                    end: this.date.endDate
                }
            }).then(res => {
                this.avgStats = res.data
                this.gaSeries = [res.data[1], res.data[3]]
                this.gaChartOptions = {
                    labels: ['Gäste', 'Berater']
                }
            }).catch(e => {
                this.error.push(e)
            })
        },

        getUsedFunctions() {
            axios.get(getUsedFunctionsURL, {
                params: {
                    start: this.date.startDate,
                    end: this.date.endDate
                }
            }).then(res => {
                let arr = res.data
                for (var elem of arr) {
                    let str = elem.type
                    elem.type = str.allReplace({
                        "videoChanged": "Video-Chat",
                        "coBrowsingChanged": "Co-Browsing",
                        "screenSharingChanged": "Screen-Sharing",
                        "whiteboardChanged": "Whiteboard"
                    })
                }
                this.usedFunctions = res.data
            }).catch(e => {
                this.error.push(e)
            })
        },

        ratingsAggregate() {
            axios.get(ratingsAggregateURL, {
                params: {
                    start: this.date.startDate,
                    end: this.date.endDate
                }
            }).then(res => {
                this.ratingStats = res.data[1]
                this.minStats = this.ratingStats[0]
                this.maxStats = this.ratingStats[1]
                let arr = []
                for (var elem of res.data[0]) {
                    console.log(elem)
                    arr.push(elem.count)
                    if (elem) {
                        this.ratingOptions.labels.push(elem.title)
                    }
                }
                this.ratings = arr
            }).catch(e => {
                this.error.push(e)
            })
        },

        async refresh() {
            this.ratingOptions.labels.length = 0
            this.getDurations()
            this.getAvgStats()
            this.getUsedFunctions()
            this.ratingsAggregate()
        },
    },
    created() {
        this.refresh()
    },
    computed: {
        rows() {
            return this.usedFunctions.length
        }
    },

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
