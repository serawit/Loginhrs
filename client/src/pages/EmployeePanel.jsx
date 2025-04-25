import React from "react";
import { Container, Typography, Box } from "@mui/material";

const EmployeePanel = () => {
  return (
    <Container maxWidth="md">
      <Box mt={4}>
        <Typography variant="h4" component="h2" gutterBottom>
          Employee Panel
        </Typography>
        <Typography variant="body1">
          Employee Panel Page(Page Under Design)
        </Typography>
      </Box>
    </Container>
  );
};

export default EmployeePanel;
