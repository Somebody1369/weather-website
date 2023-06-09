<template>
  <div class="autocomplete-wrap">
    <GMapAutocomplete
      ref="autocomplete"
      class="my-autocomplete"
      placeholder="Search the city"
      :options="{
        types: ['(cities)'],
        strictBounds: true,
      }"
      @place_changed="onPlaceChanged"
    />
    <img src="@/assets/icons/search.svg" @click="getWeather" />
    <button @click="getWeather">
      <span></span>
      <span class="two"></span>
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cityInput: "",
      countryInput: "",
    };
  },
  methods: {
    onPlaceChanged(place) {
      this.notFound = "";
      const city = place.address_components.find((component) =>
        component.types.includes("locality")
      );
      const country = place.address_components.find((component) =>
        component.types.includes("country")
      );
      if (city && country) {
        this.cityInput = `${city.long_name}`;
        this.countryInput = `${country.long_name}`;
        this.cityCountry = this.cityInput + "," + this.countryInput;
      }
    },
  },
};
</script>
<style lang="css" scoped>
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
