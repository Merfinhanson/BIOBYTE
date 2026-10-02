/**
 * Thin frontend helper for the BIOBYTE registration API.
 *
 * Frontend only. It knows nothing about Microsoft auth or Excel — it just
 * posts a normalised payload to the serverless route and surfaces a
 * readable error when something goes wrong.
 */

export const REGISTER_ENDPOINT = "/api/register";

/**
 * @typedef {object} RegistrationPayload
 * @property {string} timestamp    ISO date string
 * @property {string} teamName
 * @property {string} collegeName
 * @property {string} memberNames  Comma-separated member names
 * @property {string} contactNumber
 * @property {string} emailId
 * @property {string} problemStatement
 * @property {string} abstract
 * @property {string} status
 */

/**
 * Trims every value and drops empty keys so the API never receives
 * whitespace-only strings.
 */
function normalise(payload) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : value,
    ]),
  );
}

/**
 * Posts a registration to /api/register.
 *
 * @param {RegistrationPayload} payload
 * @param {AbortSignal} [signal] Optional abort signal (e.g. a timeout).
 * @returns {Promise<{ok: true, message: string}>}
 * @throws {Error} with a human-readable `message`
 */
export async function submitRegistration(payload, { signal } = {}) {
  let response;

  try {
    response = await fetch(REGISTER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalise(payload)),
      signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error("The request timed out. Please try again.");
    }
    throw new Error("Could not reach the server. Check your connection.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON error page (e.g. a gateway error) — fall through to status.
  }

  if (!response.ok) {
    // Prefer the API's own message, then field-level detail, then status.
    const detail =
      data?.invalid?.length || data?.missing?.length
        ? [...(data.invalid || []), ...(data.missing || [])].join(" ")
        : null;

    throw new Error(
      data?.error ||
        detail ||
        `Registration failed (${response.status}). Please try again.`,
    );
  }

  return data ?? { ok: true };
}