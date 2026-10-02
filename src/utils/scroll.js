/**
 * Smooth-scroll helper.
 *
 * Respects the sticky navbar offset that is declared on `html` via
 * `scroll-padding-top`, so one implementation works for both the
 * navbar links and any in-page button.
 */
export function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}
