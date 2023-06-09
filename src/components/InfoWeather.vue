<template>
  <section>
    <div class="autocomplete-wrap">
      <GMapAutocomplete
        ref="autocomplete"
        class="my-autocomplete"
        placeholder="Search the city"
        :options="autocompleteOptions"
        @place_changed="onPlaceChanged"
      />
      <button class="search" :disabled="disabledSearch || weatherItems.length === 5" @click="getWeather">
        <img src="@/assets/icons/search.svg" />
      </button>
      <button @click="clear">
        <span></span>
        <span class="two"></span>
      </button>
    </div>
    <h3 v-if="notFound">City not found</h3>
    <p v-if="weatherItems.length === 5">There is a maximum number of weather blocks, remove one to add new ones</p>

    <div v-for="(weatherItem, index) in weatherItems" :key="index" class="weather-block">
      <button class="delete-button" v-if="weatherItems.length > 1" @click="removeWeatherItem(index)">
        <span></span>
        <span class="two"></span>
      </button>
      <CardWeather :place="weatherItem.location" :data="weatherItem.data" />
      <div v-if="hasChartData(weatherItem)">
        <LineChart :chartData="weatherItem.chartData" />
      </div>
    </div>
  </section>
</template>

<script>
import LineChart from "./LineChart.vue";
import CardWeather from "./CardWeather.vue";

export default {
  data() {
    return {
      autocompleteOptions: {
        types: ['(cities)'],
        strictBounds: true,
      },
      disabledSearch: false,
      cityInput: "",
      countryInput: "",
      weatherItems: [],
      notFound: false,
    };
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
          this.weatherItems.unshift(weatherData);
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
              description: `${data.weather[0].main}, ${data.weather[0].description}`,
            },
           

 chartData: await this.fetchHourlyData(data.coord.lat, data.coord.lon, apiKey),
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
            temperature: hourlyForecast.map((hour) =>
              hour.temp.toFixed(0)
            ),
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
.weather-block {
  padding: 10px 30px 60px 30px;
  background-color: rgba(135, 206, 250, 0.2);
  border-radius: 40px;
}

button {
  cursor: pointer;
}
.search:disabled {
  opacity: 0.5;
}

.autocomplete-wrap {
  display: flex;
  align-items: center;
}
img {
  margin-left: 15px;
}
button {
  border: none;
  outline: none;

  color: white;
  margin-left: 5px;
  text-decoration: none;
  background: transparent;
}
span {
  width: 20px;
  height: 1.5px;
  display: block;
  background-color: #ffff;
  transform: rotate(-45deg);
}
span.two {
  transform: rotate(45deg);
  position: relative;
  top: -1px;
}
.my-autocomplete {
  background: black;
  color: white;

  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 8px 12px;
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

<!-- <template>
  <div>
    <div>
      <h2>Добавить блок погоды</h2>
      <button @click="addWeatherBlock">+</button>
    </div>

    <div v-for="(weather, index) in weatherBlocks" :key="index">
      <h3>Город: {{ weather.city }}</h3>

      <div>
        <input
          type="text"
          v-model="weather.citySearch"
          @input="searchCities(weather)"
          placeholder="Введите город"
        />
        <ul v-if="weather.showAutocomplete">
          <li
            v-for="(city, cityIndex) in weather.autocompleteCities"
            :key="cityIndex"
            @click="selectCity(weather, city)"
          >
            {{ city }}
          </li>
        </ul>
      </div>

      <div v-if="weather.weatherData">
        <h4>Погода на сегодня</h4>
        <p>Температура: {{ weather.weatherData.main.temp }}°C</p>
        <p>Описание: {{ weather.weatherData.weather[0].description }}</p>
      </div>

      <div v-if="weather.weatherData && weather.weatherData.hourly">
        <h4>Температура по часам</h4>
      </div>

      <button @click="removeWeatherBlock(index)">Удалить</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      weatherBlocks: [
        {
          city: "",
          citySearch: "",
          showAutocomplete: false,
          autocompleteCities: [],
          weatherData: null,
        },
      ],
      apiKey: "f22b2bdb33369bce2a29a33937dda689",
    };
  },
  methods: {
    addWeatherBlock() {
      if (this.weatherBlocks.length < 5) {
        this.weatherBlocks.push({
          city: "",
          citySearch: "",
          showAutocomplete: false,
          autocompleteCities: [],
          weatherData: null,
        });
      } else {
        alert("Максимальное количество блоков погоды достигнуто");
      }
    },
    removeWeatherBlock(index) {
      this.weatherBlocks.splice(index, 1);
    },
    searchCities(weather) {
      if (weather.citySearch) {
        axios
          .get(
            `https://api.openweathermap.org/data/2.5/find?q=${weather.citySearch}&appid=${this.apiKey}`
          )
          .then((response) => {
            weather.autocompleteCities = response.data.list.map(
              (city) => city.name
            );
            weather.showAutocomplete = true;
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        weather.showAutocomplete = false;
        weather.autocompleteCities = [];
      }
    },
    selectCity(weather, city) {
      weather.city = city;
      weather.citySearch = "";
      weather.showAutocomplete = false;
      weather.autocompleteCities = [];

      this.fetchWeatherData(weather);
    },
    fetchWeatherData(weather) {
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/weather?q=${weather.city}&appid=${this.apiKey}&units=metric`
        )
        .then((response) => {
          weather.weatherData = response.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
};
</script> -->
