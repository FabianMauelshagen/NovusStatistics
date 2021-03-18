<!--        Konfigurations File für alle Balken Diagramme            -->
<template>
    <div id="chart">
        <apexchart type="bar" :height="350" :options="chartOptions" :series="dataSeries">
    </apexchart>
    </div>
</template>

<script>
export default {
    props: ["dataSeries", "dataLabels"],
    data() {
        return {
            series: this.dataSeries,
            chartOptions: {
                chart: {
                    type: 'bar'
                },
                plotOptions: {
                    bar: {
                        columnWidth: '45%',
                        distributed: true
                    }
                },
                dataLabels: {
                    enabled: true
                },
                legend: {
                    show: false
                },
                xaxis: {
                    categories: this.dataLabels,
                    labels: {
                        style: {
                            fontSize: '12px'
                        }
                    }
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
            }
        }
    }
}
</script>