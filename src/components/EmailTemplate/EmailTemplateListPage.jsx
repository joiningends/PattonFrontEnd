import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
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
    KeyRound,
    Send,
    Tag,
    Eye,
    EyeOff,
    Info,
    Check,
    TagIcon
} from "lucide-react";
import axiosInstance from "../../axiosConfig";
import useAppStore from "../../zustandStore";

export default function EmailTemplateListingPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [emailTemplate, setEmailTemplate] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [showTagModal, setShowTagModal] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTagId, setSelectedTagId] = useState("");
    const [isTagLoading, setIsTagLoading] = useState(false);
    const [isSavingTag, setIsSavingTag] = useState(false);
    const emailPerPage = 10;

    const { permission } = useAppStore();

    // Get the page permissions
    let pagePermission = null;
    if (permission) {
        pagePermission = permission?.find((p) => p.page_id === 9);
    }

    useEffect(() => {
        fetchEmailTemplate();
    }, []);

    // Fetch email template's
    const fetchEmailTemplate = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(`/email-template/fetch`);

            if (response.data.success) {
                setEmailTemplate(response.data.data);
            } else {
                setError("Failed to fetch email template.");
            }
        } catch (error) {
            setError(
                "Error fetching email templates: " +
                (error.response?.data?.message || error.message)
            );
        }
        setIsLoading(false);
    };

    // Fetch available tags
    const fetchEmailTemplateTags = async () => {
        setIsTagLoading(true);
        try {
            const response = await axiosInstance.get(`/email-template/email-tags`);
            
            if (response.data.success) {
                console.log("Tag data: ", response.data.data);
                setAvailableTags(response.data.data);
            } else {
                setError("Failed to fetch email tags.");
            }
        } catch (error) {
            setError(
                "Error fetching email tags: " +
                (error.response?.data?.message || error.message)
            );
        }
        setIsTagLoading(false);
    };

    // Save tag assignment
    const saveEmailWithTags = async () => {
        if (!selectedTemplateId || !selectedTagId) {
            setError("Please select a tag to assign.");
            return;
        }

        setIsSavingTag(true);
        try {
            const response = await axiosInstance.post(`/email-template/email-tag-assign`, {
                id: selectedTemplateId,
                tagId: selectedTagId
            });

            if (response.data.success) {
                setSuccessMessage("Tag assigned successfully to the email template");
                fetchEmailTemplate(); // Refresh the template list
                handleCloseTagModal();
            } else {
                setError("Failed to assign tag to email template.");
            }
        } catch (error) {
            setError(
                "Error assigning tag: " +
                (error.response?.data?.message || error.message)
            );
        }
        setIsSavingTag(false);
    };

    // Open tag assignment modal
    const handleOpenTagModal = (templateId) => {
        setSelectedTemplateId(templateId);
        setSelectedTagId("");
        setShowTagModal(true);
        fetchEmailTemplateTags();
    };

    // Close tag assignment modal
    const handleCloseTagModal = () => {
        setShowTagModal(false);
        setSelectedTemplateId(null);
        setSelectedTagId("");
        setAvailableTags([]);
    };

    const filteredEmailTemplate = emailTemplate.filter(
        email => email.template_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastEmail = currentPage * emailPerPage;
    const indexOfFirstEmail = indexOfLastEmail - emailPerPage;
    const currentEmails = filteredEmailTemplate.slice(
        indexOfFirstEmail,
        indexOfLastEmail
    );
    const totalPages = Math.ceil(filteredEmailTemplate.length / emailPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this email template?")) {
            try {
                const response = await axiosInstance.get(
                    `/email-template/delete/${id}`
                );
                if (response.data.success) {
                    fetchEmailTemplate();
                    setSuccessMessage("Email template deleted successfully");
                } else {
                    setError("Failed to delete email template. Please try again.");
                }
            } catch (error) {
                setError(
                    "Error deleting email template: " +
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
                                Email template List
                            </h1>
                            <p className="text-[#4b4b80] text-base lg:text-lg">
                                Manage your Email template's for notifying events
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/email-template/save")}
                            className="w-full lg:w-auto bg-gradient-to-r from-[#000060] to-[#0000a0] text-white px-6 py-3 rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                        >
                            <Plus className="mr-2" />
                            <span>Create Template</span>
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
                                placeholder="Search email template..."
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
                                                <Send className="mr-2" />
                                                Template name
                                            </div>
                                        </th>

                                        <th className="px-6 py-4 font-extrabold text-sm">
                                            <div className="flex items-center">
                                                <TagIcon className="mr-2" />
                                                Tag
                                            </div>
                                        </th>

                                        <th className="px-6 py-4 font-extrabold text-sm">
                                            <div className="flex items-center">
                                                Status
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 font-extrabold text-sm">
                                            <div className="flex items-center">Actions</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentEmails.map((email, index) => (
                                        <motion.tr
                                            key={email.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className={`border-b border-[#e1e1f5] hover:bg-[#f8f8fd] transition-all duration-300 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8fd]"
                                                }`}
                                        >
                                            <td className="px-6 py-4 font-medium">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#000060] to-[#0000a0] text-white flex items-center justify-center mr-3 text-sm font-semibold shadow-md">
                                                        {email.template_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span>{email.template_name}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 font-medium">
                                                <div className="flex items-center">
                                                    <span>{email.tag_name}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 flex items-center">
                                                {email.status === true ?
                                                    <div className="flex space-x-2 items-center justify-center">
                                                        <span className="flex w-2 h-2 bg-lime-500 rounded-full animate-pulse"></span>
                                                        <div>Active</div>
                                                    </div>
                                                    :
                                                    <div className="flex space-x-2 items-center justify-center">
                                                        <span className="flex w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                                                        <div>Inactive</div>
                                                    </div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/email-template/detail/${email.id}/1`)}
                                                        className="p-2 text-[#000060] hover:text-[#0000a0] transition-colors rounded-full hover:bg-[#f0f0f9]"
                                                        id="temp-detail"
                                                    >
                                                        <Info className="w-5 h-5" />
                                                    </button>
                                                    <Tooltip anchorSelect="#temp-detail">View details</Tooltip>
                                                    
                                                    <button
                                                        onClick={() => navigate(`/email-template/edit/${email.id}/2`)}
                                                        className="p-2 text-[#000060] hover:text-[#0000a0] transition-colors rounded-full hover:bg-[#f0f0f9]"
                                                        id="temp-edit"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <Tooltip anchorSelect="#temp-edit">Edit</Tooltip>
                                                    
                                                    <button
                                                        onClick={() => handleOpenTagModal(email.id)}
                                                        className="p-2 text-orange-500 hover:text-orange-700 transition-colors rounded-full hover:bg-orange-100"
                                                        id="temp-tag"
                                                    >
                                                        <Tag className="w-5 h-5" />
                                                    </button>
                                                    <Tooltip anchorSelect="#temp-tag">Assign Tags</Tooltip>
                                                    
                                                    <button
                                                        onClick={() => handleDelete(email.id)}
                                                        className="p-2 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-100"
                                                        id="temp-delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                    <Tooltip anchorSelect="#temp-delete">Delete</Tooltip>
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
                            <span className="font-semibold">{currentEmails.length}</span> of{" "}
                            <span className="font-semibold">{filteredEmailTemplate.length}</span>{" "}
                            email template's
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

                {/* Tag Assignment Modal */}
                <AnimatePresence>
                    {showTagModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                            onClick={handleCloseTagModal}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-[#000060] flex items-center">
                                        <Tag className="mr-2" />
                                        Assign Tag
                                    </h2>
                                    <button
                                        onClick={handleCloseTagModal}
                                        className="text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {isTagLoading ? (
                                    <div className="flex justify-center items-center h-32">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#000060]"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#000060] mb-2">
                                                Select Tag
                                            </label>
                                            <select
                                                value={selectedTagId}
                                                onChange={(e) => setSelectedTagId(e.target.value)}
                                                className="w-full px-3 py-2 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                                            >
                                                <option value="">Select a tag...</option>
                                                {availableTags.map((tag) => (
                                                    <option key={tag.id} value={tag.id}>
                                                        {tag.tag_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex space-x-3 pt-4">
                                            <button
                                                onClick={handleCloseTagModal}
                                                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={saveEmailWithTags}
                                                disabled={!selectedTagId || isSavingTag}
                                                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#000060] to-[#0000a0] text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                {isSavingTag ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                                ) : (
                                                    <>
                                                        <Check className="mr-2" size={16} />
                                                        Assign Tag
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}