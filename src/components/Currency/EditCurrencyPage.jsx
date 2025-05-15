import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import axiosInstance from "../../axiosConfig";

export default function EditCurrencyPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [currencyData, setCurrencyData] = useState({
        currency_name: "",
        currency_code: "",
        currency_value: 0.0,
        status: true
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCurrencyData = async () => {
            try {
                const response = await axiosInstance.get(`/currency/fetch?id=${id}`);
                if (response.data.success) {
                    setCurrencyData(response.data.data);
                } else {
                    setErrors({ fetch: "Failed to load currency data" });
                }
            } catch (error) {
                setErrors({ fetch: error.response?.data?.message || "Error loading currency" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurrencyData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrencyData({ ...currencyData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!currencyData.currency_name.trim()) {
            newErrors.currency_name = "Currency name is required";
        }
        if (!currencyData.currency_code.trim()) {
            newErrors.currency_code = "Currency code is required";
        }
        if (currencyData.currency_value < 0) {
            newErrors.currency_value = "Please enter a valid currency value";
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axiosInstance.post(`/currency/edit/${id}`, currencyData);
            if (response.data.success) {
                setSuccessMessage("Currency updated successfully");
                setTimeout(() => {
                    navigate("/currency");
                }, 2000);
            } else {
                setErrors({
                    submit: response.data.message || "Failed to update currency",
                });
            }
        } catch (error) {
            setErrors({
                submit: error.response?.data?.message || "Error updating currency",
            });
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#000060]"></div>
            </div>
        );
    }

    if (errors.fetch) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9] p-8">
                <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl p-6 lg:p-8 text-center">
                    <h2 className="text-2xl font-bold text-[#000060] mb-4">Error Loading Currency</h2>
                    <p className="text-red-500 mb-6">{errors.fetch}</p>
                    <button
                        onClick={() => navigate("/currency")}
                        className="px-6 py-3 rounded-lg bg-[#000060] text-white hover:bg-[#0000a0] transition-all"
                    >
                        Back to Currency List
                    </button>
                </div>
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
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate("/currency")}
                        className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Currency List
                    </button>
                    <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
                        Edit Currency
                    </h1>
                    <p className="text-[#4b4b80] text-base lg:text-lg">
                        Update currency details
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
                                onClick={() => setErrors({ ...errors, submit: "" })}
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
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label
                                    htmlFor="currency_name"
                                    className="block text-sm font-medium text-[#000060] mb-2"
                                >
                                    Currency Name <span className="text-red-600">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="currency_name"
                                        name="currency_name"
                                        value={currencyData.currency_name}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                                        placeholder="Enter currency name"
                                    />
                                </div>
                                {errors.currency_name && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.currency_name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label
                                    htmlFor="currency_code"
                                    className="block text-sm font-medium text-[#000060] mb-2"
                                >
                                    Currency Code <span className="text-red-600">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="currency_code"
                                        name="currency_code"
                                        value={currencyData.currency_code}
                                        onChange={(e) => {
                                            handleInputChange({
                                                target: {
                                                    name: e.target.name,
                                                    value: e.target.value.toUpperCase()
                                                }
                                            });
                                        }}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                                        placeholder="Enter currency code (USD, EUR)"
                                        // maxLength={3}
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </div>
                                {errors.currency_code && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.currency_code}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label
                                    htmlFor="currency_value"
                                    className="block text-sm font-medium text-[#000060] mb-2"
                                >
                                    Currency Value <span className="text-red-600">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        id="currency_value"
                                        name="currency_value"
                                        value={currencyData.currency_value}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full pl-10 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                                        placeholder="Enter currency value"
                                    />
                                </div>
                                {errors.currency_value && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.currency_value}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label
                                    htmlFor="status"
                                    className="block text-sm font-medium text-[#000060] mb-2"
                                >
                                    Status <span className="text-red-600">*</span>
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={currencyData.status}
                                    onChange={handleInputChange}
                                    className="w-full pl-4 pr-10 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate("/currency")}
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
                                {isSubmitting ? "Updating..." : "Update currency"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
}