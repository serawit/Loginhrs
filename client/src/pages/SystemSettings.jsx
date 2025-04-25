import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import axios from "axios";

const SystemSettings = () => {
  const [workflows, setWorkflows] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    approvalOrder: [],
  });
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const uniqueRoles = [
          ...new Set(response.data.map((user) => user.role)),
        ];
        setRoles(uniqueRoles);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchWorkflows = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/workflows",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setWorkflows(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const handleWorkflowChange = (e) => {
    const { name, value } = e.target;
    setNewWorkflow({ ...newWorkflow, [name]: value });
  };

  const handleApprovalOrderChange = (e, index) => {
    const { value } = e.target;
    const updatedApprovalOrder = [...newWorkflow.approvalOrder];
    updatedApprovalOrder[index] = value;
    setNewWorkflow({ ...newWorkflow, approvalOrder: updatedApprovalOrder });
  };

  const handleAddApprovalStep = () => {
    setNewWorkflow({
      ...newWorkflow,
      approvalOrder: [...newWorkflow.approvalOrder, ""],
    });
  };

  const handleRemoveApprovalStep = (index) => {
    const updatedApprovalOrder = [...newWorkflow.approvalOrder];
    updatedApprovalOrder.splice(index, 1);
    setNewWorkflow({ ...newWorkflow, approvalOrder: updatedApprovalOrder });
  };

  const handleCreateWorkflow = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/workflows", newWorkflow, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewWorkflow({ name: "", approvalOrder: [] });
      // Refresh workflows
      const response = await axios.get("http://localhost:5000/api/workflows", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWorkflows(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <Container maxWidth="md">
      <Box mt={4}>
        <Typography variant="h4" component="h2" gutterBottom>
          System Settings
        </Typography>
        {isLoading && <Typography>Loading...</Typography>}
        {error && <Alert severity="error">{error}</Alert>}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Create New Workflow
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Workflow Name"
                name="name"
                value={newWorkflow.name}
                onChange={handleWorkflowChange}
              />
            </Grid>
            {newWorkflow.approvalOrder.map((step, index) => (
              <Grid item xs={12} key={index}>
                <FormControl fullWidth>
                  <InputLabel>Approval Step {index + 1}</InputLabel>
                  <Select
                    value={step}
                    onChange={(e) => handleApprovalOrderChange(e, index)}
                    label={`Approval Step ${index + 1}`}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  onClick={() => handleRemoveApprovalStep(index)}
                  color="error"
                >
                  Remove
                </Button>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button onClick={handleAddApprovalStep}>Add Approval Step</Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateWorkflow}
              >
                Create Workflow
              </Button>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Current Workflows
          </Typography>
          {workflows.length === 0 ? (
            <Typography>No workflows created yet.</Typography>
          ) : (
            <List>
              {workflows.map((workflow) => (
                <ListItem key={workflow._id}>
                  <ListItemText
                    primary={workflow.name}
                    secondary={workflow.approvalOrder.join(" -> ")}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default SystemSettings;
