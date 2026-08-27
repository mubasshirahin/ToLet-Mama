import * as THREE from "three";
import { buildHouse } from "./buildHouse";
import { buildParticles } from "./particles";

export const PALETTE = {
  ink: 0x2c1810,
  brown: 0x5c3a21,
  paper: 0xfaf3e0,
  amber: 0xe8b04b,
  ember: 0xd97a38,
};

// Builds renderer + scene + camera + lights + fog + procedural objects.
// Everything is transparent-clear so HTML behind a translucent section shows through.
export function buildScene(theme, wrap) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  wrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.FogExp2(theme.bg, 0.014);

  const camera = new THREE.PerspectiveCamera(
    50,
    wrap.clientWidth / Math.max(wrap.clientHeight, 1),
    0.1,
    200
  );
  camera.position.set(0, 1.6, 14);

  // Warm vintage lighting
  const ambient = new THREE.AmbientLight(PALETTE.paper, 0.4);
  const key = new THREE.DirectionalLight(PALETTE.amber, 1.1);
  key.position.set(4, 6, 6);
  const rim = new THREE.DirectionalLight(PALETTE.ember, 0.65);
  rim.position.set(-6, -2, -4);

  scene.add(ambient, key, rim);

  // Hero house (left-of-center so headline stays readable)
  const hero = buildHouse({ y: -0.6, scale: 1 });
  hero.group.position.x = -2.6;
  scene.add(hero.group);

  // Neighborhood cluster for the Showcase band
  const neighborhood = new THREE.Group();
  const offsets = [
    [3.4, -0.4, -2, 1.2],
    [-4.6, -0.7, -4, 0.8],
    [0.2, -0.9, -5, 1.6],
    [6.4, -0.9, -6, 0.7],
  ];
  for (const [x, y, z, s] of offsets) {
    const h = buildHouse({ y, scale: s / 4 });
    h.group.position.set(x, y, z);
    neighborhood.add(h.group);
  }
  scene.add(neighborhood);

  // Ambient particle drift + far warm starfield
  const particles = buildParticles(900, { radius: 18 });
  scene.add(particles);

  const starfield = buildParticles(1400, { center: [0, 4, -28], radius: 20, size: 0.05, opacity: 0 });
  scene.add(starfield);

  // Architecture ground grid
  const grid = new THREE.GridHelper(50, 25, PALETTE.brown, 0x3a2416);
  grid.position.y = -2.2;
  scene.add(grid);

  const disposer = () => {
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      }
    });
  };

  const tweenable = {
    scene,
    camera,
    ambient,
    key,
    rim,
    hero,
    neighborhood,
    particles,
    starfield,
    grid,
  };

  return { renderer, scene, camera, disposer, tweenable, palette: PALETTE };
}
