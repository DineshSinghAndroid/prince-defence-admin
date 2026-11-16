"use client";

import {
    createContext,
    useEffect,
    useState,
} from "react";

import {
    getMe,
    logout as logoutAdmin,
} from "@/services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    // CHECK AUTH

    const checkAuth = async () => {
        try {
            const response = await getMe();

            // GET USER FROM API RESPONSE

            const authenticatedUser =
                response?.data?.user ||
                response?.user ||
                response?.data?.data?.user ||
                null;

            setUser(authenticatedUser);

        } catch (error) {
            console.error(
                "Authentication failed:",
                error
            );

            setUser(null);

        } finally {
            setLoading(false);
        }
    };


    // LOGOUT

    const handleLogout = async () => {
        try {
            await logoutAdmin();

            setUser(null);

        } catch (error) {
            console.error(
                "Logout failed:",
                error
            );
        }
    };


    // INITIAL AUTH CHECK
    useEffect(() => {
        // Safety timeout: Ensure loading never hangs permanently if backend or network is unresponsive
        const safetyTimer = window.setTimeout(() => {
            setLoading((current) => {
                if (current) {
                    console.warn("Session check timed out. Showing login screen.");
                    return false;
                }
                return current;
            });
        }, 8000);

        const timer = window.setTimeout(() => {
            void checkAuth();
        }, 0);

        return () => {
            window.clearTimeout(timer);
            window.clearTimeout(safetyTimer);
        };
    }, []);


    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                checkAuth,
                handleLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};