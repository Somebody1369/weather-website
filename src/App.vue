<template>
  <HeaderComponent />
  <HomePage />
</template>

<script>
import HeaderComponent from "@/components/HeaderComponent.vue";
import HomePage from "./views/HomePage.vue";

export default {
  name: "App",
  components: {
    HomePage,
    HeaderComponent,
  },
};
</script>

<style>
@import "./assets/styles/index.css";
#app {
  font-family: "Poppins", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0;
  margin: 0 auto;
}
</style>
