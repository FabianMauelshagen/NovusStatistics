<template>
    <div id="chart">
            <apexchart ref="statChart" :height="500" :options="chartOptions" :series="dataSeries">
            </apexchart>
    <b-row>
            <b-col>
              <p :v-model="dataLabels[0]"><b>Gesamt: {{dataLabels[0]}}</b></p>
            </b-col>
            <b-col>
              <p :v-model="dataLabels[1]"><b>Durchschnitt: {{dataLabels[1]}}</b></p>
            </b-col>
            <b-col>
              <p :v-model="dataLabels[2]"><b>Min: {{dataLabels[2]}}</b></p>
            </b-col>
            <b-col>
              <p :v-model="dataLabels[3]"><b>Max: {{dataLabels[3]}}</b></p>
            </b-col>
          </b-row>
        </div>
</template>

<script>
import de from "apexcharts/dist/locales/de.json"

export default {
    props: ["dataSeries", "dataLabels"],
    data() {
        return {
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
          palette: 'palette3'
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
        }
    }
}
</script>