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
        const timer = window.setTimeout(() => {
            void checkAuth();
        }, 0);

        return () => window.clearTimeout(timer);
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