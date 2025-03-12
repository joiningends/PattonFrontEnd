"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Mail,
  Phone,
  Briefcase,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  ToggleLeft,
  ToggleRight,
  Check,
  Filter,
  SortAsc,
  User,
  AtSign,
  Hash,
  UserCircle,
  Trash2,
  X,
  UserCog,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../axiosConfig";


export default function UserPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [sortField, setSortField] = useState("username");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ type: "", message: "" });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [filterRoles, setFilterRoles] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`/users/`);
      if (response.data.success) {
        setUsers(response.data.data);
        console.log(response.data.data);
      } else {
        setErrorMessage(response.data.message || "Failed to fetch users");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Error fetching users");
    }
  };


  const filteredUsers = users.filter(user => {
    const matchesSearchTerm =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === "All" ||
      user.roles.some(role => role.roleName === filterRole);

    return matchesSearchTerm && matchesRole;
  });


  const sortedUsers = filteredUsers.sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];

    if (fieldA < fieldB) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (fieldA > fieldB) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });


  const rolesArray = [
    "All",
    "Admin",
    "Account Manager",
    "Plant Head",
    "Plant Engineer",
    "Commercial Team",
    "Commercial Approver",
  ];

  const handleSort = field => {
    setSortField(field);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus ? 1 : 2; // 1 to disable, 2 to enable
      const response = await axiosInstance.post(
        `/users/status/${userId}`,
        { status: newStatus }
      );
      if (response.data.success) {
        setUsers(
          users.map(user =>
            user.id === userId ? { ...user, status: !currentStatus } : user
          )
        );
        setAlertMessage({
          type: "success",
          message: `User ${newStatus === 2 ? "enabled" : "disabled"
            } successfully`,
        });
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        setErrorMessage(
          response.data.message || "Failed to update user status"
        );
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Error updating user status"
      );
    }
  };

  const handleDeleteUser = async id => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await axiosInstance.get(`/users/delete/${id}`);
        if (response.data.success) {
          setUsers(users.filter(user => user.id !== id));
          setAlertMessage({
            type: "success",
            message: `User ${response.data.data.username} has been deleted`,
          });
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
          }, 3000);
        } else {
          setErrorMessage(response.data.message || "Failed to delete user");
        }
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "Error deleting user");
      }
    }
  };

  const handleRoleSelect = role => {
    setFilterRole(role);
    setIsDropdownOpen(false);
  };

  const openEditModal = user => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setIsEditModalOpen(false);
  };

  const handleEditUser = async e => {
    e.preventDefault();

    // Validate phone number
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(editingUser.phone)) {
      setErrorMessage("Phone number must be 10 digits");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editingUser.email)) {
      setErrorMessage("Invalid email format");
      return;
    }

    try {
      const response = await axiosInstance.post(
        `/users/edit/${editingUser.id}`,
        {
          username: editingUser.username,
          phone: editingUser.phone,
          email: editingUser.email,
          designation: editingUser.designation,
          department: editingUser.department,
        }
      );
      if (response.data.success) {
        setUsers(
          users.map(user =>
            user.id === editingUser.id ? { ...user, ...editingUser } : user
          )
        );
        setAlertMessage({
          type: "success",
          message: `User ${editingUser.username} has been updated successfully`,
        });
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
        closeEditModal();
      } else {
        setErrorMessage(response.data.message || "Failed to update user");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Error updating user");
    }
  };

  const handleEditInputChange = e => {
    const { name, value } = e.target;
    setEditingUser(prev => ({ ...prev, [name]: value }));
  };

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get(`/role/view`);
      if (response.data.success) {
        console.log("Roles:", response.data.roles);
        setRoles(response.data.roles);

        // Set filterRoles with the "All" option
        const rolesWithAll = [{ role_id: "All", role_name: "All" }, ...response.data.roles];
        setFilterRoles(rolesWithAll);
      } else {
        setErrorMessage(response.data.message || "Failed to fetch roles");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Error fetching roles");
    }
  };


  const fetchUserRole = async (id) => {
    try {
      const response = await axiosInstance.get(`users/userRoledata/${id}`);
      if (response.data.success) {
        console.log("User Role: ", response);
        console.log(response.data.data[0]);
        setSelectedRole(response.data.data[0].role_id);
      } else {
        setErrorMessage(error.response?.data?.message || "Error fetching user role");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Error fetching user role.");
    }
  }



  const openRoleModal = user => {
    setSelectedUser(user);
    fetchUserRole(user.id);
    // setSelectedRole(null);
    setIsRoleModalOpen(true);
    fetchRoles();
  };

  const closeRoleModal = () => {
    setIsRoleModalOpen(false);
    setSelectedUser(null);
    setSelectedRole(null);
  };

  const handleRoleAssignment = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      const response = await axiosInstance.post(`/users/map`, {
        p_user_id: selectedUser.id,
        p_role_id: selectedRole,
      });

      if (response.data.success) {
        setAlertMessage({
          type: "success",
          message: `Role assigned successfully to ${selectedUser.username}`,
        });
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        // Refetch users to update the table data
        await fetchUsers();
        closeRoleModal();
        // setTimeout(() => navigate("/users"), 1000);
      } else {
        setErrorMessage(response.data.message || "Failed to assign role");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Error assigning role");
    }
  };

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
            className={`fixed top-4 right-4 z-[1000] p-4 rounded-lg shadow-lg ${alertMessage.type === "success" ? "bg-green-100" : "bg-yellow-100"
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

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 z-[1000]"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMessage}</span>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setErrorMessage("")}
          >
            <X className="h-6 w-6 text-red-500" />
          </span>
        </motion.div>
      )}

      <header className="mb-16 relative z-[10]">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
              Users
            </h1>
            <p className="text-[#4b4b80] text-base lg:text-lg">
              Manage your user base efficiently
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/AddUser")}
            className="w-full lg:w-auto bg-gradient-to-r from-[#000060] to-[#0000a0] text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#000060] focus:ring-opacity-50"
          >
            <Users className="inline-block mr-2 h-5 w-5" />
            Add New User
          </motion.button>
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
              placeholder="Search users..."
              className="w-full pl-12 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 text-[#000060]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4b4b80]"
              size={20}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto mt-4 lg:mt-0">
            <div
              className="relative w-full sm:w-48"
              style={{ position: "relative", zIndex: 999 }}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full h-full px-4 py-3 bg-[#f0f0f9] text-[#000060] rounded-lg text-sm hover:bg-[#e1e1f5] transition-colors shadow-md hover:shadow-lg flex items-center justify-between"
              >
                <Filter className="mr-2 h-4 w-4" />
                <span>{filterRole}</span>
                <ChevronDown className="h-4 w-4" />
              </motion.button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-[999] w-full mt-2 bg-white rounded-lg shadow-lg"
                    style={{ position: "absolute", minWidth: "200px" }}
                  >
                    {filterRoles.map(role => (
                      <motion.button
                        key={role.role_id}
                        whileHover={{ backgroundColor: "#f0f0f9" }}
                        onClick={() => handleRoleSelect(role.role_name)}
                        className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between"
                      >
                        <span>{role.role_name}</span>
                        {role.role_name === filterRole && (
                          <Check className="h-4 w-4 text-[#000060]" />
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-4 py-3 bg-[#f0f0f9] text-[#000060] rounded-lg text-sm hover:bg-[#e1e1f5] transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
              onClick={() => handleSort("username")}
            >
              <SortAsc className="mr-2 h-4 w-4" /> Sort by Username
            </motion.button>
          </div>
        </motion.div>
      </header>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden mt-16 relative z-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-[#2d2d5f]">
            <thead className="text-xs uppercase bg-gradient-to-r from-[#000060] to-[#0000a0] text-white">
              <tr>
                <th
                  className="px-4 py-3 lg:px-6 lg:py-4 font-extrabold text-sm cursor-pointer"
                  onClick={() => handleSort("username")}
                >
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Name
                  </div>
                </th>
                <th
                  className="px-4 py-3 lg:px-6 lg:py-4 font-extrabold text-sm cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center">
                    <AtSign className="mr-2 h-4 w-4" />
                    Email
                  </div>
                </th>
                <th
                  className="px-4 py-3 lg:px-6 lg:py-4 font-extrabold text-sm cursor-pointer hidden sm:table-cell"
                  onClick={() => handleSort("phone")}
                >
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    Phone
                  </div>
                </th>
                <th
                  className="px-4 py-3 lg:px-6 lg:py-4 font-extrabold text-sm cursor-pointer hidden md:table-cell"
                  onClick={() => handleSort("username")}
                >
                  <div className="flex items-center">
                    <Hash className="mr-2 h-4 w-4" />
                    Username
                  </div>
                </th>
                <th
                  className="px-4 py-3 lg:px-6 lg:py-4 font-extrabold text-sm cursor-pointer"
                  onClick={() => handleSort("designation")}
                >
                  <div className="flex items-center">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Role
                  </div>
                </th>
                <th className="px-4 py-3 lg:px-6 lg:py-4 font-extrabold text-sm">
                  <div className="flex items-center">
                    <Edit className="mr-2 h-4 w-4" />
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`border-b border-[#e1e1f5] hover:bg-[#f8f8fd] transition-all duration-300 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8fd]"
                    }`}
                >
                  <td className="px-4 py-3 lg:px-6 lg:py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-[#000060] to-[#0000a0] text-white flex items-center justify-center mr-3 text-sm lg:text-lg font-semibold shadow-md">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-[#000060] text-sm lg:text-base flex-1">
                        {user.first_name + " " + user.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 lg:px-6 lg:py-4">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-[#000060]" />
                      <span className="text-sm lg:text-base">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 lg:px-6 lg:py-4 hidden sm:table-cell">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-[#000060]" />
                      <span className="text-sm lg:text-base">{user.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 lg:px-6 lg:py-4 hidden md:table-cell">
                    <span className="text-sm lg:text-base">
                      {user.username}
                    </span>
                  </td>
                  <td className="px-4 py-3 lg:px-6 lg:py-4">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-[#000060]" />
                      <span className="text-sm lg:text-base flex-1">
                        {user.roles[0].roleName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 lg:px-6 lg:py-4">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEditModal(user)}
                        className="text-[#000060] hover:text-[#0000a0] transition-colors p-1 rounded-full hover:bg-[#e1e1f5]"
                      >
                        <Edit className="h-4 w-4 lg:h-5 lg:w-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleUserStatus(user.id, user.status)}
                        className={`transition-colors p-1 rounded-full ${user.status
                          ? "text-green-500 hover:text-green-700 hover:bg-green-100"
                          : "text-red-500 hover:text-red-700 hover:bg-red-100"
                          }`}
                      >
                        {user.status ? (
                          <ToggleRight className="h-4 w-4 lg:h-5 lg:w-5" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 lg:h-5 lg:w-5" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openRoleModal(user)}
                        className="text-[#000060] hover:text-[#0000a0] transition-colors p-1 rounded-full hover:bg-[#e1e1f5]"
                        title="Map User to Role"
                      >
                        <UserCog className="h-4 w-4 lg:h-5 lg:w-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 lg:h-5 lg:w-5" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 lg:px-6 lg:py-4 border-t border-[#c8c8e6] flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-[#4b4b80] text-xs lg:text-sm">
            Showing <span className="font-semibold">{users.length}</span>{" "}
            results
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-2 py-1 lg:px-3 lg:py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              <ChevronLeft size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 lg:px-4 lg:py-2 bg-[#000060] text-white rounded-md hover:bg-[#0000a0] transition-colors"
            >
              1
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-2 py-1 lg:px-3 lg:py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#000060]">Edit User</h2>
              <button
                onClick={closeEditModal}
                className="text-[#000060] hover:text-[#0000a0]"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-[#000060] mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={editingUser?.username || ""}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-[#c8c8e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#000060]"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#000060] mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editingUser?.email || ""}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-[#c8c8e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#000060]"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-[#000060] mb-1"
                >
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={editingUser?.phone || ""}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-[#c8c8e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#000060]"
                />
              </div>
              <div>
                <label
                  htmlFor="designation"
                  className="block text-sm font-medium text-[#000060] mb-1"
                >
                  Designation
                </label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={editingUser?.designation || ""}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-[#c8c8e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#000060]"
                />
              </div>
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-[#000060] mb-1"
                >
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={editingUser?.department || ""}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-[#c8c8e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#000060]"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-[#000060] border border-[#000060] rounded-md hover:bg-[#000060] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#000060] text-white rounded-md hover:bg-[#0000a0] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {isRoleModalOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 0,
            padding: 0
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-6 w-full max-w-md relative"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#000060]">
                Assign Role to User
              </h2>
              <button
                onClick={closeRoleModal}
                className="text-[#000060] hover:text-[#0000a0]"
              >
                <X size={24} />
              </button>
            </div>
            <p className="mb-4">
              Assigning role to user: <strong>{selectedUser?.username}</strong>
            </p>
            <div className="mb-4">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-[#000060] mb-2"
              >
                Select Role
              </label>
              <select
                id="role"
                value={selectedRole || ""}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-[#c8c8e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#000060]"
              >
                <option value="">Select a role</option>
                {roles.map(role => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeRoleModal}
                className="px-4 py-2 text-[#000060] border border-[#000060] rounded-md hover:bg-[#000060] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleAssignment}
                disabled={!selectedRole}
                className="px-4 py-2 bg-[#000060] text-white rounded-md hover:bg-[#0000a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Role
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
