import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom"; // Import Link for potential future use
import axios from "axios";
import Joi from "joi";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment,
  Paper, // Import Paper
  CircularProgress, // Import CircularProgress
  Link, // Import MUI Link
} from "@mui/material";
// Removed styled import as we'll use sx prop and Paper

// --- Icon Imports ---
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import LockIcon from "@mui/icons-material/Lock";
// --- Logo Import ---
import logo from "../assets/logoIcon.png"; // Adjust path if needed

// Removed StyledForm definition

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  // Define validation schema for login
  const loginValidationSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // Start loading

    try {
      const { error: validationError, value } =
        loginValidationSchema.validate(formData);
      if (validationError) {
        setError(validationError.details[0].message);
        setLoading(false); // Stop loading on validation error
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        value
      );
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user.userId);
      localStorage.setItem("name", user.name);
      localStorage.setItem("structureUnit", user.structureUnit);

      // Redirect (simplified)
      navigate("/dashboard"); // Redirect all logged-in users to dashboard initially
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check credentials."
      );
    } finally {
      setLoading(false); // Stop loading regardless of success/error
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Container component="main" maxWidth="xs">
      {" "}
      {/* Use xs for a typical login form width */}
      <Box
        sx={{
          marginTop: 8, // More space from top
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
          sx={{ height: 60, mb: 2 }} // Adjust size and margin
        />

        <Typography component="h1" variant="h5" gutterBottom>
          Sign In
        </Typography>

        <Paper
          elevation={3}
          sx={{
            p: 4, // More padding inside the paper
            width: "100%", // Ensure paper takes full width of container
            mt: 3, // Margin top from title
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
            <TextField
              variant="outlined"
              margin="normal" // Consistent margin
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus // Focus on email field first
              value={formData.email}
              onChange={handleChange}
              disabled={loading} // Disable when loading
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AlternateEmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              variant="outlined"
              margin="normal" // Consistent margin
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading} // Disable when loading
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            {/* Optional: Add Remember me checkbox here */}
            {/* Optional: Add Forgot Password link here */}
            {/* <Box sx={{ textAlign: 'right', mt: 1, mb: 1 }}>
               <Link component={RouterLink} to="/forgot-password" variant="body2">
                 Forgot password?
               </Link>
             </Box> */}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading} // Disable button when loading
              sx={{ mt: 3, mb: 2, py: 1.5 }} // More vertical padding, margin top/bottom
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : null
              } // Show spinner
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            {/* Optional: Link to Register page */}
            <Box sx={{ textAlign: "center" }}>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
      {/* You might want a simpler footer or none on the login page */}
    </Container>
  );
};

export default Login;
