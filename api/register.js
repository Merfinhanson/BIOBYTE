/**
 * BIOBYTE — registration intake API (Vercel serverless function).
 *
 * Flow: browser -> POST /api/register -> this function -> Microsoft Graph
 * -> append one row to the Excel workbook table.
 *
 * The browser never talks to Microsoft Graph and never sees a secret.
 * Firestore remains the system of record; this endpoint is the spreadsheet
 * sync layer that sits on top of it.
 *
 * Required environment variables (see .env.example):
 *   MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET,
 *   EXCEL_WORKBOOK_ID, EXCEL_TABLE_NAME
 * Optional:
 *   EXCEL_DRIVE_ID, VERCEL_URL
 */

const GRAPH_ROOT = "https://graph.microsoft.com/v1.0";
const LOGIN_ROOT = "https://login.microsoftonline.com";

/**
 * Table headers must match these names AND this order, otherwise Graph
 * rejects the append. Keep in sync with the workbook table definition.
 */
const COLUMNS = [
  "Timestamp",
  "Team Name",
  "College Name",
  "Member Names",
  "Contact Number",
  "Email ID",
  "Problem Statement",
  "Abstract / Description",
  "Status",
];

/** Max accepted request body. A registration payload is a few kilobytes. */
const MAX_BODY_BYTES = 64 * 1024;

/** Field length caps — also protect the spreadsheet from junk input. */
const LIMITS = {
  teamName: 120,
  collegeName: 180,
  memberNames: 500,
  contactNumber: 32,
  emailId: 254,
  problemStatement: 160,
  abstract: 2000,
  status: 40,
};

/* ---------------------------------------------------------------------------
 * Microsoft Graph access token (client credentials / app-only flow)
 * ------------------------------------------------------------------------- */

let cachedToken = null; // { value, expiresAt }

const isConfigured = () =>
  Boolean(
    process.env.MICROSOFT_TENANT_ID &&
      process.env.MICROSOFT_CLIENT_ID &&
      process.env.MICROSOFT_CLIENT_SECRET &&
      process.env.EXCEL_WORKBOOK_ID &&
      process.env.EXCEL_TABLE_NAME,
  );

/**
 * Fetches an app-only Graph token, reusing the cached one until shortly
 * before it expires. Module scope persists across warm invocations, so this
 * avoids a token request on every registration.
 */
