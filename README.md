## Fix GeoJSON Feature properties stringified in map events

```console
npm i
npm run dev
```

To facilitate the proof of concept, a copy of the source files from the `@mapbox/vector-tile` and `@maplibre/vt-pbf` packages was placed in the `src/packages` folder.

Here the detail of modifications

## Vector tile spec

```diff
message Tile {


        // Variant type encoding
        // The use of values is described in section 4.1 of the specification
        message Value {
                // Exactly one of these values must be present in a valid message

+               // we add the json_value as string
+               optional string json_value = 0;

                optional string string_value = 1;
                optional float float_value = 2;
                optional double double_value = 3;
                optional int64 int_value = 4;
                optional uint64 uint_value = 5;
                optional sint64 sint_value = 6;
                optional bool bool_value = 7;

                extensions 8 to max;
        }
}
```

## @maplibre/vt-pbf

Compare with [original](https://github.com/maplibre/vt-pbf/blob/main/index.ts#L109-L112)

```ts

function writeProperties(context: Context, pbf: Pbf) {
  for (const key in context.feature?.properties) {
    let value = context.feature.properties[key];

    let keyIndex = context.keycache[key];
    if (value === null) continue; // don't encode null value properties

    if (typeof keyIndex === "undefined") {
      context.keys.push(key);
      keyIndex = context.keys.length - 1;
      context.keycache[key] = keyIndex;
    }
    pbf.writeVarint(keyIndex);

    // change:begin

    let valueKey = typeof value + ":" + value;

    if (
      typeof value !== "string" &&
      typeof value !== "boolean" &&
      typeof value !== "number"
    ) {
      // The value is not stringified so its type can be distinguished during encoding

      // The value key is stringified to maintain consistency with valueIndex 
      // otherwise we will have [object object]
      valueKey = "json:" + JSON.stringify(value);
    }

    // change:end

    let valueIndex = context.valuecache[valueKey];
    if (typeof valueIndex === "undefined") {
      context.values.push(value);
      valueIndex = context.values.length - 1;
      context.valuecache[valueKey] = valueIndex;
    }
    pbf.writeVarint(valueIndex);
  }
}
```

Compare with [original](https://github.com/maplibre/vt-pbf/blob/main/index.ts#L162-L177)
```ts
function writeValue(value: string | boolean | number | Record<string, unknown>, pbf: Pbf) {
  const type = typeof value;
  if (type === "string") {
    pbf.writeStringField(1, value as string);
  } else if (type === "boolean") {
    pbf.writeBooleanField(7, value as boolean);
  } else if (type === "number") {
    if ((value as number) % 1 !== 0) {
      pbf.writeDoubleField(3, value as number);
    } else if ((value as number) < 0) {
      pbf.writeSVarintField(6, value as number);
    } else {
      pbf.writeVarintField(5, value as number);
    }
    // change:begin
  } else {
    // The value wasn't stringified
    // Here we stringify the value using tag 0 instead of 1
    pbf.writeStringField(0, JSON.stringify(value as string));
  }
  // change:end
}
```


## @mapbox/vector-tile

Compare with [original](https://github.com/mapbox/vector-tile-js/blob/main/index.js#L352-L358)

```ts
/**
 * @param {Pbf} pbf
 */
function readValueMessage(pbf) {
  let value = null;
  const end = pbf.readVarint() + pbf.pos;

  while (pbf.pos < end) {
    const tag = pbf.readVarint() >> 3;

    // change:begin
    value =
      // for the tag 0 we parse the string
      tag === 0
        ? JSON.parse(pbf.readString())
        : // change:end
        tag === 1
        ? pbf.readString()
        : tag === 2
        ? pbf.readFloat()
        : tag === 3
        ? pbf.readDouble()
        : tag === 4
        ? pbf.readVarint64()
        : tag === 5
        ? pbf.readVarint()
        : tag === 6
        ? pbf.readSVarint()
        : tag === 7
        ? pbf.readBoolean()
        : null;
  }
  if (value == null) {
    throw new Error("unknown feature value");
  }

  return value;
}
```