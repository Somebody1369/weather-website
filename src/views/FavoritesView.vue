<template>
  <div class="favorites">
    <div class="blocks" v-if="favoritesItems.length">
    <div
      v-for="(weatherItem, index) in favoritesItems"
      :key="index"
      class="weather-block"
    >
      <button class="delete-button" @click="removeFromFavotires(index)">
        <span></span>
        <span class="two"></span>
      </button>
      <CardWeather :place="weatherItem.location" :data="weatherItem.data" />
      <div>
        <LineChart :chartData="weatherItem.chartData" />
      </div>
    </div>
    </div>
    <h2 v-else>Nothing here<br>Add cities to your favorites on the Homepage</h2>
  </div>
</template>
<script>
import LineChart from "@/components/LineChart.vue";
import CardWeather from "@/components/CardWeather.vue";

export default {
  components: { CardWeather, LineChart },
  data() {
    return {
      favoritesItems: [],
    };
  },
  created() {
    this.favoritesItems =
      JSON.parse(localStorage.getItem("favoritesItems")) || [];
  },
  methods: {
    removeFromFavotires(index) {
      this.favoritesItems.splice(index, 1);
      localStorage.setItem(
        "favoritesItems",
        JSON.stringify(this.favoritesItems)
      );
    },
  },
};
</script>

<style lang="css" scoped>
.favorites {
  color: white;
}

h2 {
  text-align: center;
}
button.delete-button {
  cursor: pointer;
  display: block;
  margin: 0 0 0 auto;
}
.search:disabled {
  opacity: 0.5;
  cursor: none;
}

.autocomplete-wrap {
  display: flex;
  align-items: center;
}
img {
  margin-left: 15px;
}
</style>
