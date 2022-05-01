/**
 * @author:	Emmanuel SMITH <hey@emmanuel-smith.me>
 * project:	ets2-dashboard-skin
 * file: 	_maps.js
 * Date: 	18/12/2020
 * Time: 	21:38
 */

import { log } from '@/utils/app.utils';
import axios from 'axios';
import { Feature } from 'ol';
import { defaults as defaultControls, MousePosition } from 'ol/control';
import { createStringXY } from 'ol/coordinate';
import { Point } from 'ol/geom';
import Tile from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import Projection from 'ol/proj/Projection';
import { Vector as VectorSource } from 'ol/source';
import XYZ from 'ol/source/XYZ';
import { Icon, Style } from 'ol/style';
import View from 'ol/View';

let d = {
  map: null,
  playerIcon: null,
  markerFeature: null,
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
    coordinateFormat: createStringXY(3),
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
    layers: [getMapTilesLayer(projection), getMarkerLayer()],
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

const getMarkerLayer = () => {
  d.playerIcon = new Icon({
    anchor: [0.5, 39],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    rotateWithView: true,
    src: 'https://github.com/meatlayer/ets2-mobile-route-advisor/raw/master/img/player_proportions.png'
  });

  let playerIconStyle = new Style({
    image: d.playerIcon
  });
  d.markerFeature = new Feature({
    geometry: new Point([d.config.map.maxX / 2, d.config.map.maxY / 2])
  });
  // For some reason, we cannot pass the style in the constructor.
  d.markerFeature.setStyle(playerIconStyle);

  // Adding a layer for features overlaid on the map.
  let featureSource = new VectorSource({
    features: [d.markerFeature],
    wrapX: false
  });
  return new VectorLayer({
    source: featureSource
  });
};

const updatePlayerPositionAndRotation = (lon, lat) => {
  if (d.ready !== true) return;

  lon = lon.toFixed(3);
  lat = lat.toFixed(3);
  d.lastPos = {
    x: lon,
    y: lat
  };

  let map_coords = gameCoordToPixels(lon, lat);

  d.markerFeature.getGeometry().setCoordinates(map_coords);
  d.map.getView().setCenter(map_coords);
};

const gameCoordToPixels = (x, y) => {
  if (d.ready === null) return;

  return [x, -y];
};

export { d, init, updatePlayerPositionAndRotation, gameCoordToPixels };
