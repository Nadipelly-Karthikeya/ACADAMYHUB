import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedCoordinatorRoute = ({ children }) => {
  const token = localStorage.getItem("coordinator_token");
  const role = localStorage.getItem("role");

  if (!token || role !== "coordinator") {
    return <Navigate to="/coordinator/login" replace />;
  }

  return children;
};

export default ProtectedCoordinatorRoute;
