import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

// 1. Import your logo (adjust the path if your logo/folder is named differently)
import logo from "../assets/logo.png"; // Assuming logo.png is in src/assets

const Navbar = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    navigate("/"); // Navigate to the home page
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* 2. Add the logo */}
        <Box
          component="img"
          sx={{
            height: 40, // Adjust height as needed
            mr: 2, // Add some margin to the right (theme spacing)
            cursor: "pointer", // Optional: make it look clickable
          }}
          alt="Omo Bank Logo"
          src={logo}
          onClick={() => navigate("/")} // Optional: Make logo link to home
        />

        {/* Title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Omo Bank ReportServer
        </Typography>

        {/* Navigation Buttons */}
        <Box>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          {token ? (
            <>
              {/* ... (rest of your conditional buttons remain the same) ... */}
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
              {role === "Head Office Expert" && (
                <Button color="inherit" component={Link} to="/review-reports">
                  Review Reports
                </Button>
              )}
              {role !== "Head Office Expert" && (
                <Button color="inherit" component={Link} to="/view-reports">
                  View Reports
                </Button>
              )}
              {(role === "District Expert" ||
                role === "Operation Manager" ||
                role === "Customer Relation Manager") && (
                <Button color="inherit" component={Link} to="/create-report">
                  Create Report
                </Button>
              )}
              {role === "System Admin" && (
                <>
                  <Button color="inherit" component={Link} to="/manage-users">
                    Manage Users
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/system-settings"
                  >
                    System Settings
                  </Button>
                </>
              )}
              {role !== "System Admin" &&
                role !== "District Expert" &&
                role !== "Operation Manager" &&
                role !== "Customer Relation Manager" &&
                role !== "Head Office Expert" && (
                  <>
                    <Button color="inherit" component={Link} to="/settings">
                      Settings
                    </Button>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/employee-panel"
                    >
                      Employee Panel
                    </Button>
                  </>
                )}
              {(role === "Operation Manager" ||
                role === "Customer Relation Manager" ||
                role === "District Manager") && (
                <Button color="inherit" component={Link} to="/manager-panel">
                  Manager Panel
                </Button>
              )}

              {role === "System Admin" && (
                <Button color="inherit" component={Link} to="/admin-panel">
                  Admin Panel
                </Button>
              )}
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
