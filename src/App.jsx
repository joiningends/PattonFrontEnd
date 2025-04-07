import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import PattonLoginPage from "./components/Login/Login";
import UserPage from "./components/Users/UserPage";
import AddUser from "./components/Users/AddUser";
import RolesPage from "./components/Roles/RolesPage";
import AddRolePage from "./components/Roles/AddRolesPage";
import ManagePermissionsPage from "./components/ManagePermission/ManagePermissionPage";
import ClientsPage from "./components/ClientPage/ClientsPage";
import AddClientPage from "./components/ClientPage/AddClientsPage";
import RolePermissionsPage from "./components/Roles/RolePermissionsPage";
import EditRolePage from "./components/Roles/EditRolePage";
import PagesListPage from "./components/Pages/PagesListPage";
import CreatePagePage from "./components/Pages/CreatePagePage";
import EditClientPage from "./components/ClientPage/EditClientPage";
import RFQListingPage from "./components/RFQ/RFQListingPage";
import CreateRFQPage from "./components/RFQ/CreateRFQPage";
import AddProductDetailsPage from "./components/RFQ/AddProductDetailsPage";
import EditRFQPage from "./components/RFQ/EditRFQPage";
import PlantListingPage from "./components/Plant/PlantListing";
import CreatePlantPage from "./components/Plant/CreatePlantPage";
import EditPlantPage from "./components/Plant/EditPlantPage";
import RawMaterialListingPage from "./components/RAWMaterial/RawMatrialListingPage";
import CreateRawMaterialPage from "./components/RAWMaterial/CreateRawMaterialPage";
import EditRawMaterialPage from "./components/RAWMaterial/EditRawMaterialPage";
import ForgotPassword from "./components/Login/ForgotPassword";
import ResetPassword from "./components/Login/ResetPassword";
import FirstTimeLogin from "./components/Login/FirstTimeLogin";
import useAppStore from "./zustandStore";
import axios from "axios";
import Cookies from "js-cookie";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import axiosInstance from "./axiosConfig";
import RFQDetailsPage from "./components/RFQ/RfqDetailPage";
import AddProductPage from "./components/RFQ/AddProductsPage";
import SkuDetailPage from "./components/RFQ/SkuDetailPage";

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const { setUser, setRole, setIsLoggedIn, fetchPermissions } = useAppStore();

  // List of paths where sidebar should not be shown
  const noSidebarPaths = ['/login', '/forgot/password', '/reset/password', '/first-time/login'];

  // Check if current path is in the noSidebarPaths list
  const showSidebar = !noSidebarPaths.includes(location.pathname);

  // Toggle sidebar function
  const toggleSidebar = (forceState = null) => {
    setIsSidebarOpen(forceState !== null ? forceState : !isSidebarOpen);
  };


  // Restore the user state on app initialization
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      axiosInstance.get("/auth/validate-token", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (response.data.success) {
            // Restore user state
            setUser(response.data.user);
            setRole({ role_id: response.data.user.roleid, role_name: response.data.user.role_name });
            setIsLoggedIn(true);
            fetchPermissions();
          } else {

            Cookies.remove("token");
            localStorage.removeItem("appState");
          }
        })
        .catch((error) => {
          console.error("Error validating token:", error);
          Cookies.remove("token");
          localStorage.removeItem("appState");
        });
    }
  }, [setUser, setRole, setIsLoggedIn, fetchPermissions]);

  return (
    <div className={showSidebar ? "h-screen flex" : "h-screen"}>
      {/* Render Sidebar only if showSidebar is true */}
      {showSidebar && (
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      {/* Main Content */}
      <main className="bg-[#e1e1f5] flex-1 overflow-auto w-full">
        <Routes>
          <Route path="/" element={<RFQListingPage />} />
          <Route path="/login" element={<PattonLoginPage />} />
          <Route path="/forgot/password" element={<ForgotPassword />} />
          <Route path="/reset/password" element={<ResetPassword />} />
          <Route path="/first-time/login" element={<FirstTimeLogin />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/users" element={<UserPage />} />
          <Route path="/addUser" element={<AddUser />} />

          {/* Role module */}
          <Route path="/Roles" element={<RolesPage />} />
          <Route path="/AddRole" element={<AddRolePage />} />
          <Route path="/roles/edit/:id" element={<EditRolePage />} />


          {/* <Route path="/manage-permissions" element={<ManagePermissionsPage />} />
            <Route path="/role-permissions/:roleId" element={<RolePermissionsPage />} /> */}

          {/* Page module */}
          <Route path="/pages" element={<PagesListPage />} />
          <Route path="/create-page" element={<CreatePagePage />} />

          {/* Client module */}
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/client/:id" element={<EditClientPage />} />
          <Route path="/add-client" element={<AddClientPage />} />

          {/* RFQ module */}
          {/* <Route path="/RFQ" element={<RFQListingPage />} /> */}
          <Route path="/create_RFQ" element={<CreateRFQPage />} />
          <Route path="/addProductDetails/:id" element={<AddProductDetailsPage />} />
          <Route path="/create_RFQ" element={<CreateRFQPage />} />
          <Route path="/edit_RFQ/:id" element={<EditRFQPage />} />
          <Route path="/rfq-detail/:rfqId" element={<RFQDetailsPage />} />
          <Route path="/sku-details/:rfqId" element={<AddProductPage/>} />
          <Route path="/sku-cost/:rfqId/:skuId" element={<SkuDetailPage/>} />

          {/* Plant module */}
          <Route path="/plants" element={<PlantListingPage />} />
          <Route path="/create-plant" element={<CreatePlantPage />} />
          <Route path="/edit-plant/:id" element={<EditPlantPage />} />

          {/* Raw material module */}
          <Route path="/raw-materials" element={<RawMaterialListingPage />} />
          <Route path="/create-raw-material" element={<CreateRawMaterialPage />} />
          <Route path="/edit-raw-material/:id" element={<EditRawMaterialPage />} />
        </Routes>
      </main>
    </div>
    // </Router>
  );
};

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
