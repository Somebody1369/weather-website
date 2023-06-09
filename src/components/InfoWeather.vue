<template>
  <section>
    <div class="autocomplete-wrap">
      <GMapAutocomplete
        ref="autocomplete"
        class="my-autocomplete"
        placeholder="Search the city"
        :options="autocompleteOptions"
        @place_changed="onPlaceChanged"
        @keyup.enter="getWeather"
      />
      <button
        class="search"
        :disabled="disabledSearch || weatherItems.length === 5 || !cityInput || !countryInput"
        @click="getWeather"
      >
        <img src="@/assets/icons/search.svg" />
      </button>
      <button v-if="cityInput || countryInput" class="delete-button" @click="clear">
        <span></span>
        <span class="two"></span>
      </button>
    </div>
    <h3 v-if="notFound">City not found</h3>
    <p v-if="weatherItems.length === 5">
      There is a maximum number of weather blocks, remove one to add new ones
    </p>

    <div class="blocks" v-if="weatherItems.length">
    <div
      v-for="(weatherItem, index) in weatherItems"
      :key="index"
      class="weather-block"
    >
      <div class="action-btns">
        <button
          class="add to favorites"
          @click="addToFavotires(weatherItem, index)"
        >
          <img src="@/assets/icons/save.svg" alt="" />
        </button>
        <button
          class="delete-button"
          v-if="weatherItems.length > 1"
          @click="removeWeatherItem(index)"
        >
          <span></span>
          <span class="two"></span>
        </button>
      </div>

      <CardWeather :place="weatherItem.location" :data="weatherItem.data" />
      <div v-if="hasChartData(weatherItem)">
        <div class="chart-type">
          <h3 :class="{ active: chartType === 'Day'}" @click="()=> chartType = 'Day'">Day</h3>
          |
          <h3 :class="{ active: chartType === '5Days'}" @click="()=> chartType = '5Days'">5 Days</h3>
        </div>
        <LineChart :chartData="weatherItem.chartData" />
      </div>
    </div>
    </div>
    <h2 v-else>Nothing here<br>Add cities to your favorites on the Homepage</h2>
  </section>
</template>

<script>
import LineChart from "@/components/LineChart.vue";
import CardWeather from "@/components/CardWeather.vue";

