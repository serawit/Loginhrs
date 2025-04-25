import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TablePagination,
  Alert,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  // --- Add Imports ---
  IconButton,
  Tooltip,
  // --- End Add Imports ---
} from "@mui/material";
import axios from "axios";
import Joi from "joi";
import { useTable, useSortBy, useFilters, usePagination } from "react-table";
import Grid from "@mui/material/Grid"; // Correct import

// --- Add Icon Imports ---
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add"; // For Create User button
// --- End Icon Imports ---

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "District Expert", // Set the default role
    jobPosition: "",
    structureUnit: "",
  });
  // Removed unused page/rowsPerPage state as react-table handles it

  const structureUnitOptions = [
    "Head Office",
    "Bonga District",
    "Arba Minch District",
    "Dilla District",
    "Hawassa Ketema District",
    "Durame District",
    "Sodo District",
    "Segen District",
    "Siddama District",
    "Tercha District",
    "Wolkite District",
    "Worabe District",
    "Aleta Wondo District",
    "Sawula District",
    "Halaba District",
    "Jemu District",
  ];

  const roles = [
    "System Admin",
    "Head Office Expert",
    "District Manager",
    "District Expert",
    "Operation Manager",
    "Customer Relation Manager",
  ];

  // Define validation schema for user data
  const userValidationSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().min(6).optional().allow(""), // Allow empty string for edit
    phone: Joi.string().required(),
    role: Joi.string()
      .valid(...roles) // Use spread operator for valid roles
      .required(),
    jobPosition: Joi.string().required(),
    structureUnit: Joi.string().required(),
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateClick = () => {
    // Reset form data for create dialog
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "District Expert",
      jobPosition: "",
      structureUnit: "",
    });
    setError(null); // Clear previous errors
    setOpenCreateDialog(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Clear password field for editing
      phone: user.phone,
      role: user.role,
      jobPosition: user.jobPosition,
      structureUnit: user.structureUnit,
    });
    setError(null); // Clear previous errors
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setError(null); // Clear previous errors
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenCreateDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setSelectedUser(null);
    // Reset form data on close
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "District Expert",
      jobPosition: "",
      structureUnit: "",
    });
    setError(null); // Clear errors on close
  };

  const handleCreateUser = async () => {
    setError(null); // Clear previous errors
    try {
      const validationOptions = { abortEarly: false };
      const { error: validationError, value } = userValidationSchema.validate(
        formData,
        validationOptions
      );
      if (validationError) {
        // Combine multiple validation errors if needed
        const errorMessages = validationError.details
          .map((d) => d.message)
          .join(". ");
        setError(errorMessages);
        return;
      }
      // Ensure password is provided for creation
      if (!value.password) {
        setError("Password is required for new users.");
        return;
      }

      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/users", value, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleCloseDialog();
      fetchUsers(); // Refresh user list
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to create user."
      );
    }
  };

  const handleEditUser = async () => {
    setError(null); // Clear previous errors
    try {
      const validationOptions = { abortEarly: false };
      // Exclude password from required validation if it's empty during edit
      const schemaForEdit = userValidationSchema.keys({
        password: Joi.string().min(6).optional().allow(""),
      });
      const { error: validationError, value } = schemaForEdit.validate(
        formData,
        validationOptions
      );

      if (validationError) {
        const errorMessages = validationError.details
          .map((d) => d.message)
          .join(". ");
        setError(errorMessages);
        return;
      }

      const token = localStorage.getItem("token");
      const dataToUpdate = { ...value };
      // Only send password if it's not empty
      if (!dataToUpdate.password) {
        delete dataToUpdate.password;
      }

      await axios.put(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        dataToUpdate,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleCloseDialog();
      fetchUsers(); // Refresh user list
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update user."
      );
    }
  };

  const handleDeleteUser = async () => {
    setError(null); // Clear previous errors
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleCloseDialog();
      fetchUsers(); // Refresh user list
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to delete user."
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- Define Table Columns ---
  const columns = useMemo(
    () => [
      { Header: "Name", accessor: "name" },
      { Header: "Email", accessor: "email" },
      { Header: "Phone", accessor: "phone" },
      { Header: "Role", accessor: "role" },
      { Header: "Job Position", accessor: "jobPosition" },
      { Header: "Structure Unit", accessor: "structureUnit" },
      {
        Header: "Actions",
        accessor: "_id", // Use ID for actions
        disableSortBy: true,
        disableFilters: true,
        Cell: (
          { row } // Use 'row' from Cell props
        ) => (
          // --- Use Box and IconButtons ---
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "nowrap" }}>
            <Tooltip title="Edit User">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleEditClick(row.original)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete User">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteClick(row.original)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {/* Add View Details IconButton if needed */}
            {/* <Tooltip title="View Details">
              <IconButton size="small" color="info" onClick={() => handleViewDetails(row.original)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip> */}
          </Box>
          // --- End IconButtons ---
        ),
      },
    ],
    []
  );

  const data = useMemo(() => users, [users]);

  // --- React Table Hook ---
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page: paginatedPage, // Use 'page' which is the paginated rows
    prepareRow,
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

  // Function to filter and list District Experts (Keep as is)
  const listDistrictExperts = () => {
    const districtExperts = users.filter(
      (user) => user.role === "District Expert"
    );
    return districtExperts.map((user) => (
      <ListItem key={user._id}>
        <ListItemText primary={`${user.name} - ${user.email}`} />
      </ListItem>
    ));
  };

  return (
    <Container maxWidth="xl">
      {" "}
      {/* Use wider container */}
      <Box mt={4}>
        <Typography variant="h4" component="h2" gutterBottom>
          Manage Users
        </Typography>
        {/* --- Add Icon to Create Button --- */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateClick}
          startIcon={<AddIcon />}
          sx={{ mb: 2 }} // Add margin bottom
        >
          Create User
        </Button>
        {/* --- End Icon Addition --- */}

        {isLoading && <Typography>Loading...</Typography>}
        {/* Display error specific to fetching if needed */}
        {error && !openCreateDialog && !openEditDialog && !openDeleteDialog && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ width: "100%", overflowX: "auto" }}>
          {" "}
          {/* Added overflowX */}
          {/* --- Use more standard MUI table styling --- */}
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
                        borderBottom: "solid 2px black", // Simpler border
                        padding: "12px", // Consistent padding
                        textAlign: "left", // Align text left
                        fontWeight: "bold",
                        // Removed background/color for default look
                      }}
                    >
                      {column.render("Header")}
                      <Box component="span" sx={{ ml: 0.5, fontSize: "0.8em" }}>
                        {" "}
                        {/* Use Box for sort icon */}
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
                    {" "}
                    {/* Lighter border */}
                    {row.cells.map((cell) => {
                      return (
                        <td
                          key={cell.id}
                          {...cell.getCellProps()}
                          style={{
                            padding: "12px", // Consistent padding
                            verticalAlign: "middle", // Align cell content vertically
                            // Removed background
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
          {/* --- End Table Styling Update --- */}
        </Paper>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]} // Added more options
          component="div"
          count={data.length} // Use data.length for client-side pagination
          rowsPerPage={pageSize}
          page={pageIndex}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        {/* List of District Experts (Keep as is) */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            District Experts:
          </Typography>
          <List>{listDistrictExperts()}</List>
        </Box>
      </Box>
      {/* --- Dialogs --- */}
      {/* Create User Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          {/* Display validation errors inside the dialog */}
          {error && openCreateDialog && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone"
            type="tel"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <FormControl fullWidth margin="dense" variant="outlined" required>
            <InputLabel id="create-role-label">Role</InputLabel>
            <Select
              labelId="create-role-label"
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="jobPosition"
            label="Job Position"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.jobPosition}
            onChange={handleChange}
            required
          />
          <FormControl fullWidth margin="dense" variant="outlined" required>
            <InputLabel id="create-structureUnit-label">
              Structure Unit
            </InputLabel>
            <Select
              labelId="create-structureUnit-label"
              name="structureUnit"
              value={formData.structureUnit}
              onChange={handleChange}
              label="Structure Unit"
            >
              <MenuItem value="" disabled>
                Select Structure Unit
              </MenuItem>
              {structureUnitOptions.map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit User Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {/* Display validation errors inside the dialog */}
          {error && openEditDialog && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="password"
            label="New Password (optional)"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={handleChange}
            helperText="Leave blank to keep current password"
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone"
            type="tel"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <FormControl fullWidth margin="dense" variant="outlined" required>
            <InputLabel id="edit-role-label">Role</InputLabel>
            <Select
              labelId="edit-role-label"
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="jobPosition"
            label="Job Position"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.jobPosition}
            onChange={handleChange}
            required
          />
          <FormControl fullWidth margin="dense" variant="outlined" required>
            <InputLabel id="edit-structureUnit-label">
              Structure Unit
            </InputLabel>
            <Select
              labelId="edit-structureUnit-label"
              name="structureUnit"
              value={formData.structureUnit}
              onChange={handleChange}
              label="Structure Unit"
            >
              <MenuItem value="" disabled>
                Select Structure Unit
              </MenuItem>
              {structureUnitOptions.map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleEditUser} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          {/* Display errors inside the dialog */}
          {error && openDeleteDialog && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography>
            Are you sure you want to delete user:{" "}
            <strong>{selectedUser?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* --- End Dialogs --- */}
    </Container>
  );
};

export default ManageUsers;
