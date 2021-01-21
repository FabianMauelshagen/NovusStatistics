<template>
    <div>
        <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
                <b-button block @click="collapse.show = !collapse.show; resize()" variant="dark">{{ cardText }}</b-button>
            </b-card-header>
            <b-collapse v-model="collapse.show" id="collapse-1" class="mt-2" >
                <b-card-body v-if="chartType === 'bar'">
                    <BarChart :data-series="newSeries" :data-labels="newLabels" />
                </b-card-body>
                <b-card-body v-else-if="chartType === 'pie'">
                    <b-row>
                        <b-col v-for="(e, i) in n" :key=i>
                            <PieChart :data-series="newSeries[i]" :data-labels="newLabels[i]" :data-name="newNames[i]" />
                        </b-col>
                        <b-col v-if="n > 1"></b-col>
                    </b-row>
                </b-card-body>
                <b-card-body v-else-if="chartType === 'stacked'">
                    <StackedBarChart :data-series="newSeries" :data-labels="newLabels" />
                </b-card-body>
                <b-card-body v-else-if="chartType === 'line'">
                    <LineChart :data-series="newSeries" :data-labels="newLabels" />
                </b-card-body>
                <b-card-body v-else-if="chartType === 'doubleBar'">
                    <b-row>
                        <b-col>
                            <TimeBarChart :data-series="arrSeries[0]" :data-labels="arrLabels[0]" :stack-bool="newStackBool[0]" />
                        </b-col>
                        <b-col>
                            <TimeBarChart :data-series="arrSeries[1]" :data-labels="arrLabels[1]" :stack-bool="newStackBool[1]" />
                        </b-col>
                    </b-row>
                </b-card-body>

            </b-collapse>
        </b-card>
    </div>
</template>

<script>
import BarChart from './BarChart'
import PieChart from './PieChart'
import StackedBarChart from './StackedBarChart'
import LineChart from './LineChart'
import TimeBarChart from './TimeBarChart'

export default {
    props: ["n", "chartType", "cardText", "newSeries", "newLabels", "arrSeries", "arrLabels", "newStackBool", "newNames"],
    components: {
                PieChart,
                BarChart,
                StackedBarChart,
                LineChart,
                TimeBarChart
    },
    data() {
        return {
            collapse: {
                show: false
            }
        }
    },
    methods: {
        resize() {
            window.dispatchEvent(new Event('resize'))
        },
    },
    mounted(){

    }
}
</script>

<style scoped>
  .card-header.p-1 {
    background-color:  #343a40;
    box-shadow: none;
  }
</style>

