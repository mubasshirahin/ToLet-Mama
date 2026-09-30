import axios from "axios";

// Same-origin by default: in production Laravel serves the SPA and the API
// from the same host, so relative "/api" avoids hardcoded domains.
// Local dev can still override via VITE_API_URL (see root .env).
const API_BASE = import.meta.env.VITE_API_URL || "/api";

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
        // Basename-aware: the SPA is served under /app/ in production.
        const loginPath = `${import.meta.env.BASE_URL || "/"}auth`.replace(/\/+/g, "/");
        if (!window.location.pathname.startsWith(loginPath)) {
          window.location.href = loginPath;
        }
      }
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export async function registerUser({ name, email, password, role }) {
  const { data } = await api.post("/auth/register", {
    name,
    email,
    password,
    password_confirmation: password,
    role,
  });
  localStorage.setItem("toletmama.api_token", data.token);
  localStorage.setItem("toletmama.api_user", JSON.stringify(data.user));
  return data;
}

export async function loginUser({ email, password, role }) {
  const { data } = await api.post("/auth/login", { email, password, role });
  localStorage.setItem("toletmama.api_token", data.token);
  localStorage.setItem("toletmama.api_user", JSON.stringify(data.user));
  return data;
}

export async function loginWithGoogle(credential, role) {
  const { data } = await api.post("/auth/google", { credential, role });
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

export async function fetchAllListings(params = {}) {
  const firstPage = await fetchListings({ ...params, page: 1 });
  const listings = [...(firstPage.data || [])];
  const lastPage = Number(firstPage.last_page) || 1;

  if (lastPage > 1) {
    const remainingPages = await Promise.all(
      Array.from({ length: lastPage - 1 }, (_, index) =>
        fetchListings({ ...params, page: index + 2 })
      )
    );
    remainingPages.forEach((page) => listings.push(...(page.data || [])));
  }

  return listings;
}

export async function fetchListing(id) {
  const { data } = await api.get(`/listings/${id}`);
  return data;
}

async function listingToFormData(listingData, updating = false) {
  const body = new FormData();
  const photos = [
    ["images", listingData.images || []],
    ["washroom_images", listingData.washroom_images || []],
    ["balcony_images", listingData.balcony_images || []],
  ];
  for (const [key, values] of photos) {
    body.append(key + "_present", "1");
    let fileIndex = 0;
    for (const value of values) {
      if (value instanceof File) body.append(key + "[]", value);
      else if (typeof value === "string" && value.startsWith("data:image/")) {
        const blob = await (await fetch(value)).blob();
        const extension = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
        body.append(key + "[]", new File([blob], "listing-" + key + "-" + fileIndex++ + "." + extension, { type: blob.type }));
      } else if (typeof value === "string" && value) body.append("existing_" + key + "[]", value);
    }
  }
  const structured = new Set(["highlights", "specs", "amenities", "rules", "nearby"]);
  for (const [key, value] of Object.entries(listingData)) {
    if (["images", "washroom_images", "balcony_images"].includes(key)) continue;
    if (structured.has(key)) body.append(key + "_json", JSON.stringify(value ?? []));
    else if (value !== undefined && value !== null) body.append(key, String(value));
  }
  if (updating) body.append("_method", "PUT");
  return body;
}

export async function createListing(listingData) {
  const body = await listingToFormData(listingData);
  const { data } = await api.post("/listings", body, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}

export async function updateListing(id, listingData) {
  const body = await listingToFormData(listingData, true);
  const { data } = await api.post(`/listings/${id}`, body, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}

export async function deleteListing(id) {
  await api.delete(`/listings/${id}`);
}

export async function fetchMyListings(params = {}) {
  const query = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined));
  const { data } = await api.get("/my/listings", { params: query });
  return data;
}

export async function fetchMyListingAnalytics() {
  const { data } = await api.get("/my/listings/analytics");
  return data;
}

export async function fetchDraft() {
  const { data } = await api.get("/my/draft");
  return data;
}

export async function saveDraft(draftData) {
  const { data } = await api.post("/my/draft", { data: draftData });
  return data;
}

export async function deleteDraft() {
  const { data } = await api.delete("/my/draft");
  return data;
}

// ---- Dashboard ----
export async function fetchDashboardStats() {
  const { data } = await api.get("/dashboard/stats");
  return data;
}

// ---- Favorites ----
export async function fetchFavorites() {
  const { data } = await api.get("/users/favorites");
  return data;
}

export async function saveFavorite(listingId) {
  const { data } = await api.post(`/users/favorites/${listingId}`);
  return data;
}

export async function removeFavorite(listingId) {
  const { data } = await api.delete(`/users/favorites/${listingId}`);
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

export async function fetchInterestedUsers(listingId) {
  const { data } = await api.get(`/listings/${listingId}/interested`);
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

// ---- Marketplace tools ----
export async function fetchNotifications() { return (await api.get("/notifications")).data; }
export async function fetchUnreadNotificationCount() { return (await api.get("/notifications/unread/count")).data; }
export async function readNotification(id) { return (await api.post(`/notifications/${id}/read`)).data; }
export async function fetchAppointments() { return (await api.get("/appointments")).data; }
export async function requestViewing(listingId, details) { return (await api.post(`/listings/${listingId}/appointments`, details)).data; }
export async function updateViewing(id, details) { return (await api.put(`/appointments/${id}`, details)).data; }
export async function reportListing(listingId, details) { return (await api.post(`/listings/${listingId}/reports`, details)).data; }
export async function fetchRoommates(params = {}) { return (await api.get("/roommates", { params })).data; }
export async function fetchRoommateProfile() { return (await api.get("/roommates/profile")).data; }
export async function saveRoommateProfile(profile) { return (await api.put("/roommates/profile", profile)).data; }
export async function fetchSavedSearches() { return (await api.get("/saved-searches")).data; }
export async function saveSearch(search) { return (await api.post("/saved-searches", search)).data; }
export async function deleteSearch(id) { return (await api.delete(`/saved-searches/${id}`)).data; }
export async function submitVerification(form) {
  const body = new FormData();
  Object.entries(form).forEach(([key, value]) => { if (value !== undefined && value !== null) body.append(key, value); });
  return (await api.post("/profile/verification", body, { headers: { "Content-Type": "multipart/form-data" } })).data;
}
export async function fetchAdminReports() { return (await api.get("/admin/reports")).data; }
export async function resolveAdminReport(id, status) { return (await api.put(`/admin/reports/${id}`, { status })).data; }
export async function fetchVerificationQueue() { return (await api.get("/admin/verifications")).data; }
export async function decideVerification(id, status) { return (await api.put(`/admin/verifications/${id}`, { status })).data; }
export async function downloadVerificationDocument(id) {
  const { data } = await api.get(`/admin/verifications/${id}/document`, { responseType: "blob" });
  return URL.createObjectURL(data);
}

export default api;
