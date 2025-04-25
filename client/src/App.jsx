import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import ManageUsers from "./pages/ManageUsers";
import ReviewReports from "./pages/ReviewReports";
import Settings from "./pages/Settings";
import EmployeePanel from "./pages/EmployeePanel";
import ManagerPanel from "./pages/ManagerPanel";
import AdminPanels from "./pages/AdminPanels";
import ProtectedRoute from "./components/ProtectedRoute"; // Changed the name
import ViewReports from "./pages/ViewReports";
import Footer from "./components/Footer";
import { Box } from "@mui/material";
import SystemSettings from "./pages/SystemSettings"; // Import SystemSettings

function App() {
  return (
    <Router>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Routes>
          <Route
            path="/"
            element={
              localStorage.getItem("token") ? (
                <Navigate to="/dashboard" />
              ) : (
                <Home />
              )
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-report"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "District Expert",
                  "Operation Manager",
                  "Customer Relation Manager",
                  "System Admin",
                ]}
              >
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-users"
            element={
              <ProtectedRoute allowedRoles={["System Admin"]}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review-reports"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Head Office Expert",
                  "District Manager",
                  "System Admin",
                ]}
              >
                <ReviewReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-settings" // Add the new route
            element={
              <ProtectedRoute allowedRoles={["System Admin"]}>
                <SystemSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-panel"
            element={
              <ProtectedRoute>
                <EmployeePanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager-panel"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Operation Manager",
                  "Customer Relation Manager",
                  "District Manager",
                  "System Admin",
                ]}
              >
                <ManagerPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute>
                <AdminPanels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-reports"
            element={
              <ProtectedRoute>
                <ViewReports />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
      <Footer />
    </Router>
  );
}

export default App;
