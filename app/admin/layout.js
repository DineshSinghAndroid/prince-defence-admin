"use client";

import { usePathname } from "next/navigation";

import Sidebar from "@/component/layout/Sidebar";
import ProtectedRoute from "@/component/common/ProtectedRoute";

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const isPasswordRecovery =
        pathname === "/admin/forgot-password" ||
        pathname.startsWith("/admin/forgot-password/");

    if (isPasswordRecovery) {
        return children;
    }

    return (
        <ProtectedRoute
            allowedRoles={[
                "superAdmin",
                "admin",
            ]}
        >
            <div className="flex min-h-screen flex-col lg:flex-row">
                <Sidebar />

                <main className="min-w-0 flex-1">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}