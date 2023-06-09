import { createApp } from "vue";
import App from "./App.vue";
import VueGoogleMaps from "@fawmi/vue-google-maps";
import router from './router'

createApp(App).use(router)
  .use(VueGoogleMaps, {
    load: {
      key: "AIzaSyACFrP3CbvT-A55Ogj7QG8viS46D9rMzoc",
      libraries: "places",
      version: "3.52",
    },
  })
  .mount("#app");
