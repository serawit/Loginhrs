// c:\Users\HP ENVY\Loginhrs\client\src\pages\ViewReports.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  TablePagination,
  Alert,
  Link,
  IconButton,
  Tooltip, // Added Tooltip
  // Imports for Dialogs
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Input,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit"; // Import Edit Icon
import DeleteIcon from "@mui/icons-material/Delete"; // Import Delete Icon
import { getStatusColor } from "../utils/statusColor";
import { useTable, useSortBy, useFilters, usePagination } from "react-table";
import axios from "axios"; // Or use your api service
import api from "../services/api"; // Use your api service
import Joi from "joi"; // Import Joi for edit validation

// --- Edit Validation Schema (similar to create) ---
const reportEditValidationSchema = Joi.object({
  reportType: Joi.string()
    .valid("Financial Report", "Operational Report")
    .required(),
  reportCode: Joi.string().required(),
  title: Joi.string().required(),
  reportDate: Joi.date().iso().required(),
  reportPeriodStart: Joi.date().iso().required(),
  reportPeriodEnd: Joi.date().iso().required(),
  reportingFrequency: Joi.string()
    .valid("Daily", "Weekly", "Monthly", "Quarterly", "Annually")
    .required(),
});
// --- End Edit Validation Schema ---

const ViewReports = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- State for Edit/Delete ---
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editFile, setEditFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const currentUserId = localStorage.getItem("userId"); // Get logged-in user ID
  // --- End State ---

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Assuming api service handles token
      const response = await api.get("/reports");
      setReports(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch reports."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Edit Handlers ---
  const handleOpenEditDialog = (report) => {
    setSelectedReport(report);
    setEditFormData({
      // Pre-fill form data
      reportType: report.reportType,
      reportCode: report.reportCode,
      title: report.title,
      reportDate: report.reportDate.split("T")[0], // Format date for input type="date"
      reportPeriodStart: report.reportPeriodStart.split("T")[0],
      reportPeriodEnd: report.reportPeriodEnd.split("T")[0],
      reportingFrequency: report.reportingFrequency,
    });
    setEditFile(null); // Reset file state
    setError(null); // Clear previous errors
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedReport(null);
    setEditFormData({});
    setEditFile(null);
    setError(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFileChange = (e) => {
    setEditFile(e.target.files[0]);
  };

  const handleUpdateReport = async () => {
    setError(null);
    setEditLoading(true);

    // 1. Validate form data
    const { error: validationError, value: validatedData } =
      reportEditValidationSchema.validate(editFormData, { abortEarly: false });
    if (validationError) {
      const errorMessages = validationError.details
        .map((d) => d.message)
        .join(". ");
      setError(errorMessages);
      setEditLoading(false);
      return;
    }

    // 2. Prepare FormData
    const reportFormData = new FormData();
    Object.keys(validatedData).forEach((key) => {
      reportFormData.append(key, validatedData[key]);
    });
    if (editFile) {
      // Only append file if a new one was selected
      reportFormData.append("uploadReport", editFile);
    }

    // 3. Make API call (PUT request)
    try {
      await api.put(`/reports/${selectedReport._id}`, reportFormData);
      handleCloseEditDialog();
      fetchReports(); // Refresh the list
      alert("Report updated successfully!"); // Use Snackbar later
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update report."
      );
    } finally {
      setEditLoading(false);
    }
  };
  // --- End Edit Handlers ---

  // --- Delete Handlers ---
  const handleOpenDeleteDialog = (report) => {
    setSelectedReport(report);
    setError(null); // Clear previous errors
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedReport(null);
    setError(null);
  };

  const handleDeleteReport = async () => {
    setError(null);
    setDeleteLoading(true);
    try {
      await api.delete(`/reports/${selectedReport._id}`);
      handleCloseDeleteDialog();
      fetchReports(); // Refresh the list
      alert("Report deleted successfully!"); // Use Snackbar later
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to delete report."
      );
    } finally {
      setDeleteLoading(false);
    }
  };
  // --- End Delete Handlers ---

  // --- Define Table Columns ---
  const columns = useMemo(
    () => [
      // ... other columns (Report Type, Code, Title, Unit, Date, Freq, Status, Attachment) ...
      { Header: "Report Type", accessor: "reportType" },
      { Header: "Report Code", accessor: "reportCode" },
      { Header: "Title", accessor: "title" },
      // Assuming submittedBy is populated with at least _id
      {
        Header: "Submitted By",
        accessor: "submittedBy.name",
        Cell: ({ value }) => value || "N/A",
      },
      { Header: "Structure Unit", accessor: "structureUnit" },
      {
        Header: "Report Date",
        accessor: "reportDate",
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
      },
      { Header: "Reporting Freq.", accessor: "reportingFrequency" },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <Typography sx={{ color: getStatusColor(value), fontWeight: "bold" }}>
            {value}
          </Typography>
        ),
      },
      {
        Header: "Attachment",
        accessor: "uploadReport",
        disableSortBy: true,
        Cell: ({ value }) => {
          /* ... download link code ... */
        },
      },

      // --- NEW Actions Column ---
      {
        Header: "Actions",
        accessor: "_id", // Can use any unique field, _id is good
        disableSortBy: true,
        disableFilters: true,
        Cell: ({ row }) => {
          const report = row.original;
          const canModify =
            (report.status === "Pending" || report.status === "Rejected") &&
            report.submittedBy?._id === currentUserId;

          return (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "nowrap" }}>
              {canModify && (
                <>
                  <Tooltip title="Edit Report">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEditDialog(report)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Report">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleOpenDeleteDialog(report)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {/* Keep View Attachment separate or add a view details icon here if needed */}
            </Box>
          );
        },
      },
      // --- End Actions Column ---
    ],
    [currentUserId] // Add currentUserId dependency
  );

  const data = useMemo(() => reports, [reports]);

  // --- React Table Hook (Fix Destructuring) ---
  const {
    getTableProps, // <-- Ensure this is present
    getTableBodyProps, // <-- Ensure this is present
    headerGroups, // <-- Ensure this is present
    page: paginatedPage,
    prepareRow, // <-- Ensure this is present
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 }, // Default page size
      manualPagination: false, // Use client-side pagination
    },
    useFilters, // Keep these hooks
    useSortBy,
    usePagination
  );
  // --- End React Table Hook ---

  // --- End React Table Hook ---

  // --- Pagination Handlers (Keep as is) ---
  const handleChangePage = (event, newPage) => {
    /* ... */
  };
  const handleChangeRowsPerPage = (event) => {
    /* ... */
  };
  // --- End Pagination Handlers ---

  return (
    <Container maxWidth="xl">
      <Box mt={4}>
        <Typography variant="h4" component="h2" gutterBottom>
          View Reports
        </Typography>
        {isLoading && <Typography>Loading reports...</Typography>}
        {error && !openEditDialog && !openDeleteDialog && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ width: "100%", overflowX: "auto" }}>
          {/* --- Table Rendering (Keep as is) --- */}
          <table
            {...getTableProps()}
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            {/* ... thead ... */}
            {/* ... tbody ... */}
          </table>
          {/* --- End Table Rendering --- */}
        </Paper>

        {/* --- Pagination (Keep as is) --- */}
        <TablePagination /* ... */ />
        {/* --- End Pagination --- */}
      </Box>

      {/* --- Edit Report Dialog --- */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Edit Report</DialogTitle>
        <DialogContent>
          {error && openEditDialog && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {/* Re-use the Grid structure from CreateReport form */}
          <Grid container spacing={3} sx={{ pt: 1 }}>
            {/* Report Type & Code */}
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                required
                variant="outlined"
                disabled={editLoading}
              >
                <InputLabel id="edit-reportType-label">Report Type</InputLabel>
                <Select
                  labelId="edit-reportType-label"
                  name="reportType"
                  value={editFormData.reportType || ""}
                  onChange={handleEditChange}
                  label="Report Type"
                >
                  <MenuItem value="Financial Report">Financial Report</MenuItem>
                  <MenuItem value="Operational Report">
                    Operational Report
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Report Code"
                name="reportCode"
                value={editFormData.reportCode || ""}
                onChange={handleEditChange}
                variant="outlined"
                disabled={editLoading}
              />
            </Grid>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Report Title"
                name="title"
                value={editFormData.title || ""}
                onChange={handleEditChange}
                variant="outlined"
                disabled={editLoading}
              />
            </Grid>
            {/* Dates */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Report Date"
                name="reportDate"
                type="date"
                value={editFormData.reportDate || ""}
                onChange={handleEditChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                disabled={editLoading}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Period Start"
                name="reportPeriodStart"
                type="date"
                value={editFormData.reportPeriodStart || ""}
                onChange={handleEditChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                disabled={editLoading}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Period End"
                name="reportPeriodEnd"
                type="date"
                value={editFormData.reportPeriodEnd || ""}
                onChange={handleEditChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                disabled={editLoading}
              />
            </Grid>
            {/* Frequency */}
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                required
                variant="outlined"
                disabled={editLoading}
              >
                <InputLabel id="edit-reportingFrequency-label">
                  Reporting Frequency
                </InputLabel>
                <Select
                  labelId="edit-reportingFrequency-label"
                  name="reportingFrequency"
                  value={editFormData.reportingFrequency || ""}
                  onChange={handleEditChange}
                  label="Reporting Frequency"
                >
                  <MenuItem value="Daily">Daily</MenuItem>
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="Annually">Annually</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* File Upload */}
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                component="label"
                fullWidth
                disabled={editLoading}
                sx={{ height: "100%" }}
              >
                Upload New File (Optional)
                <input
                  type="file"
                  hidden
                  onChange={handleEditFileChange}
                  name="uploadReport"
                />
              </Button>
              {editFile && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  New: {editFile.name}
                </Typography>
              )}
              {!editFile && selectedReport?.uploadReport && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Current: {selectedReport.uploadReport}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={editLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateReport}
            variant="contained"
            disabled={editLoading}
            startIcon={
              editLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {editLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* --- End Edit Report Dialog --- */}

      {/* --- Delete Confirmation Dialog --- */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          {error && openDeleteDialog && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography>
            Are you sure you want to delete the report:{" "}
            <strong>{selectedReport?.title}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteReport}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={
              deleteLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* --- End Delete Confirmation Dialog --- */}
    </Container>
  );
};

export default ViewReports;
