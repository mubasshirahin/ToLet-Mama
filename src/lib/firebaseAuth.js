import { initializeApp } from "firebase/app";
import {
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const PROFILE_STORAGE_KEY = "toletmama.profile.v1";
const CURRENT_ROLE_KEY = "toletmama.profile.currentRole";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredConfig = {
  VITE_FIREBASE_API_KEY: firebaseConfig.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  VITE_FIREBASE_APP_ID: firebaseConfig.appId,
};

export const missingFirebaseConfigKeys = Object.entries(requiredConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const isFirebaseConfigured = missingFirebaseConfigKeys.length === 0;

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;

const providers = {
  google: () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return provider;
  },
  facebook: () => new FacebookAuthProvider(),
};

function readStoredProfiles() {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAuthenticatedProfile(role, user) {
  if (typeof window === "undefined" || !user) return;

  const name = user.displayName || user.email?.split("@")[0] || "ToLet Mama User";
  const profile = {
    name,
    email: user.email || "",
    avatar: user.photoURL || "",
  };

  try {
    const storedProfiles = readStoredProfiles();
    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        ...storedProfiles,
        [role]: {
          ...storedProfiles[role],
          ...profile,
        },
      })
    );
    window.localStorage.setItem(CURRENT_ROLE_KEY, role);
  } catch {
    // Authentication should not fail just because localStorage is unavailable.
  }
}

export async function signInWithSocialProvider(providerName, role) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error(
      `Firebase is missing: ${missingFirebaseConfigKeys.join(", ")}. Add these values to .env and restart Vite.`
    );
  }

  const providerFactory = providers[providerName];
  if (!providerFactory) {
    throw new Error("Unsupported social provider.");
  }

  try {
    const result = await signInWithPopup(auth, providerFactory());
    saveAuthenticatedProfile(role, result.user);
    return result.user;
  } catch (error) {
    if (error.code === "auth/unauthorized-domain") {
      throw new Error("This domain is not authorized in Firebase Authentication. Add localhost/127.0.0.1 in Firebase Console.");
    }
    if (error.code === "auth/operation-not-allowed") {
      throw new Error("This provider is disabled. Enable Google and Facebook in Firebase Authentication > Sign-in method.");
    }
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("The sign-in popup was closed before login finished.");
    }
    throw error;
  }
}
