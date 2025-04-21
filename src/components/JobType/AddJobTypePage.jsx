"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Package, X } from "lucide-react";
import axiosInstance from "../../axiosConfig";

export default function CreateJobTypePage() {
    const navigate = useNavigate();
    const [jobData, setJobData] = useState({
        job_name: "",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setJobData({ ...jobData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!jobData.job_name.trim()) {
            newErrors.job_name = "Job name is required";
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
            const response = await axiosInstance.post("/job-type/save", jobData);
            if (response.data.success) {
                setSuccessMessage("Job type created successfully");
                setTimeout(() => {
                    navigate("/job-types");
                }, 2000);
            } else {
                setErrors({
                    submit: response.data.message || "Failed to create job type",
                });
            }
        } catch (error) {
            setErrors({
                submit: error.response?.data?.message || "Error creating job type",
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
                        onClick={() => navigate("/job-types")}
                        className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Job types
                    </button>
                    <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
                        Create New Job Type
                    </h1>
                    <p className="text-[#4b4b80] text-base lg:text-lg">
                        Add a new job type to the system
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
                                    htmlFor="job_name"
                                    className="block text-sm font-medium text-[#000060] mb-2"
                                >
                                    Job Name *
                                </label>
                                <div className="relative">
                                    <Package
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                                        size={20}
                                    />
                                    <input
                                        type="text"
                                        id="job_name"
                                        name="job_name"
                                        value={jobData.job_name}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                                        placeholder="Enter job name"
                                    />
                                </div>
                                {errors.job_name && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.job_name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate("/job-types")}
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
                                {isSubmitting ? "Creating..." : "Create Job Type"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
}