// src/components/dashboard/AuditLogDisplay.jsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  Tooltip,
} from "@mui/material";

import format from "date-fns/format"; // Import directly from the module path

const AuditLogDisplay = ({ logs, loading, error }) => {
  if (loading) {
    return <Typography>Loading audit logs...</Typography>;
  }

  if (error) {
    return (
      <Typography color="error">Error loading audit logs: {error}</Typography>
    );
  }

  if (!logs || logs.length === 0) {
    return <Typography>No audit logs found.</Typography>;
  }

  const formatDetails = (details) => {
    if (!details) return "N/A";
    // Simple JSON string representation, customize as needed
    return JSON.stringify(details);
  };

  const getEventTypeChip = (eventType) => {
    let color = "default";
    switch (eventType) {
      case "FAILED_LOGIN":
        color = "error";
        break;
      case "ROLE_CHANGE":
        color = "warning";
        break;
      case "USER_CREATED":
        color = "success";
        break;
      case "USER_DELETED":
        color = "error";
        break;
      default:
        color = "info";
    }
    return (
      <Chip label={eventType.replace("_", " ")} color={color} size="small" />
    );
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Security & Audit Logs
      </Typography>
      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650 }}
          aria-label="audit logs table"
          size="small"
        >
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Event Type</TableCell>
              <TableCell>Performed By</TableCell>
              <TableCell>Target User</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow
                key={log._id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Tooltip title={log.timestamp}>
                    <span>
                      {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell>{getEventTypeChip(log.eventType)}</TableCell>
                <TableCell>
                  {log.userId
                    ? `${log.performedBy} (${
                        log.userId.name || log.userId.username
                      })`
                    : log.performedBy}
                </TableCell>
                <TableCell>
                  {log.targetUserId
                    ? `${log.targetUserId.name || log.targetUserId.username}`
                    : "N/A"}
                </TableCell>
                <TableCell>{log.ipAddress || "N/A"}</TableCell>
                <TableCell>
                  <Tooltip title={formatDetails(log.details)}>
                    <Typography
                      variant="caption"
                      sx={{
                        maxWidth: 150,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                      }}
                    >
                      {formatDetails(log.details)}
                    </Typography>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add Pagination controls here later if needed */}
    </Box>
  );
};

export default AuditLogDisplay;
