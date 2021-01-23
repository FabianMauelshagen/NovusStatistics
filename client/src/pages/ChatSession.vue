<template>
    <div class="full-width">
        <p class="topHeader">Sitzungs Statistik</p>
        <time-component v-on:date-changed="date = $event; refresh()"></time-component>
        <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
                <b-button block @click="collapse1.show = !collapse1.show; resize()" variant="dark">Allgemein</b-button>
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
                            <p class="topP" :v-model="avgStats[0]"><b>Sitzungen:</b> {{avgStats[0]}} </p>

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
                <b-button block @click="collapse2.show = !collapse2.show; resize()" variant="dark">Behandelte Themen</b-button>
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
        
        <Card chart-type="line" :new-series="series" :new-labels="durationStats" card-text="Sitzungs Dauer"/>

    </div>
</template>

<script>
const axios = require('axios')
const getDurationsURL = 'http://localhost:3000/chatsessions/getDurations'
const getAvgStatsURL = 'http://localhost:3000/chatsessions/getAvgStats'
const getUsedFunctionsURL = 'http://localhost:3000/chatsessions/getUsedFunctions'
const ratingsAggregateURL = 'http://localhost:3000/chatsessions/ratingsAggregate'
import Card from '../components/Card'
const time = require('../assets/time')



String.prototype.allReplace = function (obj) {
    var retStr = this
    for (var x in obj) {
        retStr = retStr.replace(new RegExp(x, 'g'), obj[x])
    }
    return retStr
}

export default {
    name: 'chatsessions',
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
                noData: {
                    text: 'Keine Daten verfügbar',
                    align: 'center',
                    verticalAlign: 'middle',
                    style: {
                        fontSize: '20px',
                    }
                }
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
                noData: {
                    text: 'Keine Daten verfügbar',
                    align: 'center',
                    verticalAlign: 'middle',
                    style: {
                        fontSize: '20px',
                    }
                }
            },
            durationStats: [],
            durationSeries: [],
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
                if(res.data[1] !== 0 && res.data[3] !== 0){
                    this.gaSeries = [res.data[1], res.data[3]]
                } else {
                    this.gaSeries = []
                }
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
        resize() {
            window.dispatchEvent(new Event('resize'))
        },
    },
    created() {
        this.refresh()
    },
    mounted(){
        this.resize()
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

button {
    font-weight: bold;
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
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    font-size: 65px;
    font-weight: bold;
}

.topP{
    margin-top: 40px;
}

</style>
