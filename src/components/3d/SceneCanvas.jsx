import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildScene } from "./Scene";
import { createScrollTimeline } from "./scrollTimeline";

gsap.registerPlugin(ScrollTrigger);

// Read theme colors at mount so fog/lighting match the active theme.
function readTheme() {
  const cs = getComputedStyle(document.documentElement);
  return {
    bg: cs.getPropertyValue("--theme-bg").trim() || "#0F0B08",
    ink: cs.getPropertyValue("--theme-ink").trim() || "#F7EFE3",
  };
}

// Fixed full-screen Three.js background. pointer-events:none so HTML above stays interactive.
export default function SceneCanvas() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const { renderer, scene, camera, disposer, tweenable } = buildScene(readTheme(), wrap);

    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.pointerEvents = "none";

    wrap.appendChild(renderer.domElement);

    const render = () => renderer.render(scene, camera);
    const onResize = () => {
      const w = wrap.clientWidth;
      const h = Math.max(wrap.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    gsap.ticker.add(render);
    window.addEventListener("resize", onResize);
    onResize();

    const cleanupScroll = createScrollTimeline(tweenable);

    return () => {
      gsap.ticker.remove(render);
      window.removeEventListener("resize", onResize);
      cleanupScroll();
      disposer();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
      style={{ isolation: "isolate", opacity: 0.10 }}
    />
  );
}
