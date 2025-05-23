"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  FileText,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { motion } from "framer-motion";

const API_BASE_URL = "http://localhost:3000/api";

export default function PagesListPage() {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const pagesPerPage = 10;

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/pages/`);
      if (response.data.success) {
        setPages(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch pages");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching pages");
    }
    setIsLoading(false);
  };

  const handleDeletePage = async id => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      try {
        const response = await axios.get(`${API_BASE_URL}/pages/delete/${id}`);
        if (response.data.success) {
          setPages(pages.filter(page => page.id !== id));
        } else {
          setError(response.data.message || "Failed to delete page");
        }
      } catch (error) {
        setError(error.response?.data?.message || "Error deleting page");
      }
    }
  };

  const togglePageStatus = async (id, currentStatus) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/pages/status/${id}`, {
        status: currentStatus ? 1 : 2, // 1 to disable, 2 to enable
      });
      if (response.data.success) {
        setPages(
          pages.map(page =>
            page.id === id ? { ...page, status: !currentStatus } : page
          )
        );
      } else {
        setError(response.data.message || "Failed to update page status");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error updating page status");
    }
  };

  const filteredPages = pages.filter(page =>
    page.pagename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastPage = currentPage * pagesPerPage;
  const indexOfFirstPage = indexOfLastPage - pagesPerPage;
  const currentPages = filteredPages.slice(indexOfFirstPage, indexOfLastPage);
  const totalPages = Math.ceil(filteredPages.length / pagesPerPage);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
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
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
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
              Pages
            </h1>
            <p className="text-[#4b4b80] text-base lg:text-lg">
              Manage your website pages
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/create-page")}
            className="w-full lg:w-auto bg-gradient-to-r from-[#000060] to-[#0000a0] text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#000060] focus:ring-opacity-50"
          >
            <Plus className="inline-block mr-2 h-5 w-5" />
            Create New Page
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
              placeholder="Search pages..."
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
                    <FileText className="mr-2 h-5 w-5" />
                    Page Name
                  </div>
                </th>
                <th className="px-6 py-4 font-extrabold text-sm">Status</th>
                <th className="px-6 py-4 font-extrabold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPages.map((page, index) => (
                <motion.tr
                  key={page.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`border-b border-[#e1e1f5] hover:bg-[#f8f8fd] transition-all duration-300 ${
                    index % 2 === 0 ? "bg-white" : "bg-[#f8f8fd]"
                  }`}
                >
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#000060] to-[#0000a0] text-white flex items-center justify-center mr-3 text-sm font-semibold shadow-md">
                        {page.pagename.charAt(0).toUpperCase()}
                      </div>
                      <span>{page.pagename}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        page.status
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {page.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(`/edit-page/${page.id}`)}
                        className="text-[#000060] hover:text-[#0000a0] transition-colors p-1 rounded-full hover:bg-[#e1e1f5]"
                      >
                        <Edit className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => togglePageStatus(page.id, page.status)}
                        className={`transition-colors p-1 rounded-full ${
                          page.status
                            ? "text-green-500 hover:text-green-700 hover:bg-green-100"
                            : "text-red-500 hover:text-red-700 hover:bg-red-100"
                        }`}
                      >
                        {page.status ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeletePage(page.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100"
                      >
                        <Trash2 className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-[#c8c8e6] flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-[#4b4b80] text-sm">
            Showing <span className="font-semibold">{currentPages.length}</span>{" "}
            of <span className="font-semibold">{filteredPages.length}</span>{" "}
            pages
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                className={`px-3 py-1 rounded-md transition-colors ${
                  currentPage === page
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
              onClick={() =>
                setCurrentPage(prev => Math.min(prev + 1, totalPages))
              }
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
