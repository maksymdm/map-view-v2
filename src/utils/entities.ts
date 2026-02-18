import * as THREE from "three";

export const createBeam = (): THREE.Mesh => {
  const BEAM_HEIGHT = 10;
  const BEAM_BOTTOM = 0.5;
  const BEAM_TOP = 4.0;

  const h = BEAM_HEIGHT;
  const b = BEAM_BOTTOM / 2;
  const t = BEAM_TOP / 2;

  const geometry = new THREE.BufferGeometry();

  const vertices = new Float32Array([
    // bottom
    -b, -b, 0,
    b, -b, 0,
    b,  b, 0,
    -b,  b, 0,

    // top
    -t, -t, h,
    t, -t, h,
    t,  t, h,
    -t,  t, h,
  ]);

  const indices = new Uint16Array([
    0, 1, 5, 0, 5, 4,
    1, 2, 6, 1, 6, 5,
    2, 3, 7, 2, 7, 6,
    3, 0, 4, 3, 4, 7,
  ]);

  // RGBA per-vertex (bottom opaque -> top transparent)
  const colors = new Float32Array([
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,

    1, 1, 1, 0,
    1, 1, 1, 0,
    1, 1, 1, 0,
    1, 1, 1, 0,
  ]);

  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 4)); // <- 4 = RGBA

  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geometry, material);
};
