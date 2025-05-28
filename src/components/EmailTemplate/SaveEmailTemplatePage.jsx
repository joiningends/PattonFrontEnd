import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import axiosInstance from "../../axiosConfig";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function SaveEmailTemplatePage() {
    const navigate = useNavigate();
    const { id, ops } = useParams();

    const [emailTemplateData, setEmailTemplateData] = useState({
        template_name: "",
        subject: "",
        email_content: "",
        email_signature: "",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Add loading state

    // Fetch template data when component mounts or ID changes
    useEffect(() => {
        if (id) {
            const fetchTemplate = async () => {
                setIsLoading(true); // Set loading to true
                try {
                    console.log('Fetching template with ID:', id); // Debug log
                    const response = await axiosInstance.get(`/email-template/fetch?id=${id}`);
                    console.log('API Response:', response.data); // Debug log
                    
                    if (response.data.success && response.data.data) {
                        const templateData = response.data.data;
                        console.log('Template Data:', templateData); // Debug log
                        
                        // More robust data setting with fallbacks
                        setEmailTemplateData({
                            template_name: templateData.template_name || '',
                            subject: templateData.subject || '',
                            email_content: templateData.email_content || '',
                            email_signature: templateData.email_signature || '',
                        });
                        setIsEditing(true);
                    } else {
                        console.error('API returned success:false or no data');
                        setErrors({
                            submit: "No template data found",
                        });
                    }
                } catch (error) {
                    console.error('Error fetching template:', error); // Debug log
                    setErrors({
                        submit: error.response?.data?.message || "Error loading template",
                    });
                } finally {
                    setIsLoading(false); // Set loading to false
                }
            };
            fetchTemplate();
        }
    }, [id]);

    // Quill editor modules configuration
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    // Quill editor formats configuration
    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link'
    ];

    const handleEditorChange = (content) => {
        setEmailTemplateData(prev => ({
            ...prev,
            email_content: content
        }));
    };

    const handleSignatureChange = (content) => {
        setEmailTemplateData(prev => ({
            ...prev,
            email_signature: content
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmailTemplateData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!emailTemplateData.template_name.trim()) {
            newErrors.template_name = "Template name is required.";
        }
        if (!emailTemplateData.subject.trim()) {
            newErrors.subject = "Email subject is required";
        } else if (emailTemplateData.subject.length > 50) {
            newErrors.subject = "Email subject must not be greater than 50 characters.";
        }
        if (!emailTemplateData.email_content.trim() || emailTemplateData.email_content === '<p><br></p>') {
            newErrors.email_content = "Email content is required.";
        }
        if (!emailTemplateData.email_signature.trim() || emailTemplateData.email_signature === '<p><br></p>') {
            newErrors.email_signature = "Email signature is required.";
        }
        return newErrors;
    };

    // Modify handleSubmit to handle both create and update
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const url = isEditing
                ? `/email-template/edit/${id}`
                : "/email-template/save";

            const dataToSend = isEditing 
            ? { ...emailTemplateData, id: id }
            : emailTemplateData;

            const response = await axiosInstance.post(url, dataToSend);

            if (response.data.success) {
                setSuccessMessage(response.data.message ||
                    `Email Template ${isEditing ? 'updated' : 'created'} successfully`);
                setTimeout(() => {
                    navigate("/email-template");
                }, 2000);
            } else {
                setErrors({
                    submit: response?.data?.message ||
                        `Failed to ${isEditing ? 'update' : 'create'} email template`,
                });
            }
        } catch (error) {
            setErrors({
                submit: error.response?.data?.message ||
                    `Error ${isEditing ? 'updating' : 'creating'} email template`,
            });
        }
        setIsSubmitting(false);
    };

    // Show loading state while fetching data
    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9] min-h-screen p-4 lg:p-8 flex items-center justify-center">
                <div className="text-[#000060] text-xl">Loading template data...</div>
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
                        onClick={() => navigate("/email-template")}
                        className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to email template list
                    </button>
                    <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
                        {isEditing ? "Edit email template" : "Create new email template"}
                    </h1>
                    <p className="text-[#4b4b80] text-base lg:text-lg">
                        Add a new email template type to the system for notification
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
                                    htmlFor="template_name"
                                    className="block text-sm font-medium text-[#000060] mb-2"
                                >
                                    Template name <span className="text-red-600">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="template_name"
                                        name="template_name"
                                        value={emailTemplateData.template_name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                                        placeholder="Enter email template name"
                                        disabled={ops == 1}
                                    />
                                </div>
                                {errors.template_name && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.template_name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="subject"
                                    className="block text-sm font-medium text-[#000060] mb-2"
                                >
                                    Email subject <span className="text-red-600">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={emailTemplateData.subject}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                                        placeholder="Enter email subject"
                                        disabled={ops == 1}
                                    />
                                </div>
                                {errors.subject && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.subject}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="email_content"
                                    className="block text-sm font-medium text-[#000060] mb-2"
                                >
                                    Email content <span className="text-red-600">*</span>
                                </label>
                                <div className="h-[300px]">
                                    <ReactQuill
                                        theme="snow"
                                        value={emailTemplateData.email_content}
                                        onChange={handleEditorChange}
                                        modules={modules}
                                        formats={formats}
                                        placeholder="Write your email content here..."
                                        className="h-[calc(100%-82px)]"
                                        readOnly={ops == 1}
                                    />
                                </div>
                                {errors.email_content && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.email_content}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="email_signature"
                                    className="block text-sm font-medium text-[#000060] mb-2"
                                >
                                    Email signature <span className="text-red-600">*</span>
                                </label>
                                <ReactQuill
                                    theme="snow"
                                    value={emailTemplateData.email_signature}
                                    onChange={handleSignatureChange}
                                    modules={{
                                        toolbar: [
                                            ['bold', 'italic', 'underline'],
                                            ['link'],
                                            ['clean']
                                        ]
                                    }}
                                    formats={['bold', 'italic', 'underline', 'link']}
                                    placeholder="Enter your email signature"
                                    className="border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent"
                                    readOnly={ops == 1}
                                />
                                {errors.email_signature && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.email_signature}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate("/email-template")}
                                className="px-6 py-3 rounded-lg border-2 border-[#000060] text-[#000060] hover:bg-[#000060] hover:text-white transition-all duration-300"
                            >
                                Cancel
                            </button>
                            {ops != 1 && (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-6 py-3 rounded-lg bg-gradient-to-r from-[#000060] to-[#0000a0] text-white transition-all duration-300 ${isSubmitting
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:shadow-lg transform hover:-translate-y-1"
                                        }`}
                                >
                                    {isSubmitting
                                        ? isEditing ? "Updating..." : "Creating..."
                                        : isEditing ? "Update Template" : "Create Template"}
                                </button>
                            )}
                        </div>
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
}