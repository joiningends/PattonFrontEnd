"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import axiosInstance from "../../axiosConfig"

// Icons (you may need to install an icon library or use SVGs)
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const FileTextIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)
const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
)
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export default function RFQListingPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rfqs, setRFQs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [selectedRFQ, setSelectedRFQ] = useState(null)
  const [approveComment, setApproveComment] = useState("")
  const [selectedPlants, setSelectedPlants] = useState([])
  const [plants, setPlants] = useState([])
  const [rejectReasons, setRejectReasons] = useState([])
  const [rejectComment, setRejectComment] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const rfqsPerPage = 10
  const [statusDescription, setStatusDescription] = useState(null)

  const rejectReasonOptions = ["Capability", "Volume", "Material", "Customer Background check", "Others"]

  const fetchRFQs = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.post("http://localhost:3000/api/rfq/getrfq", {
        p_user_id: 3, // This should be dynamically set based on the logged-in user
        p_rfq_id: null,
        p_client_id: null,
      })
      if (response.data.success) {
        setRFQs(response.data.data);
        console.log("RFQ: ", response.data.data);
      } else {
        setError("Failed to fetch RFQs")
      }
    } catch (error) {
      setError("Error fetching RFQs: " + (error.response?.data?.message || error.message))
    }
    setIsLoading(false)
  }, [])

  const fetchPlants = useCallback(async () => {
    try {
      const response = await axiosInstance.get("http://localhost:3000/api/plant")
      if (response.data.success) {
        console.log("Plants: ", response.data.data[0]);

        setPlants(response.data.data[0]);
      } else {
        setError("Failed to fetch plants")
      }
    } catch (error) {
      setError("Error fetching plants: " + (error.response?.data?.message || error.message))
    }
  }, [])

  useEffect(() => {
    fetchRFQs().catch((err) => {
      console.error("Error in fetchRFQs:", err)
      setError("Failed to load RFQs. Please try again later.")
    })
    fetchPlants().catch((err) => {
      console.error("Error in fetchPlants:", err)
      setError("Failed to load plants. Please try again later.")
    })
  }, [fetchRFQs, fetchPlants])

  const filteredRFQs = rfqs.filter(
    (rfq) =>
      rfq.rfq_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.client_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const indexOfLastRFQ = currentPage * rfqsPerPage
  const indexOfFirstRFQ = indexOfLastRFQ - rfqsPerPage
  const currentRFQs = filteredRFQs.slice(indexOfFirstRFQ, indexOfLastRFQ)
  const totalPages = Math.ceil(filteredRFQs.length / rfqsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleEdit = (rfqId) => {
    navigate(`/edit_RFQ/${rfqId}`)
  }

  const handleDelete = async (rfqId) => {
    if (window.confirm("Are you sure you want to delete this RFQ?")) {
      try {
        const response = await axiosInstance.delete(`http://localhost:3000/api/rfq/delete/${rfqId}`)
        if (response.data.success) {
          fetchRFQs()
          setSuccessMessage("RFQ deleted successfully")
        } else {
          setError("Failed to delete RFQ. Please try again.")
        }
      } catch (error) {
        setError("Error deleting RFQ: " + (error.response?.data?.message || error.message))
      }
    }
  }

  const openApproveModal = (rfq) => {
    console.log("REPlant: ", plants);
    setSelectedRFQ(rfq)
    setIsApproveModalOpen(true)
  }

  const openRejectModal = (rfq) => {
    setSelectedRFQ(rfq)
    setIsRejectModalOpen(true)
  }

  const isApproveValid = selectedPlants.length > 0 && approveComment.trim() !== ""
  const isRejectValid = rejectReasons.length > 0 && rejectComment.trim() !== ""

  const handleApprove = async () => {
    if (!isApproveValid) {
      setError("Please select at least one plant and add a comment.")
      return
    }
    try {
      const response = await axiosInstance.post("http://localhost:3000/api/rfq/approve", {
        rfq_id: selectedRFQ.rfq_id,
        user_id: 3, // This should be dynamically set based on the logged-in user
        state_id: 2,
        plant_id: selectedPlants[0], // We're using the first selected plant for now
        comments: approveComment || null,
      })
      if (response.data.success) {
        fetchRFQs()
        setIsApproveModalOpen(false)
        setSelectedRFQ(null)
        setSelectedPlants([])
        setApproveComment("")
        setSuccessMessage("RFQ approved successfully")
      } else {
        setError("Failed to approve RFQ. Please try again.")
      }
    } catch (error) {
      setError("Error approving RFQ: " + (error.response?.data?.message || error.message))
    }
  }

  const handleReject = async () => {
    if (!isRejectValid) {
      setError("Please select at least one reason and add a comment.")
      return
    }
    try {
      const response = await axiosInstance.post("http://localhost:3000/api/rfq/approve", {
        rfq_id: selectedRFQ.rfq_id,
        user_id: 3, // This should be dynamically set based on the logged-in user
        state_id: 0,
        plant_id: null,
        comments: rejectComment || null,
      })
      if (response.data.success) {
        fetchRFQs()
        setIsRejectModalOpen(false)
        setSelectedRFQ(null)
        setRejectReasons([])
        setRejectComment("")
        setSuccessMessage("RFQ rejected successfully")
      } else {
        setError("Failed to reject RFQ. Please try again.")
      }
    } catch (error) {
      setError("Error rejecting RFQ: " + (error.response?.data?.message || error.message))
    }
  }

  const showStateDescription = (description) => {
    setStatusDescription(description)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9] min-h-screen p-4 lg:p-8"
    >
      <header className="mb-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">RFQ Listing</h1>
            <p className="text-[#4b4b80] text-base lg:text-lg">Manage your Request for Quotations</p>
          </div>
          <button
            onClick={() => navigate("/create_RFQ")}
            className="w-full lg:w-auto bg-gradient-to-r from-[#000060] to-[#0000a0] text-white px-6 py-3 rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
          >
            <PlusIcon />
            <span className="ml-2">Create RFQ</span>
          </button>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-4 lg:p-6 rounded-xl shadow-lg flex flex-col lg:flex-row justify-between items-stretch space-y-4 lg:space-y-0 lg:space-x-4"
        >
          <div className="relative flex items-center w-full lg:w-96">
            <input
              type="text"
              placeholder="Search RFQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4b4b80]">
              <SearchIcon className="w-5 h-5" />
            </div>
          </div>
        </motion.div>
      </header>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center justify-between"
          >
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage("")} className="text-green-700 hover:text-green-900">
              <XIcon />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#000060]"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-[#2d2d5f]">
              <thead className="text-xs uppercase bg-gradient-to-r from-[#000060] to-[#0000a0] text-white">
                <tr>
                  <th className="px-6 py-4 font-extrabold text-sm">
                    <div className="flex items-center">
                      <FileTextIcon className="mr-2" />
                      RFQ Name
                    </div>
                  </th>
                  <th className="px-6 py-4 font-extrabold text-sm">
                    <div className="flex items-center">Client</div>
                  </th>
                  <th className="px-6 py-4 font-extrabold text-sm">
                    <div className="flex items-center">Status</div>
                  </th>
                  <th className="px-6 py-4 font-extrabold text-sm">
                    <div className="flex items-center">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentRFQs.map((rfq, index) => (
                  <motion.tr
                    key={rfq.rfq_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`border-b border-[#e1e1f5] hover:bg-[#f8f8fd] transition-all duration-300 ${
                      index % 2 === 0 ? "bg-white" : "bg-[#f8f8fd]"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#000060] to-[#0000a0] text-white flex items-center justify-center mr-3 text-sm font-semibold shadow-md">
                          {rfq.rfq_name.charAt(0).toUpperCase()}
                        </div>
                        <span>{rfq.rfq_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{rfq.client_name}</td>
                    <td className="px-6 py-4">
                      {rfq.state_description && (
                        <button
                          onClick={() => showStateDescription(rfq.state_description)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-xs"
                        >
                          Show Status
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {(rfq.state_id !== 2 && rfq.state_id !== 0) ? (
                        <div className="flex items-center space-x-2">
                          {/* <button
                            onClick={() => handleEdit(rfq.rfq_id)}
                            className="p-2 text-[#000060] hover:text-[#0000a0] transition-colors rounded-full hover:bg-[#f0f0f9]"
                          >
                            <EditIcon className="w-5 h-5" />
                          </button> */}
                          {/* <button
                            onClick={() => handleDelete(rfq.rfq_id)}
                            className="p-2 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-100"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button> */}
                          <button
                            onClick={() => openApproveModal(rfq)}
                            className="p-2 text-green-500 hover:text-green-700 transition-colors rounded-full hover:bg-green-100"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openRejectModal(rfq)}
                            className="p-2 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-100"
                          >
                            <XIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500">No actions available</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-4 border-t border-[#c8c8e6] flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-[#4b4b80] text-sm">
            Showing <span className="font-semibold">{currentRFQs.length}</span> of{" "}
            <span className="font-semibold">{filteredRFQs.length}</span> RFQs
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-md transition-colors ${
                  currentPage === page ? "bg-[#000060] text-white" : "bg-[#f0f0f9] text-[#000060] hover:bg-[#e1e1f5]"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Approve Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#000060] mb-4">Approve RFQ</h2>
            <p className="mb-4 text-[#4b4b80]">Select plants and add a comment to approve this RFQ.</p>
            <div className="mb-4 space-y-2">
              {plants.map((plant) => (
                <label key={plant.plant_id} className="flex items-center space-x-3 cursor-pointer">
                  <input  
                    type="checkbox"
                    checked={selectedPlants.includes(plant.plant_id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlants([...selectedPlants, plant.plant_id])
                      } else {
                        setSelectedPlants(selectedPlants.filter((id) => id !== plant.plant_id))
                      }
                    }}
                    className="form-checkbox h-5 w-5 text-[#000060] rounded border-gray-300 focus:ring-[#000060] transition duration-150 ease-in-out"
                  />
                  <span className="text-[#2d2d5f]">{plant.plantname}</span>
                </label>
              ))}
            </div>
            <textarea
              value={approveComment}
              onChange={(e) => setApproveComment(e.target.value)}
              placeholder="Add your comment here... (required)"
              className="w-full p-3 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 mb-4"
              rows="3"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={!isApproveValid}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isApproveValid
                    ? "bg-[#000060] text-white hover:bg-[#0000a0]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#000060] mb-4">Reject RFQ</h2>
            <p className="mb-4 text-[#4b4b80]">Select reasons and add a comment to reject this RFQ.</p>
            <div className="mb-4 space-y-2">
              {rejectReasonOptions.map((reason) => (
                <label key={reason} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rejectReasons.includes(reason)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRejectReasons([...rejectReasons, reason])
                      } else {
                        setRejectReasons(rejectReasons.filter((r) => r !== reason))
                      }
                    }}
                    className="form-checkbox h-5 w-5 text-red-500 rounded border-gray-300 focus:ring-red-500 transition duration-150 ease-in-out"
                  />
                  <span className="text-[#2d2d5f]">{reason}</span>
                </label>
              ))}
            </div>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Add your comment here... (required)"
              className="w-full p-3 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 mb-4"
              rows="3"
              maxLength={655}
              required
            />
            <p className="text-sm text-gray-500 mb-4">{rejectComment.length}/655 characters</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!isRejectValid}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isRejectValid
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {statusDescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#000060] mb-4">RFQ Status</h2>
            <p className="mb-4 text-[#4b4b80]">{statusDescription}</p>
            <button
              onClick={() => setStatusDescription(null)}
              className="px-4 py-2 bg-[#000060] text-white rounded-lg hover:bg-[#0000a0] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

