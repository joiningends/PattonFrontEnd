"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../axiosConfig";
import useAppStore from "../../zustandStore";
import { Mail, Phone, Building, User, Briefcase, Users } from "lucide-react"; // Icons for profile details
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user } = useAppStore(); // Get user from Zustand store
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const userId = user?.id;

  // Fetch profile data
  useEffect(() => {
    if (user) {
      fetchProfileData(userId);
    } else {
      navigate("/login");
    }
  });

  const fetchProfileData = async (userId) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      if (response.data.success) {
        setProfileData(response.data.data);
      } else {
        setError("Failed to fetch profile data");
      }
    } catch (error) {
      setError("Error fetching profile data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9] min-h-screen p-4 lg:p-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
            Profile
          </h1>
          <p className="text-[#4b4b80] text-base lg:text-lg">
            View and manage your profile information
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-xl p-6 lg:p-8"
        >
          {profileData && (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#000060] to-[#0000a0] text-white flex items-center justify-center text-3xl font-semibold shadow-md">
                  {profileData.first_name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#000060]">
                    {profileData.first_name} {profileData.last_name}
                  </h2>
                  <p className="text-[#4b4b80]">{profileData.designation}</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="bg-gradient-to-br from-[#f8f8fd] to-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <User className="h-6 w-6 mr-3 text-[#000060]" />
                    <h3 className="font-semibold text-lg text-[#000060]">
                      Username
                    </h3>
                  </div>
                  <p className="text-[#4b4b80]">{profileData.username}</p>
                </div>

                {/* Email */}
                <div className="bg-gradient-to-br from-[#f8f8fd] to-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <Mail className="h-6 w-6 mr-3 text-[#000060]" />
                    <h3 className="font-semibold text-lg text-[#000060]">
                      Email
                    </h3>
                  </div>
                  <p className="text-[#4b4b80]">{profileData.email}</p>
                </div>

                {/* Phone */}
                <div className="bg-gradient-to-br from-[#f8f8fd] to-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <Phone className="h-6 w-6 mr-3 text-[#000060]" />
                    <h3 className="font-semibold text-lg text-[#000060]">
                      Phone
                    </h3>
                  </div>
                  <p className="text-[#4b4b80]">{profileData.phone}</p>
                </div>

                {/* Department */}
                <div className="bg-gradient-to-br from-[#f8f8fd] to-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <Building className="h-6 w-6 mr-3 text-[#000060]" />
                    <h3 className="font-semibold text-lg text-[#000060]">
                      Department
                    </h3>
                  </div>
                  <p className="text-[#4b4b80]">{profileData.department}</p>
                </div>

                {/* Designation */}
                <div className="bg-gradient-to-br from-[#f8f8fd] to-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <Briefcase className="h-6 w-6 mr-3 text-[#000060]" />
                    <h3 className="font-semibold text-lg text-[#000060]">
                      Designation
                    </h3>
                  </div>
                  <p className="text-[#4b4b80]">{profileData.designation}</p>
                </div>

                {/* Roles */}
                <div className="bg-gradient-to-br from-[#f8f8fd] to-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <Users className="h-6 w-6 mr-3 text-[#000060]" />
                    <h3 className="font-semibold text-lg text-[#000060]">
                      Roles
                    </h3>
                  </div>
                  <ul className="text-[#4b4b80]">
                    {profileData.roles.map((role) => (
                      <li key={role.roleId}>{role.roleName}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}