import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Builds all scroll-scrubbed camera/light/fog/object timelines.
// Returns a cleanup function that kills everything (call on unmount).
export function createScrollTimeline(t) {
  const { scene, camera, ambient, key, rim, hero, neighborhood, particles, starfield } = t;
  const house = hero.tweenable;

  // ── Global scrub across the whole page: dolly, pan, fog, light ──
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 1 },
  });

  tl.to(camera.position, { z: 12, x: 0.8 }, 0)
    .to(camera.rotation, { y: 0.3 }, 0)
    .to(scene.fog, { density: 0.008 }, 0)
    .to(camera.position, { y: 2.6, x: -0.4 }, 0.35)
    .to(camera.rotation, { y: -0.2 }, 0.55)
    .to(camera.position, { z: 20, y: 3.2 }, 0.7)
    .to(scene.fog, { density: 0.024 }, 1)
    .to(ambient, { intensity: 0.16 }, 0.5)
    .to(key, { intensity: 1.7 }, 0.55)
    .to(rim, { intensity: 0.22 }, 0.8);

  // ── Hero: house spins away + dissolves solid → wireframe as hero leaves ──
  const heroTl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 1 },
  });
  heroTl
    .to(house.group.rotation, { x: 0.7, y: Math.PI * 1.5 }, 0)
    .to(house.group.position, { x: -7, y: 2, z: -3 }, 0)
    .to(house.walls.material, { opacity: 0.08 }, 0.3);

  // Ambient particle idle drift (loop, happens regardless of scroll)
  const drift = gsap.timeline({ repeat: -1, yoyo: true, ease: "sine.inOut" });
  drift
    .to(particles.rotation, { x: 0.2, z: -0.3, duration: 8 }, 0)
    .to(particles.position, { y: 0.7, duration: 5 }, 0)
    .to(particles.material, { opacity: 0.45, duration: 4 }, 0.5);

  // ── Showcase band: neighborhood cluster travels through fog/light ──
  const showcase = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: "#showcase", start: "top bottom", end: "top top", scrub: 1 },
  });
  showcase
    .fromTo(neighborhood.rotation, { y: -0.6 }, { y: Math.PI * 2, duration: 1 }, 0)
    .fromTo(neighborhood.position, { x: -2, y: -1 }, { x: 2, y: 1, duration: 1 }, 0)
    .to(key, { intensity: 2.2, duration: 0.5 }, 0);

  // ── Listings: camera focuses + key light blooms ──
  const listings = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: "#listings", start: "top bottom", end: "top top", scrub: 1 },
  });
  listings
    .to(camera, { z: 11, y: 1.9 }, 0)
    .to(camera.rotation, { y: 0.12 }, 0)
    .to(key, { intensity: 2.6 }, 0)
    .to(scene.fog, { density: 0.018 }, 0.4);

  // ── Testimonials / Footer: pull back + resolve warm starfield ──
  const ending = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: "#testimonials", start: "top bottom", end: "bottom bottom", scrub: 1 },
  });
  ending
    .to(camera.position, { z: 26, y: 5, x: 0 }, 0)
    .to(starfield.material, { opacity: 0.95 }, 0)
    .to(starfield.position, { z: -16 }, 0)
    .to(scene.fog, { density: 0.006 }, 0.4);

  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh);

  return () => {
    window.removeEventListener("load", refresh);
    [tl, heroTl, drift, showcase, listings, ending].forEach((timeline) => {
      if (timeline.scrollTrigger) timeline.scrollTrigger.kill();
      timeline.kill();
    });
  };
}
