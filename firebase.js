import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export {
  app,
  auth,
  db,
  googleProvider,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
};

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.startsWith("YOUR_") &&
    !firebaseConfig.projectId.startsWith("YOUR_")
  );
}

export function friendlyAuthError(error) {
  const code = error?.code || "";
  const messages = {
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account exists with this email.",
    "auth/wrong-password": "The email or password is incorrect.",
    "auth/email-already-in-use": "An account already exists with this email.",
    "auth/weak-password": "Choose a stronger password.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/popup-blocked": "Your browser blocked the sign-in popup. Please allow popups or try again.",
    "auth/unauthorized-domain": "This website domain is not authorized in Firebase Authentication.",
    "auth/network-request-failed": "Network error. Check your internet connection and try again."
  };
  return messages[code] || error?.message || "Authentication failed. Please try again.";
}

export function createReferralCode(uid) {
  return `KS-${uid.slice(0, 8).toUpperCase()}`;
}

export async function ensureUserDocument(user, extra = {}) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const displayName = user.displayName || extra.name || user.email?.split("@")[0] || "Kingscale User";
    await setDoc(ref, {
      uid: user.uid,
      name: displayName,
      username: extra.username || displayName.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || `user${user.uid.slice(0, 6)}`,
      email: user.email || "",
      phone: extra.phone || "",
      age: extra.age ?? null,
      photoURL: user.photoURL || "",
      provider: user.providerData?.[0]?.providerId === "google.com" ? "Google" : "Email",
      referralCode: createReferralCode(user.uid),
      settings: {
        notifications: true,
        marketing: false,
        securityAlerts: true
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } else if (extra.syncProfile) {
    await updateDoc(ref, {
      name: user.displayName || snap.data().name || "Kingscale User",
      email: user.email || snap.data().email || "",
      photoURL: user.photoURL || snap.data().photoURL || "",
      updatedAt: serverTimestamp()
    });
  }

  const latest = await getDoc(ref);
  return latest.data();
}
