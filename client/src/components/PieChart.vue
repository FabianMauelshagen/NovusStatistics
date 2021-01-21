<template>
    <div class="chart" id="chart" align="center">
        <apexchart type="pie" width="450" :options="chartOptions" :series="dataSeries">
    </apexchart>
    </div>
</template>

<script>
export default {
    props: ["dataSeries", "dataLabels", "dataName"],
    data() {
        return {
            chartOptions: {
                chart: {
                type: 'pie'
                },
                title: {
                text: this.dataName,
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
                labels: this.dataLabels,
                noData: {
                    text: 'Keine Daten verfügbar',
                    align: 'center',
                    verticalAlign: 'middle',
                    style: {
                        fontSize: '20px',
                    }
                }
            },
        }
    },
}
</script>

<style scoped>
.apexcharts-legend-series{
    margin-left: -20px;
    margin-right: -20px;
}
</style>