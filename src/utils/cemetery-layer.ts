import * as THREE from 'three';
import {
  type CustomLayerInterface,
  type CustomRenderMethodInput,
  type LngLatLike,
  Map,
} from 'maplibre-gl';
import { createBeam } from './entities.ts';
import { FreyaScene } from './scene.ts';
import { createProjectionMatrix } from './matrix.ts';

enum ObjectId {
  LIGHT_BEAM,
  WAYPOINT_GRAVE,
  WAYPOINT_MARKER,
  NAVIGATION_ARROW,
}

interface CemeteryLayoutObject {
  matrix: THREE.Matrix4;
  object: THREE.Object3D;
}

export interface CemeteryLayerConfig {
  id?: string;
  waypointCoords: LngLatLike;
}

export class CemeteryLayer implements CustomLayerInterface {
  id: string;
  type: 'custom' = 'custom';
  renderingMode: '2d' | '3d' = '3d';

  private freyaScene: FreyaScene | null = null;
  private readonly waypointCoords: LngLatLike = [0, 0];

  private objectIndex: Record<ObjectId, CemeteryLayoutObject> = {} as Record<
    ObjectId,
    CemeteryLayoutObject
  >;

  constructor({ id = 'cemetery-layer', waypointCoords }: CemeteryLayerConfig) {
    this.id = id;
    this.waypointCoords = waypointCoords;
  }

  onAdd(map: Map, gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.freyaScene = new FreyaScene(map, gl);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, -70, 100).normalize();
    this.freyaScene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff);
    directionalLight2.position.set(0, 70, 100).normalize();
    this.freyaScene.add(directionalLight2);

    const beam = createBeam();
    const beamMatrix = createProjectionMatrix({
      location: this.waypointCoords,
      modelRotate: [0, 0, Math.PI / 2],
      scaleFactor: 3,
      translationFactorX: 0.7,
      translationFactorY: 0.7,
      translationFactorZ: 0.3,
    });

    this.objectIndex[ObjectId.LIGHT_BEAM] = {
      object: beam,
      matrix: beamMatrix,
    };

    this.freyaScene.add(beam);
  }

  render(_: WebGLRenderingContext, args: CustomRenderMethodInput) {
    const defaultProjectionMatrix = new THREE.Matrix4().fromArray(
      args.defaultProjectionData.mainMatrix,
    );

    defaultProjectionMatrix.multiply(this.objectIndex[ObjectId.LIGHT_BEAM].matrix);

    this.freyaScene?.draw(defaultProjectionMatrix);
  }
}
