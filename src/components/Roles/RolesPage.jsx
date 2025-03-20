"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  UserCircle,
  Settings,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../axiosConfig";
import useAppStore from "../../zustandStore";


export default function RolesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState(""); // Added error message state
  const rolesPerPage = 10;
  const [showAlert, setShowAlert] = useState(false);

  const { permission } = useAppStore();

  // Get the page permissions
  let pagePermission = null;
  if(permission) {
    pagePermission = permission?.find((p) => p.page_id === 8);
    console.log(pagePermission.permissions);
  }

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/role/view`);
      if (response.data.success) {
        setRoles(response.data.roles);
      } else {
        setError("Failed to fetch roles");
      }
    } catch (error) {
      setError("Error fetching roles");
    }
    setIsLoading(false);
  };

  const filteredRoles = roles.filter(role =>
    role.role_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastRole = currentPage * rolesPerPage;
  const indexOfFirstRole = indexOfLastRole - rolesPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole);
  const totalPages = Math.ceil(filteredRoles.length / rolesPerPage);

  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };

  const handleEditRole = roleId => {
    navigate(`/roles/edit/${roleId}`);
  };

  const handleDeleteRole = async roleId => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        const response = await axiosInstance.delete(
          `/role/delete/${roleId}`
        );
        if (response.data.success) {
          setRoles(roles.filter(role => role.role_id !== roleId));
        } else {
          setError("Failed to delete role");
        }
      } catch (error) {
        setError("Error deleting role");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9] min-h-screen p-4 lg:p-8 space-y-8"
    >

      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${alertMessage.type === "success" ? "bg-green-100" : "bg-yellow-100"
              }`}
          >
            <div className="flex items-center space-x-2">
              {alertMessage.type === "success" ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-yellow-500" />
              )}
              <span
                className={`text-sm ${alertMessage.type === "success"
                  ? "text-green-700"
                  : "text-yellow-700"
                  }`}
              >
                {alertMessage.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {errorMessage && ( // Added error message display
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <AlertCircle
              className="h-6 w-6 text-red-500"
              onClick={() => setErrorMessage("")}
            />
          </span>
        </motion.div>
      )}
      <header className="mb-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
              Roles
            </h1>
            <p className="text-[#4b4b80] text-base lg:text-lg">
              Manage user roles in your organization
            </p>
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/manage-permissions")}
              className="w-full lg:w-auto bg-[#f0f0f9] text-[#000060] px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#000060] focus:ring-opacity-50"
            >
              <Settings className="inline-block mr-2 h-5 w-5" />
              Manage Permissions
            </motion.button> */}
            {pagePermission && pagePermission.permissions.find((p) => p.permission_id === 4) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/AddRole")}
                className="w-full lg:w-auto bg-gradient-to-r from-[#000060] to-[#0000a0] text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#000060] focus:ring-opacity-50"
              >
                <Plus className="inline-block mr-2 h-5 w-5" />
                Add New Role
              </motion.button>
            )}
          </div>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-4 lg:p-6 rounded-xl shadow-lg flex flex-col lg:flex-row justify-between items-stretch space-y-4 lg:space-y-0 lg:space-x-4"
        >
          <div className="relative w-full lg:w-96">
            <input
              type="text"
              placeholder="Search roles..."
              className="w-full pl-12 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 text-[#000060]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4b4b80]"
              size={20}
            />
          </div>
        </motion.div>
      </header>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-[#2d2d5f]">
            <thead className="text-xs uppercase bg-gradient-to-r from-[#000060] to-[#0000a0] text-white">
              <tr>
                <th className="px-6 py-4 font-extrabold text-sm">
                  <div className="flex items-center">
                    <UserCircle className="mr-2 h-5 w-5" />
                    Role Name
                  </div>
                </th>
                <th className="px-6 py-4 font-extrabold text-sm">
                  <div className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRoles.map((role, index) => (
                <motion.tr
                  key={role.role_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`border-b border-[#e1e1f5] hover:bg-[#f8f8fd] transition-all duration-300 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8fd]"
                    }`}
                >
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#000060] to-[#0000a0] text-white flex items-center justify-center mr-3 text-sm font-semibold shadow-md">
                        {role.role_name.charAt(0)}
                      </div>
                      <span className="text-[#000060] font-medium">
                        {role.role_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {pagePermission.permissions.find((p) => p.permission_id === 2) && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditRole(role.role_id)}
                          className="text-[#000060] hover:text-[#0000a0] transition-colors p-1 rounded-full hover:bg-[#e1e1f5]"
                        >
                          <Edit className="h-5 w-5" />
                        </motion.button>
                      )}
                      {/* <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteRole(role.role_id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100"
                      >
                        <Trash2 className="h-5 w-5" />
                      </motion.button> */}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-[#c8c8e6] flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-[#4b4b80] text-sm">
            Showing <span className="font-semibold">{currentRoles.length}</span>{" "}
            of <span className="font-semibold">{filteredRoles.length}</span>{" "}
            roles
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </motion.button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md transition-colors ${currentPage === page
                  ? "bg-[#000060] text-white"
                  : "bg-[#f0f0f9] text-[#000060] hover:bg-[#e1e1f5]"
                  }`}
              >
                {page}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>

  );
}
