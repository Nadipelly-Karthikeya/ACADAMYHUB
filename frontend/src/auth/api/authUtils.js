export const isLoggedIn = () => {
  return (
    localStorage.getItem("student_token") ||
    localStorage.getItem("coordinator_token") ||
    localStorage.getItem("admin_token")
  );
};
