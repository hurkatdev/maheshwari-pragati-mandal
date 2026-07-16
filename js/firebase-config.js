// ── Firebase Project Config ───────────────────────────────────────────────────
// Replace every "YOUR_*" value with your actual Firebase project settings.
// Firebase Console → Project Settings → Your apps → Web app → SDK config
//
// After filling this in, also add these Authorized Domains in Firebase Console:
//   Authentication → Settings → Authorized domains:
//     • localhost
//     • hurkatdev.github.io
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
