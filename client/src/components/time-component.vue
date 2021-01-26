<template>
  <div>
    <b-container>
      <b-row>
        <b-col>
          <b-button class="tbtn" :disabled="isLoading[0]" v-on:click="clicked(0); getYesterday()">Letzter Tag</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" :disabled="isLoading[1]" v-on:click="clicked(1); getLastWeek()">Letzte Woche</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" :disabled="isLoading[2]" v-on:click="clicked(2); getLastSevenDays()">Letzte 7 Tage</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" :disabled="isLoading[3]" v-on:click="clicked(3); getLastMonth()">Letzter Monat</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" :disabled="isLoading[4]" v-on:click="clicked(4); getCurrentMonth()">Aktueller Monat</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" :disabled="isLoading[5]" v-on:click="clicked(5); getLastQuarter()">Letztes Quartal</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" :disabled="isLoading[6]" v-on:click="clicked(6); getCurrentQuarter()">Aktuelles Quartal</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" :disabled="isLoading[7]" v-on:click="clicked(7); getLastYear()">Letztes Jahr</b-button>
        </b-col>
        <b-col>
          <b-button class="tbtn" :disabled="isLoading[8]" v-on:click="clicked(8); getCurrentYear()">Aktuelles Jahr</b-button>
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
      isLoading: [
        null, null, null, null, null, null, null, null, null
      ],
      date: {
        startDate: new Date(),
        endDate: new Date()
      }
    }
  },

  methods: {
    clicked(val) {
      for (let i = 0; i < this.isLoading.length; i++) {
        this.isLoading[i] = false
        this.isLoading[val] = true
      }
    },
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
    font-weight: bold;
    border: none;
}

.tbtn:active, .tbtn:hover{
    background-color: #7EF6B6!important;
    color: #595959;
}

.tbtn:disabled {
    background-color: #7EF6B6;
    color: black;
}

.pickBtn {
    margin-bottom: 5px;
}

</style>