import * as THREE from 'three';
import { type LngLatLike, MercatorCoordinate } from 'maplibre-gl';

export interface ProjectionMatrixConfig {
  location: LngLatLike;
  altitude?: number;
  modelRotate?: number[];
  scaleFactor?: number;
  translationFactorX?: number;
  translationFactorY?: number;
  translationFactorZ?: number;
}

export const createProjectionMatrix = ({
  location,
  altitude = 0,
  modelRotate = [0, 0, 0],
  scaleFactor = 1,
  translationFactorX = 1,
  translationFactorY = 1,
  translationFactorZ = 1,
}: ProjectionMatrixConfig): THREE.Matrix4 => {
  const modelAsMercatorCoordinate = MercatorCoordinate.fromLngLat(location, altitude);
  const meterToMercator = modelAsMercatorCoordinate.meterInMercatorCoordinateUnits();

  const modelTransform = {
    translateX: modelAsMercatorCoordinate.x + translationFactorX * meterToMercator,
    translateY: modelAsMercatorCoordinate.y + translationFactorY * meterToMercator,
    translateZ: modelAsMercatorCoordinate.z + translationFactorZ * meterToMercator,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    /* Since our 3D model is in real world meters, a scale transform needs to be
     * applied since the CustomLayerInterface expects units in MercatorCoordinates.
     */
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * scaleFactor,
  };

  const rotationX = new THREE.Matrix4().makeRotationAxis(
    new THREE.Vector3(1, 0, 0),
    modelTransform.rotateX,
  );
  const rotationY = new THREE.Matrix4().makeRotationAxis(
    new THREE.Vector3(0, 1, 0),
    modelTransform.rotateY,
  );
  const rotationZ = new THREE.Matrix4().makeRotationAxis(
    new THREE.Vector3(0, 0, 1),
    modelTransform.rotateZ,
  );

  return new THREE.Matrix4()
    .makeTranslation(
      modelTransform.translateX,
      modelTransform.translateY,
      modelTransform.translateZ,
    )
    .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
    .multiply(rotationX)
    .multiply(rotationY)
    .multiply(rotationZ);
};
