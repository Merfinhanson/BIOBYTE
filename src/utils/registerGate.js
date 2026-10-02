/**
 * Cross-section trigger for the Registration gate.
 *
 * The Google login gate must stay closed until a user explicitly clicks a
 * "Register Now" button (hero, navbar, footer). Sections are siblings, so they
 * coordinate through one custom event instead of prop drilling.
 *
 * The request is also sticky: the Registration chunk is lazy-loaded, so a click
 * made before it mounts would otherwise be lost.
 */

export const OPEN_REGISTER_EVENT = "biobyte:open-register";

let pendingRequest = false;

export function openRegisterGate() {
  pendingRequest = true;
  window.dispatchEvent(new CustomEvent(OPEN_REGISTER_EVENT));
}

/** Reads and clears the pending flag. */
export function consumeRegisterGateRequest() {
  const wasRequested = pendingRequest;
  pendingRequest = false;
  return wasRequested;
}
