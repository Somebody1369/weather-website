<template>
  <div class="favorites">
    <ModalPopup :cancel="cancelButton" :message="modalMessage" ref="modal" />

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
          <div class="chart-type">
            <h3
              :class="{ active: weatherItem.chartType === 'Day' }"
              @click="() => (weatherItem.chartType = 'Day')"
            >
              Day
            </h3>
            |
            <h3
              :class="{ active: weatherItem.chartType === '5Days' }"
              @click="() => (weatherItem.chartType = '5Days')"
            >
              5 Days
            </h3>
          </div>
          <div v-if="weatherItem.chartType === 'Day'">
            <LineChart :chartData="weatherItem.chartData" />
          </div>
          <div v-else-if="weatherItem.chartType === '5Days'">
            <LineChart :chartData="weatherItem.daysChartData" />
          </div>
        </div>
      </div>
    </div>
    <h2 v-else>
      Nothing here<br />Add cities to your favorites on the Homepage
    </h2>
  </div>
</template>
<script>
import LineChart from "@/components/LineChart.vue";
import CardWeather from "@/components/CardWeather.vue";
import ModalPopup from "@/components/ModalPopup.vue";

export default {
  components: { CardWeather, LineChart, ModalPopup },
  data() {
    return {
      chartType: "Day",
      favoritesItems: [],
      modalMessage: "",
      cancelButton: true,
    };
  },
  created() {
    this.favoritesItems =
      JSON.parse(localStorage.getItem("favoritesItems")) || [];
      console.log(this.favoritesItems);
  },
  methods: {
    async removeFromFavotires(index) {
      try {
        this.modalMessage =
          "Do you want remove the city from favorites?";
        await this.$refs.modal.openModal();
        this.favoritesItems.splice(index, 1);
        localStorage.setItem(
          "favoritesItems",
          JSON.stringify(this.favoritesItems)
        );
      } catch (error) {
        console.log("Action canceled");
        return 0;
      }
    },
  },
};
</script>

<style lang="css" scoped>
.favorites {
  color: white;
  display: flex;
    align-items: center;
    flex-direction: column;
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
