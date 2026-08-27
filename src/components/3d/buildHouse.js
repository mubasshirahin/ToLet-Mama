import * as THREE from "three";

// Low-poly house built from primitives — no external .gltf assets.
// Returns { group, tweenable } so the ScrollTrigger timeline can drive transforms.

export function buildHouse({ y = 0, scale = 1, wireColor = 0x5c3a21, fillColor = 0x2c1810 } = {}) {
  const group = new THREE.Group();

  const wire = new THREE.MeshBasicMaterial({
    color: wireColor,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });

  const fill = new THREE.MeshPhongMaterial({
    color: fillColor,
    transparent: true,
    opacity: 0.92,
  });

  // Walls
  const wallGeom = new THREE.BoxGeometry(3, 2.2, 2.6);
  const walls = new THREE.Mesh(wallGeom, fill);
  walls.position.y = 1.1;
  group.add(walls);

  // Wireframe shell (stays visible when solid walls dissolve)
  const shell = new THREE.Mesh(new THREE.BoxGeometry(3.06, 2.26, 2.66), wire);
  shell.position.y = 1.1;
  group.add(shell);

  // Pyramid roof
  const roofGeom = new THREE.ConeGeometry(2.3, 1.4, 4, 1);
  const roof = new THREE.Mesh(roofGeom, wire);
  roof.position.y = 2.9;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  // Door + windows
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.12), wire);
  door.position.set(-0.55, 0.6, 1.31);
  group.add(door);

  const win = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.12), wire);
  win.position.set(0.55, 1.1, 1.31);
  group.add(win);

  // Chimney
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.8, 6), wire);
  chimney.position.set(0.85, 3.3, -0.4);
  group.add(chimney);

  group.position.y = y;
  group.scale.setScalar(scale);

  return { group, tweenable: { group, roof, shell, walls, door, win, chimney } };
}
