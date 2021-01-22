<template>
    <div id="chart">
        <apexchart type="bar" :height="350" :options="chartOptions" :series="dataSeries">
    </apexchart>
    </div>
</template>

<script>
export default {
    props: ["dataSeries", "dataLabels", "stackBool"],
    data() {
        return {
            series: this.dataSeries,
            chartOptions: {
                chart: {
                    stacked: this.stackBool,
                },
                title: {
                    text: 'Stündliche Nutzung kumuliert Gesamt'
                },
                grid: {
                    row: {
                        colors: ['#fff', '#f2f2f2']
                    }
                },
                xaxis: {
                    labels: {
                        formatter: function (value) {
                            return value + ':00'
                        }
                    },
                    categories: this.dataLabels
                },
                theme: {
                    mode: 'light',
                    palette: 'palette3'
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
        }
    }
}
</script>