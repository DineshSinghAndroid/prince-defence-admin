"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function HomePage() {
    const { user, loading } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            router.replace(
                user ? "/admin/dashboard" : "/login"
            );
        }
    }, [loading, user, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Checking your session...</p>
        </div>
    );
}