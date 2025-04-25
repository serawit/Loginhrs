// c:\Users\HP ENVY\Loginhrs\client\src\pages\ReviewReports.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TablePagination,
  TextField,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  IconButton,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { getStatusColor } from "../utils/statusColor";
import { useTable, useSortBy, useFilters, usePagination } from "react-table";
import axios from "axios";

const ReviewReports = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/reports", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const pendingReports = response.data.filter(
          (report) => report.status === "Pending"
        );
        setReports(pendingReports);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  // --- Feedback Dialog Handlers ---
  const handleOpenFeedbackDialog = (report) => {
    setSelectedReport(report);
    setOpenFeedbackDialog(true);
  };
  const handleCloseFeedbackDialog = () => {
    setOpenFeedbackDialog(false);
    setSelectedReport(null);
    setFeedback("");
  };
  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };
  const handleSendFeedback = async () => {
    try {
      // TODO: Implement actual feedback sending API call
      console.log(
        `Sending feedback: "${feedback}" for report ID: ${selectedReport._id}`
      );
      handleCloseFeedbackDialog();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send feedback.");
    }
  };

  // --- Approve/Reject Handlers ---
  const handleApprove = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/reports/${reportId}/status`,
        { status: "Approved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReports((prevReports) =>
        prevReports.filter((report) => report._id !== reportId)
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };
  const handleReject = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/reports/${reportId}/status`,
        { status: "Rejected" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReports((prevReports) =>
        prevReports.filter((report) => report._id !== reportId)
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // --- Define Table Columns ---
  const columns = useMemo(
    () => [
      { Header: "Report Type", accessor: "reportType" },
      { Header: "Report Code", accessor: "reportCode" },
      { Header: "Title", accessor: "title" },
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
        Cell: ({ value }) => {
          if (!value) {
            return (
              <Typography variant="caption" color="textSecondary">
                N/A
              </Typography>
            );
          }
          const downloadUrl = `http://localhost:5000/api/reports/download/${value}`;
          return (
            <Link
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <IconButton size="small" color="primary">
                <DownloadIcon fontSize="small" />
              </IconButton>
              <Typography
                variant="body2"
                sx={{
                  ml: 0.5,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  maxWidth: "150px",
                }}
                title={value}
              >
                {value.length > 20
                  ? `${value.substring(0, 10)}...${value.substring(
                      value.length - 7
                    )}`
                  : value}
              </Typography>
            </Link>
          );
        },
      },
      {
        Header: "Actions",
        accessor: "_id",
        Cell: ({ cell }) => (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "nowrap" }}>
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => handleApprove(cell.row.original._id)}
              sx={{ minWidth: "auto", px: 1 }}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={() => handleReject(cell.row.original._id)}
              sx={{ minWidth: "auto", px: 1 }}
            >
              Reject
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleOpenFeedbackDialog(cell.row.original)}
              sx={{ minWidth: "auto", px: 1 }}
            >
              Feedback
            </Button>
          </Box>
        ),
      },
    ],
    []
  );

  const data = useMemo(() => reports, [reports]);

  // --- React Table Hook ---
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page: paginatedPage,
    prepareRow,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 5 },
      manualPagination: false, // Let react-table handle pagination
      // pageCount: Math.ceil(reports.length / pageSize), // <<< REMOVED THIS LINE
    },
    useFilters,
    useSortBy,
    usePagination
  );
  // --- End React Table Hook ---

  // --- Pagination Handlers ---
  const handleChangePage = (event, newPage) => {
    gotoPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(Number(event.target.value));
  };

  return (
    <Container maxWidth="xl">
      <Box mt={4}>
        <Typography variant="h4" component="h2" gutterBottom>
          Review Reports
        </Typography>
        {isLoading && <Typography>Loading...</Typography>}
        {error && <Alert severity="error">{error}</Alert>}

        <Paper sx={{ width: "100%", overflowX: "auto" }}>
          <table
            {...getTableProps()}
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                  {headerGroup.headers.map((column) => (
                    <th
                      key={column.id}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      style={{
                        borderBottom: "solid 2px black",
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "bold",
                      }}
                    >
                      {column.render("Header")}
                      <Box component="span" sx={{ ml: 0.5, fontSize: "0.8em" }}>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </Box>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {paginatedPage.map((row) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    key={row.id}
                    style={{ borderBottom: "solid 1px #e0e0e0" }}
                  >
                    {row.cells.map((cell) => {
                      return (
                        <td
                          key={cell.id}
                          {...cell.getCellProps()}
                          style={{
                            padding: "12px",
                            verticalAlign: "middle",
                          }}
                        >
                          {cell.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Paper>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={reports.length}
          rowsPerPage={pageSize}
          page={pageIndex}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

      {/* --- Feedback Dialog --- */}
      <Dialog
        open={openFeedbackDialog}
        onClose={handleCloseFeedbackDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Provide Feedback</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="feedback"
            label="Feedback"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={feedback}
            onChange={handleFeedbackChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFeedbackDialog}>Cancel</Button>
          <Button onClick={handleSendFeedback} variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReviewReports;
