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
      localStorage.removeItem("toletmama.api_token");
      localStorage.removeItem("toletmama.api_user");
      // Redirect to auth page if not already there
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth";
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
