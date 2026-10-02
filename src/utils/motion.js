/* Shared motion utilities. Kept out of component files so Vite fast
   refresh stays valid when exporting non-component helpers. */

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Children carrying this attribute are staggered as one group. */
export const ITEM_SELECTOR = "[data-reveal-item]";