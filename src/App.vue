<template>
  <form class="top-bar">
    <div class="d-flex">
      <div class="col m-1">
        <label for="url" class="form-label">URL</label>
        <input
          id="url"
          v-model="url"
          type="text"
          class="form-control"
          @input="initMap"
        />
      </div>
      <div class="col m-1">
        <label for="position-x" class="form-label">X</label>
        <input
          id="position-x"
          v-model="position.x"
          type="number"
          class="form-control"
          step="0.001"
          @input="changePosition"
        />
      </div>
      <div class="col m-1">
        <label for="position-y" class="form-label">Y</label>
        <input
          id="position-y"
          v-model="position.y"
          type="number"
          class="form-control"
          step="0.001"
          @input="changePosition"
        />
      </div>
      <!--      <div class="col m-1">-->
      <!--        <label for="cities" class="form-label">Cities</label>-->
      <!--        <select id="cities" v-model="cities" class="form-select">-->
      <!--          <option>P</option>-->
      <!--        </select>-->
      <!--      </div>-->
    </div>
    <div id="mouse-position"></div>
    <small v-if="m">{{ m.config }}</small>
  </form>
  <div id="map" class="map"></div>
</template>

<script>
import { log } from '@/utils/app.utils.js';
import * as map from '@/utils/map.utils.js';

export default {
  name: 'App',
  data() {
    return {
      ready: false,
      cities: [],
      position: {
        x: 4390.914,
        y: -53430.543
      },
      url: 'https://raw.githubusercontent.com/TwinDragon/SCS_Map_Tiles/master/'
    };
  },
  computed: {
    m() {
      return this.ready ? map.d : null;
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
          this.changePosition();
        })
        .catch((e) => {
          const errorMessage = e.message || e;
          log(`Unknown error: ${errorMessage}`, 'MAPS_INIT', 'ERROR');
        });
    },
    changePosition() {
      map.updatePlayerPositionAndRotation(this.position.x, this.position.y);
    }
  }
};
</script>

<style lang="scss">
@import 'assets/scss/app';
</style>
