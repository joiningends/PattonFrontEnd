import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Users2,
  BookUserIcon,
  UserRoundPen,
  ContainerIcon,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import useAppStore from "../../zustandStore";

export default function Sidebar({ isOpen, toggleSidebar }) {

  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State to manage Settings submenu visibility

  // State management store variables
  const { isLoggedIn, logout, permission } = useAppStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        toggleSidebar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [toggleSidebar]);

  // Handle logout
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the token from cookies
    Cookies.remove("token");

    //  manage state
    logout();

    // Redirect to the login page
    navigate("/login");
  };


  // const handleLogin = () => {
  //   navigate("/");
  // }

  const allMenuItems = [
    // { icon: LayoutDashboard, label: "RFQ management", path: "/" },
    // { icon: Users2, label: "User management", path: "/users" },
    // { icon: BookUserIcon, label: "Client management", path: "/clients" },
    // { icon: UserRoundPen, label: "Role management", path: "/Roles" },
    { icon: LayoutDashboard, label: "RFQ management", path: "/", pageName: "RFQ management" },
    { icon: Users2, label: "User management", path: "/users", pageName: "User management" },
    { icon: BookUserIcon, label: "Client management", path: "/clients", pageName: "Client management" },
    { icon: UserRoundPen, label: "Role management", path: "/Roles", pageName: "Role management" },
    // { icon: Clock, label: "Time log", path: "/time-log" },
    // { icon: GanttChartSquare, label: "Resource mgmt", path: "/resource-management" },
    // { icon: FileIcon, label: "Project template", path: "/project-template" },
  ];

  const allSettingsItems = [
    { icon: FolderKanban, label: "Factory Plants", path: "/plants", pageName: "Plant management" },
    { icon: ContainerIcon, label: "Raw material", path: "/raw-materials", pageName: "Raw material" },
  ];

  // Filter menu items based on permissions
  const filteredMenuItems = allMenuItems.filter((item) => {
    const page = permission?.find((p) => p.page_name === item.pageName);
    return page;
  });

  const filteredSettingsItems = allSettingsItems.filter((item) => {
    const page = permission?.find((p) => p.page_name === item.pageName);
    return page;
  });

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => toggleSidebar(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white shadow-lg rounded-full transition-all duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-[#000060]" />
        ) : (
          <Menu className="h-6 w-6 text-[#000060]" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`h-screen bg-gradient-to-b from-[#000060] via-[#000050] to-[#000040] shadow-2xl flex flex-col fixed lg:relative transition-all duration-300 z-50
          ${isOpen ? "w-80 left-0" : "w-0 -left-80 lg:w-80 lg:left-0"}`}
      >
        {/* Sidebar Header */}
        <div className="h-28 flex items-center justify-center px-6 border-b border-[#000060] bg-[#000060]">
          <div className="text-white font-bold text-3xl tracking-wider border-2 border-white px-4 py-1 bg-[#000060]">
            PATTON
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
          {filteredMenuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`group flex items-center justify-between px-5 py-3.5 rounded-xl relative overflow-hidden
                ${location.pathname === item.path
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-blue-100 hover:bg-white hover:text-[#000060]"
                }`}
            >
              <div className="flex items-center gap-4 z-10 relative">
                <item.icon
                  className={`h-5 w-5 ${location.pathname === item.path
                    ? "text-white"
                    : "text-blue-300 group-hover:text-[#000060]"
                    }`}
                />
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight
                className={`h-4 w-4 ${location.pathname === item.path
                  ? "text-white"
                  : "text-blue-300 group-hover:text-[#000060]"
                  }`}
              />
            </Link>
          ))}

          {/* Settings Submenu */}
          <div>
            {filteredSettingsItems.length > 0 && (
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`group flex items-center justify-between px-5 py-3.5 rounded-xl w-full text-blue-100 hover:bg-white hover:text-[#000060] transition-all duration-300 relative overflow-hidden`}
              >
                <div className="flex items-center gap-4 z-10 relative">
                  <Settings
                    className={`h-5 w-5 ${isSettingsOpen ? "text-white" : "text-blue-300"
                      }`}
                  />
                  <span className="font-medium">Settings</span>
                </div>
                {isSettingsOpen ? (
                  <ChevronDown className="h-4 w-4 text-blue-300 group-hover:text-[#000060]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-blue-300 group-hover:text-[#000060]" />
                )}
              </button>
            )}


            {/* Settings Submenu Items */}
            {isSettingsOpen && (
              <div className="pl-8 mt-2 space-y-2">
                {filteredSettingsItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className={`group flex items-center justify-between px-5 py-3.5 rounded-xl relative overflow-hidden
                      ${location.pathname === item.path
                        ? "bg-white/10 text-white shadow-lg"
                        : "text-blue-100 hover:bg-white hover:text-[#000060]"
                      }`}
                  >
                    <div className="flex items-center gap-4 z-10 relative">
                      <item.icon
                        className={`h-5 w-5 ${location.pathname === item.path
                          ? "text-white"
                          : "text-blue-300 group-hover:text-[#000060]"
                          }`}
                      />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 ${location.pathname === item.path
                        ? "text-white"
                        : "text-blue-300 group-hover:text-[#000060]"
                        }`}
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Support & Logout */}
        <div className="p-6 border-t border-white/10 space-y-3">
          <a
            href="#"
            className="group flex items-center justify-between px-5 py-3.5 rounded-xl text-blue-100 hover:bg-white hover:text-[#000060] transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex items-center gap-4 z-10 relative">
              <HelpCircle className="h-5 w-5 text-blue-300 group-hover:text-[#000060] transition-colors duration-300" />
              <span className="font-medium transition-all duration-300 group-hover:translate-x-1">
                Support
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-blue-300 group-hover:text-[#000060] transition-all duration-300 group-hover:translate-x-1" />
          </a>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="group flex items-center justify-between px-5 py-3.5 rounded-xl w-full text-blue-100 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex items-center gap-4 relative z-10">
                <LogOut className="h-5 w-5 text-blue-300 group-hover:text-red-300 transition-colors duration-300" />
                <span className="font-medium group-hover:text-red-100 transition-colors duration-300 group-hover:translate-x-1">
                  Logout
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-blue-300 group-hover:text-red-300 transition-all duration-300 group-hover:translate-x-1 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="group flex items-center justify-between px-5 py-3.5 rounded-xl w-full text-blue-100 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex items-center gap-4 relative z-10">
                <LogOut className="h-5 w-5 text-blue-300 group-hover:text-green-300 transition-colors duration-300" />
                <span className="font-medium group-hover:text-green-100 transition-colors duration-300 group-hover:translate-x-1">
                  Login
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-blue-300 group-hover:text-green-300 transition-all duration-300 group-hover:translate-x-1 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-800  to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}