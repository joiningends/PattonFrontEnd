"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
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
  Building,
  MapPin,
  Globe,
  Hash,
  AlertCircle,
  Users,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../axiosConfig";
import useAppStore from "../../zustandStore";


export default function ClientsPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const clientsPerPage = 10;

  const { isLoggedIn, user, permission, role } = useAppStore();

  // Get the page permission
  let pagePermission = null;
  if(permission) {
    pagePermission = permission?.find((p) => p.page_id === 7);
    console.log(pagePermission.permissions);
  }

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/client/getall`);
      if (response.data.success) {
        setClients(response.data.data);
      } else {
        setError("Failed to fetch clients");
      }
    } catch (error) {
      setError("Error fetching clients");
    }
    setIsLoading(false);
  };

  const handleSort = field => {
    setSortField(field);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const toggleClientStatus = async (clientId, currentStatus) => {
    console.log("Client Id: ", clientId);
    console.log("current Status: ", currentStatus);
    try {
      // Assuming there's an API endpoint to update client status
      const response = await axiosInstance.post(
        `/client/disable/${clientId}`,
        {
          status: !currentStatus,
        }
      );
      if (response.data.success) {
        setClients(
          clients.map(client =>
            client.client_id === clientId
              ? { ...client, status: !currentStatus }
              : client
          )
        );
        setAlertMessage({
          type: "success",
          message: `Client ${!currentStatus ? "activated" : "deactivated"
            } successfully`,
        });
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        setError(response.data.message || "Failed to update client status");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error updating client status");
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = Object.values(client).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus =
      filterStatus === "All"
        ? true
        : client.status === (filterStatus === "Active");
    return matchesSearch && matchesStatus;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = sortedClients.slice(
    indexOfFirstClient,
    indexOfLastClient
  );
  const totalPages = Math.ceil(sortedClients.length / clientsPerPage);

  const openContactsModal = client => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const closeContactsModal = () => {
    setSelectedClient(null);
    setIsModalOpen(false);
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
                <AlertCircle className="h-5 w-5 text-yellow-500" />
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

      <header className="mb-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
              Clients
            </h1>
            <p className="text-[#4b4b80] text-base lg:text-lg">
              Manage your client database efficiently
            </p>
          </div>
          {pagePermission && pagePermission.permissions.find((p) => p.permission_id === 4) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/add-client")}
              className="w-full lg:w-auto bg-gradient-to-r from-[#000060] to-[#0000a0] text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#000060] focus:ring-opacity-50"
            >
              <Building className="inline-block mr-2 h-5 w-5" />
              Add New Client
            </motion.button>
          )}
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
              placeholder="Search clients..."
              className="w-full pl-12 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 text-[#000060]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4b4b80]"
              size={20}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-48">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 bg-[#f0f0f9] text-[#000060] rounded-lg text-sm hover:bg-[#e1e1f5] transition-colors shadow-md hover:shadow-lg flex items-center justify-between"
              >
                <Filter className="mr-2 h-4 w-4" />
                <span>{filterStatus}</span>
                <ChevronDown className="h-4 w-4" />
              </motion.button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg"
                  >
                    {["All", "Active", "Inactive"].map(status => (
                      <motion.button
                        key={status}
                        whileHover={{ backgroundColor: "#f0f0f9" }}
                        onClick={() => {
                          setFilterStatus(status);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between"
                      >
                        <span>{status}</span>
                        {status === filterStatus && (
                          <Check className="h-4 w-4 text-[#000060]" />
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSort("name")}
              className="w-full sm:w-auto px-6 py-3 bg-[#f0f0f9] text-[#000060] rounded-lg text-sm hover:bg-[#e1e1f5] transition-colors shadow-md hover:shadow-lg flex items-center justify-center whitespace-nowrap"
            >
              <SortAsc className="mr-2 h-4 w-4" />
              Sort by Name
            </motion.button>
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
                <th
                  className="px-6 py-4 font-extrabold text-sm cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    Client Name
                  </div>
                </th>
                <th
                  className="px-6 py-4 font-extrabold text-sm cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </div>
                </th>
                <th className="px-6 py-4 font-extrabold text-sm cursor-pointer hidden md:table-cell">
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    Phone
                  </div>
                </th>
                <th className="px-6 py-4 font-extrabold text-sm cursor-pointer hidden lg:table-cell">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    Location
                  </div>
                </th>
                {/* <th className="px-6 py-4 font-extrabold text-sm cursor-pointer hidden xl:table-cell">
                  <div className="flex items-center">
                    <Hash className="mr-2 h-4 w-4" />
                    PAN
                  </div>
                </th> */}
                <th className="px-6 py-4 font-extrabold text-sm">
                  <div className="flex items-center justify-center">
                    <Globe className="mr-2 h-4 w-4" />
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentClients.map((client, index) => (
                <motion.tr
                  key={client.client_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`border-b border-[#e1e1f5] hover:bg-[#f8f8fd] transition-all duration-300 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8fd]"
                    }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#000060] to-[#0000a0] text-white flex items-center justify-center mr-3 text-sm font-semibold shadow-md">
                        {client.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-[#000060]">
                        {client.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-[#000060]" />
                      <span>{client.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-[#000060]" />
                      <span>{client.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-[#000060]" />
                      <span>
                        {client.city}, {client.state}
                      </span>
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 hidden xl:table-cell">
                    <span>{client.pan_gst}</span>
                  </td> */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      {pagePermission.permissions.find((p) => p.permission_id === 2) && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate(`/client/${client.client_id}`)}
                          className="text-[#000060] hover:text-[#0000a0] transition-colors p-2 rounded-full hover:bg-[#e1e1f5]"
                        >
                          <Edit className="h-5 w-5" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          toggleClientStatus(client.client_id, client.status)
                        }
                        className={`transition-colors p-2 rounded-full ${client.status
                          ? "text-green-500 hover:text-green-700 hover:bg-green-100"
                          : "text-red-500 hover:text-red-700 hover:bg-red-100"
                          }`}
                      >
                        {client.status ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openContactsModal(client)}
                        className="text-[#000060] hover:text-[#0000a0] transition-colors p-2 rounded-full hover:bg-[#e1e1f5]"
                      >
                        <Users className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#c8c8e6] flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-[#4b4b80] text-sm">
            Showing{" "}
            <span className="font-semibold">{currentClients.length}</span> of{" "}
            <span className="font-semibold">{sortedClients.length}</span>{" "}
            clients
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(currentPage - 1)}
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
                onClick={() => setCurrentPage(page)}
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
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modal for displaying other contacts */}
      <AnimatePresence>
        {isModalOpen && selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#000060]">
                  Other Contacts for {selectedClient.name}
                </h2>
                <button
                  onClick={closeContactsModal}
                  className="text-[#000060] hover:text-[#0000a0] transition-colors bg-[#f0f0f9] p-2 rounded-full"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              {selectedClient.other_contacts &&
                selectedClient.other_contacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedClient.other_contacts.map((contact, index) => (
                    <motion.div
                      key={contact.contact_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-gradient-to-br from-[#f8f8fd] to-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#000060] to-[#0000a0] text-white flex items-center justify-center mr-4 text-xl font-semibold shadow-md">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-[#000060]">
                            {contact.name}
                          </h3>
                          <p className="text-sm text-[#4b4b80]">
                            {contact.designation}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="flex items-center text-[#4b4b80]">
                          <Mail className="h-5 w-5 mr-3 text-[#000060]" />
                          {contact.email}
                        </p>
                        <p className="flex items-center text-[#4b4b80]">
                          <Phone className="h-5 w-5 mr-3 text-[#000060]" />
                          {contact.phone}
                        </p>
                        <p className="flex items-center text-[#4b4b80]">
                          <Building className="h-5 w-5 mr-3 text-[#000060]" />
                          {contact.company}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#4b4b80] bg-[#f8f8fd] p-6 rounded-lg">
                  No other contacts found for this client.
                </p>
              )}
              <div className="mt-8 text-center">
                <button
                  onClick={closeContactsModal}
                  className="bg-gradient-to-r from-[#000060] to-[#0000a0] text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
