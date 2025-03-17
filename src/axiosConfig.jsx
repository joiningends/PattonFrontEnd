import axios from "axios";
import Cookies from "js-cookie";

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api", // Your API base URL
});

// Set up the request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: Set up a response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration or unauthorized access
      console.error("Unauthorized access. Redirecting to login...");
      // Clear the token and redirect to login
      Cookies.remove("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;