import { addProtocol, type LngLatLike, Map } from 'maplibre-gl';
import { Protocol } from 'pmtiles';

export interface MapConfiguration {
  center: LngLatLike;
  style: string;
  zoom: number;
  pitch: number;
  bearing: number;
}

export const configureMap = (configuration: MapConfiguration): { map: Map } => {
  const { style, zoom, pitch, bearing, center } = configuration;

  const protocol = new Protocol();
  addProtocol('pmtiles', protocol.tile);

  const map = new Map({
    container: 'map',
    center,
    style,
    zoom,
    pitch,
    bearing,
    attributionControl: { compact: true },
    renderWorldCopies: false,
    maplibreLogo: true,
  });

  return { map };
};
