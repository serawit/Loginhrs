import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom"; // Import RouterLink
import axios from "axios";
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  Paper, // Import Paper
  CircularProgress, // Import CircularProgress
  Link, // Import MUI Link
} from "@mui/material";
// Removed styled import
import Joi from "joi";

// --- Logo Import ---
import logo from "../assets/logoIcon.png"; // Adjust path if needed

// Removed StyledForm definition

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "District Expert", // Default role
    structureUnit: "",
    jobPosition: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Changed from isLoading for consistency
  const navigate = useNavigate();

  // --- Options (Keep as is) ---
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
    "Operation Manager",
    "Customer Relation Manager",
    "District Manager",
    "Head Office Expert",
    "District Expert",
  ];
  // --- End Options ---

  // --- Validation Schema (Keep as is, maybe add email validation) ---
  const userValidationSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(), // Added basic email validation
    password: Joi.string().min(6).required(),
    phone: Joi.string().required(), // Consider adding pattern validation
    role: Joi.string()
      .valid(...roles)
      .required(),
    structureUnit: Joi.string().required(),
    jobPosition: Joi.string().required(),
  });
  // --- End Validation Schema ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // Start loading

    try {
      const { error: validationError, value } = userValidationSchema.validate(
        formData,
        { abortEarly: false }
      ); // Validate all fields
      if (validationError) {
        // Combine multiple errors
        const errorMessages = validationError.details
          .map((d) => d.message)
          .join(". ");
        setError(errorMessages);
        setLoading(false); // Stop loading on validation error
        return;
      }

      await axios.post("http://localhost:5000/api/auth/register", value);
      // Don't reset form here, navigate away
      alert("Registration successful! Please login."); // Simple alert, consider Snackbar
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Container component="main" maxWidth="sm">
      {" "}
      {/* Use sm for longer form */}
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <Box
          component="img"
          src={logo}
          alt="Omo Bank Logo"
          sx={{ height: 60, mb: 2 }}
        />

        <Typography component="h1" variant="h5" gutterBottom>
          Sign Up
        </Typography>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            mt: 3,
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2}>
              {" "}
              {/* Use Grid for layout */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password" // Use new-password for registration
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="phone"
                  label="Phone Number"
                  type="tel"
                  id="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="jobPosition"
                  label="Job Position"
                  type="text"
                  id="jobPosition"
                  value={formData.jobPosition}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                {" "}
                {/* Role and Unit side-by-side on larger screens */}
                <FormControl
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                  disabled={loading}
                >
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                  disabled={loading}
                >
                  <InputLabel id="structureUnit-label">
                    Structure Unit
                  </InputLabel>
                  <Select
                    labelId="structureUnit-label"
                    id="structureUnit"
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
              </Grid>
              <Grid item xs={12}>
                {" "}
                {/* Button spans full width */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  {loading ? "Registering..." : "Sign Up"}
                </Button>
              </Grid>
              <Grid item xs={12} sx={{ textAlign: "center" }}>
                {" "}
                {/* Link spans full width */}
                <Link component={RouterLink} to="/login" variant="body2">
                  {"Already have an account? Sign In"}
                </Link>
              </Grid>
            </Grid>{" "}
            {/* End Grid Container */}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
