import { create } from "zustand";
import axios from "axios";
import axiosInstance from "./axiosConfig";


// Save state to local storage
const saveStateToLocalStorage = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem("appState", serializedState);
    } catch (error) {
        console.error("Error saving state to local storage", error);
    }
}

// Load state from local storage
const loadStateFromLocalStorage = () => {
    try {
        const serializedState = localStorage.getItem("appState");
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (error) {
        console.error("Error loading state from localStorage:", error);
        return undefined;
    }
};


const useAppStore = create((set, get) => {

    // Load initial state from localStorage
    const initialState = loadStateFromLocalStorage() || {
        user: null,
        role: null,
        permission: null,
        isLoggedIn: false,
        error: null,
    };

    return {
        ...initialState,

        // Actions
        setUser: (user) => {
            set({ user });
            saveStateToLocalStorage({ ...get(), user });
        },
        setRole: (role) => {
            set({ role });
            saveStateToLocalStorage({ ...get(), role });
        },
        setPermission: (permission) => {
            set({ permission });
            saveStateToLocalStorage({ ...get(), permission });
        },
        setIsLoggedIn: (isLoggedIn) => {
            set({ isLoggedIn });
            saveStateToLocalStorage({ ...get(), isLoggedIn });
        },
        setAppError: (error) => {
            set({ error });
            saveStateToLocalStorage({ ...get(), error });
        },


        // Fetch permissions based on role_id
        fetchPermissions: async () => {
            const { role } = get();
            if (!role) {
                set({ error: "No role found. Please log in again." });
                return;
            }

            try {
                const response = await axiosInstance.get(`/role/view/${role.role_id}`);
                if (response.data.success) {
                    // console.log("Debug role: ", response);
                    const permission = response.data.roles[0].pages;
                    set({ permission }); // Update the state
                    saveStateToLocalStorage({ ...get(), permission }); // Save to local storage 
                } else {
                    set({ error: response.data.message || "Failed to fetch permissions" });
                }
            } catch (error) {
                set({ error: error.response?.data?.message || "Error fetching permissions" });
            }
        },

        // Clear state on logout
        logout: () => {
            localStorage.removeItem("appState");
            set({ user: null, role: null, permission: null, isLoggedIn: false, error: null });
        },

    }

});

export default useAppStore;