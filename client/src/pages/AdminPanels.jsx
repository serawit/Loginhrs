import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  // Link, // MUI Link not strictly needed if using Button with RouterLink
  // Icon, // MUI Icon components are imported directly (e.g., PeopleIcon)
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People"; // Icon for Manage Users
import SettingsIcon from "@mui/icons-material/Settings"; // Icon for System Settings
import AssessmentIcon from "@mui/icons-material/Assessment"; // Icon for Reports Overview

// --- Add Icons for Stats Placeholder ---
import GroupIcon from "@mui/icons-material/Group"; // Icon for Total Users
import DescriptionIcon from "@mui/icons-material/Description"; // Icon for Reports Submitted
import PendingActionsIcon from "@mui/icons-material/PendingActions"; // Icon for Pending Approvals
// --- End Icon Additions ---

const AdminPanels = () => {
  // Style for the paper sections
  const paperStyle = {
    p: 3, // Padding
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Center content
    height: "100%", // Make papers in a row equal height
  };

  return (
    <Container maxWidth="lg">
      <Box mt={4} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Admin Panel
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          Quick access to system administration tasks and overview.
        </Typography>

        {/* --- Top Navigation Sections (Already have icons) --- */}
        <Grid container spacing={4}>
          {/* Link to Manage Users */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} sx={paperStyle}>
              <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6" component="h2" gutterBottom>
                User Management
              </Typography>
              <Typography variant="body2" align="center" sx={{ mb: 3 }}>
                Create, view, edit, and delete user accounts and manage their
                roles.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/manage-users"
                startIcon={<PeopleIcon />}
              >
                Manage Users
              </Button>
            </Paper>
          </Grid>

          {/* Link to System Settings */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} sx={paperStyle}>
              <SettingsIcon color="secondary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6" component="h2" gutterBottom>
                System Configuration
              </Typography>
              <Typography variant="body2" align="center" sx={{ mb: 3 }}>
                Configure system settings, manage report workflows, and other
                parameters.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                component={RouterLink}
                to="/system-settings"
                startIcon={<SettingsIcon />}
              >
                System Settings
              </Button>
            </Paper>
          </Grid>

          {/* Link for Reports Overview */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} sx={paperStyle}>
              <AssessmentIcon
                sx={{ fontSize: 40, mb: 2, color: "success.main" }}
              />
              <Typography variant="h6" component="h2" gutterBottom>
                Reports Overview
              </Typography>
              <Typography variant="body2" align="center" sx={{ mb: 3 }}>
                View overall report statistics and manage report statuses if
                needed.
              </Typography>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "success.main",
                  "&:hover": { backgroundColor: "success.dark" },
                }}
                component={RouterLink}
                to="/dashboard"
                startIcon={<AssessmentIcon />}
              >
                View Dashboard
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* --- System Statistics Placeholder Section --- */}
        <Box mt={5}>
          <Typography variant="h5" component="h2" gutterBottom align="center">
            System Statistics (Coming Soon)
          </Typography>
          <Paper
            elevation={2}
            sx={{
              p: 3, // Increased padding slightly
              mt: 2,
              // Removed fixed background color to use theme's paper color
            }}
          >
            {/* --- Modified Placeholder Content with Icons --- */}
            <Grid
              container
              spacing={2}
              justifyContent="center"
              alignItems="stretch"
            >
              {" "}
              {/* Use stretch for equal height items */}
              {/* Stat 1: Total Users */}
              <Grid
                item
                xs={12}
                sm={4}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                  textAlign: "center",
                  borderRight: { sm: "1px solid #e0e0e0" },
                }}
              >
                {" "}
                {/* Add border */}
                <GroupIcon color="action" sx={{ fontSize: 35, mb: 1 }} />
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ minHeight: "3em" }}
                >
                  {" "}
                  {/* Ensure min height for alignment */}
                  Total Users
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  --
                </Typography>{" "}
                {/* Placeholder value */}
              </Grid>
              {/* Stat 2: Reports Submitted */}
              <Grid
                item
                xs={12}
                sm={4}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                  textAlign: "center",
                  borderRight: { sm: "1px solid #e0e0e0" },
                }}
              >
                {" "}
                {/* Add border */}
                <DescriptionIcon color="action" sx={{ fontSize: 35, mb: 1 }} />
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ minHeight: "3em" }}
                >
                  Reports Submitted
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  --
                </Typography>{" "}
                {/* Placeholder value */}
              </Grid>
              {/* Stat 3: Pending Approvals */}
              <Grid
                item
                xs={12}
                sm={4}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                  textAlign: "center",
                }}
              >
                <PendingActionsIcon
                  color="action"
                  sx={{ fontSize: 35, mb: 1 }}
                />
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ minHeight: "3em" }}
                >
                  Pending Approvals
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  --
                </Typography>{" "}
                {/* Placeholder value */}
              </Grid>
            </Grid>
            {/* --- End Modified Placeholder Content --- */}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminPanels;
