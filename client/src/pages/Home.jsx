import React from "react";
import { Link } from "react-router-dom";
import { Button, Grid, Typography, Paper } from "@mui/material";

const Home = () => {
  const paperStyle = {
    padding: "2rem",
    margin: "2rem auto",
    textAlign: "center",
    borderRadius: "1rem",
    boxShadow: "5px 5px 15px rgba(0, 0, 0, 0.2)",
  };

  const buttonStyle = {
    margin: "1rem",
    fontSize: "1rem",
    fontWeight: "600",
    textTransform: "none",
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: "100vh" }}>
      <Paper style={paperStyle} sx={{ width: { xs: "90%", sm: "70%", md: "50%" } }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Omo Bank Hierarchical Reporting System
        </Typography>
        <Typography variant="body1" gutterBottom>
          Manage tasks, generate reports, and access role-specific features for employees, managers, and admins.
        </Typography>
        <div>
          <Button
            variant="contained"
            color="primary"
            style={buttonStyle}
            component={Link}
            to="/login"
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="primary"
            style={buttonStyle}
            component={Link}
            to="/register"
          >
            Register
          </Button>
          <Button
            variant="contained"
            color="secondary"
            style={buttonStyle}
            component={Link}
            to="/dashboard"
          >
            Go to Dashboard
          </Button>
        </div>
      </Paper>
    </Grid>
  );
};

export default Home;