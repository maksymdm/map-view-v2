import * as THREE from 'three'
import {
  type CustomLayerInterface,
  type CustomRenderMethodInput,
  type LngLatLike,
  Map,
  MercatorCoordinate,
} from 'maplibre-gl'
import { createBeam } from './entities.ts'
import { FreyaScene } from './scene.ts'

export interface CemeteryLayerConfig {
  id?: string
  waypointCoords: LngLatLike
}

export class CemeteryLayer implements CustomLayerInterface {
  id: string
  type: 'custom' = 'custom'
  renderingMode: '2d' | '3d' = '2d'

  private freyaScene: FreyaScene | null = null
  private readonly waypointCoords: LngLatLike = [0, 0]
  private beamMatrix: THREE.Matrix4 = new THREE.Matrix4()

  constructor({ id = 'cemetery-layer', waypointCoords }: CemeteryLayerConfig) {
    this.id = id
    this.waypointCoords = waypointCoords
  }

  onAdd(map: Map, gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.freyaScene = new FreyaScene(map, gl)

    const directionalLight = new THREE.DirectionalLight(0xffffff)
    directionalLight.position.set(0, -70, 100).normalize()
    this.freyaScene.add(directionalLight)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff)
    directionalLight2.position.set(0, 70, 100).normalize()
    this.freyaScene.add(directionalLight2)

    const beam = createBeam()

    const modelAsMercatorCoordinate = MercatorCoordinate.fromLngLat(this.waypointCoords, 0)
    const meterToMercator = modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()

    const modelRotate = [0, 0, Math.PI / 2]

    const modelTransform = {
      translateX: modelAsMercatorCoordinate.x + 0.7 * meterToMercator,
      translateY: modelAsMercatorCoordinate.y + 0.7 * meterToMercator,
      translateZ: modelAsMercatorCoordinate.z + 0.3 * meterToMercator,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      /* Since our 3D model is in real world meters, a scale transform needs to be
       * applied since the CustomLayerInterface expects units in MercatorCoordinates.
       */
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * 3,
    }

    const rotationX = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(1, 0, 0),
      modelTransform.rotateX,
    )
    const rotationY = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 1, 0),
      modelTransform.rotateY,
    )
    const rotationZ = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 0, 1),
      modelTransform.rotateZ,
    )

    this.beamMatrix = new THREE.Matrix4()
      .makeTranslation(
        modelTransform.translateX,
        modelTransform.translateY,
        modelTransform.translateZ,
      )
      .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ)

    this.freyaScene.add(beam)
  }

  render(_: WebGLRenderingContext, args: CustomRenderMethodInput) {
    const defaultProjectionMatrix = new THREE.Matrix4().fromArray(
      args.defaultProjectionData.mainMatrix,
    )

    defaultProjectionMatrix.multiply(this.beamMatrix)

    this.freyaScene?.draw(defaultProjectionMatrix)
  }
}
