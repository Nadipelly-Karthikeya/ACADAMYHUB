import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:4000/api/v1",
});

// PUBLIC ROUTES
const publicEndpoints = [
  "/auth/student/register",
  "/auth/student/login",
  "/auth/student/verify-email",

  "/auth/admin/register",
  "/auth/admin/login",
  "/auth/admin/verify-email",
];

// ------------------------------------------------------
// REQUEST INTERCEPTOR
// ------------------------------------------------------
axiosClient.interceptors.request.use((config) => {
  const cleanUrl = config.url.startsWith("/") ? config.url : `/${config.url}`;

  console.log("REQUEST:", cleanUrl);

  // PUBLIC ROUTE → REMOVE TOKEN
  if (publicEndpoints.some((ep) => cleanUrl.startsWith(ep))) {
    delete config.headers.Authorization;
    return config;
  }

  // PRIVATE ROUTE → ATTACH TOKEN
  const role = localStorage.getItem("role");
  let token = null;

  if (role === "student") token = localStorage.getItem("student_token");
  if (role === "coordinator") token = localStorage.getItem("coordinator_token");
  if (role === "admin") token = localStorage.getItem("admin_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ------------------------------------------------------
// RESPONSE INTERCEPTOR → REFRESH TOKEN HANDLING
// ------------------------------------------------------
axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "Access token expired" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const role = localStorage.getItem("role");

        let refreshToken = null;

        if (role === "student") {
          refreshToken = localStorage.getItem("student_refresh_token");
        } else if (role === "coordinator") {
          refreshToken = localStorage.getItem("coordinator_refresh_token");
        } else if (role === "admin") {
          refreshToken = localStorage.getItem("admin_refresh_token");
        }

        // Call refresh token API
        const refreshRes = await axios.post(
          "http://localhost:4000/api/v1/auth/refresh-token",
          { refreshToken }
        );

        const newAccessToken = refreshRes.data.data.accessToken;

        // Save new token in correct location
        if (role === "student")
          localStorage.setItem("student_token", newAccessToken);

        if (role === "coordinator")
          localStorage.setItem("coordinator_token", newAccessToken);

        if (role === "admin")
          localStorage.setItem("admin_token", newAccessToken);

        // Attach new token to original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry request
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        console.error("REFRESH TOKEN FAILED:", refreshErr);

        // Auto logout user
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
