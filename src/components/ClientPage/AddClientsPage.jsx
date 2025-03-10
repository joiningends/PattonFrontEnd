"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building,
  Mail,
  MapPin,
  Globe,
  Hash,
  User,
  Briefcase,
  Plus,
  X,
} from "lucide-react";
import Select from "react-select";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Country, State } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from "axios";
import axiosInstance from "../../axiosConfig";

const API_BASE_URL = "http://localhost:3000/api";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    height: "48px",
    minHeight: "48px",
    borderColor: state.isFocused ? "#000060" : "#e1e1f5",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#000060",
    },
  }),
  valueContainer: base => ({
    ...base,
    height: "48px",
    padding: "0 6px 0 40px",
  }),
  input: base => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
};

const getCountries = () => {
  return Country.getAllCountries().map(country => ({
    value: country.isoCode,
    label: country.name,
  }));
};

const getStates = countryCode => {
  return State.getStatesOfCountry(countryCode).map(state => ({
    value: state.isoCode,
    label: state.name,
  }));
};

const schema = yup.object().shape({
  name: yup
    .string()
    .required("Company name is required")
    .min(2, "Company name must be at least 2 characters"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  street_no: yup.string().required("Street address is required"),
  city: yup.string().required("City is required"),
  state: yup.object().required("State is required"),
  country: yup.object().required("Country is required"),
  Pan_gst: yup
    .string()
    .matches(/^[0-9A-Z]{10}$|^[0-9A-Z]{15}$/, "Invalid PAN or GST format")
    .required("PAN/GST number is required"),
  contacts: yup.array().of(
    yup.object().shape({
      name: yup.string().required("Contact name is required"),
      email: yup
        .string()
        .email("Invalid email format")
        .required("Contact email is required"),
      mobile: yup.string().required("Contact mobile is required"),
      designation: yup.string().required("Designation is required"),
    })
  ),
});

export default function AddClientPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [states, setStates] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      street_no: "",
      city: "",
      state: null,
      country: null,
      Pan_gst: "",
      contacts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
  });

  const selectedCountry = watch("country");

  useEffect(() => {
    if (selectedCountry) {
      setStates(getStates(selectedCountry.value));
    }
  }, [selectedCountry]);

  const onSubmit = async data => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        p_name: data.name,
        p_email: data.email,
        p_phone: data.phone,
        p_city: data.city,
        p_state: data.state.label,
        p_country: data.country.label,
        p_street_no: data.street_no,
        p_PAN_gst: data.Pan_gst,
        p_other_contacts: data.contacts.map(contact => ({
          name: contact.name,
          phone: contact.mobile,
          email: contact.email,
          designation: contact.designation,
          company: data.name,
        })),
      };
      console.log("Form submitted:", formattedData);
      const response = await axiosInstance.post(
        `/client/save`,
        formattedData
      );
      if (response.data.success) {
        console.log("Client created successfully:", response.data.data);
        setSuccessMessage("Client created successfully");
        setTimeout(() => {
          navigate("/clients");
        }, 2000);
      } else {
        setErrorMessage(
          response.data.message ||
          "An error occurred while creating the client."
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage(
        error.response?.data?.message ||
        "An error occurred while creating the client. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full h-12 pl-10 pr-4 rounded-lg border border-[#e1e1f5] focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 bg-white`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9] min-h-screen p-2 sm:p-4 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/clients")}
            className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Clients
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
            Add New Client
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-[#4b4b80]">
            Create a new client profile
          </p>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{errorMessage}</span>
            </motion.div>
          )}
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
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-[#000060] mb-4">
                  Company Details
                </h2>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Company Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-[#000060]" />
                  </div>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`${inputClass} ${errors.name ? "border-red-500" : ""
                          }`}
                        placeholder="Enter company name"
                      />
                    )}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[#000060]" />
                  </div>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        className={`${inputClass} ${errors.email ? "border-red-500" : ""
                          }`}
                        placeholder="Enter email address"
                      />
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Phone Number *
                </label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      {...field}
                      country={"in"}
                      inputClass={`${inputClass} !w-full !h-12 !pl-12`}
                      buttonClass="!border-0 !border-r !rounded-l-lg"
                      dropdownClass="!w-[300px]"
                      containerClass={`${errors.phone ? "!border-red-500" : ""
                        }`}
                      inputProps={{
                        name: "phone",
                        required: true,
                        autoFocus: false,
                      }}
                      containerStyle={{
                        width: "100%",
                      }}
                      dropdownStyle={{
                        width: "300px",
                        maxHeight: "300px",
                        fontSize: "14px",
                      }}
                    />
                  )}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="street_no"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Street Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-[#000060]" />
                  </div>
                  <Controller
                    name="street_no"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`${inputClass} ${errors.street_no ? "border-red-500" : ""
                          }`}
                        placeholder="Enter street address"
                      />
                    )}
                  />
                </div>
                {errors.street_no && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.street_no.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  City *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-[#000060]" />
                  </div>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`${inputClass} ${errors.city ? "border-red-500" : ""
                          }`}
                        placeholder="Enter city"
                      />
                    )}
                  />
                </div>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  Country *
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#000060] z-10 pointer-events-none" />
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={getCountries()}
                        styles={selectStyles}
                        className={`w-full ${errors.country ? "border-red-500" : ""
                          }`}
                        classNamePrefix="select"
                        placeholder="Select country"
                      />
                    )}
                  />
                </div>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.country.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  State *
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#000060] z-10 pointer-events-none" />
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={states}
                        isDisabled={!selectedCountry}
                        styles={selectStyles}
                        className={`w-full ${errors.state ? "border-red-500" : ""
                          }`}
                        classNamePrefix="select"
                        placeholder={
                          selectedCountry
                            ? "Select state"
                            : "Select a country first"
                        }
                      />
                    )}
                  />
                </div>
                {errors.state && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.state.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="Pan_gst"
                  className="block text-sm font-medium text-[#000060] mb-2"
                >
                  PAN Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-[#000060]" />
                  </div>
                  <Controller
                    name="Pan_gst"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`${inputClass} ${errors.Pan_gst ? "border-red-500" : ""
                          }`}
                        placeholder="Enter PAN number"
                      />
                    )}
                  />
                </div>
                {errors.Pan_gst && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.Pan_gst.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#000060]">
                  Contact Details
                </h2>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    append({ name: "", email: "", mobile: "", designation: "" })
                  }
                  className="flex items-center px-4 py-2 bg-[#000060] text-white rounded-lg hover:bg-[#0000a0] transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Contact
                </motion.button>
              </div>

              <AnimatePresence>
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-6 p-4 border border-[#e1e1f5] rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-[#000060]">
                        Contact {index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <Controller
                        name={`contacts.${index}.name`}
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-medium text-[#000060] mb-2">
                              Contact Name *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-[#000060]" />
                              </div>
                              <input
                                {...field}
                                type="text"
                                className={`${inputClass} ${errors.contacts?.[index]?.name
                                    ? "border-red-500"
                                    : ""
                                  }`}
                                placeholder="Enter contact name"
                              />
                            </div>
                            {errors.contacts?.[index]?.name && (
                              <p className="mt-1 text-sm text-red-500">
                                {errors.contacts[index].name.message}
                              </p>
                            )}
                          </div>
                        )}
                      />

                      <Controller
                        name={`contacts.${index}.email`}
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-medium text-[#000060] mb-2">
                              Contact Email *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-[#000060]" />
                              </div>
                              <input
                                {...field}
                                type="email"
                                className={`${inputClass} ${errors.contacts?.[index]?.email
                                    ? "border-red-500"
                                    : ""
                                  }`}
                                placeholder="Enter contact email"
                              />
                            </div>
                            {errors.contacts?.[index]?.email && (
                              <p className="mt-1 text-sm text-red-500">
                                {errors.contacts[index].email.message}
                              </p>
                            )}
                          </div>
                        )}
                      />

                      <Controller
                        name={`contacts.${index}.mobile`}
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-medium text-[#000060] mb-2">
                              Contact Mobile *
                            </label>
                            <PhoneInput
                              {...field}
                              country={"in"}
                              inputClass={`${inputClass} !w-full !h-12 !pl-12`}
                              buttonClass="!border-0 !border-r !rounded-l-lg"
                              dropdownClass="!w-[300px]"
                              containerClass={`${errors.contacts?.[index]?.mobile
                                  ? "!border-red-500"
                                  : ""
                                }`}
                              inputProps={{
                                name: `contact_mobile_${index}`,
                                required: true,
                                autoFocus: false,
                              }}
                              containerStyle={{
                                width: "100%",
                              }}
                              dropdownStyle={{
                                width: "300px",
                                maxHeight: "300px",
                                fontSize: "14px",
                              }}
                            />
                            {errors.contacts?.[index]?.mobile && (
                              <p className="mt-1 text-sm text-red-500">
                                {errors.contacts[index].mobile.message}
                              </p>
                            )}
                          </div>
                        )}
                      />

                      <Controller
                        name={`contacts.${index}.designation`}
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-medium text-[#000060] mb-2">
                              Designation *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Briefcase className="h-5 w-5 text-[#000060]" />
                              </div>
                              <input
                                {...field}
                                type="text"
                                className={`${inputClass} ${errors.contacts?.[index]?.designation
                                    ? "border-red-500"
                                    : ""
                                  }`}
                                placeholder="Enter designation"
                              />
                            </div>
                            {errors.contacts?.[index]?.designation && (
                              <p className="mt-1 text-sm text-red-500">
                                {errors.contacts[index].designation.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {fields.length === 0 && (
                <p className="text-[#4b4b80] text-sm">
                  No contacts added. Click "Add Contact" to add a new contact.
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/clients")}
                className="px-6 h-12 rounded-lg border-2 border-[#000060] text-[#000060] hover:bg-[#000060] hover:text-white transition-all duration-300"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className={`px-6 h-12 rounded-lg bg-[#000060] text-white transition-all duration-300 flex items-center hover:bg-[#0000a0] ${isSubmitting
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:shadow-lg transform hover:-translate-y-1"
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Building className="w-5 h-5 mr-2" />
                    Create Client
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
