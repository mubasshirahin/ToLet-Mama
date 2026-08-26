import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach auth token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("toletmama.api_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally (token expired / invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only force-logout when /auth/me itself fails — token is genuinely dead.
      // Other 401s (e.g. /profile, /dashboard/stats) should NOT wipe the session,
      // because a single transient failure would kick the user out.
      if ((error.config?.url || "").includes("/auth/me")) {
        localStorage.removeItem("toletmama.api_token");
        localStorage.removeItem("toletmama.api_user");
        if (!window.location.pathname.startsWith("/auth")) {
          window.location.href = "/auth";
        }
      }
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export async function registerUser({ name, email, password }) {
  const { data } = await api.post("/auth/register", {
    name,
    email,
    password,
    password_confirmation: password,
  });
  localStorage.setItem("toletmama.api_token", data.token);
  localStorage.setItem("toletmama.api_user", JSON.stringify(data.user));
  return data;
}

export async function loginUser({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("toletmama.api_token", data.token);
  localStorage.setItem("toletmama.api_user", JSON.stringify(data.user));
  return data;
}

export async function loginWithGoogle(credential) {
  const { data } = await api.post("/auth/google", { credential });
  localStorage.setItem("toletmama.api_token", data.token);
  localStorage.setItem("toletmama.api_user", JSON.stringify(data.user));
  return data;
}

export async function logoutUser() {
  await api.post("/auth/logout");
  localStorage.removeItem("toletmama.api_token");
  localStorage.removeItem("toletmama.api_user");
}

export async function getCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data;
}

// ---- Listings ----
export async function fetchListings(params = {}) {
  const { data } = await api.get("/listings", { params });
  return data;
}

export async function fetchListing(id) {
  const { data } = await api.get(`/listings/${id}`);
  return data;
}

export async function createListing(listingData) {
  const { data } = await api.post("/listings", listingData);
  return data;
}

export async function updateListing(id, listingData) {
  const { data } = await api.put(`/listings/${id}`, listingData);
  return data;
}

export async function deleteListing(id) {
  await api.delete(`/listings/${id}`);
}

export async function fetchMyListings() {
  const { data } = await api.get("/my/listings");
  return data;
}

// ---- Dashboard ----
export async function fetchDashboardStats() {
  const { data } = await api.get("/dashboard/stats");
  return data;
}

// ---- Favorites ----
export async function fetchFavorites() {
  const { data } = await api.get("/favorites");
  return data;
}

export async function toggleFavorite(listingId) {
  const { data } = await api.post(`/favorites/${listingId}`);
  return data;
}

export async function removeFavorite(listingId) {
  const { data } = await api.delete(`/favorites/${listingId}`);
  return data;
}

// ---- Listing Views ----
export async function recordListingView(listingId) {
  const { data } = await api.post(`/listings/${listingId}/view`);
  return data;
}

export async function fetchListingMonthlyViews(listingId) {
  const { data } = await api.get(`/listings/${listingId}/views/monthly`);
  return data;
}

// ---- Profile ----
export async function fetchProfile() {
  const { data } = await api.get("/profile");
  return data;
}

export async function updateProfile(profileData) {
  const { data } = await api.put("/profile", profileData);
  // Sync updated user data back to localStorage so Dashboard and other pages stay in sync
  if (data.user) {
    localStorage.setItem("toletmama.api_user", JSON.stringify({ ...JSON.parse(localStorage.getItem("toletmama.api_user") || "{}"), ...data.user }));
  }
  return data;
}

export async function updatePassword({ current_password, new_password }) {
  const { data } = await api.put("/profile/password", {
    current_password,
    new_password,
  });
  return data;
}

// ---- Messages ----
export async function fetchConversations() {
  const { data } = await api.get("/messages");
  return data;
}

export async function fetchConversation(userId) {
  const { data } = await api.get(`/messages/${userId}`);
  return data;
}

export async function sendMessage({ receiver_id, listing_id, body }) {
  const { data } = await api.post("/messages", {
    receiver_id,
    listing_id,
    body,
  });
  return data;
}

export async function fetchUnreadCount() {
  const { data } = await api.get("/messages/unread/count");
  return data;
}

export default api;
