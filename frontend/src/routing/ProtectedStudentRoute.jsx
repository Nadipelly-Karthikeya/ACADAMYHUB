import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedStudentRoute = ({ children }) => {
  const token = localStorage.getItem("student_token");
  const role = localStorage.getItem("role");

  // If there is no token OR wrong role -> redirect to login
  if (!token || role !== "student") {
    return <Navigate to="/student/login" replace />;
  }

  return children; // allow access
};

export default ProtectedStudentRoute;
