<template>
  <div class="top-bar">
    <div>
      <label for="url">URL</label>
      <input id="url" v-model="url" type="text" @input="initMap" />
    </div>
    <div id="mouse-position"></div>
    <small>{{ m.config.map }}</small>
  </div>
  <div id="map" class="map"></div>
</template>

<script>
import { log } from '@/utils/app.utils.js';
import * as map from '@/utils/map.utils.js';

export default {
  name: 'App',
  data() {
    return {
      url: 'https://raw.githubusercontent.com/TwinDragon/SCS_Map_Tiles/master/'
    };
  },
  computed: {
    m() {
      return map.d;
    }
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      map.d.ready = false;
      map
        .init(this.url)
        .then(() => {
          this.ready = true;
        })
        .catch((e) => {
          const errorMessage = e.message || e;
          log(`Unknown error: ${errorMessage}`, 'MAPS_INIT', 'ERROR');
        });
    }
  }
};
</script>

<style lang="scss">
@import 'assets/scss/app';
</style>
