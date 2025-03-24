"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, User, Package2, DollarSign, IndianRupee, AlertCircle, ChevronLeft, Check, ArrowLeft, Download } from "lucide-react";
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
    const [alertMessage, setAlertMessage] = useState({ type: "", message: "" });

    const { isLoggedIn, user, permission, role } = useAppStore();

    console.log("RFQ_id: ", rfqId);

    let userId = null;
    if (user) {
        userId = user.id;
    }

    // Fetch RFQ details
    useEffect(() => {
        const fetchRFQDetails = async () => {
            setIsLoading(true);

            console.log("USERID: ", user.id);
            console.log("RFQID: ", rfqId);


            try {
                const response = await axiosInstance.post(`/rfq/getrfq`, {
                    p_user_id: role.role_id!==8 ? user.id : null,
                    p_rfq_id: rfqId,               // Need to be dynamic
                    p_client_id: null,
                });

                console.log(response.data.data);

                if (response.data.success) {
                    setRFQ(response.data.data[0]);
                } else {
                    setError("Failed to fetch RFQ details");
                }

                // Fetch documents
                const documentsResponse = await axiosInstance.get(`/rfq/${rfqId}/documents/`);
                if (documentsResponse.data.success) {
                    setDocuments(documentsResponse.data.data);
                } else {
                    setError("Failed to fetch documents");
                }
            } catch (error) {
                setError("Error fetching RFQ details");
            }
            setIsLoading(false);
        };

        fetchRFQDetails();
    }, [rfqId]);

    // Handle document download
    const handleDownload = async (documentId) => {
        try {
            const response = await axiosInstance.get(`/rfq/${documentId}/download/`, {
                responseType: "blob"
            });

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InfoCard icon={FileText} title="RFQ Name" value={rfq.rfq_name} />
                    <InfoCard icon={User} title="Client Name" value={rfq.client_name} />
                    <InfoCard icon={Package2} title="Total SKUs" value={rfq.skus?.length} />
                    <InfoCard icon={IndianRupee} title="Total Cost" value={rfq.total_cost_to_customer || 'N/A'} />
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
                    <h2 className="text-xl font-semibold text-[#000060] mb-4">Documents</h2>
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