<template>
    <div id="chart">
        <apexchart type="bar" :height="350" :options="chartOptions" :series="series">
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
                    type: 'bar',
                    stacked: true,
                    toolbar: {
                        show: true
                    },
                    zoom: {
                        enabled: true
                    }
                },
                responsive: [{
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: 'bottom',
                            offsetX: -10,
                            offsetY: 0
                        }
                    }
                }],
                plotOptions: {
                    bar: {
                        horizontal: false,
                    },
                },
                xaxis: {
                    categories: this.dataLabels
                },
                legend: {
                    position: 'right',
                    offsetY: 40
                },
                fill: {
                    opacity: 1
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