"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Percent } from "lucide-react";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export default function EditRawMaterialPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [materialData, setMaterialData] = useState({
    raw_material_name: "",
    raw_material_rate: "",
    quantity_per_assembly: "",
    scrap_rate: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchRawMaterialData();
  }, []);

  const fetchRawMaterialData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rawmaterial/${id}`);
      if (response.data.success) {
        const data = response.data.data;
        setMaterialData(data);
      } else {
        setErrors({ submit: "Failed to fetch raw material data" });
      }
    } catch (error) {
      setErrors({ submit: "Error fetching raw material data" });
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setMaterialData({ ...materialData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!materialData.raw_material_name.trim())
      newErrors.raw_material_name = "Material name is required";
    if (!materialData.raw_material_rate)
      newErrors.raw_material_rate = "Material rate is required";
    if (!materialData.quantity_per_assembly)
      newErrors.quantity_per_assembly = "Quantity per assembly is required";
    if (!materialData.scrap_rate)
      newErrors.scrap_rate = "Scrap rate is required";
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
      const dataToSubmit = {
        ...materialData,
      };
      const response = await axios.post(
        `${API_BASE_URL}/rawmaterial/edit/${id}`,
        dataToSubmit
      );
      if (response.data.success) {
        setSuccessMessage("Raw material updated successfully");
        setTimeout(() => {
          navigate("/raw-materials");
        }, 2000);
      } else {
        setErrors({
          submit: response.data.message || "Failed to update raw material",
        });
      }
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || "Error updating raw material",
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
            onClick={() => navigate("/raw-materials")}
            className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Raw Materials
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
            Edit Raw Material
          </h1>
          <p className="text-[#4b4b80] text-base lg:text-lg">
            Update raw material information
          </p>
        </motion.div>

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
                  htmlFor="raw_material_name"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Raw Material Name
                </label>
                <div className="relative">
                  <Package
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                    size={20}
                  />
                  <input
                    type="text"
                    id="raw_material_name"
                    name="raw_material_name"
                    value={materialData.raw_material_name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                    placeholder="Enter raw material name"
                  />
                </div>
                {errors.raw_material_name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.raw_material_name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="raw_material_rate"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Raw Material Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    id="raw_material_rate"
                    name="raw_material_rate"
                    value={materialData.raw_material_rate}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                    placeholder="Enter raw material rate"
                  />
                </div>
                {errors.raw_material_rate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.raw_material_rate}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="quantity_per_assembly"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Quantity per Assembly
                </label>
                <div className="relative">
                  <Package
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                    size={20}
                  />
                  <input
                    type="number"
                    step="0.01"
                    id="quantity_per_assembly"
                    name="quantity_per_assembly"
                    value={materialData.quantity_per_assembly}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                    placeholder="Enter quantity per assembly"
                  />
                </div>
                {errors.quantity_per_assembly && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.quantity_per_assembly}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="scrap_rate"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Scrap Rate
                </label>
                <div className="relative">
                  <Percent
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000060]"
                    size={20}
                  />
                  <input
                    type="number"
                    step="0.01"
                    id="scrap_rate"
                    name="scrap_rate"
                    value={materialData.scrap_rate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
                    placeholder="Enter scrap rate"
                  />
                </div>
                {errors.scrap_rate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.scrap_rate}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/raw-materials")}
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
                {isSubmitting ? "Updating..." : "Update Raw Material"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
