<template>
  <div>
    <b-container>
      <b-row>
        <b-col>
          <b-button class="tbtn" v-on:click="getYesterday()">Letzter Tag</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getLastWeek()">Letzte Woche</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getLastSevenDays()">Letzte 7 Tage</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getLastMonth()">Letzter Monat</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getLastQuarter()">Letztes Quartal</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getLastYear()">Letztes Jahr</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getCurrentMonth()">Aktueller Monat</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getCurrentQuarter()">Aktuelles Quartal</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" v-on:click="getCurrentYear()">Aktuelles Jahr</b-button>
        </b-col>
      </b-row>
    </b-container>
    <b-container>
            <b-row>
                <b-col>
                    <b-form-datepicker class="pickBtn" v-model="date.startDate"
                        :date-format-options="{ year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }"
                        locale="de" placeholder="Kein Datum gewählt">
                    </b-form-datepicker>
                </b-col>
                <b-col>
                    <b-form-datepicker class="pickBtn" v-model="date.endDate"
                        :date-format-options="{ year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }"
                        locale="de" placeholder="Kein Datum gewählt" v-on:input="setEndDate()">
                    </b-form-datepicker>
                </b-col>
            </b-row>
        </b-container>
  </div>
</template>

<script>
const time = require('../assets/time')

export default {

  data() {
    return {
      date: {
        startDate: new Date(),
        endDate: new Date()
      }
    }
  },

  methods: {
    getYesterday() {
      this.date.startDate = time.getYesterday()[0]
      this.date.endDate = time.getYesterday()[1]
    },
    getLastSevenDays() {
      this.date.startDate = time.getLastSevenDays()[0]
      this.date.endDate = time.getLastSevenDays()[1]
    },
    getLastWeek() {
      this.date.startDate = time.getLastWeek()[0]
      this.date.endDate = time.getLastWeek()[1]
    },
    getLastMonth() {
      this.date.startDate = time.getLastMonth()[0]
      this.date.endDate = time.getLastMonth()[1]
    },
    getLastQuarter() {
      this.date.startDate = time.getLastQuarter()[0]
      this.date.endDate = time.getLastQuarter()[1]
    },
    getLastYear() {
      this.date.startDate = time.getLastYear()[0]
      this.date.endDate = time.getLastYear()[1]
    },
    getCurrentMonth() {
      this.date.startDate = time.getCurrentMonth()[0]
      this.date.endDate = time.getCurrentMonth()[1]
    },
    getCurrentQuarter() {
      this.date.startDate = time.getCurrentQuarter()[0]
      this.date.endDate = time.getCurrentQuarter()[1]
    },
    getCurrentYear() {
      this.date.startDate = time.getCurrentYear()[0]
      this.date.endDate = time.getCurrentYear()[1]
    },
    setEndDate() {
      let end = this.date.endDate
      if(time.getSpecificDate(end)[0] <= this.date.startDate){
        this.date.startDate = time.getSpecificDate(end)[0]
      }
      this.date.endDate = time.getSpecificDate(end)[1]
    },
  },

  watch: {
    date:{
      handler: function(newVal) { 
        this.$emit('date-changed', newVal)
        
      },
      deep: true
   }
  }
}
</script>

<style scoped>
.tbtn {
    background-color: #343a40;
    margin: 2px;
    margin-bottom: 5px;
}

.pickBtn {
    margin-bottom: 5px;
}
</style>