const PROFILE_STORAGE_KEY = "toletmama.profile.v1";
const CURRENT_ROLE_KEY = "toletmama.profile.currentRole";

function getClientId() {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!id) {
    console.warn("VITE_GOOGLE_CLIENT_ID not set in .env");
  }
  return id;
}

function isEduEmail(email) {
  if (!email) return false;
  const domain = email.split("@")[1];
  return domain?.toLowerCase().endsWith(".edu");
}

function readStoredProfiles() {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAuthenticatedProfile(role, user) {
  if (typeof window === "undefined" || !user) return;

  const name = user.name || user.email?.split("@")[0] || "User";
  const profiles = readStoredProfiles();
  profiles[user.email] = {
    name,
    email: user.email,
    picture: user.picture || null,
    role,
    lastLogin: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
    window.localStorage.setItem(CURRENT_ROLE_KEY, role);
  } catch {
    // Storage full or unavailable
  }
}

export function getStoredProfiles() {
  return readStoredProfiles();
}

export function getCurrentRole() {
  try {
    return window.localStorage.getItem(CURRENT_ROLE_KEY) || "Student";
  } catch {
    return "Student";
  }
}

export function clearStoredProfiles() {
  try {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    window.localStorage.removeItem(CURRENT_ROLE_KEY);
  } catch {
    // Ignore
  }
}

function decodeJWT(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

let currentCallback = null;
let currentRole = null;

function handleCredentialResponse(response) {
  if (!currentCallback) return;

  const payload = decodeJWT(response.credential);
  if (!payload) {
    currentCallback(new Error("Failed to verify Google sign-in. Please try again."), null);
    currentCallback = null;
    return;
  }

  const user = {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    sub: payload.sub,
    email_verified: payload.email_verified,
  };

  // Enforce .edu email check
  if (!isEduEmail(user.email)) {
    currentCallback(
      new Error("Only .edu email addresses are allowed. Please sign in with your institutional email."),
      null
    );
    currentCallback = null;
    return;
  }

  saveAuthenticatedProfile(currentRole, user);
  currentCallback(null, user);
  currentCallback = null;
}

export function initGoogleSignIn(containerId, callback, role) {
  const clientId = getClientId();
  if (!clientId) {
    callback(new Error("Google Client ID not configured. Add VITE_GOOGLE_CLIENT_ID to .env"), null);
    return;
  }

  currentCallback = callback;
  currentRole = role;

  const container = document.getElementById(containerId);
  if (!container) {
    callback(new Error("Sign-in button container not found"), null);
    return;
  }

  container.innerHTML = "";

  const initGIS = () => {
    if (typeof google === "undefined" || !google.accounts) {
      callback(new Error("Google Identity Services not loaded. Check your internet connection."), null);
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      cancel_on_tap_outside: false,
    });

    google.accounts.id.renderButton(container, {
      type: "standard",
      shape: "rectangular",
      theme: "outline",
      text: "signin_with",
      size: "large",
      width: 280,
      logo_alignment: "left",
    });
  };

  if (window.google?.accounts?.id) {
    initGIS();
  } else {
    // GIS script not loaded yet — load it dynamically
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGIS;
    script.onerror = () => {
      callback(new Error("Failed to load Google sign-in. Check your internet connection."), null);
    };
    document.head.appendChild(script);
  }
}

export function googleSignOut() {
  if (typeof google !== "undefined" && google.accounts) {
    google.accounts.id.disableAutoSelect();
  }
  clearStoredProfiles();
}