
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Plus,
    Building,
    User,
    ChevronLeft,
    ChevronRight,
    Edit,
    Trash2,
    X,
    MapPin,
} from "lucide-react";
import axiosInstance from "../../axiosConfig";
import useAppStore from "../../zustandStore";


export default function JobTypesListingPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [jobTypes, setJobTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const JobPerPage = 10;

    const { permission } = useAppStore();
    console.log(permission);

    // Get the page permissions
    let pagePermission = null;
    if (permission) {
        pagePermission = permission?.find((p) => p.page_id === 11);
        console.log(pagePermission.permissions);
    }

    useEffect(() => {
        fetchJobType();
    }, []);

    const fetchJobType = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(`/job-type`);

            console.log("Job type response: ", response);
            if (response.data.success) {
                setJobTypes(response.data.data);
            } else {
                setError("Failed to fetch job types");
            }
        } catch (error) {
            setError(
                "Error fetching job types: " +
                (error.response?.data?.message || error.message)
            );
        }
        setIsLoading(false);
    };

    const filteredJobTypes = jobTypes.filter(
        job =>
            job.job_name.toLowerCase().includes(searchTerm.toLowerCase()) 
    );

    const indexOfLastJob = currentPage * JobPerPage;
    const indexOfFirstJob = indexOfLastJob - JobPerPage;
    const currentJobTypes = filteredJobTypes.slice(
        indexOfFirstJob,
        indexOfLastJob
    );
    const totalPages = Math.ceil(filteredJobTypes.length / JobPerPage);

    const handlePageChange = pageNumber => {
        setCurrentPage(pageNumber);
    };

    const handleEdit = plantId => {
        navigate(`/job-types/edit/${plantId}`);
    };

    const handleDelete = async (jobId) => {
        if (window.confirm("Are you sure you want to delete this plant?")) {
            try {
                const response = await axiosInstance.get(
                    `/job-type/delete/${jobId}`
                );
                if (response.data.success) {
                    fetchJobType();
                    setSuccessMessage("Job type deleted successfully");
                } else {
                    setError("Failed to delete job type. Please try again.");
                }
            } catch (error) {
                setError(
                    "Error deleting job type: " +
                    (error.response?.data?.message || error.message)
                );
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9] min-h-screen p-4 lg:p-8"
        >
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-8">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6"
                    >
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
                                Job types
                            </h1>
                            <p className="text-[#4b4b80] text-base lg:text-lg">
                                Manage your Job types
                            </p>
                        </div>
                        {pagePermission && pagePermission.permissions.find((p) => p.permission_id === 4) && (
                            <button
                                onClick={() => navigate("/job-types/create")}
                                className="w-full lg:w-auto bg-gradient-to-r from-[#000060] to-[#0000a0] text-white px-6 py-3 rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <Plus className="mr-2" />
                                <span>Create Job types</span>
                            </button>
                        )}
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
                                placeholder="Search plants..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                            />
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4b4b80]"
                                size={20}
                            />
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
                            <button
                                onClick={() => setSuccessMessage("")}
                                className="text-green-700 hover:text-green-900"
                            >
                                <X size={20} />
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
                                                <Building className="mr-2" />
                                                Job Name
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 font-extrabold text-sm">
                                            <div className="flex items-center">
                                                <User className="mr-2" />
                                                Status
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 font-extrabold text-sm">
                                            <div className="flex items-center">Actions</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentJobTypes.map((job, index) => (
                                        <motion.tr
                                            key={job.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className={`border-b border-[#e1e1f5] hover:bg-[#f8f8fd] transition-all duration-300 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8fd]"
                                                }`}
                                        >
                                            <td className="px-6 py-4 font-medium">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#000060] to-[#0000a0] text-white flex items-center justify-center mr-3 text-sm font-semibold shadow-md">
                                                        {job.job_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span>{job.job_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${job.status
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {job.status ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    {pagePermission.permissions.find((p) => p.permission_id === 2) && (
                                                        <button
                                                            onClick={() => handleEdit(job.id)}
                                                            className="p-2 text-[#000060] hover:text-[#0000a0] transition-colors rounded-full hover:bg-[#f0f0f9]"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {pagePermission.permissions.find((p) => p.permission_id === 3) && (
                                                        <button
                                                            onClick={() => handleDelete(job.id)}
                                                            className="p-2 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-100"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="px-6 py-4 border-t border-[#c8c8e6] flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                        <div className="text-[#4b4b80] text-sm">
                            Showing{" "}
                            <span className="font-semibold">{currentJobTypes.length}</span> of{" "}
                            <span className="font-semibold">{filteredJobTypes.length}</span>{" "}
                            Job types
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-2 rounded-md transition-colors ${currentPage === page
                                        ? "bg-[#000060] text-white"
                                        : "bg-[#f0f0f9] text-[#000060] hover:bg-[#e1e1f5]"
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
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
