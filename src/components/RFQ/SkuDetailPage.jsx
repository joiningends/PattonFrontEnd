"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, User, Package2, DollarSign, IndianRupee, AlertCircle, ChevronLeft, Check, ArrowLeft, PencilIcon, TreesIcon, CirclePlusIcon, Trash2Icon, Axis3DIcon } from "lucide-react";
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
    const [jobTypesData, setJobTypeData] = useState(null);
    const [jobCosts, setJobCosts] = useState([]);

    const [showJobCostModal, setShowJobCostModal] = useState(false);
    const [showOtherCostModal, setShowOtherCostModal] = useState(false);

    const [skuOtherCosts, setSkuOtherCosts] = useState([]);
    const [otherCostData, setOtherCostData] = useState(null);

    const [editingOtherCost, setEditingOtherCost] = useState(null);
    const [editingJobCost, setEditingJobCost] = useState(null);

    const [otherCosts, setOtherCosts] = useState({
        other_cost_id: null,
        other_cost_per_kg: '',
        sku_id: skuId,
        rfq_id: rfqId,
        other_cost: null,
        status: true
    });

    const [jobCostData, setJobCostData] = useState({
        job_id: null,
        job_cost: '',
        isskulevel: true,
        sku_id: skuId,
        rfq_id: rfqId,
        status: true,
        job_costs: []
    });

    const { isLoggedIn, user, permission, role } = useAppStore();

    console.log("RFQ_id: ", rfqId);

    let userId = null;
    if (user) {
        userId = user.id;
    }


    const [editModal, setEditModal] = useState({
        open: false,
        productId: null,
        currentValue: null,
        newValue: "",
        fieldName: ""
    });

    // Open edit modal
    const handleEditClick = (productId, currentValue, fieldName) => {
        setEditModal({
            open: true,
            productId,
            currentValue,
            newValue: currentValue || "",
            fieldName
        });
    };

    // Close modal
    const closeModal = () => {
        setEditModal({
            open: false,
            productId: null,
            currentValue: null,
            newValue: "",
            fieldName: ""
        });
    };

    // Handle input change
    const handleInputChange = (e) => {
        setEditModal(prev => ({
            ...prev,
            newValue: e.target.value
        }));
    };

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

        const fetchJobTypeDetails = async () => {
            setIsLoading(true);

            console.log("skuId: ", skuId);
            console.log("RFQID: ", rfqId);

            try {
                const response = await axiosInstance.get(`/job-type/`);

                console.log("response data: ", response.data.data);

                if (response.data.success) {
                    setJobTypeData(response.data.data);
                } else {
                    setError("Failed to fetch Job type details");
                }

            } catch (error) {
                setError("Error fetching Job type details");
            }
            setIsLoading(false);
        };

        const fetchOtherCost = async () => {
            setIsLoading(true);

            try {
                const response = await axiosInstance.get("/other-cost/");

                console.log("Other cost: ", response.data.data);

                if (response.data.success) {
                    setOtherCostData(response.data.data);
                } else {
                    setError("Failed to fetch Other cost details");
                }
            } catch (error) {
                setError("Error fetching Other cost details");
            }
            setIsLoading(false);
        };

        fetchSkuDetails();
        fetchJobCosts();
        fetchJobTypeDetails();
        fetchOtherCost();
        fetchOtherCostsForSku();

    }, [rfqId, skuId]);


    const fetchJobCosts = async () => {
        try {
            const response = await axiosInstance.get(`/sku/fetch/job-cost/${rfqId}/${skuId}`);
            if (response.data.success) {
                setJobCosts(response.data.data);
                console.log("Job Cost: ", response.data.data);
            }
        } catch (error) {
            console.error("Error fetching job costs:", error);
        }
    };


    const fetchOtherCostsForSku = async () => {
        try {
            const response = await axiosInstance.get(`other-cost/get-byskurfq/${rfqId}/${skuId}`);
            if (response.data.success) {
                setSkuOtherCosts(response.data.data);
                console.log(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching other costs for SKU:", error);
        }
    };


    const handleJobCostDelete = async (jobId) => {
        try {
            const response = await axiosInstance.delete(`/sku/delete/job-cost/${jobId}/${skuId}`);

            // re-calculate the sub_total_cost
            const calculateSubTotal_response = await axiosInstance.get(`/sku/calculate/sub-total-cost/${skuId}/${rfqId}`);

            if (response.data.success && calculateSubTotal_response.data.success) {
                setAlertMessage({
                    type: "success",
                    message: "Job cost deleted successfully"
                });
                setShowAlert(true);


                // Refresh the SKU data
                const skuResponse = await axiosInstance.get(`/sku/getsku/${rfqId}?skuId=${skuId}`);
                if (skuResponse.data.success) {
                    // setSku(skuResponse.data.data[0]);
                    // Sort the products: GP COIL first, then BOM
                    const sortedSku = { ...skuResponse.data.data[0] };
                    if (sortedSku.products && sortedSku.products.length > 0) {
                        sortedSku.products = [...sortedSku.products].sort((a, b) => {
                            // Sort by is_bom flag (false values first - GP COIL)
                            if (a.is_bom === b.is_bom) return 0;
                            return a.is_bom ? 1 : -1;
                        });
                    }
                    setSku(sortedSku);
                }

                // fetchSkuDetails();
                fetchJobCosts();
            } else {
                setAlertMessage({
                    type: "error",
                    message: response.data.message || "Failed to delete job cost"
                });
                setShowAlert(true);
            }
        } catch (error) {
            console.error("Error deleting job cost: ", error);
        }
    };


    const handleOtherCostDelete = async (id) => {
        try {
            const response = await axiosInstance.delete(`/other-cost/delete/othercost-sku/${id}`);

            // re-calculate the sub_total_cost
            const calculateSubTotal_response = await axiosInstance.get(`/sku/calculate/sub-total-cost/${skuId}/${rfqId}`);

            if (response.data.success && calculateSubTotal_response.data.success) {
                setAlertMessage({
                    type: "success",
                    message: "Other cost deleted successfully"
                });
                setShowAlert(true);


                // Refresh the SKU data
                const skuResponse = await axiosInstance.get(`/sku/getsku/${rfqId}?skuId=${skuId}`);
                if (skuResponse.data.success) {
                    // setSku(skuResponse.data.data[0]);
                    // Sort the products: GP COIL first, then BOM
                    const sortedSku = { ...skuResponse.data.data[0] };
                    if (sortedSku.products && sortedSku.products.length > 0) {
                        sortedSku.products = [...sortedSku.products].sort((a, b) => {
                            // Sort by is_bom flag (false values first - GP COIL)
                            if (a.is_bom === b.is_bom) return 0;
                            return a.is_bom ? 1 : -1;
                        });
                    }
                    setSku(sortedSku);
                }

                // fetchSkuDetails();
                fetchOtherCostsForSku();
            } else {
                setAlertMessage({
                    type: "error",
                    message: response.data.message || "Failed to delete other cost"
                });
                setShowAlert(true);
            }
        } catch (error) {
            console.error("Error deleting other cost: ", error);
        }
    };


    // Save the edited yield value
    const saveEditedValue = async () => {
        try {
            if (editModal.fieldName === "yield_percentage") {

                console.log("yield_percentage edit: ", editModal);
                const response = await axiosInstance.post("/sku/edit-yield", {
                    product_id: editModal.productId,
                    yield_percentage: parseFloat(editModal.newValue)
                });

                const autoCalResponse = await axiosInstance.post("/rfq/auto-calculate", {
                    p_rfq_id: rfqId
                });

                if (response.data.success && autoCalResponse.data.success) {
                    setAlertMessage({
                        type: "success",
                        message: "Yield percentage updated successfully"
                    });
                    setShowAlert(true);

                    // Refresh the SKU data
                    const skuResponse = await axiosInstance.get(`/sku/getsku/${rfqId}?skuId=${skuId}`);
                    if (skuResponse.data.success) {
                        // setSku(skuResponse.data.data[0]);
                        // Sort the products: GP COIL first, then BOM
                        const sortedSku = { ...skuResponse.data.data[0] };
                        if (sortedSku.products && sortedSku.products.length > 0) {
                            sortedSku.products = [...sortedSku.products].sort((a, b) => {
                                // Sort by is_bom flag (false values first - GP COIL)
                                if (a.is_bom === b.is_bom) return 0;
                                return a.is_bom ? 1 : -1;
                            });
                        }
                        setSku(sortedSku);
                    }
                } else {
                    setAlertMessage({
                        type: "error",
                        message: response.data.message || "Failed to update yield percentage"
                    });
                    setShowAlert(true);
                }
            }

            if (editModal.fieldName === "bom_cost_per_kg") {
                console.log("bom_cost_per_kg edit :", editModal);

                const response = await axiosInstance.post("/sku/edit-bom-cost", {
                    product_id: editModal.productId,
                    bom_cost_per_kg: parseFloat(editModal.newValue)
                });

                const autoCalResponse = await axiosInstance.post("/rfq/auto-calculate", {
                    p_rfq_id: rfqId
                });

                if (response.data.success && autoCalResponse.data.success) {
                    setAlertMessage({
                        type: "success",
                        message: "Bom cost per kg updated successfully"
                    });
                    setShowAlert(true);

                    // Refresh the SKU data
                    const skuResponse = await axiosInstance.get(`/sku/getsku/${rfqId}?skuId=${skuId}`);
                    if (skuResponse.data.success) {
                        // setSku(skuResponse.data.data[0]);
                        // Sort the products: GP COIL first, then BOM
                        const sortedSku = { ...skuResponse.data.data[0] };
                        if (sortedSku.products && sortedSku.products.length > 0) {
                            sortedSku.products = [...sortedSku.products].sort((a, b) => {
                                // Sort by is_bom flag (false values first - GP COIL)
                                if (a.is_bom === b.is_bom) return 0;
                                return a.is_bom ? 1 : -1;
                            });
                        }
                        setSku(sortedSku);
                    }
                } else {
                    setAlertMessage({
                        type: "error",
                        message: response.data.message || "Failed to update yield percentage"
                    });
                    setShowAlert(true);
                }
            }

            if (editModal.fieldName === "net_weight_of_product") {
                console.log("net_weight_of_product edit :", editModal);

                const response = await axiosInstance.post("/sku/edit-net-weight", {
                    product_id: editModal.productId,
                    net_weight_of_product: parseFloat(editModal.newValue)
                });

                const autoCalResponse = await axiosInstance.post("/rfq/auto-calculate", {
                    p_rfq_id: rfqId
                });

                if (response.data.success && autoCalResponse.data.success) {
                    setAlertMessage({
                        type: "success",
                        message: "Net weight of product updated successfully"
                    });
                    setShowAlert(true);

                    // Refresh the SKU data
                    const skuResponse = await axiosInstance.get(`/sku/getsku/${rfqId}?skuId=${skuId}`);
                    if (skuResponse.data.success) {
                        // setSku(skuResponse.data.data[0]);
                        // Sort the products: GP COIL first, then BOM
                        const sortedSku = { ...skuResponse.data.data[0] };
                        if (sortedSku.products && sortedSku.products.length > 0) {
                            sortedSku.products = [...sortedSku.products].sort((a, b) => {
                                // Sort by is_bom flag (false values first - GP COIL)
                                if (a.is_bom === b.is_bom) return 0;
                                return a.is_bom ? 1 : -1;
                            });
                        }
                        setSku(sortedSku);
                    }
                } else {
                    setAlertMessage({
                        type: "error",
                        message: response.data.message || "Failed to update yield percentage"
                    });
                    setShowAlert(true);
                }
            }

            closeModal();
        } catch (error) {
            setAlertMessage({
                type: "error",
                message: error.response?.data?.message || "Error updating value"
            });
            setShowAlert(true);
            closeModal();
        }
    };

    // const handleSaveJobCost = async () => {
    //     try {
    //         // Basic validation
    //         if (!jobCostData.job_id) {
    //             setAlertMessage({
    //                 type: "error",
    //                 message: "Please select a job type"
    //             });
    //             setShowAlert(true);
    //             return;
    //         }

    //         // Prepare data for API call
    //         const requestData = {
    //             job_id: jobCostData.job_id,
    //             isskulevel: jobCostData.isskulevel,
    //             sku_id: jobCostData.sku_id,
    //             rfq_id: jobCostData.rfq_id,
    //             status: jobCostData.status
    //         };

    //         if (jobCostData.isskulevel) {
    //             // SKU level - single cost
    //             if (!jobCostData.job_cost) {
    //                 setAlertMessage({
    //                     type: "error",
    //                     message: "Please enter both job cost values"
    //                 });
    //                 setShowAlert(true);
    //                 return;
    //             }
    //             requestData.job_costs = [{
    //                 job_cost: jobCostData.job_cost
    //                 // job_cost_per_kg: jobCostData.job_cost_per_kg
    //             }];
    //         } else {
    //             // Product level - array of costs
    //             if (jobCostData.job_costs.length === 0 ||
    //                 jobCostData.job_costs.some(cost => !cost?.job_cost)) {
    //                 setAlertMessage({
    //                     type: "error",
    //                     message: "Please enter job costs for all products"
    //                 });
    //                 setShowAlert(true);
    //                 return;
    //             }
    //             requestData.job_costs = jobCostData.job_costs;
    //         }

    //         const response = await axiosInstance.post("/sku/job-cost", requestData);

    //         // re-calculate the sub_total_cost
    //         const calculateSubTotal_response = await axiosInstance.get(`/sku/calculate/sub-total-cost/${skuId}/${rfqId}`);

    //         if (response.data.success && calculateSubTotal_response.data.success) {
    //             setAlertMessage({
    //                 type: "success",
    //                 message: response.data.message || "Job costs saved successfully"
    //             });
    //             setShowAlert(true);
    //             setShowJobCostModal(false);

    //             // Reset form
    //             setJobCostData({
    //                 job_id: null,
    //                 job_cost: '',
    //                 // job_cost_per_kg: '',
    //                 isskulevel: true,
    //                 sku_id: skuId,
    //                 rfq_id: rfqId,
    //                 status: true,
    //                 job_costs: []
    //             });
    //             fetchJobCosts(); // Refresh job costs after saving
    //             // Refresh the SKU data
    //             const skuResponse = await axiosInstance.get(`/sku/getsku/${rfqId}?skuId=${skuId}`);
    //             if (skuResponse.data.success) {
    //                 // setSku(skuResponse.data.data[0]);
    //                 // Sort the products: GP COIL first, then BOM
    //                 const sortedSku = { ...skuResponse.data.data[0] };
    //                 if (sortedSku.products && sortedSku.products.length > 0) {
    //                     sortedSku.products = [...sortedSku.products].sort((a, b) => {
    //                         // Sort by is_bom flag (false values first - GP COIL)
    //                         if (a.is_bom === b.is_bom) return 0;
    //                         return a.is_bom ? 1 : -1;
    //                     });
    //                 }
    //                 setSku(sortedSku);
    //             }
    //         } else {
    //             setAlertMessage({
    //                 type: "error",
    //                 message: response.data.message || "Failed to save job costs"
    //             });
    //             setShowAlert(true);
    //         }
    //     } catch (error) {
    //         setAlertMessage({
    //             type: "error",
    //             message: error.response?.data?.message || "Error saving job costs"
    //         });
    //         setShowAlert(true);
    //     }
    // };


    const handleSaveJobCost = async () => {
        try {
            // Basic validation
            if (!jobCostData.job_id) {
                setAlertMessage({
                    type: "error",
                    message: "Please select a job type"
                });
                setShowAlert(true);
                return;
            }

            // Prepare data for API call
            const requestData = {
                job_id: jobCostData.job_id,
                isskulevel: jobCostData.isskulevel,
                sku_id: jobCostData.sku_id,
                rfq_id: jobCostData.rfq_id,
                status: jobCostData.status,
                isEdit: !!editingJobCost // Add this flag to indicate edit mode
            };

            if (jobCostData.isskulevel) {
                // SKU level - single cost
                if (!jobCostData.job_cost) {
                    setAlertMessage({
                        type: "error",
                        message: "Please enter both job cost values"
                    });
                    setShowAlert(true);
                    return;
                }
                requestData.job_costs = [{
                    job_cost: jobCostData.job_cost
                }];
            } else {
                // Product level - array of costs
                if (jobCostData.job_costs.length === 0 ||
                    jobCostData.job_costs.some(cost => !cost?.job_cost)) {
                    setAlertMessage({
                        type: "error",
                        message: "Please enter job costs for all products"
                    });
                    setShowAlert(true);
                    return;
                }
                requestData.job_costs = jobCostData.job_costs;
            }

            // Call the API - same endpoint but with isEdit flag
            const response = await axiosInstance.post("/sku/job-cost", requestData);

            // re-calculate the sub_total_cost
            const calculateSubTotal_response = await axiosInstance.get(`/sku/calculate/sub-total-cost/${skuId}/${rfqId}`);

            if (response.data.success && calculateSubTotal_response.data.success) {
                setAlertMessage({
                    type: "success",
                    message: response.data.message ||
                        (editingJobCost ? "Job costs updated successfully" : "Job costs saved successfully")
                });
                setShowAlert(true);
                setShowJobCostModal(false);

                // Reset form and editing state
                setJobCostData({
                    job_id: null,
                    job_cost: '',
                    isskulevel: true,
                    sku_id: skuId,
                    rfq_id: rfqId,
                    status: true,
                    job_costs: []
                });
                setEditingJobCost(null);

                fetchJobCosts(); // Refresh job costs after saving
                // Refresh the SKU data
                const skuResponse = await axiosInstance.get(`/sku/getsku/${rfqId}?skuId=${skuId}`);
                if (skuResponse.data.success) {
                    const sortedSku = { ...skuResponse.data.data[0] };
                    if (sortedSku.products && sortedSku.products.length > 0) {
                        sortedSku.products = [...sortedSku.products].sort((a, b) => {
                            return a.is_bom ? 1 : -1;
                        });
                    }
                    setSku(sortedSku);
                }
            } else {
                setAlertMessage({
                    type: "error",
                    message: response.data.message ||
                        (editingJobCost ? "Failed to update job costs" : "Failed to save job costs")
                });
                setShowAlert(true);
            }
        } catch (error) {
            setAlertMessage({
                type: "error",
                message: error.response?.data?.message ||
                    (editingJobCost ? "Error updating job costs" : "Error saving job costs")
            });
            setShowAlert(true);
        }
    };


    const handleSaveOtherCost = async () => {
        try {
            // Basic validation
            if (!otherCosts.other_cost_id || !otherCosts.other_cost_per_kg) {
                setAlertMessage({
                    type: "error",
                    message: "Please fill all required fields"
                });
                setShowAlert(true);
                return;
            }

            // Calculate total cost
            const totalCost = parseFloat(otherCosts.other_cost_per_kg) * parseFloat(sku.assembly_weight);

            // Prepare data for API call
            const requestData = {
                other_cost_id: otherCosts.other_cost_id,
                sku_id: skuId,
                rfq_id: rfqId,
                other_cost_per_kg: otherCosts.other_cost_per_kg,
                other_cost: totalCost,
                status: true
            };

            console.log("Edited other cost: ", editingOtherCost);

            let response;
            if (editingOtherCost) {
                // Update existing cost
                response = await axiosInstance.post("other-cost/edit/othercost/sku/", {
                    p_id: editingOtherCost.id,
                    other_cost_id: otherCosts.other_cost_id,
                    other_cost_per_kg: otherCosts.other_cost_per_kg,
                    other_cost: totalCost
                });
            } else {
                // Create new cost
                response = await axiosInstance.post("/other-cost/by-skuid", requestData);
            }

            const calculateSubTotal_response = await axiosInstance.get(`/sku/calculate/sub-total-cost/${skuId}/${rfqId}`);

            if (response.data.success && calculateSubTotal_response.data.success) {
                setAlertMessage({
                    type: "success",
                    message: response.data.message ||
                        (editingOtherCost ? "Other cost updated successfully" : "Other cost saved successfully")
                });
                setShowAlert(true);
                setShowOtherCostModal(false);
                setEditingOtherCost(null);

                // Reset form
                setOtherCosts({
                    other_cost_id: null,
                    other_cost_per_kg: '',
                    sku_id: skuId,
                    rfq_id: rfqId,
                    other_cost: null,
                    status: true
                });

                fetchOtherCostsForSku();
                // Refresh the SKU data
                const skuResponse = await axiosInstance.get(`/sku/getsku/${rfqId}?skuId=${skuId}`);
                if (skuResponse.data.success) {
                    // setSku(skuResponse.data.data[0]);
                    // Sort the products: GP COIL first, then BOM
                    const sortedSku = { ...skuResponse.data.data[0] };
                    if (sortedSku.products && sortedSku.products.length > 0) {
                        sortedSku.products = [...sortedSku.products].sort((a, b) => {
                            // Sort by is_bom flag (false values first - GP COIL)
                            if (a.is_bom === b.is_bom) return 0;
                            return a.is_bom ? 1 : -1;
                        });
                    }
                    setSku(sortedSku);
                }
            } else {
                setAlertMessage({
                    type: "error",
                    message: response.data.message ||
                        (editingOtherCost ? "Failed to update other cost" : "Failed to save other cost")
                });
                setShowAlert(true);
            }
        } catch (error) {
            setAlertMessage({
                type: "error",
                message: error.response?.data?.message ||
                    (editingOtherCost ? "Error updating other cost" : "Error saving other cost")
            });
            setShowAlert(true);
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

            {/* Edit Modal */}
            <AnimatePresence>
                {editModal.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-lg p-6 w-full max-w-md"
                        >
                            <h3 className="text-lg font-semibold mb-4">
                                Edit {editModal.fieldName.replace('_', ' ')}
                            </h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Value:
                                </label>
                                <input
                                    type="text"
                                    value={editModal.currentValue || "N/A"}
                                    readOnly
                                    className="w-full p-2 border rounded bg-gray-100"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Value:
                                </label>
                                <input
                                    type="number"
                                    value={editModal.newValue}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    min={editModal.fieldName === "yield_percentage" ? 0 : undefined}
                                    max={editModal.fieldName === "yield_percentage" ? 100 : undefined}
                                    step="0.01"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveEditedValue}
                                    disabled={!editModal.newValue ||
                                        (editModal.fieldName === "yield_percentage" &&
                                            (editModal.newValue < 0 || editModal.newValue > 100))}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-blue-300"
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
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
                            onClick={() => navigate(`/sku-details/${rfqId}`)}
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
                    <div className=" rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            {/* Sub total cost */}
                            <div className="flex justify-end">
                                <div className="flex bg-none space-x-4 p-4 bg-blue-400 ">
                                    <div>Sub total cost: </div>
                                    <div>{sku.sub_total_cost > 0 ? sku.sub_total_cost : 0.00}</div>
                                </div>
                            </div>
                            <table className="min-w-full border border-gray-200 bg-white">
                                <thead className="bg-gray-100">
                                    {/* SKU Header Row */}
                                    <tr className="bg-blue-100">
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
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-blue-200 border border-gray-200">PART NAME</th>
                                        {sku.products?.map((product, index) => (
                                            <th key={index} className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider bg-blue-900 border border-gray-200">
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
                                                        onClick={() => handleEditClick(
                                                            product.product_id,
                                                            product.yield_percentage,
                                                            "yield_percentage"
                                                        )}
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
                                                        onClick={() => handleEditClick(
                                                            product.product_id,
                                                            product.bom_cost_per_kg,
                                                            "bom_cost_per_kg"
                                                        )}
                                                        id={`edit-value-${index}`}
                                                    />
                                                    <Tooltip anchorSelect={`#edit-value-${index}`}>Edit Value</Tooltip>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Particular Row */}
                                    <tr>
                                        <td colSpan={sku.products?.length + 1} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-black border border-gray-200">
                                            A PARTICULAR
                                        </td>
                                    </tr>

                                    {/* Net Weight Row */}
                                    <tr className="bg-blue-400">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200">Net weight of product (kg)</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <span>{product.net_weight_of_product || "-"}</span>
                                                    <PencilIcon
                                                        className="h-3 w-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                                                        onClick={() => handleEditClick(
                                                            product.product_id,
                                                            product.net_weight_of_product,
                                                            "net_weight_of_product"
                                                        )}
                                                        id={`edit-value-${index}`}
                                                    />
                                                    <Tooltip anchorSelect={`#edit-value-${index}`}>Edit Value</Tooltip>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Assembly cost */}
                                    <tr className="bg-blue-400">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200">Assembly</td>
                                        <td colSpan={sku.products?.length} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                            {sku.assembly_weight || "-"}
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
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200 bg-blue-300">NET R.M. COST IN Rs.</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                {product.net_rm_cost || "-"}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* LABOUR Row */}
                                    <tr>
                                        <td colSpan={sku.products?.length + 1} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-black border border-gray-200 ">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-lg text-gray-800">B LABOUR COST</h2>
                                                <button
                                                    onClick={() => setShowJobCostModal(true)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition inline-flex items-center"
                                                >
                                                    <CirclePlusIcon className="w-4 h-4 mr-2" />
                                                    Add Job Cost
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* BOM */}
                                    <tr className="bg-blue-50 hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200">BOM</td>
                                        {sku.products?.map((product, index) => (
                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                {product.final_bom_cost || "-"}
                                            </td>
                                        ))}
                                    </tr>


                                    {/* Display each job type's costs */}
                                    {jobCosts.map((jobCostGroup, index) => (
                                        <React.Fragment key={jobCostGroup.job_id}>
                                            {jobCostGroup.costs.some(c => c.is_skulevel) ? (
                                                // SKU-level costs (full width)
                                                <tr className="bg-blue-50 hover:bg-gray-50">
                                                    <td key={index} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200">
                                                        <div className="flex justify-between items-center">
                                                            <span>{jobCostGroup.job_name}</span>
                                                            <div className="flex space-x-2 group-hover:opacity-100 transition-opacity">
                                                                <PencilIcon
                                                                    className="h-3 w-3 text-blue-500 hover:text-blue-700 cursor-pointer"
                                                                    onClick={() => {
                                                                        const isSkuLevel = jobCostGroup.costs.some(c => c.is_skulevel);
                                                                        setEditingJobCost(jobCostGroup);
                                                                        setJobCostData({
                                                                          job_id: jobCostGroup.job_id,
                                                                          isskulevel: isSkuLevel,
                                                                          sku_id: skuId,
                                                                          rfq_id: rfqId,
                                                                          status: true,
                                                                          job_cost: isSkuLevel ? jobCostGroup.costs.find(c => c.is_skulevel)?.job_cost || '' : '',
                                                                          job_costs: isSkuLevel ? [] : 
                                                                            sku.products
                                                                              .filter(p => !p.is_bom)
                                                                              .map(product => {
                                                                                const existingCost = jobCostGroup.costs.find(c => c.product_id === product.product_id);
                                                                                return {
                                                                                  product_id: product.product_id,
                                                                                  job_cost: existingCost?.job_cost || ''
                                                                                };
                                                                              })
                                                                        });
                                                                        setShowJobCostModal(true);
                                                                      }}
                                                                    id={`edit-val-${index}`}
                                                                />
                                                                <Tooltip anchorSelect={`#edit-val-${index}`}>Edit</Tooltip>

                                                                <Trash2Icon
                                                                    className="h-3 w-3 text-red-500 hover:text-red-700 text-xs cursor-pointer"
                                                                    onClick={() => handleJobCostDelete(jobCostGroup.job_id)}
                                                                    id={`del-val-${index}`}
                                                                />
                                                                <Tooltip anchorSelect={`#del-val-${index}`}>Delete</Tooltip>

                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td colSpan={sku.products?.length} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                        {jobCostGroup.costs.find(c => c.is_skulevel)?.job_cost || "-"}
                                                    </td>
                                                </tr>
                                            ) : (
                                                // Product-level costs (per product column)
                                                <tr className="bg-blue-50 hover:bg-gray-50">
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200">
                                                        {/* {jobCostGroup.job_name} */}
                                                        <div className="flex justify-between items-center">
                                                            <span>{jobCostGroup.job_name}</span>
                                                            <div className="flex space-x-2 group-hover:opacity-100 transition-opacity">
                                                                <PencilIcon
                                                                    className="h-3 w-3 text-blue-500 hover:text-blue-700 cursor-pointer"
                                                                    onClick={() => {
                                                                        const isSkuLevel = jobCostGroup.costs.some(c => c.is_skulevel);
                                                                        setEditingJobCost(jobCostGroup);
                                                                        setJobCostData({
                                                                          job_id: jobCostGroup.job_id,
                                                                          isskulevel: isSkuLevel,
                                                                          sku_id: skuId,
                                                                          rfq_id: rfqId,
                                                                          status: true,
                                                                          job_cost: isSkuLevel ? jobCostGroup.costs.find(c => c.is_skulevel)?.job_cost || '' : '',
                                                                          job_costs: isSkuLevel ? [] : 
                                                                            sku.products
                                                                              .filter(p => !p.is_bom)
                                                                              .map(product => {
                                                                                const existingCost = jobCostGroup.costs.find(c => c.product_id === product.product_id);
                                                                                return {
                                                                                  product_id: product.product_id,
                                                                                  job_cost: existingCost?.job_cost || ''
                                                                                };
                                                                              })
                                                                        });
                                                                        setShowJobCostModal(true);
                                                                      }}
                                                                    id={`edit-val-${index}`}
                                                                />
                                                                <Tooltip anchorSelect={`#edit-val-${index}`}>Edit</Tooltip>

                                                                <Trash2Icon
                                                                    className="h-3 w-3 text-red-500 hover:text-red-700 text-xs cursor-pointer"
                                                                    onClick={() => handleJobCostDelete(jobCostGroup.job_id)}
                                                                    id={`del-val-${index}`}
                                                                />
                                                                <Tooltip anchorSelect={`#del-val-${index}`}>Delete</Tooltip>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {sku.products?.map((product, index) => {
                                                        const cost = jobCostGroup.costs.find(c => c.product_id === product.product_id);
                                                        return (
                                                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                                {cost?.job_cost || "-"}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}

                                    {/* Other cost Row */}
                                    <tr>
                                        <td colSpan={sku.products?.length + 1} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-black border border-gray-200 ">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-lg text-gray-800">OTHER COST</h2>
                                                <button
                                                    onClick={() => setShowOtherCostModal(true)}
                                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                                                >
                                                    <CirclePlusIcon className="w-4 h-4 mr-2" />
                                                    Add Other Cost
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {skuOtherCosts.length > 0 ? (
                                        skuOtherCosts.map((cost, index) => (
                                            <tr key={index} className="bg-blue-50 hover:bg-gray-50">
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200">
                                                    <div className="flex justify-between items-center">
                                                        <span>{cost.other_cost_name}</span>
                                                        <div className="flex space-x-2 group-hover:opacity-100 transition-opacity">
                                                            <PencilIcon
                                                                className="h-3 w-3 text-blue-500 hover:text-blue-700 cursor-pointer"
                                                                onClick={() => {
                                                                    setEditingOtherCost(cost);
                                                                    setOtherCosts({
                                                                        other_cost_id: cost.other_cost_id,
                                                                        other_cost_per_kg: cost.other_cost_per_kg,
                                                                        sku_id: skuId,
                                                                        rfq_id: rfqId,
                                                                        other_cost: cost.other_cost,
                                                                        status: true
                                                                    });
                                                                    setShowOtherCostModal(true);
                                                                }}
                                                                id={`edit-val-${index}`}
                                                            />
                                                            <Tooltip anchorSelect={`#edit-val-${index}`}>Edit</Tooltip>

                                                            <Trash2Icon
                                                                className="h-3 w-3 text-red-500 hover:text-red-700 text-xs cursor-pointer"
                                                                onClick={() => handleOtherCostDelete(cost.id)}
                                                                id={`del-val-${index}`}
                                                            />
                                                            <Tooltip anchorSelect={`#del-val-${index}`}>Delete</Tooltip>

                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-200">
                                                    {parseFloat(cost.other_cost_per_kg).toFixed(2)}
                                                </td>
                                                <td colSpan={sku.products?.length} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-200 text-center">
                                                    {parseFloat(cost.other_cost).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-6 text-center text-gray-500 border border-gray-200">
                                                No other costs added yet
                                            </td>
                                        </tr>
                                    )}

                                    {/* Sub total cost */}
                                    {skuOtherCosts.length > 0 && (
                                        < tr className="bg-blue-400">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-200">Sub total cost</td>
                                            <td colSpan={sku.products?.length} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-200">
                                                {sku.sub_total_cost || "-"}
                                            </td>
                                        </tr>
                                    )}

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </motion.div>


            {/* Job Cost Modal */}
            <AnimatePresence>
                {showJobCostModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 "
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6">
                                <div className="flex justify-between items-center">
                                    {/*  <h3 className="text-xl font-semibold text-white">
                                        {jobCostData.isskulevel ? "Add SKU Level Job Costs" : "Add Product Level Job Costs"}
                                    </h3> */}
                                    <h3 className="text-xl font-semibold text-white">
                                        {editingJobCost ? "Edit Job Costs" : jobCostData.isskulevel ? "Add SKU Level Job Costs" : "Add Product Level Job Costs"}
                                    </h3>
                                    <button
                                        onClick={() => setShowJobCostModal(false)}
                                        className="text-white/80 hover:text-white transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto flex-1">
                                <div className="space-y-6">
                                    {/* Job Type Selection */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Job Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            value={jobCostData.job_id}
                                            onChange={(e) => setJobCostData({ ...jobCostData, job_id: e.target.value })}
                                        >
                                            <option value="">Select Job Type</option>
                                            {jobTypesData?.map((job) => (
                                                <option key={job.id} value={job.id}>{job.job_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Level Toggle */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Cost Level
                                        </label>
                                        <div className="flex space-x-4">
                                            <button
                                                type="button"
                                                className={`px-4 py-2 rounded-lg flex-1 transition-all ${jobCostData.isskulevel ? 'bg-blue-100 text-blue-700 border border-blue-300 font-medium' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                onClick={() => setJobCostData({ ...jobCostData, isskulevel: true })}
                                            >
                                                SKU Level
                                            </button>
                                            <button
                                                type="button"
                                                className={`px-4 py-2 rounded-lg flex-1 transition-all ${!jobCostData.isskulevel ? 'bg-blue-100 text-blue-700 border border-blue-300 font-medium' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                onClick={() => setJobCostData({ ...jobCostData, isskulevel: false })}
                                            >
                                                Product Level
                                            </button>
                                        </div>
                                    </div>

                                    {/* Cost Input Section */}
                                    {jobCostData.isskulevel ? (
                                        // SKU Level Form
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Job Cost (Total) <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                                    <input
                                                        type="number"
                                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                        value={jobCostData.job_cost}
                                                        onChange={(e) => setJobCostData({ ...jobCostData, job_cost: e.target.value })}
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    ) : (
                                        // Product Level Form
                                        <div className="space-y-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Job Costs (Non-BOM Products)
                                            </label>
                                            <div className="overflow-x-auto pb-3">
                                                <div className="flex space-x-4 pb-2" style={{ minWidth: `${Math.max(1, sku?.products?.filter(p => p.is_bom !== true)?.length) * 280}px` }}>
                                                    {sku?.products?.filter(p => p.is_bom !== true).map((product, index) => (
                                                        <div key={index} className="border border-gray-200 rounded-xl p-4 flex-shrink-0 w-64 bg-white shadow-sm hover:shadow-md transition-shadow">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="font-medium text-gray-800 truncate">{product.product_name}</h4>
                                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">GP COIL</span>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Job Cost (₹)</label>
                                                                    <div className="relative">
                                                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                                                        <input
                                                                            type="number"
                                                                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                            value={jobCostData.job_costs[index]?.job_cost || ''}
                                                                            onChange={(e) => {
                                                                                const newCosts = [...jobCostData.job_costs];
                                                                                newCosts[index] = {
                                                                                    ...newCosts[index],
                                                                                    product_id: product.product_id,
                                                                                    job_cost: e.target.value
                                                                                };
                                                                                setJobCostData({ ...jobCostData, job_costs: newCosts });
                                                                            }}
                                                                            step="0.01"
                                                                            min="0"
                                                                            placeholder="0.00"
                                                                        />
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowJobCostModal(false)}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveJobCost}
                                    className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={!jobCostData.job_id || (jobCostData.isskulevel && (!jobCostData.job_cost))}
                                >
                                    Save Job Costs
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Other Cost Modal */}
            <AnimatePresence>
                {showOtherCostModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 "
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6">
                                <div className="flex justify-between items-center">
                                    {/* <h3 className="text-xl font-semibold text-white">
                                        Add Other Cost
                                    </h3> */}

                                    <h3 className="text-xl font-semibold text-white">
                                        {editingOtherCost ? "Edit Other Cost" : "Add Other Cost"}
                                    </h3>
                                    {/* <button
                                        onClick={() => setShowOtherCostModal(false)}
                                        className="text-white/80 hover:text-white transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button> */}
                                    <button
                                        onClick={() => {
                                            setShowOtherCostModal(false);
                                            setEditingOtherCost(null);
                                            setOtherCosts({
                                                other_cost_id: null,
                                                other_cost_per_kg: '',
                                                sku_id: skuId,
                                                rfq_id: rfqId,
                                                other_cost: null,
                                                status: true
                                            });
                                        }}
                                        className="text-white/80 hover:text-white transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto flex-1">
                                <div className="space-y-6">

                                    {/* Assembly weight */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Assembly weight
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled"
                                            value={sku.assembly_weight}
                                            disabled
                                        />
                                    </div>

                                    {/* Job Type Selection */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Other cost <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            value={otherCostData.other_cost_id}
                                            onChange={(e) => setOtherCosts({ ...otherCosts, other_cost_id: e.target.value })}
                                        >
                                            <option value="">Select other cost</option>
                                            {otherCostData?.map((other) => (
                                                <option key={other.id} value={other.id}>{other.cost_name}</option>
                                            ))}
                                        </select>
                                    </div>


                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Cost / kg <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    value={otherCosts.other_cost_per_kg}
                                                    onChange={(e) => setOtherCosts({ ...otherCosts, other_cost_per_kg: e.target.value })}
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Total cost (auto)
                                            </label>
                                            <div className="relative">
                                                {/* <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span> */}
                                                <input
                                                    type="number"
                                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    value={otherCosts.other_cost_per_kg * sku.assembly_weight}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowOtherCostModal(false)}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveOtherCost}
                                    className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={!otherCosts.other_cost_id || !otherCosts.other_cost_per_kg}
                                >
                                    Save Other Cost
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div >
    );
}

