import { configureMap } from './utils/map.ts';
import { CemeteryLayer } from './utils/cemetery-layer.ts';

const fetchGeoGson = async () => {
  const response = await fetch(`${import.meta.env.BASE_URL}/route/valhalla-test-route.geojson`);
  return await response.json();
};

const fetchInterpolatedPath = async () => {
  const response = await fetch(`${import.meta.env.BASE_URL}/route/interpolated-path.json`);
  return await response.json();
};

const main = async () => {
  const geojson = await fetchGeoGson();
  const { coordinates: interpolatedPath } = await fetchInterpolatedPath();

  let intervalId = -1;
  let currentPositionIndex = 0;

  const { map } = configureMap({
    center: geojson.geometry.coordinates[0],
    style: 'https://drsrvsyvyuem5.cloudfront.net/freya_map_fake_s3.json',
    zoom: 20,
    pitch: 60,
    bearing: 0,
  });

  map.on('load', async () => {
    map.addSource('route', {
      type: 'geojson',
      data: geojson,
    });

    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      paint: {
        'line-color': '#ffffff',
        'line-width': 20,
      },
    });

    const coords = geojson.geometry.coordinates;
    const start = coords[0];
    const waypoint = coords[coords.length - 1];

    const cemeteryLayer = new CemeteryLayer({
      startPointCoords: start,
      waypointCoords: waypoint,
    });

    map.addLayer(cemeteryLayer);

    intervalId = setInterval(() => {
      if (currentPositionIndex == interpolatedPath.length) {
        clearInterval(intervalId);
        return;
      }

      const position = interpolatedPath[currentPositionIndex];

      cemeteryLayer.updateCurrentPointCoords(map, position);

      map.easeTo({
        center: position,
        duration: 300,
        easing: t => t,
        essential: true,
      });

      currentPositionIndex++;
    }, 300);
  });

  map.on('remove', () => {
    clearInterval(intervalId);
  });
};

void main();
