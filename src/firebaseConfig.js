/**
 * BIOBYTE Firebase web configuration — PUBLIC values.
 *
 * These are public client identifiers, not secrets. They are compiled into
 * the browser bundle by design and are readable by anyone who views source,
 * which is exactly how the Firebase Web SDK is meant to ship. Your real
 * protections are Firebase Auth, Firestore and Storage security rules —
 * never this file.
 *
 * Why they are checked in: Vite inlines env vars at BUILD time, so a project
 * without VITE_FIREBASE_* set in Vercel previously threw at module scope and
 * took the entire site down with a black screen. With this fallback the app
 * always boots, and Registration comes up on its own the moment real env vars
 * are added.
 *
 * If VITE_FIREBASE_* is set in the environment, those values take precedence —
 * see src/firebase.js. So you can move to proper env vars at any time and this
 * file simply stops being used.
 */
export const FIREBASE_PUBLIC_CONFIG = {
  apiKey: "AIzaSyBP8Gq2rJixcEioJFsnEUkzAJdoDpQngr0",
  authDomain: "ben10-cc356.firebaseapp.com",
  projectId: "ben10-cc356",
  storageBucket: "ben10-cc356.firebasestorage.app",
  messagingSenderId: "978523355225",
  appId: "1:978523355225:web:fb076afcbf20c432211948",
  measurementId: "G-SYCEYET3D6",
};

export default FIREBASE_PUBLIC_CONFIG;