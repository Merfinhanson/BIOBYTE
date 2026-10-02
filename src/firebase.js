import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase web config.
 *
 * Read from Vite env vars (see .env.example) so no values are committed.
 * Set them in `.env.local` for local dev and in the Vercel dashboard for
 * production. These are public client identifiers (they ship in the bundle
 * by design) — the real protections are Firebase Auth + Firestore rules.
 *
 * Note: Vite inlines import.meta.env values at BUILD time. Adding these to
 * Vercel after a build does nothing until you redeploy without the cache.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/* Only what this app actually calls is fatal. Analytics identifiers are
   optional, so leaving one out must not take registration offline. */
const REQUIRED_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "appId",
];

const missing = REQUIRED_KEYS.filter((key) => !firebaseConfig[key]);

if (missing.length) {
  throw new Error(
    `Missing Firebase environment variables: ${missing.join(", ")}. ` +
      "For local dev copy .env.example to .env.local; for production set them " +
      "in Vercel → Project → Settings → Environment Variables, then redeploy " +
      "with the build cache disabled so Vite can inline them.",
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;