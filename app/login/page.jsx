"use client";

import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import { AuthContext } from "@/context/AuthContext";

import {
    Shield,
    User,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Loader2,
    KeyRound,
} from "lucide-react";

export default function LoginPage() {
    const router = useRouter();

    const {
        checkAuth,
        user,
        loading: authLoading,
    } = useContext(AuthContext);

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            router.replace("/admin/dashboard");
        }
    }, [authLoading, user, router]);

    const getErrorMessage = (error) => {
        if (
            typeof navigator !== "undefined" &&
            navigator.onLine === false
        ) {
            return "No internet connection. Please check your network and try again.";
        }

        const status = error?.response?.status;

        if (status === 400) {
            return (
                error?.response?.data?.message ||
                "Please enter valid login details."
            );
        }

        if (status === 401) {
            return "Invalid email or password.";
        }

        if (status === 403) {
            return "You do not have permission to access the admin panel.";
        }

        if (status === 404) {
            return "Admin account was not found.";
        }

        if (status >= 500) {
            return "Server error. Please try again in a moment.";
        }

        if (error?.response?.data?.message) {
            return error.response.data.message;
        }

        if (error?.message) {
            if (
                error.message
                    .toLowerCase()
                    .includes("network")
            ) {
                return "Unable to connect to the server. Please check your internet connection.";
            }

            return error.message;
        }

        return "Login failed. Please check your credentials and try again.";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setLoading(true);

        try {
            await login(email, password);

            await checkAuth();

            toast.success(
                "Login successful. Redirecting..."
            );

            router.replace("/admin/dashboard");
        } catch (error) {
            console.error(
                "Login Error:",
                error
            );

            toast.error(
                getErrorMessage(error)
            );
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Checking your session...</p>
            </div>
        );
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f1f4a] via-[#1a3577] to-[#3869D0] p-4">

            {/* Background Effects */}

            <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#94CCF9]/40 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#3869D0]/60 blur-3xl" />

            <div className="pointer-events-none absolute right-1/4 top-1/4 h-64 w-64 rounded-full bg-[#7c3aed]/30 blur-3xl" />

            <div className="pointer-events-none absolute bottom-1/4 left-1/4 h-56 w-56 rounded-full bg-[#fbbf24]/25 blur-3xl" />

            {/* Login Card */}

            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/30 bg-white/15 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-10">

                {/* Top Glow */}

                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/20 to-transparent" />

                {/* Header */}

                <div className="relative mb-8 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/40 bg-gradient-to-br from-[#3869D0] via-[#5b8de0] to-[#94CCF9] text-white shadow-lg shadow-[#3869D0]/50">

                        <Shield size={30} />

                    </div>

                    <p className="mt-5 text-[10px] font-bold tracking-[0.25em] text-[#fde68a]">
                        ADMIN PANEL
                    </p>

                    <h1 className="montserrat mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                        Admin Login
                    </h1>

                    <p className="mt-2 text-sm text-white/60">
                        Sign in to access your dashboard
                    </p>
                </div>

                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="relative space-y-5"
                >

                    {/* Email */}

                    <div>

                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-semibold text-white/90"
                        >
                            Email
                        </label>

                        <div className="relative">

                            <User
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                            />

                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                required
                                disabled={loading}
                                className="w-full rounded-xl border border-white/25 bg-white/10 py-3.5 pl-12 pr-4 text-sm text-white outline-none backdrop-blur-md transition-all placeholder:text-white/40 focus:border-[#94CCF9] focus:bg-white/20 focus:ring-4 focus:ring-[#94CCF9]/20 disabled:cursor-not-allowed disabled:opacity-60"
                            />

                        </div>

                    </div>

                    {/* Password */}

                    <div>

                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-semibold text-white/90"
                        >
                            Password
                        </label>

                        <div className="relative">

                            <Lock
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                            />

                            <input
                                id="password"
                                name="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                required
                                disabled={loading}
                                className="w-full rounded-xl border border-white/25 bg-white/10 py-3.5 pl-12 pr-12 text-sm text-white outline-none backdrop-blur-md transition-all placeholder:text-white/40 focus:border-[#94CCF9] focus:bg-white/20 focus:ring-4 focus:ring-[#94CCF9]/20 disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (current) =>
                                            !current
                                    )
                                }
                                disabled={loading}
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>

                        </div>

                    </div>

                    {/* Forgot Password */}

                    <div className="flex justify-end -mt-2">

                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/admin/forgot-password"
                                )
                            }
                            disabled={loading}
                            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#fde68a] transition-all hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <KeyRound
                                size={15}
                                className="transition-transform duration-300 group-hover:rotate-12"
                            />

                            Forgot Password?
                        </button>

                    </div>

                    {/* Login Button */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#fbbf24] via-[#fcd34d] to-[#fde68a] px-4 py-3.5 text-sm font-extrabold text-[#0f1f4a] shadow-lg shadow-[#fbbf24]/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#fbbf24]/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                    >

                        {loading ? (
                            <>
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />

                                Logging in...
                            </>
                        ) : (
                            <>
                                Login

                                <ArrowRight
                                    size={17}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </>
                        )}

                    </button>

                </form>

                {/* Security Text */}

                <div className="relative mt-7 flex items-center justify-center gap-2 text-center text-[11px] text-white/45">

                    <Lock size={12} />

                    <span>
                        Secure admin access
                    </span>

                </div>

            </div>

        </main>
    );
}