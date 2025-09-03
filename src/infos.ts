import geojsonvt from "geojson-vt";
import { fromVectorTileJs, GeoJSONWrapper } from "./packages/@maplibre/vt-pbf";

import Protobuf from "pbf";

import { VectorTile } from "./packages/@mapbox/vector-tile";
import { collection, x, y, z } from "./data";

const EXTENT = 8192;

const tileIndex = geojsonvt(collection, {
  buffer: 2048,
  tolerance: 6,
  extent: 8192,
  maxZoom: 18,
  lineMetrics: false,
  generateId: false,
});

const tile = tileIndex.getTile(z, x, y);

if (!tile) {
  process.exit(1);
}

const geojsonWrapper = new GeoJSONWrapper(tile.features, {
  version: 2,
  extent: EXTENT,
});

const arrayBuffer = fromVectorTileJs(geojsonWrapper);

const pbf = new Protobuf(arrayBuffer);
const vectorTile = new VectorTile(pbf);

const geojson = vectorTile.layers._geojsonTileLayer
  .feature(0)
  .toGeoJSON(x, y, z);

console.log(JSON.stringify(collection, undefined, 2));
console.log(JSON.stringify(geojson, undefined, 2));

process.exit(0);