async function getGraphToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const tenant = process.env.MICROSOFT_TENANT_ID;
  const body = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const res = await fetch(`${LOGIN_ROOT}/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok || !payload.access_token) {
    // Log the Graph diagnostic server-side only. Never echo it to the client,
    // because it can contain tenant/app identifiers.
    console.error("[biobyte] token request failed", res.status, payload);
    const error = new Error("Could not authenticate with Microsoft Graph.");
    error.statusCode = 502;
    error.hint =
      payload.error_description || payload.error || "token request rejected";
    throw error;
  }

  // expires_in is seconds; keep a 60s safety margin via the +60_000 above.
  cachedToken = {
    value: payload.access_token,
    expiresAt: Date.now() + (Number(payload.expires_in) || 3600) * 1000,
  };

  return cachedToken.value;
}

/* ---------------------------------------------------------------------------
 * Excel append
 * ------------------------------------------------------------------------- */

/**
 * Appends a single row to the configured workbook table.
 * Uses the `b` (default drive) shortcut unless EXCEL_DRIVE_ID is provided.
 */
async function appendRow(values) {
  const token = await getGraphToken();

  const driveId = process.env.EXCEL_DRIVE_ID?.trim() || "b";
  const workbookId = encodeURIComponent(process.env.EXCEL_WORKBOOK_ID.trim());
  const tableName = encodeURIComponent(process.env.EXCEL_TABLE_NAME.trim());

  const url =
    `${GRAPH_ROOT}/drives/${driveId}/items/${workbookId}` +
    `/workbook/tables/${tableName}/rows`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [values] }),
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("[biobyte] row append failed", res.status, payload);
    const error = new Error("Excel rejected the registration row.");
    error.statusCode = res.status === 404 ? 503 : 502;
    // The Graph `error.message` is a diagnostic, not a secret. Surface it in
    // server logs and return only the friendly message to the client.
    error.hint = payload?.error?.message || `graph responded ${res.status}`;
    throw error;
  }

  return payload;
}

/* ---------------------------------------------------------------------------
 * Validation
 * ------------------------------------------------------------------------- */

const REQUIRED_FIELDS = [
  "timestamp",
  "teamName",
  "collegeName",
  "memberNames",
  "contactNumber",
  "emailId",
  "problemStatement",
  "abstract",
  "status",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-\s\d]{6,32}$/;

const asText = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * Validates and normalises the request body.
 * Returns { ok: true, data } or { ok: false, missing, invalid }.
 */
function validate(body) {
  const data = {};
  const missing = [];
  const invalid = [];

  for (const field of REQUIRED_FIELDS) {
    const text = asText(body?.[field]);
    if (!text) {
      missing.push(field);
      continue;
    }
    if (text.length > LIMITS[field]) {
      invalid.push(`${field} exceeds ${LIMITS[field]} characters`);
      continue;
    }
    data[field] = text;
  }

  if (!missing.length) {
    if (!EMAIL_RE.test(data.emailId)) {
      invalid.push("emailId is not a valid email address");
    }
    if (!PHONE_RE.test(data.contactNumber)) {
      invalid.push("contactNumber contains unexpected characters");
    }
    if (data.abstract.length < 30) {
      invalid.push("abstract must be at least 30 characters");
    }
  }

  return missing.length || invalid.length
    ? { ok: false, missing, invalid }
    : { ok: true, data };
}

/* ---------------------------------------------------------------------------
 * Best-effort rate limiting
 *
 * Serverless instances are ephemeral, so this is a courtesy guard against
 * casual abuse, not a hard security boundary. A shared store (Upstash,
 * Vercel KV, WAF rule) would be needed for a real limit.
 * ------------------------------------------------------------------------- */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

const clientIp = (req) =>
  (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
  req.socket?.remoteAddress ||
  "unknown";

/* ---------------------------------------------------------------------------
 * Handler
 * ------------------------------------------------------------------------- */

export default async function handler(req, res) {
  /* ---- 1. POST only ---- */
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      ok: false,
      error: "Method not allowed. Use POST.",
    });
  }

  /* ---- 2. Basic abuse guard ---- */
  if (rateLimited(clientIp(req))) {
    return res.status(429).json({
      ok: false,
      error: "Too many submissions. Please wait a minute and try again.",
    });
  }

  /* ---- 3. Parse body ---- */
  const raw = typeof req.body === "string" ? req.body : null;

  if (typeof req.body === "object" && req.body !== null) {
    // Already parsed by the runtime.
  } else if (raw) {
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
      return res.status(413).json({ ok: false, error: "Request body too large." });
    }
    try {
      req.body = JSON.parse(raw);
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid JSON body." });
    }
  } else {
    return res.status(400).json({ ok: false, error: "Request body is required." });
  }

  /* ---- 4. Validate ---- */
  const result = validate(req.body);

  if (!result.ok) {
    return res.status(400).json({
      ok: false,
      error: "Validation failed.",
      missing: result.missing,
      invalid: result.invalid,
    });
  }

  const { data } = result;

  /* ---- 5. Refuse early with a clear reason if not configured ----
   * No placeholder write, no silent success. The frontend shows this error
   * and offers a retry once the event team has filled in the env vars.
   * ---------------------------------------------------------- */
  if (!isConfigured()) {
    console.error("[biobyte] missing Microsoft/Excel environment variables");
    return res.status(503).json({
      ok: false,
      error:
        "Registration storage is not configured yet. Please contact the organisers.",
      code: "EXCEL_NOT_CONFIGURED",
    });
  }

  /* ---- 6. Append to Excel ---- */
  // Server time is authoritative so a client clock cannot skew the sheet.
  const values = [
    new Date().toISOString(),
    data.teamName,
    data.collegeName,
    data.memberNames,
    data.contactNumber,
    data.emailId,
    data.problemStatement,
    data.abstract,
    data.status,
  ];

  try {
    await appendRow(values);
  } catch (err) {
    return res.status(err.statusCode || 502).json({
      ok: false,
      error: err.message || "Could not save the registration.",
      code: "EXCEL_WRITE_FAILED",
    });
  }

  /* ---- 7. Success ---- */
  console.log(
    `[biobyte] registration saved | team="${data.teamName}" | columns=${COLUMNS.length}`,
  );

  return res.status(201).json({
    ok: true,
    message: "Registration saved.",
    columns: COLUMNS,
  });
}