import * as THREE from "three";

// Warm glowing particle cloud. Returns a THREE.Points suitable for AdditiveBlending.
export function buildParticles(
  count,
  {
    center = [0, 0, 0],
    radius = 18,
    size = 0.06,
    colors = [0xe8b04b, 0xd97a38, 0x5c3a21, 0xf4e8c1],
    opacity = 0.9,
  } = {}
) {
  const positions = new Float32Array(count * 3);
  const cs = new Float32Array(count * 3);
  const palette = colors.map((c) => new THREE.Color(c));

  for (let i = 0; i < count; i++) {
    positions[i * 3] = center[0] + (Math.random() - 0.5) * radius * 2;
    positions[i * 3 + 1] = center[1] + (Math.random() - 0.5) * radius * 2;
    positions[i * 3 + 2] = center[2] + (Math.random() - 0.5) * radius * 2;
    const col = palette[Math.floor(Math.random() * palette.length)];
    cs[i * 3] = col.r;
    cs[i * 3 + 1] = col.g;
    cs[i * 3 + 2] = col.b;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setAttribute("color", new THREE.BufferAttribute(cs, 3));

  const material = new THREE.PointsMaterial({
    size,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geom, material);
  points.frustumCulled = false;
  return points;
}
