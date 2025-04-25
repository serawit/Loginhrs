// src/services/api.js
import axios from "axios";

// Define the base URL for your API
const API_BASE_URL = "http://localhost:5000/api"; // Adjust if your backend runs elsewhere

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for global error handling (e.g., 401 redirects)
api.interceptors.response.use(
  (response) => response, // Simply return successful responses
  (error) => {
    // Handle specific errors globally if needed
    if (error.response && error.response.status === 401) {
      // Example: Unauthorized - maybe redirect to login
      console.error("Unauthorized access - redirecting to login.");
      localStorage.removeItem("token"); // Clear bad token
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("name");
      // window.location.href = '/login'; // Use this if not using React Router's navigate hook context
    }
    // Important: Always reject the promise so individual components can catch errors too
    return Promise.reject(error);
  }
);

export default api;
