"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, User, Package2, DollarSign, IndianRupee, AlertCircle, ChevronLeft, Check, ArrowLeft, PencilIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../axiosConfig";
import useAppStore from "../../zustandStore";
import { Tooltip } from "react-tooltip";

export default function SkuDetailPage() {
    const navigate = useNavigate();
    const { rfqId, skuId } = useParams();
    const [rfq, setRFQ] = useState(null);
    const [sku, setSku] = useState(null);
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

        const fetchSkuDetails = async () => {
            setIsLoading(true);

            console.log("skuId: ", skuId);
            console.log("RFQID: ", rfqId);

            try {
                const response = await axiosInstance.get(`/sku/getsku/${rfqId}?skuId=${skuId}`);

                console.log("response data: ", response.data.data);

                if (response.data.success) {
                    // Sort the products: GP COIL first, then BOM
                    const sortedSku = { ...response.data.data[0] };
                    if (sortedSku.products && sortedSku.products.length > 0) {
                        sortedSku.products = [...sortedSku.products].sort((a, b) => {
                            // Sort by is_bom flag (false values first - GP COIL)
                            if (a.is_bom === b.is_bom) return 0;
                            return a.is_bom ? 1 : -1;
                        });
                    }
                    setSku(sortedSku);
                } else {
                    setError("Failed to fetch RFQ details");
                }

            } catch (error) {
                setError("Error fetching RFQ details");
            }
            setIsLoading(false);
        };

        fetchSkuDetails();

    }, [rfqId, skuId]);


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
                        <button
                            onClick={() => navigate("/")}
                            className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to RFQ List
                        </button>
                        <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
                            SKU Cost Sheet
                        </h1>
                        <p className="text-[#4b4b80] text-base lg:text-lg">
                            Detailed information about the SKU
                        </p>
                    </div>
                </motion.div>
            </header>

            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6"
            >
                <div>
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-200">
                                <thead className="bg-gray-100">
                                    {/* SKU Header Row */}
                                    <tr className="bg-green-100">
                                        <th colSpan={sku.products?.length + 1} className="px-6 py-4 text-center border border-gray-200">
                                            <h2 className="text-2xl font-semibold text-gray-800">{sku.sku_name}</h2>
                                        </th>
                                    </tr>


                                    {/* Material Type Row */}
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">Material</th>
                                        {sku.products?.map((product, index) => (
                                            <th key={index} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                                                {product.is_bom === true ? "BOM" : "GP COIL"}
                                            </th>
                                        ))}
                                    </tr>

                                    {/* Drawing No Row */}
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">Drawing No</th>
                                        <td colSpan={sku.products?.length} className="px-6 py-4 text-center border border-gray-200">
                                            <span className="text-sm font-semibold text-gray-800">{sku.drawing_no || 'N/A'}</span>
                                        </td>
                                    </tr>

                                    {/* Part Name Row */}
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-yellow-200 border border-gray-200">PART NAME</th>
                                        {sku.products?.map((product, index) => (
                                            <th key={index} className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider bg-yellow-900 border border-gray-200">
                                                {product.product_name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {/* Quantity Row */}
                                    <tr>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200">Quantity per assembly</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                {product.quantity_per_assembly || "-"}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Material Type Row */}
                                    <tr>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200">Raw Material type</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                {product.raw_material_type_name || "-"}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Material Rate Row */}
                                    <tr className="">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200 bg-blue-100">Raw Material Rate</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                {product.raw_material_rate || "-"}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Scrap Rate Row */}
                                    <tr className="">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200 bg-blue-300">Scrap Rate</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                {product.scrap_rate || "-"}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Yield % Row */}
                                    <tr className="">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200 bg-blue-300">Yield %</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <span>{product.yield_percentage || "-"}</span>
                                                    <PencilIcon
                                                        className="h-3 w-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                                                        id={`edit-value-${index}`}
                                                    />
                                                    <Tooltip anchorSelect={`#edit-value-${index}`}>Edit Value</Tooltip>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* BOM Cost/kg Row */}
                                    <tr className="">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200 bg-blue-300">BOM Cost/kg</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <span>{product.bom_cost_per_kg || "-"}</span>
                                                    <PencilIcon
                                                        className="h-3 w-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                                                        id={`edit-value-${index}`}
                                                    />
                                                    <Tooltip anchorSelect={`#edit-value-${index}`}>Edit Value</Tooltip>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Final BOM Cost Row */}
                                    {/* <tr className="">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200 bg-blue-300">Final BOM Cost</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                {product.final_bom_cost || "-"}
                                            </td>
                                        ))}
                                    </tr> */}

                                    {/* Particular Row */}
                                    <tr>
                                        <td colSpan={sku.products?.length + 1} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-black border border-gray-200">
                                            A PARTICULAR
                                        </td>
                                    </tr>

                                    {/* Net Weight Row */}
                                    <tr className="bg-green-400">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200">Net weight of product (kg)</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <span>{product.net_weight_of_product || "-"}</span>
                                                    <PencilIcon
                                                        className="h-3 w-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                                                        id={`edit-value-${index}`}
                                                    />
                                                    <Tooltip anchorSelect={`#edit-value-${index}`}>Edit Value</Tooltip>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Assembly cost */}
                                    <tr className="bg-green-400">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200">Assembly</td>
                                        <td colSpan={sku.products?.length} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                            {sku.assembly_cost || "-"}
                                        </td>
                                    </tr>

                                    {/* Gross weight in kg */}
                                    <tr className="">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200">Gross weight (kg)</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                {product.gross_weight_kg || "-"}
                                            </td>
                                        ))}
                                    </tr>


                                    {/* RM wastage in kg */}
                                    <tr className="">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200 ">R.M. Wastage (kg)</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                {product.rm_wastage_kg || "-"}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Cost of RM */}
                                    <tr className="">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200 ">Cost of R.M.</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                {product.cost_of_rm || "-"}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Less cost of scrap */}
                                    <tr className="">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200 ">Less cost of scrap</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                {product.less_cost_of_scrap || "-"}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Net RM cost in RS */}
                                    <tr className="">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200 bg-red-300">NET R.M. COST IN Rs.</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                {product.net_rm_cost || "-"}
                                            </td>
                                        ))}
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

