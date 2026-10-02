# BIOBYTE

Biotechnology hackathon landing page and registration portal for Crescent
Technocrats Club.

React 19 + Vite frontend, Vercel serverless API, Firebase Auth/Firestore/
Storage, and Microsoft Graph for appending each registration to an Excel
workbook table.

---

## How registration data flows

```
Browser (Registration.jsx)
   │  1. Google sign-in + email verification   → Firebase Auth
   │  2. PPT upload                            → Firebase Storage
   │  3. Registration record                   → Firestore  (source of truth)
   │  4. Team details                          → POST /api/register
   ▼
Vercel serverless function (api/register.js)
   │  app-only token (client credentials)
   ▼
Microsoft Graph → append one row → Excel workbook table
```

Firestore is the durable record. The Excel append happens **after** Firestore
saves, so a spreadsheet outage never loses a registration. If the Excel call
fails, the UI keeps the payload and offers **Retry spreadsheet sync**, which
retries only the spreadsheet — it does not re-upload the PPT or create a
duplicate Firestore document.

The browser never talks to Microsoft Graph and never sees a secret.

---

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "BIOBYTE: site, registration and Excel sync"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

`.env`, `.env.local` and `.vercel` are git-ignored. Only `.env.example` is
tracked, so no secrets enter the repository.

---

## 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. **Add New → Project**, then import the GitHub repository.
3. Vercel auto-detects **Vite**. Confirm:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Click **Deploy**.

`vercel.json` already declares the same values plus a rewrite that excludes
`/api/` so the SPA fallback can never swallow the serverless route.

---

## 3. Environment variables

**Settings → Environment Variables → Add all.** Apply to Production,
Preview and Development.

**Frontend (build-time, must keep the `VITE_` prefix):**

| Variable | Source |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase console → Project settings → Your apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | same |
| `VITE_FIREBASE_PROJECT_ID` | same |
| `VITE_FIREBASE_STORAGE_BUCKET` | same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | same |
| `VITE_FIREBASE_APP_ID` | same |
| `VITE_FIREBASE_MEASUREMENT_ID` | same |

**Backend (runtime, no prefix — never exposed to the browser):**

| Variable | Source |
| --- | --- |
| `MICROSOFT_TENANT_ID` | Entra ID → App registrations → Directory (tenant) ID |
| `MICROSOFT_CLIENT_ID` | Entra ID → App registrations → Application (client) ID |
| `MICROSOFT_CLIENT_SECRET` | Entra ID → Certificates & secrets (shown once) |
| `EXCEL_WORKBOOK_ID` | the workbook file id |
| `EXCEL_TABLE_NAME` | the table name inside the workbook |
| `EXCEL_DRIVE_ID` | only if the workbook is on a named shared drive |

Vercel redeploys automatically after environment changes:
**Deployments → ⋮ → Redeploy**.

---

## 4. Prepare the Excel workbook

The workbook **must contain a Table**, not just a sheet range.

1. Open the workbook → `Insert` → `Table` (or `Format as Table`).
2. Name it (this becomes `EXCEL_TABLE_NAME`), e.g. `Registrations`.
3. Set the header row to match `COLUMNS` in `api/register.js` exactly, in
   the same order:

   | Timestamp | Team Name | College Name | Member Names | Contact Number | Email ID | Problem Statement | Abstract / Description | Status |
   | --- | --- | --- | --- | --- | --- | --- | --- | --- |

   A mismatch in names or order makes Graph reject the row.

### Grant the app access to the workbook

1. Share the workbook with the account that owns the app registration
   (or its group), with **Can edit**. For app-only permissions this is
   required — personal OneDrive files are not reachable by the
   client-credentials flow.
2. Entra ID → App registrations → **API permissions** → add Microsoft Graph
   **Application** permission `Files.ReadWrite.All` → **Grant admin consent**.
   `Sites.Selected` is the least-privilege alternative if you want to avoid
   tenant-wide file access.

---

## 5. Test the registration flow

**Locally** — the Vercel function is not served by `vite dev`, so run the
API route with the Vercel CLI:

```bash
npm install -g vercel
vercel login
vercel dev          # serves the frontend and /api together
```

Then open the printed URL, register, and check the function output. To test
the endpoint alone:

```bash
curl -i -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2026-01-01T00:00:00.000Z",
    "teamName": "Test Team",
    "collegeName": "Crescent Institute",
    "memberNames": "Asha Rao, Bo Li",
    "contactNumber": "+91 98765 43210",
    "emailId": "asha@crescent.education",
    "problemStatement": "CF-01 — Upgrade",
    "abstract": "A test abstract that is comfortably longer than thirty characters.",
    "status": "registered"
  }'
```

Expected: `201` with `{"ok":true,...}`. A `503` with
`EXCEL_NOT_CONFIGURED` means the Microsoft env vars are missing; a `502` means
auth or the workbook/table lookup failed — read the function logs.

**On Vercel** — redeploy, then submit the real form. Confirm:

1. A `registrations` document appears in Firestore.
2. The PPT appears in Firebase Storage.
3. A new row appears at the top of the Excel table.

---

## Environment variables reference

| Variable | Used by | Purpose |
| --- | --- | --- |
| `VITE_FIREBASE_*` | Vite build | Firebase Auth/Firestore/Storage client config (public) |
| `MICROSOFT_TENANT_ID` | `api/register.js` | Entra tenant for the token request |
| `MICROSOFT_CLIENT_ID` | `api/register.js` | App registration client id |
| `MICROSOFT_CLIENT_SECRET` | `api/register.js` | Client secret for app-only auth |
| `EXCEL_WORKBOOK_ID` | `api/register.js` | Target workbook file id |
| `EXCEL_TABLE_NAME` | `api/register.js` | Table to append rows to |
| `EXCEL_DRIVE_ID` | `api/register.js` | Shared-drive id; defaults to `b` |
| `VERCEL_URL` | informational | Auto-provided by Vercel |

---

## Commands

```bash
npm install
npm run dev       # local frontend (Vite)
npm run build     # production build
npm run preview   # preview the build
npm run lint      # oxlint
vercel dev        # frontend + /api together
```

---

## Security notes

- No secret is ever shipped to the browser. Only `VITE_FIREBASE_*` values
  are public, and Firebase Auth plus Firestore/Storage rules are what
  protect data — verify those rules are locked down.
- `api/register.js` accepts POST only, validates and length-caps every
  field, and never echoes Microsoft errors or identifiers back to the client.
- The per-IP rate limit in `api/register.js` is a courtesy guard. Serverless
  instances are ephemeral, so it is **not** a hard limit — add a WAF rule or
  a shared store (Upstash / Vercel KV) before a public launch.
- Firebase Auth is the real access gate: unapproved email domains are
  rejected in `src/config/access.js` before the form is reachable.