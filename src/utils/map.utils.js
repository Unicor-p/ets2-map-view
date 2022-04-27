/**
 * @author:	Emmanuel SMITH <hey@emmanuel-smith.me>
 * project:	ets2-dashboard-skin
 * file: 	_maps.js
 * Date: 	18/12/2020
 * Time: 	21:38
 */

import {
  betweenFloat,
  greaterOrEqualThanFloat,
  lessOrEqualThanFloat,
  log
} from '@/utils/app.utils';
import axios from 'axios';
import { defaults as defaultControls, MousePosition } from 'ol/control';
import { createStringXY } from 'ol/coordinate';
import Tile from 'ol/layer/Tile';
import Map from 'ol/Map';
import Projection from 'ol/proj/Projection';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';

let d = {
  map: null,
  playerIcon: null,
  playerFeature: null,
  gBehaviorCenterOnPlayer: true,
  gBehaviorRotateWithPlayer: true,
  gIgnoreViewChangeEvents: false,
  ready: false,
  arrowRotate: '',
  config: null,
  paths: {
    base: '',
    tiles: 'Tiles/{z}/{x}/{y}.png',
    config: 'TileMapInfo.json'
  },
  lastPos: {
    x: null,
    y: null
  }
};

const ZOOM_DEFAULT = 8;

// ----
const initConfig = (path) => {
  d.paths.base = path + 'ets2/latest/';

  return axios.get(d.paths.base + d.paths.config).then(
    (response) => {
      d.config = response.data;
      log(`Map config found`, 'MAPS_INIT');

      const tilesPath = d.paths.tiles.replace(/{[xyz]}/g, 0);

      return axios.get(d.paths.base + tilesPath).then(
        () => {
          d.gBehaviorRotateWithPlayer = true;
        },
        () => {
          throw new Error('Cant get tiles - Tiles NOT FOUND');
        }
      );
    },
    () => {
      throw new Error('Cant get config - Map config NOT FOUND');
    }
  );
};

const initMap = () => {
  // --- TsMap
  let projection = new Projection({
    code: 'ZOOMIFY',
    units: 'pixels',
    extent: [
      d.config.map.x1,
      -d.config.map.y2,
      d.config.map.x2,
      -d.config.map.y1 // x1, -y2, x2, -y1 (reverse y direction)
    ]
  });
  // --- ./TsMap

  // --- [Debug] Mouse position
  const mousePosition = new MousePosition({
    coordinateFormat: createStringXY(4),
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
    projection
  });
  // --- ./[Debug] Mouse position

  d.map = new Map({
    controls: defaultControls({
      zoom: true,
      rotate: false
    }).extend([mousePosition]),
    layers: [getMapTilesLayer(projection)],
    target: 'map',
    view: new View({
      center: [0, 0],
      zoom: ZOOM_DEFAULT,
      minZoom: d.config.map.minZoom,
      maxZoom: d.config.map.maxZoom,
      projection: projection,
      extent: projection.getExtent()
    })
  });

  // Detecting when the user interacts with the map.
  // https://stackoverflow.com/q/32868671/
  d.map.getView().on(['change:center', 'change:rotation'], function () {
    if (d.gIgnoreViewChangeEvents) return;

    // The user has moved or rotated the map.
    d.gBehaviorCenterOnPlayer = false;
  });
};

const init = (path) => {
  return initConfig(path)
    .then(() => initMap())
    .then(() => (d.ready = true));
};

// ----

const getMapTilesLayer = (projection) => {
  return new Tile({
    source: new XYZ({
      projection: projection,
      url: d.paths.base + d.paths.tiles
    })
  });
};

// ----

const updatePlayerPositionAndRotation = (lon, lat, rot, speed) => {
  if (d.ready !== true) return;

  lon = lon.toFixed(3);
  lat = lat.toFixed(3);
  rot = rot.toFixed(5);
  speed = speed.toFixed(0);

  if (d.lastPos.x === lon || d.lastPos.y === lat) return;

  d.lastPos = {
    x: lon,
    y: lat
  };

  let map_coords = gameCoordToPixels(lon, lat);
  let rad = rot * Math.PI * 2;

  d.playerFeature.getGeometry().setCoordinates(map_coords);
  d.playerIcon.setRotation(-rad);

  d.gIgnoreViewChangeEvents = true;
  if (d.gBehaviorCenterOnPlayer) {
    if (d.gBehaviorRotateWithPlayer) {
      //auto-zoom map by speed
      if (lessOrEqualThanFloat(speed, 30)) d.map.getView().setZoom(15);
      else if (betweenFloat(speed, 30, 50)) d.map.getView().setZoom(9);
      else if (betweenFloat(speed, 51, 89)) d.map.getView().setZoom(8);
      else if (greaterOrEqualThanFloat(speed, 90)) d.map.getView().setZoom(7);

      d.map.getView().setCenter(map_coords);
      d.map.getView().setRotation(rad);
    } else {
      d.map.getView().setCenter(map_coords);
      d.map.getView().setRotation(0);
    }
  }
  d.gIgnoreViewChangeEvents = false;
};

const gameCoordToPixels = (x, y) => {
  if (d.ready === null) return;

  return [x, -y];
};

export { d, init, updatePlayerPositionAndRotation, gameCoordToPixels };
