import { useEffect } from "react";

/**
 * Scroll-driven background tone.
 *
 * Each major section carries a slightly different dark-green mood. Rather
 * than snapping the body background per section (which reads as an abrupt
 * jump), we compute a continuous scroll progress and ease the colour toward
 * its target on every animation frame. The result is a slow drift through
 * the BIOBYTE palette that never visibly cuts.
 *
 * Implemented with a passive scroll listener + rAF, writing one CSS custom
 * property. Respects prefers-reduced-motion by pinning the hero tone.
 */

/** Dark-green variations, ordered roughly as they appear down the page. */
const MOODS = [
  [7, 10, 5], // hero — deepest
  [9, 14, 6], // featured mission
  [11, 17, 7], // about
  [8, 15, 6], // problem statements — slight cool shift
  [6, 12, 6], // registration
  [10, 16, 7], // rules & timeline
  [13, 19, 8], // prizes — warmest
  [8, 13, 7], // faq
  [10, 15, 8], // core team
  [9, 14, 6], // ticker / contact
  [7, 10, 5], // footer
];

const BASE = MOODS[0];

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Picks the mood for a given scroll progress and blends it toward the
 * next stop, so the tone is continuous everywhere rather than stepped.
 */
const moodAt = (progress) => {
  const scaled = clamp01(progress) * (MOODS.length - 1);
  const index = Math.min(Math.floor(scaled), MOODS.length - 2);
  const local = scaled - index;

  // Smootherstep keeps the drift gentle at the start/end of each section
  // instead of changing at a constant rate.
  const eased = local * local * local * (local * (local * 6 - 15) + 10);

  const a = MOODS[index];
  const b = MOODS[index + 1];

  return [
    a[0] + (b[0] - a[0]) * eased,
    a[1] + (b[1] - a[1]) * eased,
    a[2] + (b[2] - a[2]) * eased,
  ];
};

const useScrollMood = () => {
  useEffect(() => {
    const root = document.documentElement;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.style.setProperty("--page-bg", `rgb(${BASE.join(",")})`);
      return undefined;
    }

    let current = BASE.slice();
    let target = BASE.slice();
    let frame = 0;

    const measure = () => {
      const scrollable = root.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        target = BASE.slice();
        return;
      }
      target = moodAt(window.scrollY / scrollable);
    };

    const render = () => {
      frame = 0;

      // Ease ~9% of the remaining distance each frame.
      current = current.map((value, i) => value + (target[i] - value) * 0.09);

      const settled = current.every(
        (value, i) => Math.abs(value - target[i]) < 0.05,
      );

      root.style.setProperty(
        "--page-bg",
        `rgb(${current.map((v) => Math.round(v)).join(",")})`,
      );

      // Keep easing until the tone has effectively landed, then idle.
      if (!settled) frame = requestAnimationFrame(render);
    };

    const schedule = () => {
      measure();
      if (!frame) frame = requestAnimationFrame(render);
    };

    schedule();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
};

export default useScrollMood;