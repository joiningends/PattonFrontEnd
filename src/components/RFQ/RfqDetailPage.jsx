"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, User, Package2, DollarSign, IndianRupee, AlertCircle, ChevronLeft, Check, ArrowLeft, Download, PlusIcon, Upload, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../axiosConfig";
import useAppStore from "../../zustandStore";

export default function RFQDetailsPage() {
    const navigate = useNavigate();
    const { rfqId } = useParams();
    const [rfq, setRFQ] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [showDocumentUpload, setShowDocumentUpload] = useState(false);
    const fileInputRef = useRef(null);
    const [currentDocumentPage, setCurrentDocumentPage] = useState(1);
    const [documentsPerPage] = useState(5);

    const { isLoggedIn, user, permission, role } = useAppStore();

    console.log("RFQ_id: ", rfqId);

    const appState = localStorage.getItem("appState");

    // Parse the JSON string to get an object
    const parsedState = JSON.parse(appState);

    const roleId = parsedState?.user?.roleid || null;

    let userId = null;
    if (user) {
        userId = user.id;
    }



    const fetchDocuments = async () => {
        setIsLoading(true);
        setError("");
        try {
            const response = await axiosInstance.get(`/rfq/${rfqId}/documents`);
            if (response.data.success) {
                setDocuments(response.data.data);
            } else {
                setError("Failed to fetch documents");
            }
        } catch (error) {
            setError(
                "Error fetching documents: " +
                (error.response?.data?.message || error.message)
            );
        }
    };

    // Fetch RFQ details
    useEffect(() => {
        const fetchRFQDetails = async () => {
            setIsLoading(true);

            console.log("USERID: ", user.id);
            console.log("RFQID: ", rfqId);

            if (role && (roleId === 19 || roleId === 8 || roleId === 21 || roleId === 20)) {
                userId = null;
            }


            try {
                const response = await axiosInstance.post(`/rfq/getrfq`, {
                    p_user_id: userId,
                    p_rfq_id: rfqId,               // Need to be dynamic
                    p_client_id: null,
                });

                console.log("response data: ", response.data.data);

                if (response.data.success) {
                    setRFQ(response.data.data[0]);
                } else {
                    setError("Failed to fetch RFQ details");
                }

            } catch (error) {
                setError("Error fetching RFQ details");
            }
            setIsLoading(false);
        };

        fetchRFQDetails();
        fetchDocuments();
    }, [rfqId]);


    // Handle file upload
    const handleFileUpload = async files => {
        setIsLoading(true);
        setError("");
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("documents", files[i]);
        }

        try {
            const response = await axiosInstance.post(
                `/rfq/${rfqId}/documents`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            if (response.data.success) {
                setAlertMessage(response.data.message);
                fetchDocuments();
                // setTimeout(()=>{
                //   navigate("/");
                // }, 2000);
            } else {
                setError(response.data.message || "Failed to upload documents");
            }
        } catch (error) {
            setError(
                "Error uploading documents: " +
                (error.response?.data?.message || error.message)
            );
        } finally {
            setIsLoading(false);
        }
    };


    // Handle document download
    const handleDownload = async (documentId) => {
        try {
            const response = await axiosInstance.get(`/rfq/${documentId}/download/`, {
                responseType: "blob"
            });

            console.log("response: ", response);

            // Determine MIME type based on filename extension
            const contentDisposition = response.headers["content-disposition"];
            const fileName = contentDisposition
                ? contentDisposition.split("filename=")[1].replace(/['"]/g, "")
                : `document_${documentId}.pdf`; // Default to PDF extension

            // Get file extension
            const fileExt = fileName.split('.').pop().toLowerCase();

            // Map extension to MIME type
            const mimeTypes = {
                'pdf': 'application/pdf',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                // Add other MIME types as needed
            };
            const mimeType = mimeTypes[fileExt] || 'application/octet-stream';

            // Create blob with correct MIME type
            const blob = new Blob([response.data], { type: mimeType });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setError("Error downloading document");
        }
    };

    // Handle delete
    const handleDelete = async (documentId) => {
        setIsLoading(true);
        setError("");
        try {
            const response = await axiosInstance.delete(
                `/rfq/${documentId}/docdelete/permanent`
            );
            if (response.data.success) {
                setAlertMessage("Document deleted successfully");

                fetchDocuments();
            } else {
                setError("Failed to delete document");
            }
        } catch (error) {
            setError(
                "Error deleting document: " +
                (error.response?.data?.message || error.message)
            );
        }
        setIsLoading(false);
    };

    const indexOfLastDocument = currentDocumentPage * documentsPerPage;
    const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
    const currentDocuments = documents.slice(
        indexOfFirstDocument,
        indexOfLastDocument
    );
    const totalDocumentPages = Math.ceil(documents.length / documentsPerPage);

    const handleDocumentPageChange = pageNumber => {
        setCurrentDocumentPage(pageNumber);
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

    if (!rfq) {
        return (
            <div className="flex justify-center items-center h-screen">
                No RFQ data found.
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9] min-h-screen p-4 lg:p-8"
        >
            <AnimatePresence>
                {showAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-green-100"
                    >
                        <div className="flex items-center space-x-2">
                                <Check className="h-5 w-5 text-green-500" />
                            <span
                                className="text-sm"
                            >
                                {alertMessage}
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
                        <button
                            onClick={() => navigate("/")}
                            className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to RFQ List
                        </button>
                        <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
                            RFQ Details
                        </h1>
                        <p className="text-[#4b4b80] text-base lg:text-lg">
                            Detailed information about the RFQ
                        </p>
                    </div>
                    {/* <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="w-full lg:w-auto bg-gradient-to-r from-[#000060] to-[#0000a0] text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#000060] focus:ring-opacity-50"
                    >
                        <ChevronLeft className="inline-block mr-2 h-5 w-5" />
                        Back
                    </motion.button> */}
                </motion.div>
            </header>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-xl shadow-xl p-6 space-y-8"
            >
                {/* RFQ Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoCard icon={FileText} title="RFQ Name" value={rfq.rfq_name} />
                    <InfoCard icon={User} title="Client Name" value={rfq.client_name} />
                    <InfoCard icon={Package2} title="Total SKUs" value={rfq.skus?.length} />
                    {/* <InfoCard icon={IndianRupee} title="Total Cost" value={rfq.total_cost_to_customer || 'N/A'} /> */}
                </div>

                {/* Cost Breakdown */}
                {/* <div className="bg-[#f8f8fd] rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-[#000060] mb-4">Cost Breakdown</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <CostItem title="Ex Factory Cost" value={rfq.ex_factory_cost} />
                        <CostItem title="Freight Cost" value={rfq.freight_cost} />
                        <CostItem title="Insurance Cost" value={rfq.insurance_cost} />
                    </div>
                </div> */}

                {/* SKU List */}
                {rfq.skus && (
                    <div className="bg-[#f8f8fd] rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-[#000060] mb-4">SKU List</h2>
                        <SKUTable skus={rfq.skus} />
                    </div>
                )}

                {/* Documents Section */}
                <div className="bg-[#f8f8fd] rounded-lg p-6">
                    <div className="flex justify-between">
                        <h2 className="text-xl font-semibold text-[#000060] mb-4">Documents</h2>
                        <button
                            onClick={() => setShowDocumentUpload(true)}
                            className="w-full lg:w-auto bg-gradient-to-r from-[#000060] to-[#0000a0] text-white text-sm px-3 py-1 rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                        >
                            <PlusIcon />
                            <span className="ml-2">Add documents</span>
                        </button>
                    </div>
                    {documents.length > 0 ? (
                        <div className="space-y-4">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
                                >
                                    <div className="flex items-center space-x-3">
                                        <FileText className="w-5 h-5 text-[#000060]" />
                                        <span className="text-[#4b4b80]">{doc.original_name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(doc.id)}
                                        className="p-2 text-[#000060] hover:text-[#0000a0] transition-colors rounded-full hover:bg-[#f0f0f9]"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[#4b4b80]">No documents available.</p>
                    )}
                </div>

            </motion.div>

            <AnimatePresence>
                {showDocumentUpload && (
                    // <motion.div
                    //     initial={{ y: -20, opacity: 0 }}
                    //     animate={{ y: 0, opacity: 1 }}
                    //     transition={{ duration: 0.5, delay: 0.2 }}
                    //     className="bg-white rounded-xl shadow-xl p-6 lg:p-8"
                    // >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-10 mt-0"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg shadow-xl w-full max-w-fit p-10"
                        >
                            <h2 className="text-2xl font-bold text-[#000060] mb-6">
                                Upload Documents
                            </h2>
                            <div
                                className="border-2 border-dashed border-[#c8c8e6] rounded-lg p-8 text-center cursor-pointer hover:border-[#000060] transition-colors mb-8 bg-[#f8f8fd]"
                                onClick={() => fileInputRef.current.click()}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => {
                                    e.preventDefault();
                                    handleFileUpload(e.dataTransfer.files);
                                }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    multiple
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                    onChange={e => handleFileUpload(e.target.files)}
                                />
                                <Upload className="mx-auto h-16 w-16 text-[#000060] mb-4" />
                                <p className="text-[#000060] font-medium text-lg mb-2">
                                    Drag and drop files here or click to select files
                                </p>
                                <p className="text-[#4b4b80] text-sm">
                                    Accepted file types: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG
                                </p>
                            </div>

                            {isLoading && (
                                <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded-lg flex items-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700 mr-3"></div>
                                    <p>Uploading documents...</p>
                                </div>
                            )}
                            {error && (
                                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                                    <p>{error}</p>
                                </div>
                            )}
                            {alertMessage?.message && (
                                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                                    <p>{alertMessage?.message}</p>
                                </div>
                            )}

                            {documents.length > 0 ? (
                                <div>
                                    <h3 className="text-xl font-semibold text-[#000060] mb-4">
                                        Uploaded Documents
                                    </h3>
                                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-[#f0f0f9] text-[#000060]">
                                                    <th className="p-3 text-left font-semibold">
                                                        File Name
                                                    </th>
                                                    <th className="p-3 text-left font-semibold">Type</th>
                                                    <th className="p-3 text-left font-semibold">Size</th>
                                                    <th className="p-3 text-center font-semibold">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentDocuments.map(doc => (
                                                    <tr
                                                        key={doc.id}
                                                        className="border-b border-[#e1e1f5] hover:bg-[#f8f8fd] transition-colors"
                                                    >
                                                        <td className="p-3">{doc.original_name}</td>
                                                        <td className="p-3">{doc.mime_type}</td>
                                                        <td className="p-3">
                                                            {(doc.file_size / 1024).toFixed(2)} KB
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <button
                                                                onClick={() =>
                                                                    handleDownload(doc.id, doc.original_name)
                                                                }
                                                                className="text-[#000060] hover:text-[#0000a0] mr-2 p-1 rounded-full hover:bg-[#e1e1f5] transition-colors"
                                                                title="Download"
                                                            >
                                                                <Download className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(doc.id)}
                                                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {totalDocumentPages > 1 && (
                                        <div className="mt-4 flex justify-center">
                                            <nav className="flex items-center space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleDocumentPageChange(currentDocumentPage - 1)
                                                    }
                                                    disabled={currentDocumentPage === 1}
                                                    className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                                {Array.from(
                                                    { length: totalDocumentPages },
                                                    (_, i) => i + 1
                                                ).map(page => (
                                                    <button
                                                        key={page}
                                                        onClick={() => handleDocumentPageChange(page)}
                                                        className={`px-3 py-1 rounded-md transition-colors ${currentDocumentPage === page
                                                            ? "bg-[#000060] text-white"
                                                            : "bg-[#f0f0f9] text-[#000060] hover:bg-[#e1e1f5]"
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() =>
                                                        handleDocumentPageChange(currentDocumentPage + 1)
                                                    }
                                                    disabled={currentDocumentPage === totalDocumentPages}
                                                    className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </nav>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-[#4b4b80] italic text-center p-4 bg-[#f8f8fd] rounded-lg">
                                    No documents uploaded yet. Use the form above to upload
                                    documents.
                                </p>
                            )}

                            <div className="mt-8 flex justify-between">
                                <button
                                    onClick={() => setShowDocumentUpload(false)}
                                    className="px-6 py-3 rounded-lg border-2 border-[#000060] text-[#000060] hover:bg-[#000060] hover:text-white transition-all duration-300"
                                >
                                    Back to Product Details
                                </button>
                                <button
                                    onClick={() => {
                                        if (documents.length > 0) {
                                            setAlertMessage("Documents uploaded successfully.");
                                            setShowDocumentUpload(false);
                                            // setShowPopup(true);
                                            setTimeout(() => {
                                                navigate(`/rfq-detail/${rfqId}`);
                                            }, 2000);
                                        } else {
                                            setError(
                                                "Please upload at least one document before saving the RFQ."
                                            );
                                        }
                                    }}
                                    className={`px-6 py-3 rounded-lg text-white transition-all duration-300 ${documents.length === 0
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-[#000060] hover:bg-[#0000a0] hover:shadow-lg transform hover:-translate-y-1"
                                        }`}
                                    disabled={documents.length === 0}
                                >
                                    SAVE
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


        </motion.div>
    );
}

// Reusable Components
function InfoCard({ icon: Icon, title, value }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
                <Icon className="w-6 h-6 text-[#000060]" />
                <h3 className="text-[#4b4b80] font-medium">{title}</h3>
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#000060]">{value || 'N/A'}</p>
        </div>
    );
}

function CostItem({ title, value }) {
    return (
        <div className="p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-[#4b4b80]">{title}</p>
            <p className="text-lg font-semibold text-[#000060]">{value || 'N/A'}</p>
        </div>
    );
}

function SKUTable({ skus }) {
    return (

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e1e1f5]">
                <thead className="bg-[#f8f8fd]">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Part No.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Drawing No.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Annual Usage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#e1e1f5]">
                    {skus.map((sku, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#000060]">{sku.sku_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.sku_description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.sku_part_no}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.sku_drawing_no}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.sku_annual_usage}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.sku_size}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${sku.sku_status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {sku.sku_status ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}