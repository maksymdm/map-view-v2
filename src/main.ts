import {configureMap} from "./utils/map.ts";
import {CemeteryLayer} from "./utils/cemetery-layer.ts";

const {map} = configureMap({
  center: [30.5107, 50.4174],
  style: "https://drsrvsyvyuem5.cloudfront.net/freya_map_fake_s3.json",
  zoom: 20,
  pitch: 60,
  bearing: 0,
})

map.on("load", () => {
  const cemeteryLayer = new CemeteryLayer({
    waypointCoords: [30.5107, 50.4174],
  })

  map.addLayer(cemeteryLayer)
})
