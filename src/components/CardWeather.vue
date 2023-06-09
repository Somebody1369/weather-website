<template>
  <section>
    <div v-if="data.description">
      <h1>{{ place }}</h1>
      <h1>{{ data.temperature.toFixed(0) }}°C</h1>
      <h2>{{ data.description }}</h2>
      <img
        v-if="data.icon"
        :src="`http://openweathermap.org/img/wn/${data.icon}@2x.png`"
        alt=""
      />
    </div>
    <!-- <ul v-if="forecasts.length">
      <li v-for="forecast in forecasts" :key="forecast.date">
        <p>{{ forecast.date }}</p>
        <p>{{ forecast.averageTemperature.toFixed(0) }}</p>
        <p>{{ forecast.description }}</p>
      </li>
    </ul> -->
  </section>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    place: {
      type: String,
    },
    data: {
      type: Object,
    },
  },
};
</script>

<style>
section {
  display: flex;
  align-items: center;
  flex-direction: column;
}
</style>
