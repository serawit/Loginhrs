// c:\Users\HP ENVY\Loginhrs\client\src\pages\Reports.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Joi from "joi";

const StyledForm = styled("form")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  backgroundColor: theme.palette.background.paper,
}));

const Reports = () => {
  const [formData, setFormData] = useState({
    reportType: "",
    reportCode: "",
    title: "",
    reportPeriodStart: "", // Expecting ISO string here
    reportPeriodEnd: "", // Expecting ISO string here
    reportDate: "", // Expecting ISO string here
    reportingFrequency: "",
    uploadReport: null, // Expecting File object or null
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Define validation schema for report data (Frontend validation)
  const reportValidationSchema = Joi.object({
    reportType: Joi.string()
      .valid("Financial Report", "Operational Report")
      .required(),
    reportCode: Joi.string().required(),
    title: Joi.string().required(),
    reportPeriodStart: Joi.date().iso().required(),
    reportPeriodEnd: Joi.date().iso().required(),
    reportDate: Joi.date().iso().required(),
    reportingFrequency: Joi.string()
      .valid("Daily", "Weekly", "Monthly", "Quarterly", "Annually")
      .required(),
    // uploadReport: Joi.any().optional(), // File object is not validated by Joi here
  });

  const reportTypes = ["Financial Report", "Operational Report"];

  const reportCodeToTitleMap = {
    OB_TB001: "Trial Balance",
    NBE_FIN006: "Income Statement",
    NBE_FIN004: "Balance Sheet – Institutional",
    BRE_INC001: "Breakdown of Income Accounts",
    BRE_EXP001: "Breakdown of Expenses",
    NP024: "Monthly Average Reserve Report",
    NBE_FIN003: "Liquidity Requirement Report",
    NBE_FIN010: "Profit and Loss Statement",
    NBE_FIN005: "Balance Sheet – NBE",
    NBE_FIN008: "Non-Performing Loans and Advances & Provisions",
    NBE_FIN007: "Loan Classification and Provisioning",
    OB_FIN003: "Fixed Asset / PPE",
    NBE_FIN011: "Capital Adequacy Report – On-Balance Sheet",
    NBE_FIN012: "Capital Adequacy Report – Off-Balance Sheet",
    NBE_FIN013: "Capital Adequacy Report (Quarterly) – Capital Components",
    NBE_FIN014: "Maturity of Assets & Liabilities",
    NBE_LN001: "Loan & Advance Disbursement, Collection & Outstanding",
    NBE_LN002: "Loan to Related Parties",
    NBE_LN003: "Borrowers Exceeding 10% of the Bank's Capital",
    NBE_PIF001: "Personal Information – Individual",
    NBE_PIF002: "Personal Information – Non-Individual",
    OB_INSU001: "Insurance Activity Report by Business Unit",
    OB_ARR001: "Arrears by Age – Individual",
    OB_ARR002: "Arrears Beneficiary Report",
    OB_ARR003: "Arrears by Age – Summary",
  };

  const financialReportCodes = Object.keys(reportCodeToTitleMap).filter(
    (code) =>
      [
        "OB_TB001",
        "NBE_FIN006",
        "NBE_FIN004",
        "BRE_INC001",
        "BRE_EXP001",
        "NP024",
        "NBE_FIN003",
        "NBE_FIN010",
        "NBE_FIN005",
        "NBE_FIN008",
        "NBE_FIN007",
        "OB_FIN003",
        "NBE_FIN011",
        "NBE_FIN012",
        "NBE_FIN013",
        "NBE_FIN014",
      ].includes(code)
  );

  const operationalReportCodes = Object.keys(reportCodeToTitleMap).filter(
    (code) =>
      [
        "NBE_LN001",
        "NBE_LN002",
        "NBE_LN003",
        "NBE_PIF001",
        "NBE_PIF002",
        "OB_INSU001",
        "OB_ARR001",
        "OB_ARR002",
        "OB_ARR003",
      ].includes(code)
  );

  const reportingFrequencies = [
    "Daily",
    "Weekly",
    "Monthly",
    "Quarterly",
    "Annually",
  ];

  // --- Correct handleChange to store ISO strings ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      name === "reportDate" ||
      name === "reportPeriodStart" ||
      name === "reportPeriodEnd"
    ) {
      // Ensure we handle empty date input gracefully
      if (value) {
        try {
          const isoDate = new Date(value).toISOString();
          setFormData((prevData) => ({ ...prevData, [name]: isoDate }));
        } catch (dateError) {
          console.error(`Error converting date for ${name}:`, dateError);
          setFormData((prevData) => ({ ...prevData, [name]: "" })); // Clear if invalid
        }
      } else {
        setFormData((prevData) => ({ ...prevData, [name]: "" })); // Handle clearing the date
      }
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      uploadReport: e.target.files[0],
    }));
  };

  // --- Correct handleSubmit to send state values ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting Report (State):", formData); // Log state before validation
    setErrorMessage("");

    try {
      // 1. Prepare data for Joi validation (exclude the file object)
      const dataToValidate = { ...formData };
      delete dataToValidate.uploadReport; // Exclude file object from Joi validation
      delete dataToValidate.structureUnit; // Ensure this is removed if present

      // 2. Validate using Joi for frontend feedback - ONLY check for 'error'
      const { error } = reportValidationSchema.validate(dataToValidate, {
        abortEarly: false, // Show all validation errors
      });

      if (error) {
        const errorMessages = error.details.map((d) => d.message).join(", ");
        setErrorMessage(`Validation failed: ${errorMessages}`);
        console.error("Frontend Validation Error:", error.details);
        return;
      }

      // 3. Create FormData and append directly from the *state* (formData)
      //    This ensures date fields are sent as the ISO strings stored in the state.
      const formDataToSend = new FormData();
      for (const key in formData) {
        // Handle file separately
        if (key === "uploadReport") {
          if (formData[key] instanceof File) {
            formDataToSend.append(key, formData[key], formData[key].name);
          }
        }
        // Append other fields from state (including date ISO strings)
        // Ensure not to send null/undefined/empty strings unless specifically intended
        // Also skip structureUnit as it's handled by the backend
        else if (
          key !== "structureUnit" &&
          formData[key] !== null &&
          formData[key] !== undefined &&
          formData[key] !== ""
        ) {
          formDataToSend.append(key, formData[key]);
        }
      }

      // Optional: Log keys being sent for debugging (can't easily log FormData values)
      // console.log("FormData keys being sent:");
      // for (let key of formDataToSend.keys()) {
      //    console.log(key);
      // }

      // 4. Send to backend
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/reports", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type is set automatically by the browser for FormData
        },
      });

      // 5. Reset form and navigate
      setFormData({
        // Reset form state
        reportType: "",
        reportCode: "",
        title: "",
        reportPeriodStart: "",
        reportPeriodEnd: "",
        reportDate: "",
        reportingFrequency: "",
        uploadReport: null,
      });
      navigate("/view-reports");
    } catch (err) {
      console.error("Error submitting report:", err);
      // Provide more specific feedback from backend if available
      if (err.response) {
        console.error("Backend Error Response:", err.response.data);
        // Check if the backend sent a specific validation message
        if (err.response.data && err.response.data.message) {
          setErrorMessage(err.response.data.message);
        } else {
          setErrorMessage("An error occurred during submission on the server.");
        }
      } else if (err.request) {
        // Network error
        setErrorMessage("Network error: Could not reach the server.");
      } else {
        // Other errors (e.g., setup error in the request)
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  // --- useEffect hooks (seem okay, using functional updates) ---
  useEffect(() => {
    if (formData.reportCode) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        title: reportCodeToTitleMap[prevFormData.reportCode] || "",
      }));
    } else {
      // Clear title if reportCode is cleared
      setFormData((prevFormData) => ({ ...prevFormData, title: "" }));
    }
  }, [formData.reportCode]); // Dependency only on reportCode

  useEffect(() => {
    // Clear code and title when type changes
    setFormData((prevFormData) => ({
      ...prevFormData,
      reportCode: "",
      title: "",
    }));
  }, [formData.reportType]); // Dependency only on reportType

  return (
    <Container maxWidth="md">
      <Box mt={4} mb={4}>
        <Typography variant="h4" component="h2" gutterBottom>
          Submit a Report
        </Typography>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <StyledForm onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Report Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="report-type-label">Report Type</InputLabel>
                <Select
                  labelId="report-type-label"
                  id="report-type"
                  name="reportType"
                  value={formData.reportType}
                  onChange={handleChange}
                  label="Report Type"
                >
                  <MenuItem value="" disabled>
                    Select Report Type
                  </MenuItem>
                  {reportTypes.map((reportType) => (
                    <MenuItem key={reportType} value={reportType}>
                      {reportType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Report Code */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="report-code-label">Report Code</InputLabel>
                <Select
                  labelId="report-code-label"
                  id="report-code"
                  name="reportCode"
                  value={formData.reportCode}
                  onChange={handleChange}
                  label="Report Code"
                  disabled={!formData.reportType}
                >
                  <MenuItem value="" disabled>
                    Select Report Code
                  </MenuItem>
                  {formData.reportType === "Financial Report" &&
                    financialReportCodes.map((reportCode) => (
                      <MenuItem key={reportCode} value={reportCode}>
                        {reportCode}
                      </MenuItem>
                    ))}
                  {formData.reportType === "Operational Report" &&
                    operationalReportCodes.map((reportCode) => (
                      <MenuItem key={reportCode} value={reportCode}>
                        {reportCode}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Title */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Title"
                value={formData.title || ""}
                required
                disabled // Title is automatically set
                InputLabelProps={{ shrink: !!formData.title }}
              />
            </Grid>

            {/* Reporting Frequency */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="reporting-frequency-label">
                  Reporting Frequency
                </InputLabel>
                <Select
                  labelId="reporting-frequency-label"
                  id="reporting-frequency"
                  name="reportingFrequency"
                  value={formData.reportingFrequency}
                  onChange={handleChange}
                  label="Reporting Frequency"
                >
                  <MenuItem value="" disabled>
                    Select Reporting Frequency
                  </MenuItem>
                  {reportingFrequencies.map((frequency) => (
                    <MenuItem key={frequency} value={frequency}>
                      {frequency}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Report Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="report-date"
                name="reportDate"
                label="Report Date"
                type="date" // HTML5 date input
                value={
                  // Display YYYY-MM-DD format from ISO string
                  formData.reportDate
                    ? formData.reportDate.substring(0, 10)
                    : ""
                }
                onChange={handleChange} // Sets ISO string in state
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>

            {/* Report Period Start */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="report-period-start"
                name="reportPeriodStart"
                label="Report Period Start"
                type="date" // HTML5 date input
                value={
                  // Display YYYY-MM-DD format from ISO string
                  formData.reportPeriodStart
                    ? formData.reportPeriodStart.substring(0, 10)
                    : ""
                }
                onChange={handleChange} // Sets ISO string in state
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>

            {/* Report Period End */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="report-period-end"
                name="reportPeriodEnd"
                label="Report Period End"
                type="date" // HTML5 date input
                value={
                  // Display YYYY-MM-DD format from ISO string
                  formData.reportPeriodEnd
                    ? formData.reportPeriodEnd.substring(0, 10)
                    : ""
                }
                onChange={handleChange} // Sets ISO string in state
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>

            {/* Upload Report */}
            <Grid item xs={12}>
              <Button variant="contained" component="label">
                Upload Report (optional)
                <input
                  type="file"
                  name="uploadReport"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {formData.uploadReport && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Selected: {formData.uploadReport.name}
                </Typography>
              )}
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3 }} // Increased margin top slightly
          >
            Submit Report
          </Button>
        </StyledForm>
      </Box>
    </Container>
  );
};

export default Reports;
