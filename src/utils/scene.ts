import * as THREE from 'three';
import {Map} from 'maplibre-gl';

export class FreyaScene {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;

  constructor(map: Map, gl: WebGLRenderingContext) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();

    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true
    })
    this.renderer.autoClear = false;
  }

  add(...object: THREE.Object3D[]): THREE.Scene<THREE.Object3DEventMap> {
    return this.scene.add(...object);
  }

  draw(projectionMatrix: THREE.Matrix4) {
    this.camera.projectionMatrix = projectionMatrix;

    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);
  }
}
