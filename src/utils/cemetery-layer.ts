import * as THREE from 'three';
import {
  type CustomLayerInterface,
  type CustomRenderMethodInput,
  type LngLatLike,
  Map,
} from 'maplibre-gl';
import { createBeam, createPhotoDisc, loadModel } from './entities.ts';
import { FreyaScene } from './scene.ts';
import { createProjectionMatrix } from './matrix.ts';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

enum ObjectId {
  LIGHT_BEAM,
  WAYPOINT_GRAVE,
  WAYPOINT_MARKER,
  NAVIGATION_ARROW,
  PHOTO_DISC,
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
  private readonly gltfLoader = new GLTFLoader();

  private objectIndex: Record<ObjectId, CemeteryLayoutObject> = {} as Record<
    ObjectId,
    CemeteryLayoutObject
  >;

  constructor({ id = 'cemetery-layer', waypointCoords }: CemeteryLayerConfig) {
    this.id = id;
    this.waypointCoords = waypointCoords;
  }

  async onAdd(map: Map, gl: WebGLRenderingContext | WebGL2RenderingContext) {
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

    try {
      const locationPin = await loadModel(
        this.gltfLoader,
        `${import.meta.env.BASE_URL}/models/location_pin.glb`,
      );
      const locationPinMatrix = createProjectionMatrix({
        location: this.waypointCoords,
        modelRotate: [0, Math.PI / 2, Math.PI / 2],
        translationFactorX: 0.7,
        translationFactorY: 0.7,
        translationFactorZ: 15,
        scaleFactor: 4,
      });

      this.objectIndex[ObjectId.WAYPOINT_MARKER] = {
        matrix: locationPinMatrix,
        object: locationPin,
      };
    } catch (e) {
      console.error(e);
    }

    const photoDisc = createPhotoDisc();
    const photoDiscMatrix = createProjectionMatrix({
      location: this.waypointCoords,
      modelRotate: [Math.PI / 2, 0, 0],
      translationFactorX: 0.7,
      translationFactorY: 0.8,
      translationFactorZ: 15,
      scaleFactor: 4,
    });

    this.objectIndex[ObjectId.PHOTO_DISC] = {
      matrix: photoDiscMatrix,
      object: photoDisc,
    };

    for (const key in this.objectIndex) {
      const { object } = this.objectIndex[key as unknown as ObjectId];
      object.matrixAutoUpdate = false;

      this.freyaScene.add(object);
    }
  }

  render(_: WebGLRenderingContext, args: CustomRenderMethodInput) {
    const defaultProjectionMatrix = new THREE.Matrix4().fromArray(
      args.defaultProjectionData.mainMatrix,
    );

    for (const key in this.objectIndex) {
      const { object, matrix } = this.objectIndex[key as unknown as ObjectId];

      object.matrix = defaultProjectionMatrix.clone().multiply(matrix);
    }

    this.freyaScene?.draw();
  }
}
