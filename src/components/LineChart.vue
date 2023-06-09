<template>
  <canvas style="width: 100% !important" ref="chart"></canvas>
</template>

<script>
import { defineComponent } from "vue";
import {
  Chart,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";

Chart.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

export default defineComponent({
  props: {
    chartData: Object,
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    async renderChart() {
      const ctx = this.$refs.chart.getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: this.chartData.time,
          datasets: [
            {
              label: "Temperature",
              data: this.chartData.temperature,
              borderColor: "rgba(255, 255, 255, 1)",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: false,
              responsive: true,
              maintainAspectRatio: false,
              suggestedMin: Math.min(...this.chartData.temperature) - 1,
              suggestedMax: Math.max(...this.chartData.temperature) + 1,
              ticks: {
                color: "rgba(255, 255, 255, 1)",
              },
            },
            x: {
              type: "category",
              ticks: {
                color: "rgba(255, 255, 255, 1)", // Устанавливаем белый цвет текста меток по оси X
              },
            },
          },
        },
      });
    },
  },
});
</script>

<style>
canvas {
  margin: 0 auto;
  width: 100% !important;
  display: block;
  box-sizing: border-box;
  height: auto !important;
  @media screen and (max-width: 540px) {
    width: 300px;
  }
}
</style>
