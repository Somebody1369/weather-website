<template>
  <div>
    <InfoWeather />
  </div>
</template>
<script>
import InfoWeather from "@/components/InfoWeather.vue";
export default {
  components: {
    InfoWeather,
  },
};
</script>
<style lang="css" scoped>
.day-week {
  display: flex;
  width: 100%;
  max-width: 150px;
}
h3 {
  padding: 10px;
}
</style>
