<template>
    <div>
        <Header header="Sitzungs Statistik" />
        <time-component v-on:date-changed="date = $event; refresh()"></time-component>
        <b-card no-body class="mb-1">
                <b-button block @click="collapse1.show = !collapse1.show; resize()" variant="dark">Allgemein</b-button>
            <b-collapse v-model="collapse1.show" id="collapse-1" class="mt-2">
                <b-card-body>
                    <b-row>
                        <b-col>
                            
                            <b-table id="functionTable" striped hover :items="usedFunctions" :fields="tableHeaders" :per-page="perPage"
                                :current-page="currentPage"></b-table>
                                <b-row>
                                <b-pagination class="ml-3" v-model="currentPage" :total-rows="rows" :per-page="perPage">
                                </b-pagination>
                                <b-button class="tbtn"  @click="csvExport(usedFunctions)"><b-icon icon="download"></b-icon> CSV</b-button>
                            </b-row>
                            
                        </b-col>
                        <b-col>
                            <PieChart :data-series="gaSeries" :data-labels="gaLabels" data-name="Anzahl Gäste und Berater" pie-size="450"/>
                            
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
                <b-button block @click="collapse2.show = !collapse2.show; resize()" variant="dark">Behandelte Themen</b-button>
            <b-collapse v-model="collapse2.show" id="collapse-2" class="mt-2">
                <b-card-body>
                    <b-row>
                        <b-col>
                            <b-list-group>
                                <b-list-group-item><b>Nicht genutz</b></b-list-group-item>
                                <b-list-group-item v-for="(elem, index) in ratingStats[2]" v-bind:index="index"
                                    v-bind:key="index">{{elem}}</b-list-group-item>
                            </b-list-group>
                        </b-col>
                        <b-col>
                            <b-list-group class="mb-4">
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
                            <b-button class="csv2"  @click="csvExport(ratingStats)"><b-icon icon="download"></b-icon> CSV</b-button>
                        </b-col>
                        <b-col>
                            <PieChart :data-series="ratings" :data-labels="ratingLabels" data-name="Themen Nutzung" pie-size="600"/>
                        </b-col>
                    </b-row>
                </b-card-body>
            </b-collapse>
        </b-card>
        
        <Card chart-type="line" :new-series="series" :new-labels="durationStats" card-text="Sitzungs Dauer" :new-title="['Sitzungs Dauer', 'in Minuten']"/>

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
import PieChart from '../components/PieChart'
import Header from '../components/Header'

// Funktion zum Ersetzen von String A durch String B
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
    Card,
    PieChart,
    Header
    },
    data() {
        return {
            collapse1: {
                show: false
            },
            collapse2: {
                show: false
            },
            series: [],
            gaSeries: [],
            gaLabels: ['Gäste', 'Berater'],
            avgStats: [],
            minStats: [],
            maxStats: [],
            ratingStats: [],
            ratingLabels: [],
            ratings: [],
            currentPage: 1,
            perPage: 9,
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
                        this.ratingLabels.push(elem.title)
                    }
                }
                this.ratings = arr
            }).catch(e => {
                this.error.push(e)
            })
        },

        csvExport(arrData) {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += [
                Object.keys(arrData[0]).join(";"),
                ...arrData.map(item => Object.values(item).join(";"))
            ]
                .join("\n")
                .replace(/(^\[)|(\]$)/gm, "");

            const data = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", data);
            link.setAttribute("download", "export.csv");
            link.click();
        },

        async refresh() {
            this.ratingLabels.length = 0
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

    #functionTable{
        
    }

    .tbtn {
        position: absolute;
        right: 0px;
        width: 15%;
        margin-right: 2%;
    }

    .csv2 {
        background-color: #343a40 !important;
        margin-top: 25px;
        font-weight: bold;
        border: none !important;
    }

    .csv2:active {
        background-color: #3c4249 !important;
        color: #7EF6B6 !important;
    }

    .csv2:disabled,
    .csv2:hover {
        background-color: #7EF6B6 !important;
        color: #343a40 !important;
        border: none;
    }
</style>
