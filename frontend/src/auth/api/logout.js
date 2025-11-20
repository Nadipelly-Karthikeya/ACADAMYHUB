export const logout = () => {
  // Remove ALL possible tokens
  localStorage.removeItem("student_token");
  localStorage.removeItem("student_refresh_token");
  localStorage.removeItem("student_verify_jwt");

  localStorage.removeItem("coordinator_token");
  localStorage.removeItem("coordinator_refresh_token");
  localStorage.removeItem("coordinator_verify_jwt");

  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_refresh_token");

  // Remove any extra future tokens
  localStorage.removeItem("auth_token");
  localStorage.removeItem("role");

  // Try redirecting user based on saved role
  const role = localStorage.getItem("role");

  if (role === "student") {
    window.location.href = "/student/login";
  } else if (role === "coordinator") {
    window.location.href = "/coordinator/login";
  } else if (role === "admin") {
    window.location.href = "/admin/login";
  } else {
    // default fallback
    window.location.href = "/";
  }
};
