"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, Edit } from "lucide-react";
import Select from "react-select";
import axios from "axios";
import {
  Upload,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axiosInstance from "../../axiosConfig";

const API_BASE_URL = "http://localhost:3000/api";

export default function AddProductDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [skuData, setSkuData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    quantity_per_assembly: "",
    raw_material_type: "",
    yield_percentage: "",
    bom_cost_per_kg: "",
  });
  const [currency, setCurrency] = useState("INR");
  const [validationErrors, setValidationErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [skusPerPage] = useState(5);
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [productsPerPage] = useState(5);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [currentDocumentPage, setCurrentDocumentPage] = useState(1);
  const [documentsPerPage] = useState(5);
  const fileInputRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [rawMaterial, setRawMaterial] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSkuData();
    fetchRawMaterial();
  }, []);

  const appState = localStorage.getItem("appState");
  const parsedState = JSON.parse(appState);
  const userEmail = parsedState?.user?.email || null;

  const fetchSkuData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/sku/getsku/${id}`);
      if (response.data.success) {
        setSkuData(response.data.data);
      } else {
        setError("Failed to fetch SKU data");
      }
    } catch (error) {
      setError("Error fetching SKU data");
    }
    setIsLoading(false);
  };

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/rfq/${id}/documents`);
      if (response.data.success) {
        setDocuments(response.data.data);
      } else {
        setUploadError("Failed to fetch documents");
      }
    } catch (error) {
      setUploadError(
        "Error fetching documents: " +
        (error.response?.data?.message || error.message)
      );
    }
  }, [id]);

  useEffect(() => {
    if (showDocumentUpload) {
      fetchDocuments();
    }
  }, [showDocumentUpload, fetchDocuments]);

  const indexOfLastSku = currentPage * skusPerPage;
  const indexOfFirstSku = indexOfLastSku - skusPerPage;
  const currentSkus = skuData.slice(indexOfFirstSku, indexOfLastSku);
  const totalPages = Math.ceil(skuData.length / skusPerPage);

  const indexOfLastProduct = currentProductPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts =
    selectedSku?.products?.slice(indexOfFirstProduct, indexOfLastProduct) || [];
  const totalProductPages = Math.ceil(
    (selectedSku?.products?.length || 0) / productsPerPage
  );

  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };

  const handleProductPageChange = pageNumber => {
    setCurrentProductPage(pageNumber);
  };

  const handleAddProductDetails = sku => {
    setSelectedSku(sku);
    setIsModalOpen(true);
    setIsEditMode(false);
    setEditIndex(null);
    resetNewProduct();
    setCurrentProductPage(1);
  };

  const handleEditProducts = sku => {
    setSelectedSku(sku);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSku(null);
    resetNewProduct();
    setValidationErrors({});
  };

  const resetNewProduct = () => {
    setNewProduct({
      product_name: "",
      quantity_per_assembly: "",
      raw_material_type: "",
      yield_percentage: "",
      bom_cost_per_kg: "",
    });
  };

  const validateProduct = () => {
    const errors = {};
    if (!newProduct.product_name.trim())
      errors.product_name = "Product name is required";
    if (!newProduct.quantity_per_assembly)
      errors.quantity_per_assembly = "Quantity is required";
    if (!newProduct.raw_material_type)
      errors.raw_material_type = "Raw material type is required";
    if (!newProduct.yield_percentage)
      errors.yield_percentage = "Yield percentage is required";
    if (!newProduct.bom_cost_per_kg)
      errors.bom_cost_per_kg = "BOM cost is required";
    return errors;
  };

  const handleAddProduct = () => {
    const errors = validateProduct();
    if (Object.keys(errors).length === 0) {
      const updatedSkuData = skuData.map(sku => {
        if (sku.sku_id === selectedSku.sku_id) {
          return {
            ...sku,
            products: [...(sku.products || []), { ...newProduct }],
          };
        }
        return sku;
      });
      setSkuData(updatedSkuData);
      resetNewProduct();
      setValidationErrors({});
    } else {
      setValidationErrors(errors);
    }
  };

  const handleEditProduct = (skuId, productIndex) => {
    const sku = skuData.find(s => s.sku_id === skuId);
    if (sku && sku.products[productIndex]) {
      setNewProduct(sku.products[productIndex]);
      setIsEditMode(true);
      setEditIndex(productIndex);
    }
  };

  const fetchRawMaterial = async () => {
    try {
      const response = await axiosInstance.get(`/rawmaterial/`);
      if (response.data.success) {
        setRawMaterial(response.data.data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const rawMaterialOptions = rawMaterial.map(raw => ({
    value: raw.id,
    label: raw.raw_material_name,
  }));

  const saveProductsToBackend = async (skuId, products) => {
    try {
      const response = await axiosInstance.post(`/sku/saveproducts/`, {
        p_sku_id: skuId,
        p_products: products,
      });
      if (response.data.success) {
        setSkuData(prevSkuData =>
          prevSkuData.map(sku =>
            sku.sku_id === skuId ? { ...sku, products: products } : sku
          )
        );
        setSuccessMessage(
          response.data.message || "Products updated successfully"
        );
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Failed to save products");
      }
    } catch (error) {
      setError(
        "Error saving products: " +
        (error.response?.data?.message || error.message)
      );
    }
  };

  const handleSaveProducts = async () => {
    const errors = validateProduct();
    if (Object.keys(errors).length === 0) {
      const updatedProducts = isEditMode
        ? selectedSku.products.map((p, index) =>
          index === editIndex ? newProduct : p
        )
        : [...(selectedSku.products || []), newProduct];

      await saveProductsToBackend(selectedSku.sku_id, updatedProducts);
      setSelectedSku({ ...selectedSku, products: updatedProducts });
      resetNewProduct();
      setIsEditMode(false);
      setEditIndex(null);
      setValidationErrors({});
    } else {
      setValidationErrors(errors);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (selectedOption, { name }) => {
    if (name === "raw_material_type") {
      setNewProduct({
        ...newProduct,
        raw_material_type: selectedOption.value,
      });
    }
    setValidationErrors({ ...validationErrors, [name]: "" });
  };

  const handleRemoveProduct = async (skuId, productIndex) => {
    const sku = skuData.find(s => s.sku_id === skuId);
    if (sku) {
      const updatedProducts = sku.products.filter(
        (_, index) => index !== productIndex
      );
      await saveProductsToBackend(skuId, updatedProducts);
      setSelectedSku({ ...selectedSku, products: updatedProducts });
    }
  };

  const handleFileUpload = async files => {
    setIsUploading(true);
    setUploadError("");
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("documents", files[i]);
    }

    try {
      const response = await axiosInstance.post(
        `/rfq/${id}/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        setSuccessMessage(response.data.message);
        fetchDocuments();
        // setTimeout(()=>{
        //   navigate("/");
        // }, 2000);
      } else {
        setUploadError(response.data.message || "Failed to upload documents");
      }
    } catch (error) {
      setUploadError(
        "Error uploading documents: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const response = await axiosInstance.get(
        `/rfq/${id}/download/${documentId}`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setUploadError(
        "Error downloading document: " +
        (error.response?.data?.message || error.message)
      );
    }
  };

  const handleDelete = async documentId => {
    try {
      const response = await axiosInstance.delete(
        `/rfq/${id}/docdelete/permanent/${documentId}`
      );
      if (response.data.success) {
        setSuccessMessage("Document deleted successfully");
        fetchDocuments();
      } else {
        setUploadError("Failed to delete document");
      }
    } catch (error) {
      setUploadError(
        "Error deleting document: " +
        (error.response?.data?.message || error.message)
      );
    }
  };


  // fetch the email template 
  const fetchEmailTemplate = async () => {
    try {
      const tagId = 2;  // Hard coded tagId For RFQ creation dont change it
      const response = await axiosInstance.get(`/email-template/email-with-tag/${tagId}`);

      if (response.data.data) {
        return response.data.data; // Return the data instead of setting state
      }
      return null;
    } catch (error) {
      console.error("Error fetching email template:", error);
      return null;
    }
  };

  const handleRFQSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      // fetch the email template
      const emailTemplate = await fetchEmailTemplate();
      const emailTemplateData = emailTemplate[0];

      const emailNotification = {
        emailConfigId: 1,
        toMail: userEmail,
        subject: `${emailTemplateData.subject ? emailTemplateData.subject : 'RFQ created successfully'}`,
        emailContent: `Dear Sir,\n\n` +
          `RFQ with Id: ${id} was successfully created.` +
          `${emailTemplateData?.email_content}` +
          `\n\n` +
          `${emailTemplateData?.email_signature}`,
      };

      // Add mail trigger function to the user
      const emailResponse = await axiosInstance.post("/email-config/notify", emailNotification);

      if (emailResponse.data.success) {
        setSuccessMessage("Documents uploaded successfully.");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      setError("Error saving RFQ.");
    } finally {
      setIsSaving(false);
    }
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9] min-h-screen p-4 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(`/edit_RFQ/${id}`)}
            className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Edit RFQ
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
            {showDocumentUpload ? "Upload Documents" : "SKU Details"}
          </h1>
          <p className="text-[#4b4b80] text-base lg:text-lg">
            {showDocumentUpload
              ? "Upload and manage documents for your RFQ"
              : "SKU list for the RFQ"}
          </p>
        </motion.div>

        {!showDocumentUpload && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-xl p-6 lg:p-8"
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#000060]"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    <p>{error}</p>
                  </div>
                )}
                <table className="w-full border-collapse rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-[#000060] text-white rounded-t-lg">
                      <th className="p-3 text-left">SKU Name</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-left">Annual Usage</th>
                      {/* <th className="p-3 text-center">Products</th> */}
                      {/* <th className="p-3 text-center">Action</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {currentSkus.map(sku => (
                      <tr key={sku.sku_id} className="border-b">
                        <td className="p-3 border-b border-[#e1e1f5]">
                          {sku.sku_name}
                        </td>
                        <td className="p-3 border-b border-[#e1e1f5]">
                          {sku.description}
                        </td>
                        <td className="p-3 border-b border-[#e1e1f5]">
                          {sku.annual_usage}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md transition-colors ${currentPage === page
                            ? "bg-[#000060] text-white"
                            : "bg-[#f0f0f9] text-[#000060] hover:bg-[#e1e1f5]"
                            }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => {
                      // Remove the validation check for products
                      setShowDocumentUpload(true);
                    }}
                    className="px-6 py-3 rounded-lg text-white transition-all duration-300 bg-[#000060] hover:bg-[#0000a0] hover:shadow-lg transform hover:-translate-y-1"
                  >
                    Next: Upload Documents
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {showDocumentUpload && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-xl p-6 lg:p-8"
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

            {isUploading && (
              <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded-lg flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700 mr-3"></div>
                <p>Uploading documents...</p>
              </div>
            )}
            {uploadError && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                <p>{uploadError}</p>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                <p>{successMessage}</p>
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
                    handleRFQSave();
                  } else {
                    setUploadError(
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
                SAVE RFQ
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold text-[#000060] mb-4">Success!</h2>
            <p className="text-lg mb-6">
              RFQ with ID {id} has been created successfully.
            </p>
            <button
              onClick={() => {
                setShowPopup(false);
                navigate("/rfq");
              }}
              className="w-full px-4 py-2 bg-[#000060] text-white rounded-md hover:bg-[#0000a0] transition-colors"
            >
              Go to RFQ Listing
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
