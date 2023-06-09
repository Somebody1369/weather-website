<template>
  <section class="card-weather">
    <div class="data-description" v-if="data.description">
      <h1>{{ place }}</h1>
      <h1 class="temp">{{ data.temperature.toFixed(0) }}°C</h1>

      <div class="description-icon">
        <img
          class="weather-icon"
          v-if="data.icon"
          :src="`http://openweathermap.org/img/wn/${data.icon}@2x.png`"
          alt="weather-icon"
        />
        <div class="description">
          <h2>{{ data.descriptionMain }}</h2>
          <h2>{{ data.description }}</h2>
        </div>
      </div>
    </div>
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

.card-weather {
  margin-bottom: 15px;
}

.data-description {
  display: flex;
  align-items: center;
  flex-direction: column;

  text-align: center;
}

h1 {
  font-size: 30px;
  font-weight: 400;
  margin: 20px 0;

  text-align: center;
}
h1.temp {
  color: white;
  font-size: 40px;
  font-weight: 600;
}
h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 400;
  text-align: left;
}

.description-icon {
  display: flex;
  align-items: center;
}

img.weather-icon {
  height: 120px;
}
</style>
