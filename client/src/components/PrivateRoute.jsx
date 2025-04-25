import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, roles }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Check if the user is authenticated and has the required role
  if (!token || (roles && !roles.includes(userRole))) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;