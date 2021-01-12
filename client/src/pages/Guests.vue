<template>
  <div class="full-width">
    <p class="topHeader">Kunden Statistik</p>
    <b-container>
      <b-row>
        <b-col>
          <b-button class="tbtn" v-on:click="getYesterday();refresh();">Letzter Tag</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getLastWeek();refresh();">Letzte Woche</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getLastSevenDays();refresh();">Letzte 7 Tage</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getLastMonth();refresh();">Letzter Monat</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getLastQuarter();refresh();">Letztes Quartal</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getLastYear();refresh();">Letztes Jahr</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getCurrentMonth();refresh();">Aktueller Monat</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getCurrentQuarter();refresh();">Aktuelles Quartal</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getCurrentYear();refresh();">Aktuelles Jahr</b-button>
        </b-col>
      </b-row>
    </b-container>

    <b-container>
      <b-row>
        <b-col>
          <b-form-datepicker class="pickBtn" v-model="startDate"
            :date-format-options="{ year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }" locale="de"
            placeholder="Kein Datum gewählt" v-on:input="refresh()">
          </b-form-datepicker>
        </b-col>
        <b-col>
          <b-form-datepicker class="pickBtn" v-model="endDate"
            :date-format-options="{ year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }" locale="de"
            placeholder="Kein Datum gewählt" v-on:input="setEndDate(); refresh()">
          </b-form-datepicker>
        </b-col>
      </b-row>
    </b-container>

    <b-card no-body class="mb-1">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block href="#" v-b-toggle.accordion-1 variant="info">Systemdiagnose</b-button>
      </b-card-header>
      <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-row>
            <b-col v-for="el in statsIndex" v-bind:key="el[0]" align="center">
              <div id="chart">
                <apexchart ref="chart" type="pie" width="450" :options="chartOptions[el[0]]"
                  :series="series[el[0]].data">
                </apexchart>
              </div>
            </b-col>
            <b-col></b-col>
          </b-row>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body class="mb-1">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block href="#" v-b-toggle.accordion-2 variant="info">Kundenaufkommen</b-button>
      </b-card-header>
      <b-collapse id="accordion-2" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <div id="chart">
            <apexchart :height="500" :options="statsChartOptions" :series="statsSeries"></apexchart>
          </div>
          <b-row>
            <b-col>
              <p :v-model="statsValues[0]"><b>Gesamt: {{statsValues[0]}}</b></p>
            </b-col>
            <b-col>
              <p :v-model="statsValues[1]"><b>Durchschnitt: {{statsValues[1]}}</b></p>
            </b-col>
            <b-col>
              <p :v-model="statsValues[2]"><b>Min: {{statsValues[2]}}</b></p>
            </b-col>
            <b-col>
              <p :v-model="statsValues[3]"><b>Max: {{statsValues[3]}}</b></p>
            </b-col>
          </b-row>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body class="mb-1">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block href="#" v-b-toggle.accordion-3 variant="info">Screen-Sharing Annahme</b-button>
      </b-card-header>
      <b-collapse id="accordion-3" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <div id="chart" align="center">
            <apexchart type="pie" width="380" :options="inviteChartOptions" :series="inviteSeries">
            </apexchart>
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>
</template>

<script>
const axios = require('axios')
const getUseCountURL = 'http://localhost:3000/guests/getUseCounts'
const getStatsURL = 'http://localhost:3000/guests/getStats'
const inviteStatsURL = 'http://localhost:3000/guests/getInviteStats'
const time = require('../assets/time')