export default {
  data() {
    return {
      chartType: "Day",
      autocompleteOptions: {
        types: ["(cities)"],
        strictBounds: true,
      },
      disabledSearch: false,
      cityInput: "",
      countryInput: "",
      weatherItems: [],
      favoritesItems: [],
      notFound: false,
    };
  },
  created() {
    this.weatherItems = JSON.parse(localStorage.getItem("weatherItems")) || [];
  },
  methods: {
    clear() {
      this.cityInput = "";
      this.countryInput = "";
      this.$refs.autocomplete.$el.value = "";
    },
    onPlaceChanged(place) {
      this.notFound = false;
      const city = place.address_components.find((component) =>
        component.types.includes("locality")
      );
      const country = place.address_components.find((component) =>
        component.types.includes("country")
      );
      if (city && country) {
        this.cityInput = city.long_name;
        this.countryInput = country.long_name;
      }
    },
    handleError(error) {
      console.error("Error fetching weather data:", error);
      this.notFound = true;
    },
    async getWeather() {
      this.disabledSearch = true;
      const apiKey = "7efa332cf48aeb9d2d391a51027f1a71";

      if (this.cityInput && this.countryInput) {
        const weatherData = await this.fetchWeatherData(
          this.cityInput,
          this.countryInput,
          apiKey
        );
        if (weatherData) {
          const existingWeatherData = this.weatherItems.find(
            (item) => item.location === weatherData.location
          );

          if (!existingWeatherData) {
            this.weatherItems.unshift(weatherData);
            localStorage.setItem(
              "weatherItems",
              JSON.stringify(this.weatherItems)
            );
          } else {
            alert("City already added");
          }
        }
        this.cityInput = "";
        this.countryInput = "";
        this.$refs.autocomplete.$el.value = "";
        this.disabledSearch = false;
      }
    },
    async fetchWeatherData(city, country, apiKey) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
          const weatherLocation = `${data.name},${data.sys.country}`;
          const weatherData = {
            location: weatherLocation,
            data: {
              icon: data.weather[0].icon,
              temperature: data.main.temp,
              descriptionMain: data.weather[0].main,
              description: data.weather[0].description,
            },
            chartData: await this.fetchHourlyData(
              data.coord.lat,
              data.coord.lon,
              apiKey
            ),
          };
          return weatherData;
        } else {
          this.handleError(data);
          return null;
        }
      } catch (error) {
        this.handleError(error);
        return null;
      }
    },
    async fetchHourlyData(lat, lon, apiKey) {
      try {
        const apiHourlyUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=daily,minutely,current&appid=${apiKey}&units=metric`;
        const response = await fetch(apiHourlyUrl);
        const hourlyData = await response.json();

        if (response.ok) {
          const hourlyForecast = hourlyData.hourly;
          const chartData = {
            time: hourlyForecast.map((hour) =>
              new Date(hour.dt * 1000).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            ),
            temperature: hourlyForecast.map((hour) => hour.temp.toFixed(0)),
          };
          return chartData;
        } else {
          this.handleError(hourlyData);
          return null;
        }
      } catch (error) {
        this.handleError(error);
        return null;
      }
    },
    removeWeatherItem(index) {
      this.weatherItems.splice(index, 1);
      localStorage.setItem("weatherItems", JSON.stringify(this.weatherItems));
    },
    addToFavotires(item, index) {
      if(this.favoritesItems.length < 6) {
      const existingWeatherData = this.favoritesItems.find(
        (i) => JSON.stringify(i) === JSON.stringify(item)
      );

      if (!existingWeatherData) {
        this.favoritesItems.unshift(item);
        localStorage.setItem(
          "favoritesItems",
          JSON.stringify(this.favoritesItems)
        );
      } else {
        alert("City already added. Do you want remove it from favorites?");
        this.favoritesItems.splice(index, 1);
        localStorage.setItem(
          "favoritesItems",
          JSON.stringify(this.favoritesItems)
        );
      }
    } else {
      alert("There is a maximum number of favorites(5), remove one to add new ones");
    }
    },
    hasChartData(weatherItem) {
      return (
        weatherItem &&
        weatherItem.chartData &&
        weatherItem.chartData.temperature.length > 0
      );
    },
  },
  components: { CardWeather, LineChart },
};
</script>

<style lang="css" scoped>

.chart-type {
  display: flex;
  align-items: center;
}
.chart-type h3 {
  cursor: pointer;
  color: #2c3e50;
  margin-right: 10px;
}
.chart-type h3.active{
  color: #d0dbff;
}
.chart-type h3 + h3 {
  margin-right: 0;
  margin-left: 10px;
}
.search:disabled {
  opacity: 0.5;
  cursor: none;
}

h2 {
  color: white;
  text-align: center;
}

.action-btns {
  display: flex;
  align-items: center;
  justify-content: space-between;

  max-width: 80px;
  margin: 0 0 0 auto;
}
img {
  margin-left: 8px;
}
button img {
  width: 20px;
}
button.add.to.favorites,
.delete-button {
  height: 20px;
  width: 20px;
}

.autocomplete-wrap {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}
.autocomplete-wrap button.delete-button {
  left: 160px;
  position: absolute;
}
.autocomplete-wrap button.delete-button span {
  width: 12px;
}
.my-autocomplete {
  background: black;
  color: white;

  border: 1px solid #ccc;
  border-radius: 20px;
  
  width: 100%;
  max-width: 150px;
  padding: 10px 40px 10px 15px;
}
.pac-container.pac-logo.hdpi {
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
}

.pac-container,
input.my-autocomplete.pac-target-input {
  outline: none;
}
.pac-item {
  cursor: default;
  padding: 0 4px;
  line-height: 30px;
  text-align: left;
  border-top: 3px solid #e6e6e6;
  font-size: 11px;
  /*color: lightgrey;*/
}
span.pac-item-query {
  /*color: white;*/
  color: #000;
}
.pac-logo:after {
  background-image: none !important;
  height: 0px;
}
</style>
