import { FeatureCollection } from "geojson";

export const collectionLegacy: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      id: 69,
      // id: "coucou",
      type: "Feature",
      properties: {
        hello: "world",
        nested: {
          foo: "bar",
        },
        age: 38,
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-122.4836904, 37.8338188],
          [-122.4834984, 37.8331741],
          [-122.4833968, 37.8327007],
          [-122.483568, 37.8320565],
        ],
      },
    },
  ],
};

export const collection: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      id: 74,
      // id: "coucou",
      type: "Feature",
      properties: {
        hello: "world",
        nested: {
          foo: "bar",
        },
        age: 38,
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [10, 20],
          [50, 40],
        ],
      },
    },
  ],
};

export const z = 1;
export const x = 1;
export const y = 0;
