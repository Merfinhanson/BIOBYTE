import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { FIREBASE_PUBLIC_CONFIG } from "./firebaseConfig";

/**
 * Firebase web config.
 *
 * Resolution order: VITE_FIREBASE_* env vars (Vercel) win when present,
 * otherwise the checked-in public config in ./firebaseConfig.js is used.
 *
 * This module deliberately does NOT throw when a value is absent. It used to,
 * and because Registration is lazily imported that single throw unmounted the
 * whole React tree — a blank site over a missing analytics id. Failing soft
 * here keeps the marketing site up no matter what the deploy looks like.
 */
const fromEnv = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firebaseConfig = { ...FIREBASE_PUBLIC_CONFIG };

Object.entries(fromEnv).forEach(([key, value]) => {
  if (value) firebaseConfig[key] = value;
});

/* Only what this app actually calls is fatal. Analytics identifiers are
   optional, so leaving one out must not take registration offline. */
const REQUIRED_KEYS = ["apiKey", "authDomain", "projectId", "storageBucket", "appId"];
const missing = REQUIRED_KEYS.filter((key) => !firebaseConfig[key]);

if (missing.length) {
  // eslint-disable-next-line no-console
  console.warn(
    `[BIOBYTE] Firebase config incomplete: ${missing.join(", ")}. ` +
      "Registration will not work until these are provided, via VITE_FIREBASE_* " +
      "env vars or src/firebaseConfig.js.",
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;