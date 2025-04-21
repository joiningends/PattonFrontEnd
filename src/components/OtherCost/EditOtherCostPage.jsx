"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, DollarSign, X } from "lucide-react";
import axiosInstance from "../../axiosConfig";

export default function EditOtherCostPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [costData, setCostData] = useState({
        cost_name: "",
        status: true // default to true if you want it to be active by default
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchCostData();
    }, []);

    const fetchCostData = async () => {
        try {
            const response = await axiosInstance.get(`/other-cost/${id}`);
            if (response.data.success) {
                setCostData(response.data.data);
            } else {
                setErrors({ submit: "Failed to fetch Other Cost data" });
            }
        } catch (error) {
            setErrors({ 
                submit: error.response?.data?.message || "Error fetching Other Cost data" 
            });
        }
    };

    const handleInputChange = e => {
        const { name, value, type, checked } = e.target;
        setCostData({ 
            ...costData, 
            [name]: type === 'checkbox' ? checked : value 
        });
        setErrors({ ...errors, [name]: "" });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!costData.cost_name.trim()) {
            newErrors.cost_name = "Cost name is required";
        }
        return newErrors;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        
        setIsSubmitting(true);
        try {
            const response = await axiosInstance.post(
                `/other-cost/edit/${id}`,
                costData
            );
            if (response.data.success) {
                setSuccessMessage("Other Cost updated successfully");
                setTimeout(() => {
                    navigate("/other-costs");
                }, 2000);
            } else {
                setErrors({
                    submit: response.data.message || "Failed to update Other Cost",
                });
            }
        } catch (error) {
            setErrors({
                submit: error.response?.data?.message || "Error updating Other Cost",
            });
        }
        setIsSubmitting(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9] min-h-screen p-4 lg:p-8"
        >
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate("/other-costs")}
                        className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Other Costs
                    </button>
                    <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
                        Edit Other Cost
                    </h1>
                    <p className="text-[#4b4b80] text-base lg:text-lg">
                        Update Other Cost information
                    </p>
                </motion.div>

                <AnimatePresence>
                    {errors.submit && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-between"
                        >
                            <span>{errors.submit}</span>
                            <button
                                onClick={() => setErrors({...errors, submit: ""})}
                                className="text-red-700 hover:text-red-900"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>
                    )}
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
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white rounded-xl shadow-xl p-6 lg:p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label
                                    htmlFor="cost_name"
                                    className="block text-sm font-medium text-[#000060] mb-2"
                                >
                                    Cost Name
                                </label>
                                <div className="relative">
                                    {/* <DollarSign
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                                        size={20}
                                    /> */}
                                    <input
                                        type="text"
                                        id="cost_name"
                                        name="cost_name"
                                        value={costData.cost_name}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                                        placeholder="Enter cost name"
                                    />
                                </div>
                                {errors.cost_name && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.cost_name}
                                    </p>
                                )}
                            </div>
                            
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="status"
                                    name="status"
                                    checked={costData.status}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-[#000060] rounded focus:ring-[#000060]"
                                />
                                <label
                                    htmlFor="status"
                                    className="ml-2 text-sm font-medium text-[#000060]"
                                >
                                    Active
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate("/other-costs")}
                                className="px-6 py-3 rounded-lg border-2 border-[#000060] text-[#000060] hover:bg-[#000060] hover:text-white transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-6 py-3 rounded-lg bg-gradient-to-r from-[#000060] to-[#0000a0] text-white transition-all duration-300 ${
                                    isSubmitting
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:shadow-lg transform hover:-translate-y-1"
                                }`}
                            >
                                {isSubmitting ? "Updating..." : "Update Other Cost"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
}