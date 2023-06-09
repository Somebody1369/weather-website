<template>
  <section>
    <ModalPopup :cancel="cancelButton" :message="modalMessage" ref="modal" />

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
        :disabled="
          disabledSearch ||
          weatherItems.length === 5 ||
          !cityInput ||
          !countryInput
        "
        @click="getWeather"
      >
        <img src="@/assets/icons/search.svg" />
      </button>
      <button
        v-if="cityInput || countryInput"
        class="delete-button"
        @click="clear"
      >
        <span></span>
        <span class="two"></span>
      </button>
    </div>
    <h3 v-if="notFound">City not found</h3>
    <p v-if="weatherItems.length === 5">
      There is a maximum number of weather blocks, remove one to add new ones
    </p>
    <div class="loader" v-if="preloader">loading</div>
    <div class="blocks" v-if="weatherItems.length">
      <div
        v-for="(weatherItem, index) in weatherItems"
        :key="index"
        class="weather-block"
      >
        <div class="action-btns">
          <button
            :class="{ favoriteAlready: isFavorite(weatherItem) }"
            class="add-to-favorites"
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
          <div v-if="weatherItem.chartType === 'Day'" class="chart-wrapper">
            <LineChart :chartData="weatherItem.chartData" />
          </div>
          <div
            v-else-if="weatherItem.chartType === '5Days'"
            class="chart-wrapper"
          >
            <LineChart :chartData="weatherItem.daysChartData" />
          </div>
        </div>
      </div>
    </div>
    <h2 v-else>
      Nothing here<br />Add cities to your favorites on the Homepage
    </h2>
  </section>
</template>

<script>
import LineChart from "@/components/LineChart.vue";
import CardWeather from "@/components/CardWeather.vue";
import ModalPopup from "@/components/ModalPopup.vue";

export default {
  data() {
    return {
      autocompleteOptions: {
        types: ["(cities)"],
        strictBounds: true,
      },
      forecastChartData: [],
      disabledSearch: false,
      preloader: false,
      cityInput: "",
      countryInput: "",
      userCity: [],
      weatherItems: [],
      favoritesItems: [],
      notFound: false,
      modalMessage: "Are you sure?",
      cancelButton: true,
    };
  },
  created() {
    this.weatherItems = JSON.parse(localStorage.getItem("weatherItems")) || [];
    this.favoritesItems =
      JSON.parse(localStorage.getItem("favoritesItems")) || [];
  },
  mounted() {
    const isCityRequested = localStorage.getItem('isCityRequested');
    if (!isCityRequested) {
      this.getCityByIP();
      localStorage.setItem('isCityRequested', 'true');
    }
  },
  methods: {
    async getCityByIP() {
      try {
        const response = await fetch(
          "https://api.ipgeolocation.io/ipgeo?apiKey=bb9c45bc76b34077bcdc04b0c73db009"
        );
        const data = await response.json();
        // console.log(data.city, data.country_name, data.latitude, data.longitude);
        if(response.ok) {
          this.cityInput = data.city;
          this.countryInput = data.country_name;
          this.getWeather();
        }
      } catch (error) {
        console.error(error);
      }
    },
    isFavorite(weatherItem) {
      return this.favoritesItems.some(
        (item) => JSON.stringify(item) === JSON.stringify(weatherItem)
      );
    },
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
      this.preloader = false;
      this.notFound = true;
    },
    async getWeather() {
      this.disabledSearch = true;
      this.preloader = true;
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
            this.modalMessage = "City already added";
            this.cancelButton = false;
            await this.$refs.modal.openModal();
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
            daysChartData: await this.fetch5DaysData(city, country, apiKey),
            chartType: "Day",
          };

          this.preloader = false;
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
    async fetch5DaysData(city, country, apiKey) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&units=metric&appid=${apiKey}`;

        const response = await fetch(url);
        const forecastData = await response.json();
        if (response.ok) {
          const dailyForecasts = {};
          let timeArray = [];
          let temperatureArray = [];
          forecastData.list.forEach((item) => {
            const date = item.dt_txt.split(" ")[0];

            if (!dailyForecasts[date]) {
              dailyForecasts[date] = {
                temperatures: [],
                description: item.weather[0].description,
              };
            }

            dailyForecasts[date].temperatures.push(item.main.temp);
          });

          for (const date in dailyForecasts) {
            const temperatures = dailyForecasts[date].temperatures;
            const averageTemperature = (
              temperatures.reduce((sum, temp) => sum + temp, 0) /
              temperatures.length
            ).toFixed(0);
            const day = new Date(date).getDate();
            timeArray.push(day);
            temperatureArray.push(averageTemperature);
          }
          const forecasts = {
            time: timeArray,
            temperature: temperatureArray,
          };
          return forecasts;
        } else {
          this.handleError(forecastData);
          return null;
        }
      } catch (error) {
        this.handleError(error);
        return null;
      }
    },
    async removeWeatherItem(index) {
      try {
        this.modalMessage = "Remove weather block?";
        this.cancelButton = true;
        await this.$refs.modal.openModal();
        this.weatherItems.splice(index, 1);
        localStorage.setItem("weatherItems", JSON.stringify(this.weatherItems));
      } catch (error) {
        console.log("Action canceled");
        return 0;
      }
    },
    async addToFavotires(item, index) {
      const existingWeatherData = this.favoritesItems.find(
        (i) => JSON.stringify(i) === JSON.stringify(item)
      );

      if (!existingWeatherData) {
        if (this.favoritesItems.length < 5) {
          this.favoritesItems.unshift(item);
          localStorage.setItem(
            "favoritesItems",
            JSON.stringify(this.favoritesItems)
          );
        } else {
          this.modalMessage =
            "There is a maximum number of favorites (5). Remove one to add new ones.";
          this.cancelButton = false;
          await this.$refs.modal.openModal();
          return 0;
        }
      } else {
        try {
          this.modalMessage =
            "City is already added. Do you want remove it from favorites?";
          this.cancelButton = true;
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
  components: { CardWeather, LineChart, ModalPopup },
};
</script>

<style lang="css" scoped>
button.favoriteAlready.add-to-favorites img {
  filter: invert(64%) sepia(54%) saturate(1529%) hue-rotate(168deg)
    brightness(98%) contrast(102%);
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
button.add-to-favorites,
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

.loader,
.loader:before,
.loader:after {
  border-radius: 50%;
  width: 2.5em;
  height: 2.5em;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation: load7 1.8s infinite ease-in-out;
  animation: load7 1.8s infinite ease-in-out;
}
.loader {
  color: #d0dbff;
  font-size: 10px;
  margin: 80px auto;
  position: relative;
  text-indent: -9999em;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}
.loader:before,
.loader:after {
  content: "";
  position: absolute;
  top: 0;
}
.loader:before {
  left: -3.5em;
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}
.loader:after {
  left: 3.5em;
}
@-webkit-keyframes load7 {
  0%,
  80%,
  100% {
    box-shadow: 0 2.5em 0 -1.3em;
  }
  40% {
    box-shadow: 0 2.5em 0 0;
  }
}
@keyframes load7 {
  0%,
  80%,
  100% {
    box-shadow: 0 2.5em 0 -1.3em;
  }
  40% {
    box-shadow: 0 2.5em 0 0;
  }
}
</style>
