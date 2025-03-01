"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, UserPlus, Eye, Trash2 } from "lucide-react";
import Select from "react-select";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const API_BASE_URL = "http://localhost:3000/api";

export default function CreateRFQPage() {
  const navigate = useNavigate();
  const [rfqName, setRFQName] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [skus, setSKUs] = useState([]);
  const [newSKU, setNewSKU] = useState({
    name: "",
    quantity: "",
    description: "",
    drawingNo: "",
    size: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [addClientErrors, setAddClientErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [productType, setProductType] = useState(null);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [selectedSKU, setSelectedSKU] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const openDescriptionModal = sku => {
    setSelectedSKU(sku);
    setIsDescriptionModalOpen(true);
  };

  const closeDescriptionModal = () => {
    setIsDescriptionModalOpen(false);
    setSelectedSKU(null);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    setErrors(prevErrors => ({ ...prevErrors, client: "" }));
    try {
      const response = await axios.get(`${API_BASE_URL}/client/getall`);
      console.log("Client data response:", response.data);
      if (response.data.success) {
        const clientOptions = response.data.data.map(client => ({
          value: client.client_id,
          label: client.name,
        }));
        setClients(clientOptions);
        console.log("Processed client options:", clientOptions);
      } else {
        console.error("Failed to fetch clients:", response.data.message);
        setErrors(prevErrors => ({
          ...prevErrors,
          client: "Failed to fetch clients",
        }));
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setErrors(prevErrors => ({
        ...prevErrors,
        client: "Error fetching clients",
      }));
    }
    setIsLoading(false);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewSKU({ ...newSKU, [name]: value });
  };

  const validateSKU = () => {
    const newErrors = {};
    if (!newSKU.name) newErrors.name = "SKU name is required";
    if (!newSKU.quantity) newErrors.quantity = "Quantity is required";
    if (!newSKU.description) newErrors.description = "Description is required";
    if (!newSKU.drawingNo) newErrors.drawingNo = "Drawing number is required";
    if (!newSKU.size) newErrors.size = "Size is required";
    return newErrors;
  };

  const handleAddSKU = () => {
    const skuErrors = validateSKU();
    if (Object.keys(skuErrors).length === 0) {
      setSKUs([...skus, { ...newSKU, repeat: 0 }]);
      setNewSKU({
        name: "",
        quantity: "",
        description: "",
        drawingNo: "",
        size: "",
      });
    } else {
      setErrors(skuErrors);
    }
  };

  const handleRemoveSKU = index => {
    const updatedSKUs = skus.filter((_, i) => i !== index);
    setSKUs(updatedSKUs);
  };

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault();
      setIsSubmitting(true);
      const formErrors = {};
      if (!rfqName) formErrors.rfqName = "RFQ name is required";
      if (!selectedClient) formErrors.client = "Client selection is required";
      if (skus.length === 0) formErrors.skus = "At least one SKU is required";

      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        setIsSubmitting(false);
        return;
      }

      try {
        console.log("Selected client:", selectedClient);
        const response = await axios.post(
          "http://localhost:3000/api/rfq/saverfq",
          {
            p_rfq_name: rfqName,
            p_user_id: 3, // This should be dynamically set based on the logged-in user
            p_client_id: selectedClient.value,
            p_skus: skus.map(sku => ({
              sku_name: sku.name,
              repeat: 0,
              quantity: Number.parseInt(sku.quantity),
              description: sku.description,
              drawing_no: sku.drawingNo,
              size: Number.parseFloat(sku.size) || 0,
            })),
          }
        );

        if (response.data.success) {
          // For now, we're using a hardcoded ID of 4
          navigate("/addProductDetails/4");
        } else {
          setErrors({
            submit: response.data.message || "Failed to create RFQ",
          });
        }
      } catch (error) {
        console.error("Error creating RFQ:", error);
        setSubmitError(error.response?.data?.message || "Error creating RFQ");
      }
      setIsSubmitting(false);
    },
    [rfqName, selectedClient, skus, navigate]
  );

  const openAddClientModal = () => {
    setIsAddClientModalOpen(true);
  };

  const closeAddClientModal = () => {
    setIsAddClientModalOpen(false);
    setNewClient({ name: "", email: "", phone: "" });
    setAddClientErrors({});
  };

  const handleNewClientInputChange = e => {
    const { name, value } = e.target;
    setNewClient({ ...newClient, [name]: value });
  };

  const validateNewClient = () => {
    const errors = {};
    if (!newClient.name.trim()) errors.name = "Client name is required";
    if (!newClient.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClient.email))
      errors.email = "Invalid email format";
    if (!newClient.phone) errors.phone = "Phone number is required";
    return errors;
  };

  const handleAddNewClient = async e => {
    e.preventDefault();
    const errors = validateNewClient();
    if (Object.keys(errors).length > 0) {
      setAddClientErrors(errors);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/client/save`, {
        p_name: newClient.name,
        p_email: newClient.email,
        p_phone: newClient.phone,
      });

      if (response.data.success) {
        const newClientOption = {
          value: response.data.data.id,
          label: newClient.name,
        };
        setClients([...clients, newClientOption]);
        setSelectedClient(newClientOption);
        setSuccessMessage("Client added successfully");
        closeAddClientModal();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setAddClientErrors({
          submit: response.data.message || "Failed to add client",
        });
      }
    } catch (error) {
      setAddClientErrors({
        submit: error.response?.data?.message || "Error adding client",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
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
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/rfq")}
            className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to RFQ Listing
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
            Create New RFQ
          </h1>
          <p className="text-[#4b4b80] text-base lg:text-lg">
            Fill in the details to create a new RFQ
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-xl p-6 lg:p-8"
        >
          {successMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
          {submitError && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{submitError}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-[#f8f8fd] p-6 rounded-lg shadow-md">
              <label
                htmlFor="rfqName"
                className="block text-lg font-semibold text-[#000060] mb-2"
              >
                RFQ Name
              </label>
              <input
                type="text"
                id="rfqName"
                value={rfqName}
                onChange={e => setRFQName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 text-lg"
                placeholder="Enter RFQ Name"
              />
              {errors.rfqName && (
                <p className="mt-2 text-sm text-red-500">{errors.rfqName}</p>
              )}
            </div>

            <div className="bg-[#f8f8fd] p-6 rounded-lg shadow-md">
              <label
                htmlFor="client"
                className="block text-lg font-semibold text-[#000060] mb-2"
              >
                Select Client
              </label>
              <div className="flex items-center space-x-2">
                <Select
                  id="client"
                  options={clients}
                  value={selectedClient}
                  onChange={setSelectedClient}
                  className="flex-grow text-base"
                  placeholder="Select a client"
                  styles={{
                    control: base => ({
                      ...base,
                      minHeight: "44px",
                      borderColor: "#c8c8e6",
                      "&:hover": {
                        borderColor: "#000060",
                      },
                    }),
                    menu: base => ({
                      ...base,
                      backgroundColor: "white",
                      zIndex: 9999,
                    }),
                    option: (styles, { isSelected, isFocused }) => ({
                      ...styles,
                      backgroundColor: isSelected
                        ? "#f3f4f6"
                        : isFocused
                        ? "#f9fafb"
                        : "white",
                      color: "#000000",
                      cursor: "pointer",
                      "&:active": {
                        backgroundColor: "#f3f4f6",
                      },
                      "&:hover": {
                        backgroundColor: "#f9fafb",
                      },
                    }),
                    singleValue: base => ({
                      ...base,
                      color: "#000000",
                    }),
                    menuPortal: base => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                  menuPortalTarget={document.body}
                />
                <button
                  type="button"
                  onClick={openAddClientModal}
                  className="px-4 py-2 bg-[#000060] text-white rounded-md hover:bg-[#0000a0] transition-colors flex items-center justify-center whitespace-nowrap"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  New Client
                </button>
              </div>
              {errors.client && (
                <p className="mt-2 text-sm text-red-500">{errors.client}</p>
              )}
            </div>

            <div className="bg-[#f8f8fd] p-6 rounded-lg shadow-md mt-6">
              <h3 className="text-xl font-semibold text-[#000060] mb-4">
                Product Type
              </h3>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setProductType("existing")}
                  className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
                    productType === "existing"
                      ? "bg-[#000060] text-white"
                      : "bg-white text-[#000060] border-2 border-[#000060]"
                  }`}
                >
                  Existing Product
                </button>
                <button
                  type="button"
                  onClick={() => setProductType("new")}
                  className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
                    productType === "new"
                      ? "bg-[#000060] text-white"
                      : "bg-white text-[#000060] border-2 border-[#000060]"
                  }`}
                >
                  New Product
                </button>
              </div>
            </div>

            {productType === "new" && (
              <>
                <div className="bg-[#f8f8fd] p-6 rounded-lg shadow-md mt-6">
                  <h3 className="text-2xl font-semibold text-[#000060] mb-6">
                    SKUs
                  </h3>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full border-collapse mb-6">
                      <thead>
                        <tr className="bg-[#000060] text-white">
                          <th className="p-3 text-left font-semibold text-sm uppercase tracking-wider">
                            Name
                          </th>
                          <th className="p-3 text-left font-semibold text-sm uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="p-3 text-left font-semibold text-sm uppercase tracking-wider">
                            Drawing No
                          </th>
                          <th className="p-3 text-left font-semibold text-sm uppercase tracking-wider">
                            Size
                          </th>
                          <th className="p-3 text-left font-semibold text-sm uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {skus.map((sku, index) => (
                          <tr
                            key={index}
                            className={`border-b border-[#e1e1f5] transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-[#f8f8fd]"
                            } hover:bg-[#f0f0f9]`}
                          >
                            <td className="p-3 text-sm">{sku.name}</td>
                            <td className="p-3 text-sm">{sku.quantity}</td>
                            <td className="p-3 text-sm">{sku.drawingNo}</td>
                            <td className="p-3 text-sm">{sku.size}</td>
                            <td className="p-3 text-sm">
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => openDescriptionModal(sku)}
                                  className="p-1 text-[#000060] hover:text-[#0000a0] transition-colors rounded-full hover:bg-[#f0f0f9]"
                                  title="View Description"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSKU(index)}
                                  className="p-1 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-100"
                                  title="Remove SKU"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {skus.length === 0 && (
                    <p className="text-[#4b4b80] text-sm italic">
                      No SKUs added yet. Use the form below to add SKUs.
                    </p>
                  )}
                </div>

                <div className="bg-[#f8f8fd] p-6 rounded-lg shadow-md mt-6">
                  <h3 className="text-2xl font-semibold text-[#000060] mb-6">
                    Add New SKU
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <label
                        htmlFor="skuName"
                        className="block text-sm font-medium text-[#000060] mb-2"
                      >
                        SKU Name
                      </label>
                      <input
                        type="text"
                        id="skuName"
                        name="name"
                        value={newSKU.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border-2 border-[#c8c8e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="skuQuantity"
                        className="block text-sm font-medium text-[#000060] mb-2"
                      >
                        Quantity
                      </label>
                      <input
                        type="number"
                        id="skuQuantity"
                        name="quantity"
                        value={newSKU.quantity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border-2 border-[#c8c8e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                      />
                      {errors.quantity && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.quantity}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="skuDrawingNo"
                        className="block text-sm font-medium text-[#000060] mb-2"
                      >
                        Drawing No
                      </label>
                      <input
                        type="text"
                        id="skuDrawingNo"
                        name="drawingNo"
                        value={newSKU.drawingNo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border-2 border-[#c8c8e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                      />
                      {errors.drawingNo && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.drawingNo}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="skuSize"
                        className="block text-sm font-medium text-[#000060] mb-2"
                      >
                        Size
                      </label>
                      <input
                        type="text"
                        id="skuSize"
                        name="size"
                        value={newSKU.size}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border-2 border-[#c8c8e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                      />
                      {errors.size && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.size}
                        </p>
                      )}
                    </div>
                    <div className="lg:col-span-3">
                      <label
                        htmlFor="skuDescription"
                        className="block text-sm font-medium text-[#000060] mb-2"
                      >
                        Description
                      </label>
                      <textarea
                        id="skuDescription"
                        name="description"
                        value={newSKU.description}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border-2 border-[#c8c8e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                        rows="3"
                      ></textarea>
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSKU}
                    className="mt-6 px-6 py-3 bg-[#000060] text-white rounded-md hover:bg-[#0000a0] transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add SKU
                  </button>
                </div>
              </>
            )}

            {errors.skus && (
              <p className="mt-1 text-sm text-red-500">{errors.skus}</p>
            )}

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/rfq")}
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
                {isSubmitting ? "Processing..." : "Next"}
              </button>
            </div>
          </form>
        </motion.div>
        {isAddClientModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-[#000060] mb-4">
                Add New Client
              </h2>
              <form onSubmit={handleAddNewClient} className="space-y-4">
                <div>
                  <label
                    htmlFor="clientName"
                    className="block text-sm font-medium text-[#000060] mb-1"
                  >
                    Client Name
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    name="name"
                    value={newClient.name}
                    onChange={handleNewClientInputChange}
                    className="w-full px-3 py-2 border-2 border-[#c8c8e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                  />
                  {addClientErrors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {addClientErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="clientEmail"
                    className="block text-sm font-medium text-[#000060] mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="clientEmail"
                    name="email"
                    value={newClient.email}
                    onChange={handleNewClientInputChange}
                    className="w-full px-3 py-2 border-2 border-[#c8c8e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                  />
                  {addClientErrors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {addClientErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="clientPhone"
                    className="block text-sm font-medium text-[#000060] mb-1"
                  >
                    Phone Number
                  </label>
                  <PhoneInput
                    country={"in"}
                    value={newClient.phone}
                    onChange={phone => setNewClient({ ...newClient, phone })}
                    inputProps={{
                      name: "phone",
                      required: true,
                      autoFocus: false,
                    }}
                    inputClass="w-full px-3 py-2 border-2 border-[#c8c8e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                    containerClass="w-full"
                    dropdownClass="!w-[300px]"
                  />
                  {addClientErrors.phone && (
                    <p className="mt-1 text-sm text-red-500">
                      {addClientErrors.phone}
                    </p>
                  )}
                </div>
                {addClientErrors.submit && (
                  <p className="text-sm text-red-500">
                    {addClientErrors.submit}
                  </p>
                )}
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={closeAddClientModal}
                    className="px-4 py-2 text-[#000060] border border-[#000060] rounded-md hover:bg-[#000060] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#000060] text-white rounded-md hover:bg-[#0000a0] transition-colors"
                  >
                    Add Client
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {isDescriptionModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] flex flex-col">
              <h2 className="text-2xl font-bold text-[#000060] mb-4">
                SKU Description
              </h2>
              <div className="overflow-y-auto flex-grow mb-4">
                <p className="text-[#4b4b80]">{selectedSKU?.description}</p>
              </div>
              <button
                onClick={closeDescriptionModal}
                className="px-4 py-2 bg-[#000060] text-white rounded-md hover:bg-[#0000a0] transition-colors self-end"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
