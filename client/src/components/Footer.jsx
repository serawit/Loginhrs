import React from "react";
import { Box, Typography, Container } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3, // Vertical padding
        px: 4, // Horizontal padding
        bgcolor: "#00adef", // Background color
        mt: "auto", // Use "auto" margin-top to push to the bottom
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {"Copyright © "}
          {new Date().getFullYear()}
          {" Omo Bank ReportServer."}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
