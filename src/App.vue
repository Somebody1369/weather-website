<template>
  <main>
    <nav>
      <img class="logo" src="@/assets/logo.png" alt="logo"/>
      <router-link to="/">Home</router-link> |
      <router-link to="/favorites">Favorites</router-link>
    </nav>
    <router-view />
  </main>
</template>

<style lang="css">
@import "./assets/styles/index.css";

.logo {
  height: 50px;
}


nav {
  padding: 30px;
}

nav a {
  font-size: 24px;
  text-decoration: none;
  font-weight: bold;
  color: #2c3e50;
  margin-right: 10px;

  @media screen and (max-width: 640px) {
    font-size: 16px;
  }
}

a + a {
  margin-left: 10px;
  margin-right: 0;
}

nav a.router-link-exact-active {
  color: #d0dbff;
}
</style>
