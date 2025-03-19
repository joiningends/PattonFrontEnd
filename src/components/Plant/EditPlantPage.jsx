"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Building, MapPin, X } from "lucide-react";
import axios from "axios";
import Select from "react-select";
import axiosInstance from "../../axiosConfig";


export default function EditPlantPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [plantData, setPlantData] = useState({
    plantname: "",
    plant_head: "",
    plant_head_id: null,
    process_engineer: "",
    process_engineer_id: null,
    npd_engineer: "",
    npd_engineer_id: null,
    vendor_development_engineer: "",
    vendor_development_engineer_id: null,
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchPlantData();
    fetchUsers();
  }, []);

  const fetchPlantData = async () => {
    try {
      const response = await axiosInstance.get(`/plant/${id}`);
      console.log("plantData: ", response.data.data[0]);
      if (response.data.success) {
        setPlantData(response.data.data[0][0]);
      } else {
        setErrors({ submit: "Failed to fetch plant data" });
      }
    } catch (error) {
      setErrors({ submit: "Error fetching plant data" });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`/users/`);
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setPlantData({ ...plantData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  // const handleSelectChange = (selectedOption, { name }) => {
  //   setPlantData({ ...plantData, [name]: selectedOption.value });
  //   setErrors({ ...errors, [name]: "" });
  // };

  const handleSelectChange = (selectedOption, { name }) => {
    console.log("Selected Option:", selectedOption);
    console.log("Field Name:", name);

    if (name === "plant_head") {
      setPlantData({
        ...plantData,
        plant_head: selectedOption.label,
        plant_head_id: selectedOption.value,
      });
    } else if (name === "process_engineer") {
      setPlantData({
        ...plantData,
        process_engineer: selectedOption.label,
        process_engineer_id: selectedOption.value,
      });
    } else if (name === "npd_engineer") {
      setPlantData({
        ...plantData,
        npd_engineer: selectedOption.label,
        npd_engineer_id: selectedOption.value,
      });
    } else if (name == "vendor_development_engineer") {
      setPlantData({
        ...plantData,
        vendor_development_engineer: selectedOption.label,
        vendor_development_engineer_id: selectedOption.value,
      });
    }
    setErrors({ ...errors, [name]: "" });

    console.log("Updated Plant Data:", plantData);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!plantData.plantname?.trim())
      newErrors.plantname = "Plant name is required";
    if (!plantData.plant_head) newErrors.plant_head = "Plant head is required";
    if (!plantData.process_engineer)
      newErrors.process_engineer = "Process engineer is required";
    if (!npd_engineer)
      newErrors.npd_engineer = "NPD engineer is required";
    if (!vendor_development_engineer)
      newErrors.vendor_development_engineer = "Vendor development engineer is required";
    if (!plantData.address1?.trim())
      newErrors.address1 = "Address 1 is required";
    if (!plantData.city?.trim()) newErrors.city = "City is required";
    if (!plantData.state?.trim()) newErrors.state = "State is required";
    // if (!plantData.pincode?.trim()) newErrors.pincode = "Pin code is required";
    if (!String(plantData.pincode)?.trim()) newErrors.pincode = "Pin code is required";
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
        `/plant/edit/${id}`,
        plantData
      );
      if (response.data.success) {
        setSuccessMessage("Plant updated successfully");
        setTimeout(() => {
          navigate("/plants");
        }, 2000);
      } else {
        setErrors({
          submit: response.data.message || "Failed to update plant",
        });
      }
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || "Error updating plant",
      });
    }
    setIsSubmitting(false);
  };

  const userOptions = users.map(user => ({
    value: user.id,
    label: user.username,
  }));

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
            onClick={() => navigate("/plants")}
            className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Plants
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
            Edit Plant
          </h1>
          <p className="text-[#4b4b80] text-base lg:text-lg">
            Update plant information
          </p>
        </motion.div>

        <AnimatePresence>
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
                  htmlFor="plantname"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Plant Name
                </label>
                <div className="relative">
                  <Building
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                    size={20}
                  />
                  <input
                    type="text"
                    id="plantname"
                    name="plantname"
                    value={plantData.plantname}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                    placeholder="Enter plant name"
                  />
                </div>
                {errors.plantname && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.plantname}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="plant_head"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Plant Head
                </label>
                {/* <Select
                  id="plant_head"
                  name="plant_head"
                  options={userOptions}
                  value={userOptions.find(
                    option => option.value === plantData.plant_head_id
                  )}
                  onChange={option =>
                    handleSelectChange(option, { name: "plant_head" })
                  }
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select Plant Head"
                /> */}
                <Select
                  id="plant_head"
                  name="plant_head"
                  options={userOptions}
                  value={userOptions.find(option => option.value === plantData.plant_head_id)}
                  onChange={option => handleSelectChange(option, { name: "plant_head" })}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select Plant Head"
                />
                {errors.plant_head && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.plant_head}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="process_engineer"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Process Engineer
                </label>
                <Select
                  id="process_engineer"
                  name="process_engineer"
                  options={userOptions}
                  value={userOptions.find(option => option.value === plantData.process_engineer_id)}
                  onChange={option => handleSelectChange(option, { name: "process_engineer" })}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select Process Engineer"
                />
                {errors.process_engineer && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.process_engineer}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="npd_engineer"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  NPD Engineer
                </label>
                <Select
                  id="npd_engineer"
                  name="npd_engineer"
                  options={userOptions}
                  value={userOptions.find(option => option.value === plantData.npd_engineer_id)}
                  onChange={option => handleSelectChange(option, { name: "npd_engineer" })}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select NPD Engineer"
                />
                {errors.npd_engineer && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.npd_engineer}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="vendor_development_engineer"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Vendor Development Engineer
                </label>
                <Select
                  id="vendor_development_engineer"
                  name="vendor_development_engineer"
                  options={userOptions}
                  value={userOptions.find(option => option.value === plantData.vendor_development_engineer_id)}
                  onChange={option => handleSelectChange(option, { name: "vendor_development_engineer" })}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select Vendor Development Engineer"
                />
                {errors.vendor_development_engineer && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.vendor_development_engineer}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="address1"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Address 1
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                    size={20}
                  />
                  <input
                    type="text"
                    id="address1"
                    name="address1"
                    value={plantData.address1}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                    placeholder="Enter address 1"
                  />
                </div>
                {errors.address1 && (
                  <p className="mt-1 text-sm text-red-500">{errors.address1}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="address2"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Address 2
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                    size={20}
                  />
                  <input
                    type="text"
                    id="address2"
                    name="address2"
                    value={plantData.address2}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                    placeholder="Enter address 2 (optional)"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={plantData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={plantData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                  placeholder="Enter state"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="pincode"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Pin Code
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={plantData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                  placeholder="Enter pin code"
                />
                {errors.pincode && (
                  <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/plants")}
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
                {isSubmitting ? "Updating..." : "Update Plant"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
