import React from "react";
import { Navigate } from "react-router-dom";

const PreventAuthRoute = ({ children }) => {
  const role = localStorage.getItem("role");
  const studentToken = localStorage.getItem("student_token");
  const coordinatorToken = localStorage.getItem("coordinator_token");

  // STUDENT logged in → redirect to student dashboard
  if (role === "student" && studentToken) {
    return <Navigate to="/student/dashboard" replace />;
  }

  // COORDINATOR logged in → redirect to coordinator dashboard
  if (role === "coordinator" && coordinatorToken) {
    return <Navigate to="/coordinator/dashboard" replace />;
  }

  return children; // show login/register page if no user logged in
};

export default PreventAuthRoute;
