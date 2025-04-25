import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to unauthorized page or home if role is not allowed
    return <Navigate to="/dashboard" replace />;
  }

  // Render children if authenticated and role is allowed
  return children;
};

export default ProtectedRoute;
