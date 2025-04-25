// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  List, // Import List components
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider, // Import Divider
  Chip, // For status indicators
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import format from "date-fns/format"; // For formatting dates

// Import dashboard widgets/components
import AuditLogDisplay from "../components/dashboard/AuditLogDisplay";
import api from "../services/api";

// --- Import Icons for Report Activity ---
import VisibilityIcon from "@mui/icons-material/Visibility"; // Most Viewed
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline"; // Recently Executed
import TimerIcon from "@mui/icons-material/Timer"; // Execution Times
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"; // Failed Executions
import ScheduleIcon from "@mui/icons-material/Schedule"; // Scheduled Runs
import PersonIcon from "@mui/icons-material/Person"; // Reports by User
import BusinessIcon from "@mui/icons-material/Business"; // Reports by Unit
import TrendingUpIcon from "@mui/icons-material/TrendingUp"; // Generic stat icon
// --- End Icon Imports ---

const Dashboard = () => {
  // Existing state
  const [generalData, setGeneralData] = useState(null);
  const [loadingGeneral, setLoadingGeneral] = useState(true);
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [errorAudit, setErrorAudit] = useState(null);

  // --- New State for Report Activity ---
  const [reportActivity, setReportActivity] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [errorActivity, setErrorActivity] = useState(null);
  // --- End New State ---

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // Effect for general data (keep as is)
  useEffect(() => {
    // ... existing general data fetch logic ...
    setLoadingGeneral(false); // Simulating load finish
  }, [token, navigate]);

  // Effect for audit logs (keep as is)
  useEffect(() => {
    // ... existing audit log fetch logic ...
  }, [role, token]);

  // --- New Effect for Report Activity ---
  useEffect(() => {
    const fetchReportActivity = async () => {
      // Check if user role should see this data (e.g., System Admin)
      if (role === "System Admin" && token) {
        setLoadingActivity(true);
        setErrorActivity(null);
        try {
          // *** Replace with your actual backend endpoint ***
          const { data } = await api.get("/dashboard/report-activity"); // Example endpoint
          setReportActivity(data);
        } catch (err) {
          console.error("Failed to fetch report activity:", err);
          setErrorActivity(
            err.response?.data?.message ||
              err.message ||
              "Failed to load report activity"
          );
        } finally {
          setLoadingActivity(false);
        }
      } else {
        // If user role shouldn't see this, ensure loading is false and data is null
        setLoadingActivity(false);
        setReportActivity(null);
      }
    };

    fetchReportActivity();
  }, [role, token]); // Re-run if role or token changes
  // --- End New Effect ---

  // --- Loading / Error Handling (Combined or separate) ---
  if (loadingGeneral) {
    // Keep general loading check
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  if (errorGeneral) {
    // Keep general error check
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Failed to load dashboard data: {errorGeneral}
        </Alert>
      </Container>
    );
  }
  // --- End Loading / Error Handling ---

  // --- Helper Function to Render Lists ---
  const renderActivityList = (
    title,
    icon,
    items,
    primaryKey,
    secondaryKey = null,
    countKey = null
  ) => {
    if (!items || items.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
          No data available.
        </Typography>
      );
    }
    return (
      <>
        <Typography
          variant="h6"
          sx={{ px: 2, pt: 2, display: "flex", alignItems: "center" }}
        >
          {icon && React.cloneElement(icon, { sx: { mr: 1 } })} {title}
        </Typography>
        <List dense>
          {items.slice(0, 5).map(
            (
              item,
              index // Show top 5 for brevity
            ) => (
              <ListItem
                key={
                  item.reportId ||
                  item.scheduleId ||
                  item.userId ||
                  item.unitName ||
                  index
                }
              >
                <ListItemText
                  primary={item[primaryKey]}
                  secondary={
                    <>
                      {secondaryKey && item[secondaryKey]
                        ? ` (${
                            typeof item[secondaryKey] === "string" &&
                            item[secondaryKey].includes("T")
                              ? format(new Date(item[secondaryKey]), "Pp")
                              : item[secondaryKey]
                          })`
                        : ""}
                      {countKey && item[countKey]
                        ? ` - ${item[countKey]} views/runs`
                        : ""}
                    </>
                  }
                />
                {item.status && (
                  <Chip
                    label={item.status}
                    size="small"
                    color={
                      item.status === "Success"
                        ? "success"
                        : item.status === "Failed"
                        ? "error"
                        : "default"
                    }
                  />
                )}
              </ListItem>
            )
          )}
        </List>
      </>
    );
  };
  // --- End Helper Function ---

  // --- Render Main Dashboard ---
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard ({role || "General"})
      </Typography>
      <Grid container spacing={3}>
        {/* --- General Summary Cards (Keep as is) --- */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Total Reports
            </Typography>
            <Typography component="p" variant="h4">
              {generalData?.summary?.totalReports || "--"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Pending Reviews
            </Typography>
            <Typography component="p" variant="h4">
              {generalData?.summary?.pending || "--"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Active Users
            </Typography>
            <Typography component="p" variant="h4">
              {generalData?.summary?.users || "--"}
            </Typography>
          </Paper>
        </Grid>
        {/* --- End General Summary Cards --- */}

        {/* --- Report Activity Section (Conditional) --- */}
        {role === "System Admin" && ( // Only show for System Admin (or adjust roles)
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              Report Activity Overview
            </Typography>
            {loadingActivity && <CircularProgress size={24} sx={{ ml: 2 }} />}
            {errorActivity && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorActivity}
              </Alert>
            )}

            {!loadingActivity && reportActivity && (
              <Grid container spacing={3}>
                {/* Most Viewed & Recently Executed */}
                <Grid item xs={12} md={6}>
                  <Paper>
                    {renderActivityList(
                      "Most Viewed Reports",
                      <VisibilityIcon />,
                      reportActivity.mostViewed,
                      "title",
                      null,
                      "viewCount"
                    )}
                    <Divider />
                    {renderActivityList(
                      "Recently Executed Reports",
                      <PlayCircleOutlineIcon />,
                      reportActivity.recentlyExecuted,
                      "title",
                      "executedAt"
                    )}
                  </Paper>
                </Grid>

                {/* Execution Times & Failures */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ height: "100%" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        px: 2,
                        pt: 2,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <TimerIcon sx={{ mr: 1 }} /> Execution Performance
                    </Typography>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2">
                        Average Time:{" "}
                        {reportActivity.executionTimes?.averageMs
                          ? (
                              reportActivity.executionTimes.averageMs / 1000
                            ).toFixed(2) + "s"
                          : "--"}
                      </Typography>
                      <Typography variant="body2">
                        Longest Run:{" "}
                        {reportActivity.executionTimes?.longestMs
                          ? (
                              reportActivity.executionTimes.longestMs / 1000
                            ).toFixed(2) + "s"
                          : "--"}
                        {reportActivity.executionTimes?.longestReportTitle
                          ? ` (${reportActivity.executionTimes.longestReportTitle})`
                          : ""}
                      </Typography>
                    </Box>
                    <Divider />
                    {renderActivityList(
                      "Failed Executions",
                      <ErrorOutlineIcon />,
                      reportActivity.failedExecutions,
                      "title",
                      "failedAt"
                    )}
                  </Paper>
                </Grid>

                {/* Scheduled Reports */}
                <Grid item xs={12} md={6}>
                  <Paper>
                    {renderActivityList(
                      "Upcoming Scheduled Runs",
                      <ScheduleIcon />,
                      reportActivity.scheduledRuns?.upcoming,
                      "reportTitle",
                      "nextRun"
                    )}
                    <Divider />
                    {renderActivityList(
                      "Recent Scheduled Runs",
                      <ScheduleIcon />,
                      reportActivity.scheduledRuns?.past,
                      "reportTitle",
                      "lastRun"
                    )}
                  </Paper>
                </Grid>

                {/* Reports by User/Unit (Simple List for now) */}
                <Grid item xs={12} md={6}>
                  <Paper>
                    {renderActivityList(
                      "Reports by User",
                      <PersonIcon />,
                      reportActivity.reportsByUser,
                      "userName",
                      null,
                      "reportCount"
                    )}
                    <Divider />
                    {renderActivityList(
                      "Reports by Unit",
                      <BusinessIcon />,
                      reportActivity.reportsByUnit,
                      "unitName",
                      null,
                      "reportCount"
                    )}
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Grid>
        )}
        {/* --- End Report Activity Section --- */}

        {/* --- Audit Logs Section (Conditional - Keep as is) --- */}
        {role === "System Admin" && (
          <Grid item xs={12}>
            <AuditLogDisplay
              logs={auditLogs}
              loading={loadingAudit}
              error={errorAudit}
            />
          </Grid>
        )}
        {/* --- End Audit Logs Section --- */}

        {/* --- Other Widgets (Keep as is) --- */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 240 }}
          >
            <Typography>Chart Placeholder</Typography>
          </Paper>
        </Grid>
        {/* ... other widgets ... */}
      </Grid>
    </Box>
  );
};

export default Dashboard;
