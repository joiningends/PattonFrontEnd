"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  Check,
  Filter,
  Info,
  PackagePlusIcon,
  Flashlight,
  UserRoundPlusIcon,
  ScrollIcon,
  CirclePauseIcon,
  SheetIcon,
  Satellite,
  FastForward,
  CircleArrowRightIcon,
  CopyCheckIcon
} from "lucide-react";
import axios from "axios"
import axiosInstance from "../../axiosConfig"
import useAppStore from "../../zustandStore";
import { Tooltip } from "react-tooltip";
import { comment } from "postcss";

// Icons (you may need to install an icon library or use SVGs)
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const FileTextIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)
const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
)
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export default function RFQListingPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rfqs, setRFQs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isApproveAndSentToReviewModalOpen, setIsApproveAndSentToReviewModalOpen] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState(null)
  const [approveComment, setApproveComment] = useState("")
  const [selectedPlants, setSelectedPlants] = useState([])
  const [engineerTypeForReview, setEngineerTypeForReview] = useState();
  const [plants, setPlants] = useState([])
  const [rejectReasons, setRejectReasons] = useState([])
  const [rejectComment, setRejectComment] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const rfqsPerPage = 10
  const [statusDescription, setStatusDescription] = useState(null)
  const [states, setStates] = useState([]);
  const [filterState, setFilterState] = useState("All");
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [npdEngineer, setNPDEngineer] = useState([]);
  const [selectedNPDEngineer, setSelectedNPDEngineer] = useState(null);
  const [approveSentToNPDComment, setApproveSentToNPDComment] = useState("");
  const [isRejectPlantHeadModalOpen, setIsRejectPlantHeadModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [vendorEngineers, setVendorEngineers] = useState([]);
  const [selectedVendorEngineer, setSelectedVendorEngineer] = useState(null);
  const [vendorModalIsOpen, setVendorModalIsOpen] = useState(false);
  const [isRejectVendorModalOpen, setIsRejectVendorModalOpen] = useState(false);
  const [processEngineers, setProcessEngineers] = useState([]);
  const [processModalIsOpen, setProcessModalIsOpen] = useState(false);
  const [selectedProcessEngineer, setSelectedProcessEngineer] = useState(null);
  const [openSendRfqtoPlantHeadByProcessModal, setopenSendRfqtoPlantHeadByProcessModal] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [selectStatus, setSelectedStatus] = useState(null);
  const [isSendtoCommercialTeamModalOpen, setIsSendtoCommercialTeamModalOpen] = useState(false);
  const [commercialTeam, setCommercialTeam] = useState([]);
  const [selectedCommercialTeam, setSelectedCommercialTeam] = useState(null);
  const [openSendRfqtoCommercialManagerModal, setOpenSendRfqtoCommercialManagerModal] = useState(false);
  const [sendType, setSendType] = useState(null);
  const [openSendRfqtoClientModal, setOpenSendRfqtoClientModal] = useState(false);
  const [sku, setSku] = useState([]);
  const [openCloseRfqbyClientApprovalModal, setOpenCloseRfqbyClientApprovalModal] = useState(false);
  // const { isLoggedIn, user, role, permission } = useAppStore();

  const { isLoggedIn, user, role, permission, isLoading: isStoreLoading } = useAppStore();

  const appState = localStorage.getItem("appState");

  // Parse the JSON string to get an object
  const parsedState = JSON.parse(appState);

  const roleId = parsedState?.user?.roleid || null;
  const userId = parsedState?.user?.id || null;


  if (isStoreLoading) {
    return <div>Loading user data...</div>;
  }

  if (!parsedState?.user?.roleid) {
    return <div>Error: User role not found</div>;
  }

  // console.log("User State: ", user);
  // console.log("User Role: ", role);
  // console.log("User permission: ", permission);

  // if (user.id == 8)


  // fetch SKU by rfqId
  const fetchSkus = async (rfqId) => {
    setIsLoading(true);
    console.log("Hi : ", rfqId);
    try {

      const response = await axiosInstance.get(`/sku/getsku/${rfqId}`);

      console.log(response.data.data);

      if (response.data.success) {
        setSku(response.data.data);
      } else {
        setError("Failed to fetch SKU data.");
      }
    } catch (error) {
      setError("Error fetching SKU data: ", error);
    }
    setIsLoading(false);
  };


  // fetch NPD engineers
  const fetchNPDengineers = async (rfqId) => {
    try {
      const response = await axiosInstance.get(`/users/get-npdengineer/${userId}`);
      if (response.data.success) {
        console.log("NPD engineer's: ", response.data.data);
        setNPDEngineer(response.data.data);
      } else {
        setError("Failed to fetch NPD engineer");
      }
    } catch (error) {
      setError("Error fetching NPD engineers: " + (error.response?.data?.message || error.message));
    }
  }


  // fetch Vendor engineers
  const fetchVendorEngineer = async (rfqId) => {
    try {
      const response = await axiosInstance.get(`/users/get-vendoreng/${userId}`);
      if (response.data.success) {
        console.log("Vendor engineer's: ", response.data.data);
        setVendorEngineers(response.data.data);
      } else {
        setError("Failed to fetch NPD engineer");
      }
    } catch (error) {
      setError("Error fetching NPD engineers: " + (error.response?.data?.message || error.message));
    }
  }


  const fetchProcessEngineer = async (rfqId) => {
    try {
      const response = await axiosInstance.get(`/users/get-processeng/${userId}`);
      if (response.data.success) {
        console.log("Process engineer: ", response.data.data);
        setProcessEngineers(response.data.data);
      } else {
        setError("Failed to fetch Process engineer.");
      }
    } catch (error) {
      setError("Error fetching Process engineer: " + (error.response?.data?.message || error.message))
    }
  }

  const fetchCommercialTeam = async () => {
    try {
      const response = await axiosInstance.get('/users/get-commercial-team');
      if (response.data.success) {
        console.log("Commercial Team: ", response.data.data);
        setCommercialTeam(response.data.data);
      } else {
        setError("Failed to fetch Commercial team");
      }
    } catch (error) {
      setError("Error fetching commercial team: " + (error.response?.data.message || error.message))
    }
  }


  const fetchStates = async () => {
    try {
      const response = await axiosInstance.get("/rfq/states/");
      if (response.data.success) {
        console.log("States: ", response.data.data);
        setStates(response.data.data);
      } else {
        setError("Failed to fetch states");
      }
    } catch (error) {
      setError("Error fetching states: " + (error.response?.data?.message || error.message));
    }
  };

  const handleStateSelect = (state) => {
    setFilterState(state);
    setIsStateDropdownOpen(false);
  };

  // Get the page permissions
  let pagePermission = null;
  if (permission) {
    pagePermission = permission?.find((p) => p.page_id === 6);
    console.log(pagePermission.permissions);
  }

  const rejectReasonOptions = ["Capability", "Volume", "Material", "Customer Background check", "Others"]

  const fetchRFQs = useCallback(async () => {
    setIsLoading(true)
    let query = ``;
    if (roleId == 8) {
      query = `http://localhost:3000/api/rfq/getrfq-planthead`;
    } else {
      query = `http://localhost:3000/api/rfq/getrfq`
    }
    try {
      console.log(user.id);
      const response = await axiosInstance.post(query, {
        p_user_id: user.id, // This should be dynamically set based on the logged-in user
        p_role_id: roleId,
        p_rfq_id: null,
        p_client_id: null,
      })
      if (response.data.success) {
        setRFQs(response.data.data);
        console.log("RFQ: ", response.data.data);
      } else {
        setError("Failed to fetch RFQs")
      }
    } catch (error) {
      setError("Error fetching RFQs: " + (error.response?.data?.message || error.message))
    }
    setIsLoading(false)
  }, [])



  // fetch the RFQs for NPD eng.
  const fetchRFQsforUserRole = useCallback(async () => {
    setIsLoading(true)
    // console.log("RoleID: ", role.role_id);

    console.log("RoleID: ", parsedState?.user?.roleid);


    if (!parsedState?.user?.roleid) {
      setError("User role not available");
      setIsLoading(false);
      return;
    }
    let assigned_by = null;
    if (roleId === 19) assigned_by = 15;
    else if (roleId === 21) assigned_by = 15;
    else if (roleId === 20) assigned_by = 15;
    else if (roleId === 22) assigned_by = 15;
    else if (roleId === 23) assigned_by = 22;
    try {
      console.log("RoleID: ", roleId);
      console.log("Assignedby: : ", assigned_by);

      const response = await axiosInstance.get(`http://localhost:3000/api/rfq/getrfqbyuserrole/${user.id}?p_assigned_to_roleId=${roleId}&p_assigned_by_roleId=${assigned_by}`)

      console.log("RFQ - ", response);
      if (response.data.success) {
        setRFQs(response.data.data);
        console.log("RFQ: ", response.data.data);
      } else {
        setError("Failed to fetch RFQs")
      }
    } catch (error) {
      setError("Error fetching RFQs: " + (error.response?.data?.message || error.message))
    }
    setIsLoading(false)
  }, [])


  const fetchPlants = useCallback(async () => {
    try {
      const response = await axiosInstance.get("http://localhost:3000/api/plant")
      if (response.data.success) {
        console.log("Plants: ", response.data.data);

        setPlants(response.data.data);
      } else {
        setError("Failed to fetch plants")
      }
    } catch (error) {
      setError("Error fetching plants: " + (error.response?.data?.message || error.message))
    }
  }, [])

  useEffect(() => {
    if (!roleId) return;

    if (roleId === 19 || roleId === 21 || roleId === 20 || roleId === 22 || roleId === 23) {
      fetchRFQsforUserRole().catch((err) => {
        console.error("Error in fetchRFQsforUserRole:", err)
        setError("Failed to load RFQs. Please try again later.")
      })
    } else {
      fetchRFQs().catch((err) => {
        console.error("Error in fetchRFQs:", err)
        setError("Failed to load RFQs. Please try again later.")
      })
    }
    fetchPlants().catch((err) => {
      console.error("Error in fetchPlants:", err)
      setError("Failed to load plants. Please try again later.")
    })
    fetchStates().catch((err) => {
      console.error("Error in fetchState:", err)
      setError("Failed to load states. Please try again later.")
    })
    // fetchNPDengineers().catch((err) => {
    //   console.error("Error in fetchNPDengineers:", err)
    //   setError("Failed to load NPD engineer. Please try again later.")
    // })
  }, [fetchRFQs, fetchPlants]);

  useEffect(() => {
    console.log("isOpen state:", isOpen); // Debugging line
  }, [isOpen]);



  // Assign RFQ 
  const handleMultiAssignRFQ = async () => {
    setIsLoading(true);
    setError(null);
    let successCount = 0;
    let errorMessages = [];

    try {
      // Assign to NPD Engineer if selected
      if (selectedNPDEngineer) {
        try {
          const response = await axiosInstance.post("/rfq/assign", {
            p_rfq_id: selectedRFQ.rfq_id,
            p_assigned_to_id: selectedNPDEngineer.user_id,
            p_assigned_to_roleid: 19, // NPD Engineer role
            p_assigned_by_id: user.id,
            p_assigned_by_roleid: 15, // Plant Head role
            p_status: true,
            p_comments: approveComment,
          });
          if (response.data.success) successCount++;
        } catch (error) {
          errorMessages.push(`NPD Engineer: ${error.response?.data?.message || error.message}`);
        }
      }

      // Assign to Vendor Engineer if selected
      if (selectedVendorEngineer) {
        try {
          const response = await axiosInstance.post("/rfq/assign", {
            p_rfq_id: selectedRFQ.rfq_id,
            p_assigned_to_id: selectedVendorEngineer.user_id,
            p_assigned_to_roleid: 21, // Vendor Engineer role
            p_assigned_by_id: user.id,
            p_assigned_by_roleid: 15, // Plant Head role
            p_status: true,
            p_comments: approveComment,
          });
          if (response.data.success) successCount++;
        } catch (error) {
          errorMessages.push(`Vendor Engineer: ${error.response?.data?.message || error.message}`);
        }
      }

      // Assign to Process Engineer if selected
      if (selectedProcessEngineer) {
        try {
          const response = await axiosInstance.post("/rfq/assign", {
            p_rfq_id: selectedRFQ.rfq_id,
            p_assigned_to_id: selectedProcessEngineer.user_id,
            p_assigned_to_roleid: 20, // Process Engineer role
            p_assigned_by_id: user.id,
            p_assigned_by_roleid: 15, // Plant Head role
            p_status: true,
            p_comments: approveComment,
          });
          if (response.data.success) successCount++;
        } catch (error) {
          errorMessages.push(`Process Engineer: ${error.response?.data?.message || error.message}`);
        }
      }

      if (successCount > 0) {
        setSuccessMessage(`Successfully assigned to ${successCount} Engineer(s)`);
        fetchRFQs();
        setIsOpen(false);
        setSelectedNPDEngineer(null);
        setSelectedVendorEngineer(null);
        setSelectedProcessEngineer(null);
        setApproveComment("");
        setTimeout(() => setSuccessMessage(""), 3000);
      }

      if (errorMessages.length > 0) {
        setError(`Some assignments failed: ${errorMessages.join('; ')}`);
      }

    } catch (error) {
      setError("Error in assignment process: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };


  const handleAssignRFQByNPDeng = async () => {

    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/rfq/save-comments", {
        user_id: user.id,
        rfq_id: selectedRFQ.rfq_id,
        state_id: 11,                 // Hardcode state for RFQ sent to vendor engineer.
        comments: approveComment,
      });

      console.log("Save comments response: ", response);


      const stateResponse = await axiosInstance.post("/rfq/update/rfq-state/", {
        rfq_id: selectedRFQ.rfq_id,
        rfq_state: 11,                 // Hardcode state for RFQ sent to vendor engineer.
      });

      if (response.data.success && stateResponse.data.success) {
        setSuccessMessage("RFQ assigned successfully to vendor engineer!");
        fetchRFQsforUserRole();
        setVendorModalIsOpen(false);
        setSelectedVendorEngineer([]);
        setApproveComment("");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Failed to assign RFQ");
      }

    } catch (error) {
      setError("Error assigning RFQ");
    } finally {
      setIsLoading(false)
    }
  };


  const handleAssignToCommercialTeam = async () => {
    setIsLoading(true);
    setError(null);
    try {

      const assignResponse = await axiosInstance.post("/rfq/assign", {
        p_rfq_id: selectedRFQ.rfq_id,
        p_assigned_to_id: selectedCommercialTeam.userid,
        p_assigned_to_roleid: 22,           // Commercial team
        p_assigned_by_id: userId,
        p_assigned_by_roleid: 15,           // Plant Head role
        p_status: true,
        p_comments: approveComment,
      });

      console.log("Assign response: ", assignResponse);

      if (assignResponse.data.success) {
        setSuccessMessage("RFQ assigned successfully to Commercial Team.");
        fetchRFQs();
        setIsSendtoCommercialTeamModalOpen(false);
        setSelectedCommercialTeam(null);
        setApproveComment("");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Failed to assign RFQ");
      }
    } catch (error) {
      setError("Error sending to commercial team");
    } finally {
      setIsLoading(false);
    }
  }


  const handleAssignRFQByVendorEng = async () => {

    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/rfq/save-comments", {
        user_id: user.id,
        rfq_id: selectedRFQ.rfq_id,
        state_id: 13,                 // Hardcode state for RFQ sent to vendor engineer.
        comments: approveComment,
      });

      console.log("Save comments reponse: ", response);

      const stateResponse = await axiosInstance.post("/rfq/update/rfq-state/", {
        rfq_id: selectedRFQ.rfq_id,
        rfq_state: 13,                 // Hardcode state for RFQ sent to vendor engineer.
      });

      const autoCalResponse = await axiosInstance.post("/rfq/auto-calculate", {
        p_rfq_id: selectedRFQ.rfq_id
      });

      if (response.data.success && stateResponse.data.success && autoCalResponse.data.success) {
        setSuccessMessage("Auto calculation done and RFQ assigned successfully to process engineer!");
        fetchRFQsforUserRole();
        setProcessModalIsOpen(false);
        setSelectedProcessEngineer([]);
        setApproveComment("");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Failed to assign RFQ");
      }

    } catch (error) {
      setError("Error assigning RFQ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignToPlantHeadByProcessEngineer = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/rfq/save-comments", {
        user_id: user.id,
        rfq_id: selectedRFQ.rfq_id,
        state_id: 14,                 // Hardcode state for RFQ sent to vendor engineer.
        comments: approveComment,
      });

      console.log("Save comments reponse: ", response);

      const stateResponse = await axiosInstance.post("/rfq/update/rfq-state/", {
        rfq_id: selectedRFQ.rfq_id,
        rfq_state: 14,                 // Hardcode state for RFQ sent to vendor engineer.
      });

      console.log("Update response", response);

      if (response.data.success && stateResponse.data.success) {
        setSuccessMessage("Assigned to plant head for review.");
        setopenSendRfqtoPlantHeadByProcessModal(false);
        setSelectedRFQ(null);
        fetchRFQsforUserRole();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Failed to assign to plant head");
      }
    } catch (error) {
      setError("Error assigning to plant head.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleAssignToCommercialManager = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (sendType == 1) {
        // Sending to Commercial Manager
        response = await axiosInstance.post("/rfq/assign", {
          p_rfq_id: selectedRFQ.rfq_id,
          p_assigned_to_id: 29,               // Default Commercial Manager userId
          p_assigned_to_roleid: 23,           // Commercial Manager
          p_assigned_by_id: userId,
          p_assigned_by_roleid: 22,           // Commercial Team
          p_status: true,
          p_comments: approveComment,
        })

        if (response.data.success) {
          setSuccessMessage("RFQ assigned successfully to Commercial Manager.");
          fetchRFQsforUserRole();
          setOpenSendRfqtoCommercialManagerModal(false);
          setApproveComment("");
          setSendType(null);
          setTimeout(() => setSuccessMessage(""), 3000);
        } else {
          setError("Failed to assign RFQ");
        }

      } else if (sendType == 2) {
        // Sending back to Account manager
        response = await axiosInstance.post("/rfq/save-comments", {
          user_id: userId,
          rfq_id: selectedRFQ.rfq_id,
          state_id: 19,                 // RFQ sent to Account manager for review
          comments: approveComment,
        });

        if (response.data.success) {
          const stateResponse = await axiosInstance.post("/rfq/update/rfq-state/", {
            rfq_id: selectedRFQ.rfq_id,
            rfq_state: 19,                 // RFQ sent to Account manager for review
          });

          if (stateResponse.data.success) {
            setSuccessMessage("RFQ sent to Account manager for review.");
            fetchRFQsforUserRole();
            setOpenSendRfqtoCommercialManagerModal(false);
            setApproveComment("");
            setSendType(null);
            setTimeout(() => setSuccessMessage(""), 3000);
          } else {
            setError("Failed to assign RFQ");
          }
        }
      } else {
        setError("Error Assigning this RFQ.");
      }

    } catch (error) {
      setError("Error Assigning this RFQ");
    } finally {
      setIsLoading(false);
    }
  }


  // const filteredRFQs = rfqs.filter(
  //   (rfq) =>
  //     rfq.rfq_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     rfq.client_name.toLowerCase().includes(searchTerm.toLowerCase()),
  // )

  const filteredRFQs = rfqs.filter((rfq) => {
    const matchesSearchTerm =
      rfq.rfq_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.client_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState =
      filterState === "All" || rfq.state_description === filterState;

    return matchesSearchTerm && matchesState;
  });

  const indexOfLastRFQ = currentPage * rfqsPerPage
  const indexOfFirstRFQ = indexOfLastRFQ - rfqsPerPage
  const currentRFQs = filteredRFQs.slice(indexOfFirstRFQ, indexOfLastRFQ)
  const totalPages = Math.ceil(filteredRFQs.length / rfqsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleEdit = (rfqId) => {
    navigate(`/edit_RFQ/${rfqId}`)
  }

  const handleDelete = async (rfqId) => {
    if (window.confirm("Are you sure you want to delete this RFQ?")) {
      try {
        const response = await axiosInstance.delete(`http://localhost:3000/api/rfq/delete/${rfqId}`)
        if (response.data.success) {
          fetchRFQs()
          setSuccessMessage("RFQ deleted successfully")
        } else {
          setError("Failed to delete RFQ. Please try again.")
        }
      } catch (error) {
        setError("Error deleting RFQ: " + (error.response?.data?.message || error.message))
      }
    }
  }


  // handle pause rfq modal
  const handlePauseRFQModal = async (rfq) => {
    setSelectedRFQ(rfq);
    setIsPauseModalOpen(true);
  }

  // handle pause RFQ 
  const handlePauseRFQ = async () => {
    setIsLoading(true);
    setError("");

    const status = selectedRFQ.rfq_status ? false : true;
    console.log("selectedRFQ: ", selectedRFQ);

    try {
      const response = await axiosInstance.get(`/rfq/update-rfq/status/${selectedRFQ.rfq_id}/${status}`);
      console.log("Status update response: ", response);

      const commentResponse = await axiosInstance.post("/rfq/save-comments", {
        user_id: user.id,
        rfq_id: selectedRFQ.rfq_id,
        state_id: status ? selectedRFQ.state_id : 100,                 // Hardcode state for RFQ paused.
        comments: approveComment,
      });

      if (response.data.success && commentResponse.data.success) {
        setSuccessMessage("RFQ status updated successfully.");
        fetchRFQs();
        setIsPauseModalOpen(false);
        setSelectedRFQ(null);
        setSelectedStatus(null);
        setApproveComment("");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      setError("Error pausing RFQ.");
    } finally {
      setIsLoading(false)
    }
  };

  const openApproveModal = (rfq) => {
    setSelectedRFQ(rfq)
    setIsApproveModalOpen(true)
  }

  const openSendtoCommercialTeamModal = (rfq) => {
    fetchCommercialTeam();
    setSelectedRFQ(rfq);
    setIsSendtoCommercialTeamModalOpen(true);
  }

  const openRejectModal = (rfq) => {
    setSelectedRFQ(rfq)
    setIsRejectModalOpen(true)
  }

  const openApprvalModalForReview = (rfq) => {
    setSelectedRFQ(rfq);
    setIsApproveAndSentToReviewModalOpen(true);
  }


  const openApproveAssignNPDengModal = (rfq) => {
    setSelectedRFQ(rfq);
    fetchNPDengineers(rfq.rfq_id);
    fetchVendorEngineer(rfq.rfq_id);
    fetchProcessEngineer(rfq.rfq_id);
    setIsOpen(true);
  }


  const openRejectAssignNPDengModal = (rfq) => {
    setSelectedRFQ(rfq);
    setIsRejectPlantHeadModalOpen(true);
  }

  const openApproveAssignVendorengModal = (rfq) => {
    setSelectedRFQ(rfq);
    setVendorModalIsOpen(true);
  }

  const openApproveAssignProcessengModal = (rfq) => {
    setSelectedRFQ(rfq);
    setProcessModalIsOpen(true);
  }

  const openSendRfqtoPlantHeadByProcess = (rfq) => {
    setSelectedRFQ(rfq);
    setopenSendRfqtoPlantHeadByProcessModal(true);
  }

  const openSendRfqtoCommercialManager = (rfq, send_type) => {
    setSelectedRFQ(rfq);
    setOpenSendRfqtoCommercialManagerModal(true);
    setSendType(send_type);
    // console.log("LLOS: ", send_type);
  }

  const RfqDetailedInfo = (rfq) => {
    navigate(`/rfq-detail/${rfq.rfq_id}`);
  };

  const isApproveValid = selectedPlants.length > 0 && approveComment.trim() !== ""
  const isRejectValid = rejectReasons.length > 0 && rejectComment.trim() !== ""

  const handleApprove = async () => {
    if (!isApproveValid) {
      setError("Please select at least one plant and add a comment.")
      return
    }
    try {
      const response = await axiosInstance.post("http://localhost:3000/api/rfq/approve", {
        rfq_id: selectedRFQ.rfq_id,
        user_id: user.id,
        state_id: 2,
        plant_ids: selectedPlants,            // array of plants 
        comments: approveComment || null,
      })
      if (response.data.success) {
        fetchRFQs()
        setIsApproveModalOpen(false)
        setSelectedRFQ(null)
        setSelectedPlants([])
        setApproveComment("")
        setSuccessMessage("RFQ approved successfully")
      } else {
        setError("Failed to approve RFQ. Please try again.")
      }
    } catch (error) {
      setError("Error approving RFQ: " + (error.response?.data?.message || error.message))
    }
  }

  const handleSendtoReview = async (e) => {
    console.log("called me");
    if (!engineerTypeForReview || !approveComment) {
      setError("Please fill all the required fields.");
      return;
    }

    try {

      let state = null;
      console.log("Etype: ", engineerTypeForReview);
      switch (engineerTypeForReview) {
        case "NPD": state = 15; break;
        case "VDE": state = 16; break;
        case "PE": state = 17; break;
        default:
          setError("Invalid engineer type selected");
          return;
      }

      console.log("state: ", state);

      const [updateStateResponse, insertCommentResponse] = await Promise.all([
        axiosInstance.post("/rfq/update/rfq-state/", {
          rfq_id: selectedRFQ.rfq_id,
          rfq_state: state
        }),
        axiosInstance.post("/rfq/save-comments/", {
          user_id: userId,
          rfq_id: selectedRFQ.rfq_id,
          state_id: state,
          comments: approveComment
        })
      ]);

      console.log("response1: ", updateStateResponse);
      console.log("response2: ", insertCommentResponse);


      if (updateStateResponse.data.success && insertCommentResponse.data.success) {
        fetchRFQs();
        setIsApproveAndSentToReviewModalOpen(false);
        setSelectedRFQ(null);
        setEngineerTypeForReview("");
        setApproveComment("");
        setError("");
        setSuccessMessage("RFQ sent successfully for review.");
        // Consider adding a callback here to refresh parent component state
      } else {
        setError("Failed to complete the review request.");
      }
    } catch (error) {
      setError("Failed to send for review. Please try again.");
      console.error("Review submission error:", error);
    }
  }


  const handleReject = async () => {
    if (!isRejectValid) {
      setError("Please select at least one reason and add a comment.")
      return
    }
    try {
      const response = await axiosInstance.post("http://localhost:3000/api/rfq/approve", {
        rfq_id: selectedRFQ.rfq_id,
        user_id: 3, // This should be dynamically set based on the logged-in user
        state_id: 0,
        plant_id: null,
        comments: rejectComment || null,
      })
      if (response.data.success) {
        fetchRFQs()
        setIsRejectModalOpen(false)
        setSelectedRFQ(null)
        setRejectReasons([])
        setRejectComment("")
        setSuccessMessage("RFQ rejected successfully")
      } else {
        setError("Failed to reject RFQ. Please try again.")
      }
    } catch (error) {
      setError("Error rejecting RFQ: " + (error.response?.data?.message || error.message))
    }
  }

  const showStateDescription = (description) => {
    setStatusDescription(description)
  }

  const handleRejectByPlantHead = async () => {
    if (!isRejectValid) {
      setError("Please select at least one reason and add a comment.");
      return;
    }
    try {
      const response = await axiosInstance.post("/rfq/reject/", {
        p_rfq_id: selectedRFQ.rfq_id,
        p_user_id: user.id,
        p_comments: rejectComment || null,
        p_state_id: 10
      });
      if (response.data.success) {
        setSuccessMessage("RFQ rejected by plant head successfully");
        fetchRFQs();
        setIsRejectPlantHeadModalOpen(false);
        setSelectedRFQ(null);
        setRejectReasons([]);
        setRejectComment("");
      }
    } catch (error) {
      setError("Error rejecting RFQ: " + (error.response?.data?.message || error.message));
    }
  }

  const handleRejectByNPDEngineer = async () => {
    if (!isRejectValid) {
      setError("Please select at least one reason and add a comment.");
      return;
    }
    try {
      const response = await axiosInstance.post("/rfq/reject/", {
        p_rfq_id: selectedRFQ.rfq_id,
        p_user_id: user.id,
        p_comments: rejectComment || null,
        p_state_id: 12
      });
      if (response.data.success) {
        setSuccessMessage("RFQ rejected by NPD engineer successfully");
        fetchRFQsforUserRole();
        isRejectVendorModalOpen(false);
        setSelectedRFQ(null);
        setRejectReasons([]);
        setRejectComment("");
      }
    } catch (error) {
      setError("Error rejecting RFQ: " + (error.response?.data?.message || error.message));
    }
  }

  // Trigger function for popup send to client
  const handleSendtoClient = (rfq) => {
    setSelectedRFQ(rfq);
    setOpenSendRfqtoClientModal(true);
  }

  // Handle function for sending ti client (update RFQ state and save comments)
  const handleSendRFQtoClient = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/rfq/save-comments", {
        user_id: userId,
        rfq_id: selectedRFQ.rfq_id,
        state_id: 8,                   // Hardcoded state for Send to client
        comments: approveComment,
      });

      if (response.data.success) {
        const stateResponse = await axiosInstance.post("/rfq/update/rfq-state/", {
          rfq_id: selectedRFQ.rfq_id,
          rfq_state: 8,                 // Hardcoded state for Send to client
        });

        if (stateResponse.data.success) {
          setSuccessMessage("RFQ sent to Client for approval");
          fetchRFQs();
          setOpenSendRfqtoClientModal(false);
          setSelectedRFQ(null);
          setApproveComment("");
          setTimeout(() => setSuccessMessage(""), 3000);
        } else {
          setError("Failed sending to client for approval");
        }
      } else {
        setError("Error: Sending to client for approval");
      }
    } catch (error) {
      setError("Error: Sending this RFQ");
    } finally {
      setIsLoading(false);
    }
  }

  //function to handle open modal for rfq close by client approval
  const handleRFQClose = (rfq) => {
    fetchSkus(rfq.rfq_id);
    setSelectedRFQ(rfq);
    setOpenCloseRfqbyClientApprovalModal(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9] min-h-screen p-4 lg:p-8"
    >
      <header className="mb-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">RFQ Listing</h1>
            <p className="text-[#4b4b80] text-base lg:text-lg">Manage your Request for Quotations</p>
          </div>

          {/* Render the create button as per permissions */}
          {pagePermission && pagePermission.permissions.find((p) => p.permission_id === 4) && (
            <button
              onClick={() => navigate("/create_RFQ")}
              className="w-full lg:w-auto bg-gradient-to-r from-[#000060] to-[#0000a0] text-white px-6 py-3 rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
            >
              <PlusIcon />
              <span className="ml-2">Create RFQ</span>
            </button>
          )}

        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-4 lg:p-6 rounded-xl shadow-lg flex flex-col lg:flex-row justify-between items-stretch space-y-4 lg:space-y-0 lg:space-x-4"
        >
          <div className="relative flex items-center w-full lg:w-96">
            <input
              type="text"
              placeholder="Search RFQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4b4b80]">
              <SearchIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto mt-4 lg:mt-0">
            <div
              className="relative w-full sm:w-72"
              style={{ position: "relative", zIndex: 999 }}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                className="w-full h-full px-4 py-3 bg-[#f0f0f9] text-[#000060] rounded-lg text-sm hover:bg-[#e1e1f5] transition-colors shadow-md hover:shadow-lg flex items-center justify-between"
              >
                <Filter className="mr-2 h-4 w-4" />
                <span>{filterState}</span>
                <ChevronDown className="h-4 w-4" />
              </motion.button>
              <AnimatePresence>
                {isStateDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-[999] w-full mt-2 bg-white rounded-lg shadow-lg"
                    style={{ position: "absolute", minWidth: "200px" }}
                  >
                    <motion.button
                      whileHover={{ backgroundColor: "#f0f0f9" }}
                      onClick={() => handleStateSelect("All")}
                      className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between"
                    >
                      <span>All</span>
                      {"All" === filterState && <Check className="h-4 w-4 text-[#000060]" />}
                    </motion.button>
                    {states.map((state) => (
                      <motion.button
                        key={state.state_id}
                        whileHover={{ backgroundColor: "#f0f0f9" }}
                        onClick={() => handleStateSelect(state.state_description)}
                        className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between"
                      >
                        <span>{state.state_description}</span>
                        {state.state_description === filterState && <Check className="h-4 w-4 text-[#000060]" />}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </header>

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
            <button onClick={() => setSuccessMessage("")} className="text-green-700 hover:text-green-900">
              <XIcon />
            </button>
          </motion.div>
        )}
      </AnimatePresence>


      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#000060]"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-[#2d2d5f]">
              <thead className="text-xs uppercase bg-gradient-to-r from-[#000060] to-[#0000a0] text-white">
                <tr>
                  <th className="px-6 py-4 font-extrabold text-sm">
                    <div className="flex items-center">
                      <FileTextIcon className="mr-2" />
                      RFQ Name
                    </div>
                  </th>
                  <th className="px-6 py-4 font-extrabold text-sm">
                    <div className="flex items-center">Client</div>
                  </th>
                  <th className="px-6 py-4 font-extrabold text-sm">
                    <div className="flex items-center">Active</div>
                  </th>
                  <th className="px-6 py-4 font-extrabold text-sm">
                    <div className="flex items-center">Status</div>
                  </th>
                  <th className="px-6 py-4 font-extrabold text-sm">
                    <div className="flex items-center">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentRFQs.map((rfq, index) => (
                  <motion.tr
                    key={rfq.rfq_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`border-b border-[#e1e1f5] hover:bg-[#f8f8fd] transition-all duration-300 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8fd]"
                      }`}
                  >
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#000060] to-[#0000a0] text-white flex items-center justify-center mr-3 text-sm font-semibold shadow-md">
                          {rfq.rfq_name.charAt(0).toUpperCase()}
                        </div>
                        <span>{rfq.rfq_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{rfq.client_name}</td>
                    <td className="px-6 py-4 flex items-center">
                      {rfq.rfq_status === true ?
                        <div className="flex space-x-2 items-center justify-center">
                          <span className="flex w-2 h-2 bg-lime-500 rounded-full animate-pulse"></span>
                          <div>Active</div>
                        </div>
                        :
                        <div className="flex space-x-2 items-center justify-center">
                          <span className="flex w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                          <div>Paused</div>
                        </div>}</td>
                    <td className="px-6 py-4">
                      {rfq.state_description && (
                        <button
                          onClick={() => showStateDescription(rfq.state_description)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-xs"
                        >
                          Show Status
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">

                        {/* Account manager or admin login */}
                        {(rfq.state_id === 1 && rfq.rfq_status === true) ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openApproveModal(rfq)}
                              className="p-2 text-green-500 hover:text-green-700 transition-colors rounded-full hover:bg-green-100"
                            >
                              <CheckIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openRejectModal(rfq)}
                              className="p-2 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-100"
                            >
                              <XIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => RfqDetailedInfo(rfq)}
                              className="p-2 rounded-full hover:bg-yellow-200"
                              id="rfq-details"
                            >
                              <Info className="w-5 h-5" />
                            </button>
                            <Tooltip anchorSelect="#rfq-details">RFQ Details</Tooltip>
                            <button
                              onClick={() => handlePauseRFQModal(rfq)}
                              className="p-2 rounded-full hover:bg-yellow-400"
                              id="rfq-pause"
                            >
                              <CirclePauseIcon className="w-5 h-5" />
                            </button>
                            <Tooltip anchorSelect="#rfq-pause">Pause RFQ</Tooltip>

                          </div>
                        ) : (
                          // <span className="text-gray-500">No actions available</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => RfqDetailedInfo(rfq)}
                              className="p-2 rounded-full hover:bg-yellow-200"
                              id="rfq-details"
                            >
                              <Info className="w-5 h-5" />
                            </button>
                            <Tooltip anchorSelect="#rfq-details">RFQ Details</Tooltip>

                            {/* Account manager and Admin */}
                            {(roleId === 12 || roleId === 8) && (
                              <>
                                <button
                                  onClick={() => handlePauseRFQModal(rfq)}
                                  className="p-2 rounded-full hover:bg-yellow-400"
                                  id="rfq-pause"
                                >
                                  <CirclePauseIcon className="w-5 h-5" />
                                </button>
                                <Tooltip anchorSelect="#rfq-pause">Pause RFQ</Tooltip>
                                {rfq.state_id === 19 && (
                                  <>
                                    <button
                                      onClick={() => navigate(`/sku-details/${rfq.rfq_id}/${rfq.state_id}`)}
                                      className="p-2 rounded-full hover:bg-green-100"
                                      id="add-products"
                                    >
                                      <ScrollIcon className="w-5 h-5" />
                                    </button>

                                    <Tooltip anchorSelect="#add-products">SKU Lists</Tooltip>

                                    <button
                                      onClick={() => handleSendtoClient(rfq)}
                                      className="p-2 rounded-full hover:bg-green-100"
                                      id="send-client"
                                    >
                                      <CircleArrowRightIcon className="w-5 h-5" />
                                    </button>

                                    <Tooltip anchorSelect="#send-client">Send to Client</Tooltip>
                                  </>
                                )}
                                {rfq.state_id === 8 && (
                                  <>
                                    <button
                                      onClick={() => handleRFQClose(rfq)}
                                      className="p-2 rounded-full hover:bg-green-100"
                                      id="close-sku"
                                    >
                                      <CopyCheckIcon className="w-5 h-5" />
                                    </button>

                                    <Tooltip anchorSelect="#close-sku">Close RFQ</Tooltip>
                                  </>
                                )}
                              </>
                            )}

                            {/* Plant head login */}
                            {(rfq.state_id === 2 && roleId === 15 && rfq.rfq_status === true) && (
                              <>
                                <button
                                  onClick={() => openApproveAssignNPDengModal(rfq)}
                                  className="p-2 text-green-500 hover:text-green-700 transition-colors rounded-full hover:bg-green-100"
                                >
                                  <CheckIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => openRejectAssignNPDengModal(rfq)}
                                  className="p-2 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-100"
                                >
                                  <XIcon className="w-5 h-5" />
                                </button>
                              </>
                            )}

                            {/* For plant head Review */}
                            {(rfq.state_id === 14 && roleId === 15 && rfq.rfq_status === true) && (
                              <>
                                <button
                                  onClick={() => navigate(`/sku-details/${rfq.rfq_id}/${rfq.state_id}`)}
                                  className="p-2 rounded-full hover:bg-green-100"
                                  id="add-products"
                                >
                                  <ScrollIcon className="w-5 h-5" />
                                </button>

                                <Tooltip anchorSelect="#add-products">SKU Lists</Tooltip>
                                <button
                                  onClick={() => openApprvalModalForReview(rfq)}
                                  className="p-2 rounded-xl hover:bg-green-100 bg-blue-400 text-white hover:text-black"
                                >
                                  Send for Review
                                </button>
                                <button
                                  onClick={() => openSendtoCommercialTeamModal(rfq)}
                                  className="p-2 text-black-500 hover:text-green-700 transition-colors rounded-full hover:bg-green-100"
                                  id="send-comercial"
                                >
                                  <UserRoundPlusIcon className="w-5 h-5" />
                                </button>
                                <Tooltip anchorSelect="#send-comercial">Send to Commercial team</Tooltip>
                              </>
                            )}

                            {/* For NPD engineer login */}
                            {((rfq.state_id === 9 || rfq.state_id === 15) && roleId === 19 && rfq.rfq_status === true) && (
                              <>
                                <button
                                  onClick={() => navigate(`/sku-details/${rfq.rfq_id}`)}
                                  className="p-2 rounded-full hover:bg-green-100"
                                >
                                  <PackagePlusIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => openApproveAssignVendorengModal(rfq)}
                                  className="p-2 text-black-500 hover:text-green-700 transition-colors rounded-full hover:bg-green-100"
                                >
                                  <UserRoundPlusIcon className="w-5 h-5" />
                                </button>
                                {/* <button
                                  onClick={() => openRejectAssignVendorengModal(rfq)}
                                  className="p-2 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-100"
                                >
                                  <XIcon className="w-5 h-5" />
                                </button> */}
                              </>
                            )}

                            {/* For vendor development engineer login */}
                            {((rfq.state_id === 11 || rfq.state_id === 16) && roleId === 21 && rfq.rfq_status === true) && (
                              <>
                                <button
                                  onClick={() => navigate(`/sku-details/${rfq.rfq_id}`)}
                                  className="p-2 rounded-full hover:bg-green-100"
                                  id="add-products"
                                >
                                  <ScrollIcon className="w-5 h-5" />
                                </button>

                                <Tooltip anchorSelect="#add-products">SKU List</Tooltip>
                                <button
                                  onClick={() => openApproveAssignProcessengModal(rfq)}
                                  className="p-2 hover:text-green-700 transition-colors rounded-full hover:bg-green-100"
                                  id="assign-processeng"
                                >
                                  <UserRoundPlusIcon className="w-5 h-5" />
                                </button>
                                <Tooltip anchorSelect="#assign-processeng">Assign Process Engineer</Tooltip>

                              </>
                            )}

                            {/* For Process engineer login */}
                            {((rfq.state_id === 13 || rfq.state_id === 17) && roleId === 20 && rfq.rfq_status === true) && (
                              <>
                                <button
                                  onClick={() => navigate(`/sku-details/${rfq.rfq_id}/${rfq.state_id}`)}
                                  className="p-2 rounded-full hover:bg-green-100"
                                  id="add-products"
                                >
                                  <ScrollIcon className="w-5 h-5" />
                                </button>

                                <Tooltip anchorSelect="#add-products">SKU Lists</Tooltip>
                                <button
                                  onClick={() => openSendRfqtoPlantHeadByProcess(rfq)}
                                  className="p-2 hover:text-green-700 transition-colors rounded-full hover:bg-green-100"
                                  id="assign-processeng"
                                >
                                  <UserRoundPlusIcon className="w-5 h-5" />
                                </button>
                                <Tooltip anchorSelect="#assign-processeng">Assign to PlantHead</Tooltip>

                              </>
                            )}

                            {/* For Process engineer login after sending for review*/}
                            {(rfq.state_id === 14 && roleId === 20 && rfq.rfq_status === true) && (
                              <>
                                <button
                                  onClick={() => navigate(`/sku-details/${rfq.rfq_id}/${rfq.state_id}`)}
                                  className="p-2 rounded-full hover:bg-green-100"
                                  id="add-products"
                                >
                                  <ScrollIcon className="w-5 h-5" />
                                </button>
                              </>
                            )}

                            {/* Commercial team and commercial manager login*/}
                            {((rfq.state_id === 6 || rfq.state_id === 18) && (roleId === 22 || roleId === 23) && rfq.rfq_status === true) && (
                              <>
                                <button
                                  onClick={() => navigate(`/sku-details/${rfq.rfq_id}/${rfq.state_id}`)}
                                  className="p-2 rounded-full hover:bg-green-100"
                                  id="add-products"
                                >
                                  <ScrollIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (rfq.state_id === 6) {
                                      openSendRfqtoCommercialManager(rfq, 1);   // 1: Sending to Commercial Manager
                                    } else {
                                      openSendRfqtoCommercialManager(rfq, 2);   // 2: Sending to Account Manager
                                    }
                                  }}
                                  className="p-2 hover:text-green-700 transition-colors rounded-full hover:bg-green-100"
                                  id="assign-rfq"
                                >
                                  <UserRoundPlusIcon className="w-5 h-5" />
                                </button>
                                {(rfq.state_id === 6) ?
                                  <Tooltip anchorSelect="#assign-rfq">Assign to Commercial Manager</Tooltip>
                                  :
                                  <Tooltip anchorSelect="#assign-rfq">Assign to Account Manager</Tooltip>
                                }


                              </>
                            )}

                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-4 border-t border-[#c8c8e6] flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-[#4b4b80] text-sm">
            Showing <span className="font-semibold">{currentRFQs.length}</span> of{" "}
            <span className="font-semibold">{filteredRFQs.length}</span> RFQs
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-md transition-colors ${currentPage === page ? "bg-[#000060] text-white" : "bg-[#f0f0f9] text-[#000060] hover:bg-[#e1e1f5]"
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Approve Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#000060] mb-4">Approve RFQ</h2>
            <p className="mb-4 text-[#4b4b80]">
              Select one or more plants and add a comment to approve this RFQ.
            </p>
            <div className="mb-4 space-y-2 max-h-60 overflow-y-auto">
              {plants.map((plant) => (
                <label key={plant.plant_id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPlants.includes(plant.plant_id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlants([...selectedPlants, plant.plant_id])
                      } else {
                        setSelectedPlants(selectedPlants.filter((id) => id !== plant.plant_id))
                      }
                    }}
                    className="form-checkbox h-5 w-5 text-[#000060] rounded border-gray-300 focus:ring-[#000060] transition duration-150 ease-in-out"
                  />
                  <span className="text-[#2d2d5f]">{plant.plantname}</span>
                </label>
              ))}
            </div>
            <textarea
              value={approveComment}
              onChange={(e) => setApproveComment(e.target.value)}
              placeholder="Add your comment here... (required)"
              className="w-full p-3 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 mb-4"
              rows="3"
              required
            />
            {selectedPlants.length > 0 && (
              <p className="text-sm text-[#4b4b80] mb-4">
                This RFQ will be assigned to {selectedPlants.length} plant(s).
              </p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={!isApproveValid}
                className={`px-4 py-2 rounded-lg transition-colors ${isApproveValid
                  ? "bg-[#000060] text-white hover:bg-[#0000a0]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Approve to {selectedPlants.length} Plant(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#000060] mb-4">Reject RFQ</h2>
            <p className="mb-4 text-[#4b4b80]">Select reasons and add a comment to reject this RFQ.</p>
            <div className="mb-4 space-y-2">
              {rejectReasonOptions.map((reason) => (
                <label key={reason} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rejectReasons.includes(reason)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRejectReasons([...rejectReasons, reason])
                      } else {
                        setRejectReasons(rejectReasons.filter((r) => r !== reason))
                      }
                    }}
                    className="form-checkbox h-5 w-5 text-red-500 rounded border-gray-300 focus:ring-red-500 transition duration-150 ease-in-out"
                  />
                  <span className="text-[#2d2d5f]">{reason}</span>
                </label>
              ))}
            </div>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Add your comment here... (required)"
              className="w-full p-3 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 mb-4"
              rows="3"
              maxLength={655}
              required
            />
            <p className="text-sm text-gray-500 mb-4">{rejectComment.length}/655 characters</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!isRejectValid}
                className={`px-4 py-2 rounded-lg transition-colors ${isRejectValid
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal for sending the RFQ for review */}
      {isApproveAndSentToReviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold text-[#000060] mb-4">Review RFQ</h2>
            <p className="mb-4 text-[#4b4b80]">
              Select one of the engineers to send for review and add a comment to this RFQ.
            </p>

            {/* Display error message if exists */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault(); // Prevent default form submission
              await handleSendtoReview();
            }}>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-md font-medium text-[#000060]">Send to Engineer <span className="text-red-500">*</span></span>
                  <select
                    className="w-full px-4 py-2 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 text-[#000060] mt-1"
                    onChange={(e) => setEngineerTypeForReview(e.target.value)}
                    required
                  >
                    <option value="">Select an engineer</option>
                    <option value="NPD">NPD Engineer</option>
                    <option value="VDE">Vendor Development Engineer</option>
                    <option value="PE">Process Engineer</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-md font-medium text-[#000060]">Comments <span className="text-red-500">*</span></span>
                  <textarea
                    value={approveComment}
                    onChange={(e) => setApproveComment(e.target.value)}
                    placeholder="Add your comment here..."
                    className="w-full p-3 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 mt-1"
                    rows="3"
                    required
                  />
                </label>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => { setIsApproveAndSentToReviewModalOpen(false); setError(""); setApproveComment("") }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!engineerTypeForReview && !approveComment}
                  className={`px-4 py-2 rounded-lg transition-colors ${(engineerTypeForReview && approveComment)
                    ? "bg-[#000060] text-white hover:bg-[#0000a0]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  Send to {engineerTypeForReview || "Engineer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {statusDescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#000060] mb-4">RFQ Status</h2>
            <p className="mb-4 text-[#4b4b80]">{statusDescription}</p>
            <button
              onClick={() => setStatusDescription(null)}
              className="px-4 py-2 bg-[#000060] text-white rounded-lg hover:bg-[#0000a0] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}


      {/* Assign RFQ modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#000060]">Assign RFQ</h2>
                <p className="text-sm text-[#4b4b80]">Assign this RFQ to multiple roles</p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* NPD Engineers Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-[#000060]">NPD Engineers</h3>
                  <select
                    className="w-full px-4 py-2 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 text-[#000060]"
                    value={selectedNPDEngineer?.user_id || ""}
                    onChange={(e) => {
                      const selected = npdEngineer.find(
                        (engineer) => engineer.user_id === parseInt(e.target.value)
                      );
                      setSelectedNPDEngineer(selected);
                    }}
                  >
                    <option value="" disabled>Select NPD Engineer</option>
                    {npdEngineer.map((engineer) => (
                      <option key={engineer.user_id} value={engineer.user_id}>
                        {engineer.first_name + " " + engineer.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vendor Engineers Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-[#000060]">Vendor Engineers</h3>
                  <select
                    className="w-full px-4 py-2 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 text-[#000060]"
                    value={selectedVendorEngineer?.user_id || ""}
                    onChange={(e) => {
                      const selected = vendorEngineers.find(
                        (engineer) => engineer.user_id === parseInt(e.target.value)
                      );
                      setSelectedVendorEngineer(selected);
                    }}
                  >
                    <option value="" disabled>Select Vendor Engineer</option>
                    {vendorEngineers.map((engineer) => (
                      <option key={engineer.user_id} value={engineer.user_id}>
                        {engineer.first_name + " " + engineer.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Process Engineers Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-[#000060]">Process Engineers</h3>
                  <select
                    className="w-full px-4 py-2 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 text-[#000060]"
                    value={selectedProcessEngineer?.user_id || ""}
                    onChange={(e) => {
                      const selected = processEngineers.find(
                        (engineer) => engineer.user_id === parseInt(e.target.value)
                      );
                      setSelectedProcessEngineer(selected);
                    }}
                  >
                    <option value="" disabled>Select Process Engineer</option>
                    {processEngineers.map((engineer) => (
                      <option key={engineer.user_id} value={engineer.user_id}>
                        {engineer.first_name + " " + engineer.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  placeholder="Add your comment here... (required)"
                  className="w-full p-2 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 mb-4"
                  rows="3"
                  required
                />
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-[#000060] rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMultiAssignRFQ}
                  disabled={isLoading || (!selectedNPDEngineer || !selectedVendorEngineer || !selectedProcessEngineer)}
                  className={`px-4 py-2 rounded-lg transition-colors ${(selectedNPDEngineer || selectedVendorEngineer || selectedProcessEngineer)
                    ? "bg-[#000060] text-white hover:bg-[#0000a0]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  {isLoading ? "Assigning..." : "Assign RFQ"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isRejectPlantHeadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#000060] mb-4">Reject RFQ</h2>
            <p className="mb-4 text-[#4b4b80]">Select reasons and add a comment to reject this RFQ.</p>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="mb-4 space-y-2">
              {rejectReasonOptions.map((reason) => (
                <label key={reason} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rejectReasons.includes(reason)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRejectReasons([...rejectReasons, reason])
                      } else {
                        setRejectReasons(rejectReasons.filter((r) => r !== reason))
                      }
                    }}
                    className="form-checkbox h-5 w-5 text-red-500 rounded border-gray-300 focus:ring-red-500 transition duration-150 ease-in-out"
                  />
                  <span className="text-[#2d2d5f]">{reason}</span>
                </label>
              ))}
            </div>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Add your comment here... (required)"
              className="w-full p-3 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 mb-4"
              rows="3"
              maxLength={655}
              required
            />
            <p className="text-sm text-gray-500 mb-4">{rejectComment.length}/655 characters</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsRejectPlantHeadModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectByPlantHead}
                disabled={!isRejectValid}
                className={`px-4 py-2 rounded-lg transition-colors ${isRejectValid
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}


      <AnimatePresence>
        {vendorModalIsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#000060]">Assign RFQ</h2>
                <p className="text-sm text-[#4b4b80]">Assign this RFQ to Vendor development Engineer</p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">

                <textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  placeholder="Add your comment here... (required)"
                  className="w-full p-2 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 mb-4"
                  rows="3"
                  required
                />


              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setVendorModalIsOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-[#000060] rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignRFQByNPDeng}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#000060] text-white rounded-lg hover:bg-[#0000a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Assigning..." : "Assign RFQ"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isRejectVendorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#000060] mb-4">Reject RFQ</h2>
            <p className="mb-4 text-[#4b4b80]">Select reasons and add a comment to reject this RFQ.</p>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="mb-4 space-y-2">
              {rejectReasonOptions.map((reason) => (
                <label key={reason} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rejectReasons.includes(reason)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRejectReasons([...rejectReasons, reason])
                      } else {
                        setRejectReasons(rejectReasons.filter((r) => r !== reason))
                      }
                    }}
                    className="form-checkbox h-5 w-5 text-red-500 rounded border-gray-300 focus:ring-red-500 transition duration-150 ease-in-out"
                  />
                  <span className="text-[#2d2d5f]">{reason}</span>
                </label>
              ))}
            </div>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Add your comment here... (required)"
              className="w-full p-3 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 mb-4"
              rows="3"
              maxLength={655}
              required
            />
            <p className="text-sm text-gray-500 mb-4">{rejectComment.length}/655 characters</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsRejectVendorModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectByNPDEngineer}
                disabled={!isRejectValid}
                className={`px-4 py-2 rounded-lg transition-colors ${isRejectValid
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}



      <AnimatePresence>
        {processModalIsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#000060]">Assign RFQ</h2>
                <p className="text-sm text-[#4b4b80]">Assign this RFQ to Process Engineer</p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">

                <textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  placeholder="Add your comment here... (required)"
                  className="w-full p-2 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 mb-4"
                  rows="3"
                  required
                />


              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setProcessModalIsOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-[#000060] rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignRFQByVendorEng}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#000060] text-white rounded-lg hover:bg-[#0000a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Assigning..." : "Assign RFQ"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openSendRfqtoPlantHeadByProcessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >

              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#000060]">Assign RFQ</h2>
                <p className="text-sm text-[#4b4b80]">Assign this RFQ to Plant head for review</p>
              </div>


              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <h2>Send RFQ - {selectedRFQ.rfq_name} to plant head for review.</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  placeholder="Add your comment here... (required)"
                  className="w-full p-2 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 mb-4"
                  rows="3"
                  required
                />

              </div>


              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setopenSendRfqtoPlantHeadByProcessModal(false)}
                  className="px-4 py-2 bg-gray-100 text-[#000060] rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignToPlantHeadByProcessEngineer}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#000060] text-white rounded-lg hover:bg-[#0000a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sending RFQ to commercial manager by commercial team */}
      <AnimatePresence>
        {openSendRfqtoCommercialManagerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >

              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#000060]">Assign RFQ</h2>
                <p className="text-sm text-[#4b4b80]">Assign this RFQ to {sendType == 1 ? "Commercial Manager" : "Account Manager"} for review</p>
              </div>


              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <h2>Send RFQ - {selectedRFQ.rfq_name} to {sendType == 1 ? "Commercial Manager" : "Account Manager"} for review.</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  placeholder="Add your comment here... (required)"
                  className="w-full p-2 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 mb-4"
                  rows="3"
                  required
                />

              </div>


              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setOpenSendRfqtoCommercialManagerModal(false)}
                  className="px-4 py-2 bg-gray-100 text-[#000060] rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignToCommercialManager}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#000060] text-white rounded-lg hover:bg-[#0000a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Modal for Pause RFQ */}
      <AnimatePresence>
        {isPauseModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#000060]">{selectedRFQ.rfq_status ? "Pause" : "Activate"} RFQ</h2>
                <p className="text-sm text-[#4b4b80]">Pause this RFQ to restrict any further actions</p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">

                <textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  placeholder="Add your comment here... (required)"
                  className="w-full p-2 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 mb-4"
                  rows="3"
                  required
                />


              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setIsPauseModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-[#000060] rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePauseRFQ}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#000060] text-white rounded-lg hover:bg-[#0000a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedRFQ.rfq_status ? "Pause" : "Activate"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSendtoCommercialTeamModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#000060]">Assign RFQ</h2>
                <p className="text-sm text-[#4b4b80]">Assign this RFQ to Commercial Team</p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">

                {/* Commercial team Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-[#000060]">Commercial Team</h3>
                  <select
                    className="w-full px-4 py-2 border-2 border-[#c8c8e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 text-[#000060]"
                    value={selectedCommercialTeam?.userid || ""}
                    onChange={(e) => {
                      const selected = commercialTeam.find(
                        (engineer) => engineer.userid === parseInt(e.target.value)
                      );
                      setSelectedCommercialTeam(selected);
                    }}
                  >
                    <option value="" disabled>Select Commercial Team</option>
                    {commercialTeam.map((engineer) => (
                      <option key={engineer.userid} value={engineer.userid}>
                        {engineer.firstname + " " + engineer.lastname}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  placeholder="Add your comment here... (required)"
                  className="w-full p-2 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 mb-4"
                  rows="3"
                  required
                />


              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setIsSendtoCommercialTeamModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-[#000060] rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignToCommercialTeam}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#000060] text-white rounded-lg hover:bg-[#0000a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Assigning..." : "Assign RFQ"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Send RFQ to client Popup */}
      <AnimatePresence>
        {openSendRfqtoClientModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >

              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#000060]">Send RFQ</h2>
                <p className="text-sm text-[#4b4b80]">Send this RFQ to client for approval</p>
              </div>


              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <h2>Send RFQ - <span className="font-bold">{selectedRFQ.rfq_name}</span> to client - <span className="font-bold">{selectedRFQ.client_name}</span> for approval.</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  placeholder="Add your comment here... (required)"
                  className="w-full p-2 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 mb-4"
                  rows="3"
                  required
                />

              </div>


              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setOpenSendRfqtoClientModal(false)}
                  className="px-4 py-2 bg-gray-100 text-[#000060] rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRFQtoClient}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#000060] text-white rounded-lg hover:bg-[#0000a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close RFQ after client approval */}
      <AnimatePresence>
        {openCloseRfqbyClientApprovalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-3xl"
            >

              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#000060]">Close RFQ</h2>
                <p className="text-sm text-[#4b4b80]">Select from the list of SKU's to close</p>
              </div>


              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* <div className="bg-white rounded-xl shadow-xl p-6 space-y-8"> */}
                {sku && (
                  <div className="bg-[#f8f8fd] rounded-lg p-6 shadow-xl">
                    <SKUTable
                      skus={sku}
                      // onAddProduct={roleId === 21 ? handleAddBOMProductDetails : handleAddProductDetails}
                      // onViewProduct={handleProductDetails}
                      role_id={roleId}
                      navigate={navigate}
                      rfq_id={selectedRFQ.rfq_id}
                      stateId={selectedRFQ.state_id}
                    />
                  </div>
                )}
                {/* </div> */}
              </div>

              <div className="p-6 space-y-6">
                <textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  placeholder="Add your comment here... (required)"
                  className="w-full p-2 border-2 border-[#e1e1f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000060] focus:border-transparent transition-all duration-300 mb-4"
                  rows="3"
                  required
                />
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setOpenCloseRfqbyClientApprovalModal(false)}
                  className="px-4 py-2 bg-gray-100 text-[#000060] rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRFQtoClient}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#000060] text-white rounded-lg hover:bg-[#0000a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Submiting..." : "Submit"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </motion.div>
  )
}


// SKU table for Close RFQ popup
function SKUTable({ skus, onAddProduct, onViewProduct, role_id, navigate, rfq_id, stateId }) {
  const [selectedSkus, setSelectedSkus] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAllChange = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedSkus(skus.map(sku => sku.sku_id));
    } else {
      setSelectedSkus([]);
    }
  };

  const handleCheckboxChange = (skuId) => {
    setSelectedSkus(prevSelected => {
      if (prevSelected.includes(skuId)) {
        return prevSelected.filter(id => id !== skuId);
      } else {
        return [...prevSelected, skuId];
      }
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[#e1e1f5]">
        <thead className="bg-[#f8f8fd]">
          <tr className="text-center">
            {(stateId == 8) && (
              <th className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
              </th>
            )}
            <th className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Name</th>
            {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) ? null : <th className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Description</th>}
            {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) ? null : <th className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Part No.</th>}
            {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) ? null : <th className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Drawing No.</th>}
            {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) ? null : <th className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Annual Usage</th>}
            {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) ? null : <th className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Size</th>}
            {(stateId == 14 || stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) && (<th className="px-6 py-3 whitespace-nowrap text-center text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Sub-Total Cost</th>)}
            {(stateId == 14 || stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) && (<th className="px-6 py-3 whitespace-nowrap text-center text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Total Factory Cost</th>)}
            {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) && (<th className="px-6 py-3 whitespace-nowrap text-center text-xs font-medium text-[#4b4b80] uppercase tracking-wider">FOB Value</th>)}
            {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) && (<th className="px-6 py-3 whitespace-nowrap text-center text-xs font-medium text-[#4b4b80] uppercase tracking-wider">CIF value</th>)}
            {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) && (<th className="px-6 py-3 whitespace-nowrap text-center text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Total</th>)}
            <th className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#e1e1f5]">
          {skus.map((sku, index) => (
            <tr key={index} className="text-center">
              {(stateId == 8) && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#000060]">
                  <input
                    type="checkbox"
                    checked={selectedSkus.includes(sku.sku_id)}
                    onChange={() => handleCheckboxChange(sku.sku_id)}
                  />
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#000060]">{sku.sku_name}</td>
              {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) ? null : <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.description}</td>}
              {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) ? null : <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.part_no}</td>}
              {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) ? null : <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.drawing_no}</td>}
              {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) ? null : <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.annual_usage}</td>}
              {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) ? null : <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.size}</td>}
              {(stateId == 14 || stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) && (<td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.sub_total_cost}</td>)}
              {(stateId == 14 || stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) && (<td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.total_factory_cost}</td>)}
              {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) && (<td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.fob_value}</td>)}
              {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) && (<td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.cif_value}</td>)}
              {(stateId == 6 || stateId == 18 || stateId == 19 || stateId == 8) && (<td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.total_cost}</td>)}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${sku.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {sku.status ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
