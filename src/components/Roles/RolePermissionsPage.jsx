"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Save, X } from "lucide-react";
import { motion } from "framer-motion";

const permissions = [
  { id: 1, name: "View", description: "Ability to view data" },
  { id: 2, name: "Edit", description: "Ability to edit data" },
  { id: 3, name: "Delete", description: "Ability to delete data" },
  { id: 4, name: "Create", description: "Ability to create new data" },
];

export default function RolePermissionsPage() {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const [role, setRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedPermissions, setEditedPermissions] = useState({});

  useEffect(() => {
    // Fetch role data (replace with actual API call)
    const fetchedRole = { id: roleId, name: "Admin" }; // Example data
    setRole(fetchedRole);

    // Fetch role permissions (replace with actual API call)
    const fetchedPermissions = {
      1: true,
      2: true,
      3: true,
      4: true,
    };
    setRolePermissions(fetchedPermissions);
    setEditedPermissions(fetchedPermissions);
  }, [roleId]);

  const handlePermissionToggle = permissionId => {
    setEditedPermissions(prev => ({
      ...prev,
      [permissionId]: !prev[permissionId],
    }));
  };

  const handleSave = () => {
    // Save changes (replace with actual API call)
    setRolePermissions(editedPermissions);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPermissions(rolePermissions);
    setIsEditing(false);
  };

  if (!role) {
    return <div>Loading...</div>;
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
          <button
            onClick={() => navigate("/manage-permissions")}
            className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Manage Permissions
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
            {role.name} Role Permissions
          </h1>
          <p className="text-[#4b4b80] text-base lg:text-lg">
            Manage permissions for the {role.name} role
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-xl p-6 lg:p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#000060]">
              Permissions
            </h2>
            {isEditing ? (
              <div className="space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Save className="w-5 h-5 inline-block mr-2" />
                  Save
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5 inline-block mr-2" />
                  Cancel
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-[#000060] text-white rounded-lg hover:bg-[#0000a0] transition-colors"
              >
                <Edit className="w-5 h-5 inline-block mr-2" />
                Edit Permissions
              </motion.button>
            )}
          </div>

          <div className="space-y-4">
            {permissions.map(permission => (
              <div
                key={permission.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="text-lg font-medium text-[#000060]">
                    {permission.name}
                  </h3>
                  <p className="text-sm text-[#4b4b80]">
                    {permission.description}
                  </p>
                </div>
                <div className="flex items-center">
                  {isEditing ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handlePermissionToggle(permission.id)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        editedPermissions[permission.id]
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <motion.div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          editedPermissions[permission.id]
                            ? "translate-x-6"
                            : "translate-x-0"
                        }`}
                      />
                    </motion.button>
                  ) : (
                    <div
                      className={`w-4 h-4 rounded-full ${
                        rolePermissions[permission.id]
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
