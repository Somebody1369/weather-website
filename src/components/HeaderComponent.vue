<template>
  <header>
    <h1 class="logo">Weathy</h1>
    <div class="links">
      <h2>MAIN</h2>
      <h2>FAVORITES</h2>
    </div>
  </header>
</template>
<script>
export default {
  data() {
    return {
    };
  },
};
</script>

<style lang="css" scoped>
header,
.links {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
h2 {
  text-align: center;
  color: white;
  font-weight: 400;
  margin: 0;
  width: 100%;
  max-width: 150px;
}
h2 + h2 {
  margin-left: 36px;
}
.logo {
  text-transform: uppercase;
  text-align: left;
  color: white;
  font-family: "Rubik Puddles", cursive;
}
</style>