export default {
  name: 'guests',
  data() {
    return {
      series: [{
          data: []
        },
        {
          data: []
        },
        {
          data: []
        },
        {
          data: []
        },
        {
          data: []
        }
      ],
      dataSeries: [],
      statsSeries: [],
      statsValues: [],
      chartOptions: [{
          labels: [],
        },
        {
          labels: [],
        },
        {
          labels: [],
        },
        {
          labels: [],
        },
        {
          labels: [],
        }
      ],
      statsChartOptions: {
        chart: {
          type: 'area',
          zoom: {
            enabled: true
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'straight'
        },
        title: {
          text: 'Kundenaufkommen',
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
        },
        theme: {
          palette: 'palette6'
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
      inviteSeries: [],
      inviteChartOptions: {
        title: {
          text: "Screen-Sharing Annahme",
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
      inviteStats: [],
      error: [],
      selected: 0,
      type: [0, 1, 2, 3, 4],
      statsIndex: [
        [0, 'Browser'],
        [1, 'Betriebssystem'],
        [2, 'Kamera'],
        [3, 'Mikrofon'],
        [4, 'Lautsprecher']
      ],
      startDate: time.getSpecificDate('2020-11-01')[0],
      endDate: time.getSpecificDate('2020-11-07')[1]
    }
  },
  methods: {
    getUseCounts() {
      for (let j = 0; j < this.statsIndex.length; j++) {
        axios.get(getUseCountURL, {
          params: {
            start: this.startDate,
            end: this.endDate,
            i: j
          }
        }).then(res => {
          for (let i = 0; i < this.statsIndex.length + 1; i++) {
            this.series[j].data.push(res.data[i].count)
            if (res.data[i]._id) {
              if (res.data[i]._id == 'false')
                this.chartOptions[j].labels.push('Besitzt nicht')
              else if (res.data[i]._id == 'true')
                this.chartOptions[j].labels.push('Besitzt')
              else
                this.chartOptions[j].labels.push(res.data[i]._id)
            } else
              this.chartOptions[j].labels.push('k.A.')
          }
        }).catch(e => {
          this.error.push(e)
        })
      }
    },
    getStats() {
      axios.get(getStatsURL, {
        params: {
          start: this.startDate,
          end: this.endDate
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
          start: this.startDate,
          end: this.endDate
        }
      }).then(res => {
        this.inviteStats = res.data
        for (var elem of res.data) {
          this.inviteSeries.push(elem.count)
          if (elem._id) {
            this.inviteChartOptions.labels.push(elem._id)
          }

        }
      }).catch(e => {
        this.error.push(e)
      })
    },

    getYesterday() {
      this.startDate = time.getYesterday()[0]
      this.endDate = time.getYesterday()[1]
    },
    getLastSevenDays() {
      this.startDate = time.getLastSevenDays()[0]
      this.endDate = time.getLastSevenDays()[1]
    },
    getLastWeek() {
      this.startDate = time.getLastWeek()[0]
      this.endDate = time.getLastWeek()[1]
    },
    getLastMonth() {
      this.startDate = time.getLastMonth()[0]
      this.endDate = time.getLastMonth()[1]
    },
    getLastQuarter() {
      this.startDate = time.getLastQuarter()[0]
      this.endDate = time.getLastQuarter()[1]
    },
    getLastYear() {
      this.startDate = time.getLastYear()[0]
      this.endDate = time.getLastYear()[1]
    },
    getCurrentMonth() {
      this.startDate = time.getCurrentMonth()[0]
      this.endDate = time.getCurrentMonth()[1]
    },
    getCurrentQuarter() {
      this.startDate = time.getCurrentQuarter()[0]
      this.endDate = time.getCurrentQuarter()[1]
    },
    getCurrentYear() {
      this.startDate = time.getCurrentYear()[0]
      this.endDate = time.getCurrentYear()[1]
    },
    setEndDate() {
      let end = this.endDate
      this.endDate = time.getSpecificDate(end)[1]
    },

    async refresh() {
      for (let i = this.series.length - 1; i >= 0; i--) {
        this.series[i].data.length = 0
        this.chartOptions[i].labels.length = 0
      }

      this.statsSeries.length = 0
      this.dataSeries.length = 0

      this.getInviteStats()
      this.getUseCounts()
      this.getStats()
    },
  },
  mounted() {
    for (let i = 0; i < this.statsIndex.length; i++) {
      this.$refs.chart[i].updateOptions({
        title: {
          text: this.statsIndex[i][1],
          align: 'center'
        },
        theme: {
          mode: 'light',
          palette: 'palette3'
        },
        legend: {
          position: 'bottom'
        },
      })
    }
  },
  created() {

    this.refresh()

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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

td, th {
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

.tbtn {
    background-color: #343a40;
    margin: 2px;
    margin-bottom: 5px;
}

.pickBtn {
    margin-bottom: 5px;
}

.full-width {
  padding-right: 50px;
  padding-left: 50px;
}

.btn.btn-info.btn-block.collapsed, .btn.btn-info.btn-block.not-collapsed {
  background-color: #343a40;
  color: #ffffff;
  border: none;
  box-shadow: none;
}

.btn:focus{
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
.offset{
  width: 500px !important;
  margin: 20px auto;  
}
.list-group{
    max-height: 600px;
    margin-bottom: 20px;
    overflow:auto;
    border: 1px solid #ddd;
}

.topHeader {
  text-align: center;
  color: #343a40;
  font-size: 50px;
  font-weight: bold;
}

</style>
