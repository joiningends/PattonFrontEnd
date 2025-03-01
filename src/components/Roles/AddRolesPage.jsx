"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export default function AddRolePage() {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState("");
  const [pages, setPages] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pages/`);
      if (response.data.success) {
        setPages(response.data.data);
        const initialPermissions = {};
        response.data.data.forEach(page => {
          initialPermissions[page.id] = [];
        });
        setPermissions(initialPermissions);
      } else {
        setError("Failed to fetch pages");
      }
    } catch (error) {
      setError("Error fetching pages");
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!roleName.trim()) {
      setError("Role name is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const permissionData = {};
      Object.keys(permissions).forEach(pageId => {
        if (permissions[pageId].length > 0) {
          permissionData[pageId] = permissions[pageId];
        }
      });

      const response = await axios.post(`${API_BASE_URL}/role/save`, {
        p_rolename: roleName,
        p_permission_data: permissionData,
      });

      if (response.data.success) {
        navigate("/roles");
      } else {
        setError(
          response.data.message || "An error occurred while creating the role."
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred while creating the role. Please try again."
      );
    }

    setIsSubmitting(false);
  };

  const handlePermissionChange = (pageId, permissionId) => {
    setPermissions(prev => {
      const updatedPermissions = { ...prev };
      if (updatedPermissions[pageId].includes(permissionId)) {
        updatedPermissions[pageId] = updatedPermissions[pageId].filter(
          id => id !== permissionId
        );
      } else {
        updatedPermissions[pageId] = [
          ...updatedPermissions[pageId],
          permissionId,
        ];
      }
      return updatedPermissions;
    });
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
            onClick={() => navigate("/roles")}
            className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Roles
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
            Add New Role
          </h1>
          <p className="text-[#4b4b80] text-base lg:text-lg">
            Create a new role and assign permissions
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-xl p-6 lg:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="roleName"
                className="block text-sm font-medium text-[#000060] mb-2"
              >
                Role Name
              </label>
              <input
                type="text"
                id="roleName"
                name="roleName"
                value={roleName}
                onChange={e => setRoleName(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 ${
                  error ? "border-red-500" : "border-[#c8c8e6]"
                } focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300`}
                placeholder="Enter role name"
              />
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#000060] mb-4">
                Page Permissions
              </h2>
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f0f0f9]">
                    <th className="px-4 py-2 text-left">Page Name</th>
                    <th className="px-4 py-2 text-center">View</th>
                    <th className="px-4 py-2 text-center">Edit</th>
                    <th className="px-4 py-2 text-center">Delete</th>
                    <th className="px-4 py-2 text-center">Create</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map(page => (
                    <tr key={page.id} className="border-b">
                      <td className="px-4 py-2">{page.pagename}</td>
                      {[1, 2, 3, 4].map(permissionId => (
                        <td
                          key={permissionId}
                          className="px-4 py-2 text-center"
                        >
                          <input
                            type="checkbox"
                            checked={permissions[page.id]?.includes(
                              permissionId
                            )}
                            onChange={() =>
                              handlePermissionChange(page.id, permissionId)
                            }
                            className="form-checkbox h-5 w-5 text-[#000060]"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/roles")}
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
                    Create Role
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
