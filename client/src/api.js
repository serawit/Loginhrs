import axios from "axios";

// Function to register a user
export const register = async (formData) => {
  return await axios.post("http://localhost:5000/api/register", formData);
};

// Function to log in a user
export const login = async (formData) => {
  return await axios.post("http://localhost:5000/api/login", formData);
};

const createReport = async () => {
  try {
    const response = await axios.post("http://localhost:5000/api/reports", {
      title: "Monthly Sales Report",
      content: "This report contains the sales data for the month.",
      submittedBy: "64a7f9e5b5d1c2a3e4f5g6h7", // Replace with a valid user ID
    });
    console.log(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

createReport();
