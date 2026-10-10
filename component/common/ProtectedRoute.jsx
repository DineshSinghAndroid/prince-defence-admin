"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

const ProtectedRoute = ({
    children,
    allowedRole,
    allowedRoles,
}) => {
    const { user, loading } =
        useContext(AuthContext);

    const router = useRouter();
    const permittedRoles =
        allowedRoles ||
        (allowedRole ? [allowedRole] : null);

    const isRoleAllowed =
        !permittedRoles ||
        permittedRoles.includes(user?.role);


    useEffect(() => {
        if (loading) {
            return;
        }

        // USER NOT LOGGED IN

        if (!user) {
            router.replace("/login");
            return;
        }


        // ROLE CHECK

        if (!isRoleAllowed) {
            router.replace("/admin/dashboard");
        }

    }, [
        user,
        loading,
        router,
        isRoleAllowed,
    ]);


    // LOADING

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }


    // NOT AUTHENTICATED

    if (!user) {
        return null;
    }


    // NOT AUTHORIZED

    if (!isRoleAllowed) {
        return null;
    }


    return children;
};

export default ProtectedRoute;