// c:\Users\HP ENVY\Loginhrs\client\src\pages\Settings.jsx
import React from "react";
import { Container, Typography, Box } from "@mui/material";

const Settings = () => {
  return (
    <Container maxWidth="md">
      <Box mt={4}>
        <Typography variant="h4" component="h2" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1">
          This is the Settings page. You can add settings options here.
        </Typography>
      </Box>
    </Container>
  );
};

export default Settings;
