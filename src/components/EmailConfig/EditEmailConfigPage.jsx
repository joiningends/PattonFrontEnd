import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, Info } from "lucide-react";
import axiosInstance from "../../axiosConfig";

export default function EditEmailConfigPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [emailConfigData, setEmailConfigData] = useState({
        user: "",
        pass: "",
        tags: "",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showPasskeyInfo, setShowPasskeyInfo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEmailConfig = async () => {
            try {
                const response = await axiosInstance.get(`/email-config/fetch?id=1`);
                if (response.data.success) {
                    setEmailConfigData(response.data.data);
                } else {
                    setErrors({
                        fetch: response.data.message || "Failed to fetch email config"
                    });
                }
            } catch (error) {
                setErrors({
                    fetch: error.response?.data?.message || "Error fetching email config"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmailConfig();
    }, [id]);

    const formatPassword = (password) => {
        // Remove all spaces first
        const cleaned = (password || "").replace(/\s/g, '');

        // Insert space after every 4 characters
        let formatted = '';
        for (let i = 0; i < cleaned.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formatted += ' ';
            }
            formatted += cleaned[i];
        }

        return formatted;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // For password field, remove spaces before saving
        if (name === 'pass') {
            const cleanedValue = value.replace(/\s/g, '');
            setEmailConfigData({
                ...emailConfigData,
                [name]: cleanedValue
            });
        } else {
            setEmailConfigData({
                ...emailConfigData,
                [name]: value
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!emailConfigData.user.trim()) {
            newErrors.user = "User email is required.";
        }
        if (!emailConfigData.pass.trim()) {
            newErrors.pass = "Authentication pass code of 16 characters is required";
        } else if (emailConfigData.pass.replace(/\s/g, '').length !== 16) {
            newErrors.pass = "Passcode must be exactly 16 characters";
        }
        if (!emailConfigData.tags.trim()) {
            newErrors.tags = "Tags are required";
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
            const response = await axiosInstance.post(`/email-config/edit/${id}`, emailConfigData);
            if (response.data.success) {
                setSuccessMessage(response.data.message || "Email config updated successfully");
                setTimeout(() => {
                    navigate("/email-config");
                }, 2000);
            } else {
                setErrors({
                    submit: response?.data?.message || "Failed to update email config",
                });
            }
        } catch (error) {
            setErrors({
                submit: error.response?.data?.message || "Error updating email config",
            });
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#000060]"></div>
            </div>
        );
    }

    if (errors.fetch) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9] p-4 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-xl shadow-xl p-6 lg:p-8 text-center">
                        <h2 className="text-2xl font-bold text-[#000060] mb-4">Error Loading Email Config</h2>
                        <p className="text-red-500 mb-6">{errors.fetch}</p>
                        <button
                            onClick={() => navigate("/email-config")}
                            className="px-6 py-3 rounded-lg bg-[#000060] text-white hover:bg-[#0000a0] transition-colors"
                        >
                            Back to Email Config List
                        </button>
                    </div>
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
                        onClick={() => navigate("/email-config")}
                        className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to email config list
                    </button>
                    <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
                        Edit email config
                    </h1>
                    <p className="text-[#4b4b80] text-base lg:text-lg">
                        Update the email configuration details
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
                                    htmlFor="user"
                                    className="block text-sm font-medium text-[#000060] mb-2"
                                >
                                    Email <span className="text-red-600">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="user"
                                        name="user"
                                        value={emailConfigData.user}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                                        placeholder="Enter user email"
                                    />
                                </div>
                                {errors.user && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.user}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label
                                    htmlFor="pass"
                                    className="block text-sm font-medium text-[#000060] mb-2"
                                >
                                    App Password <span className="text-red-600">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="pass"
                                        name="pass"
                                        value={formatPassword(emailConfigData.pass)}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                                        placeholder="Enter 16-character app password (XXXX XXXX XXXX XXXX)"
                                        maxLength={19} // 16 chars + 3 spaces
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasskeyInfo(!showPasskeyInfo)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4b4b80] hover:text-[#000060]"
                                        aria-label="Show password information"
                                    >
                                        <Info className="w-5 h-5" />
                                    </button>
                                </div>
                                {errors.pass && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.pass}
                                    </p>
                                )}
                                <AnimatePresence>
                                    {showPasskeyInfo && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-[#2d2d5f]"
                                        >
                                            <h4 className="font-semibold mb-2">How to generate a Google App Password:</h4>
                                            <ol className="list-decimal pl-5 space-y-1">
                                                <li>Go to your Google Account (<a href="https://myaccount.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">myaccount.google.com</a>)</li>
                                                <li>Navigate to "Security" section</li>
                                                <li>Under "Signing in to Google", select "App passwords"</li>
                                                <li>Select "Mail" as the app and "Other" as the device</li>
                                                <li>Enter a name for this password (e.g., "Nodemailer")</li>
                                                <li>Click "Generate" and copy the 16-character password</li>
                                                <li>Paste it in the field above</li>
                                            </ol>
                                            <p className="mt-2 text-xs text-blue-600">
                                                Note: You need 2-Step Verification enabled to generate app passwords.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div>
                                <label
                                    htmlFor="tags"
                                    className="block text-sm font-medium text-[#000060] mb-2"
                                >
                                    Tags <span className="text-red-600">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="tags"
                                        name="tags"
                                        value={emailConfigData.tags}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                                        placeholder="Enter email config tags"
                                    />
                                </div>
                                {errors.tags && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.tags}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate("/email-config")}
                                className="px-6 py-3 rounded-lg border-2 border-[#000060] text-[#000060] hover:bg-[#000060] hover:text-white transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-6 py-3 rounded-lg bg-gradient-to-r from-[#000060] to-[#0000a0] text-white transition-all duration-300 ${isSubmitting
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:shadow-lg transform hover:-translate-y-1"
                                    }`}
                            >
                                {isSubmitting ? "Updating..." : "Update Email Config"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
}