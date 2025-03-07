"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  Lock,
  Eye,
  EyeOff,
  X,
  AtSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export default function AddUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    designation: "",
    department: "",
    username: "", // Add this line
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!/^[A-Za-z]+$/.test(formData.firstName)) {
      newErrors.firstName = "First name should contain only letters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!/^[A-Za-z]+$/.test(formData.lastName)) {
      newErrors.lastName = "Last name should contain only letters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email address";
    }

    // if (!formData.password) {
    //   newErrors.password = "Password is required";
    // } else if (formData.password.length < 8) {
    //   newErrors.password = "Password must be at least 8 characters long";
    // }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Invalid phone number format (10 digits required)";
    }

    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username should contain only letters, numbers, and underscores";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setBackendError("");

    if (validateForm()) {
      try {
        const userData = {
          username: formData.username, // Use the username from formData
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          // password: formData.password,
          phone: formData.phone,
          designation: formData.designation,
          department: formData.department,
        };

        const response = await axios.post(
          `${API_BASE_URL}/users/register`,
          userData
        );
        if (response.data.success) {
          console.log("User created successfully:", response.data.data);
          navigate("/");
        } else {
          setBackendError(
            response.data.message ||
              "An error occurred while creating the user."
          );
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setBackendError(
          error.response?.data?.message ||
            "An error occurred while creating the user. Please try again."
        );
      }
    }

    setIsSubmitting(false);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedData = { ...prev, [name]: value };

      if (name === "firstName" || name === "lastName") {
        const generatedUsername =
          `${updatedData.firstName.toLowerCase()}_${updatedData.lastName.toLowerCase()}`.replace(
            /\s+/g,
            ""
          );
        updatedData.username = generatedUsername;
      }

      return updatedData;
    });
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9] min-h-screen p-4 lg:p-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/users")}
            className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Users
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
            Add New User
          </h1>
          <p className="text-[#4b4b80] text-base lg:text-lg">
            Create a new user account
          </p>
        </motion.div>

        {backendError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{backendError}</span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setBackendError("")}
            >
              <X className="h-6 w-6 text-red-500" />
            </span>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-xl p-6 lg:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  First Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                    size={20}
                  />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 ${
                      errors.firstName ? "border-red-500" : "border-[#c8c8e6]"
                    } focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300`}
                    placeholder="Enter first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Last Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                    size={20}
                  />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 ${
                      errors.lastName ? "border-red-500" : "border-[#c8c8e6]"
                    } focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300`}
                    placeholder="Enter last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                    size={20}
                  />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 ${
                      errors.email ? "border-red-500" : "border-[#c8c8e6]"
                    } focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 ${
                      errors.password ? "border-red-500" : "border-[#c8c8e6]"
                    } focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div> */}

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                    size={20}
                  />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 ${
                      errors.phone ? "border-red-500" : "border-[#c8c8e6]"
                    } focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="designation"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Designation
                </label>
                <div className="relative">
                  <Briefcase
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                    size={20}
                  />
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 ${
                      errors.designation ? "border-red-500" : "border-[#c8c8e6]"
                    } focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300`}
                    placeholder="Enter designation"
                  />
                </div>
                {errors.designation && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.designation}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Department
                </label>
                <div className="relative">
                  <Building
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                    size={20}
                  />
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 ${
                      errors.department ? "border-red-500" : "border-[#c8c8e6]"
                    } focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300`}
                    placeholder="Enter department"
                  />
                </div>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.department}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <AtSign
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                    size={20}
                  />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 ${
                      errors.username ? "border-red-500" : "border-[#c8c8e6]"
                    } focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300`}
                    placeholder="Enter username"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/users")}
                className="px-6 py-3 rounded-lg border-2 border-[#000060] text-[#000060] hover:bg-[#000060] hover:text-white transition-all duration-300"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-lg bg-gradient-to-r from-[#000060] to-[#0000a0] text-white transition-all duration-300 flex items-center ${
                  isSubmitting
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:shadow-lg transform hover:-translate-y-1"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    Create User
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
