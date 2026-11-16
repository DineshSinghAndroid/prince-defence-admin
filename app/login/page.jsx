"use client";

import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { login } from "@/services/authService";
import { AuthContext } from "@/context/AuthContext";

import {
    User,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Loader2,
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

    // Lock page scrolling on mobile to keep login perfectly centered and non-scrollable
    useEffect(() => {
        const origBodyOverflow = document.body.style.overflow;
        const origHtmlOverflow = document.documentElement.style.overflow;

        const applyLock = () => {
            if (window.innerWidth < 640) {
                document.body.style.overflow = "hidden";
                document.documentElement.style.overflow = "hidden";
            } else {
                document.body.style.overflow = origBodyOverflow;
                document.documentElement.style.overflow = origHtmlOverflow;
            }
        };

        applyLock();
        window.addEventListener("resize", applyLock);

        return () => {
            document.body.style.overflow = origBodyOverflow;
            document.documentElement.style.overflow = origHtmlOverflow;
            window.removeEventListener("resize", applyLock);
        };
    }, []);

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

            toast.success("Login successful. Redirecting...");

            router.replace("/admin/dashboard");
        } catch (error) {
            console.error("Login Error:", error);

            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
                <div className="flex items-center gap-3">
                    <Loader2 size={24} className="animate-spin text-[#3869D0]" />
                    <p className="text-sm font-semibold text-slate-600">
                        Checking your session...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="fixed inset-0 z-10 flex items-center justify-center overflow-hidden overscroll-none bg-[#F4F7FB] p-2.5 sm:static sm:z-auto sm:min-h-screen sm:overflow-auto sm:p-6 lg:p-10">

            {/* Split Card Container */}
            <div className="relative grid w-full max-w-sm sm:max-w-md lg:max-w-5xl grid-cols-1 overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(16,42,67,0.08)] lg:grid-cols-2">

                {/* Left Column: Lottie Animation & Brand (Visible on Desktop only) */}
                <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#EAF2FD] via-[#F1F6FE] to-[#DFECFD] p-8 xl:p-10 lg:flex">

                    {/* Subtle Organic Background Waves */}
                    <div className="pointer-events-none absolute inset-0 opacity-40">
                        <svg
                            className="h-full w-full"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 800 800"
                            preserveAspectRatio="none"
                        >
                            <path
                                d="M0,200 C150,150 350,250 500,200 C650,150 750,220 800,200 L800,800 L0,800 Z"
                                fill="#D2E3FC"
                                opacity="0.35"
                            />
                            <path
                                d="M0,400 C200,320 300,480 500,420 C700,360 700,450 800,400 L800,800 L0,800 Z"
                                fill="#C2DAFB"
                                opacity="0.3"
                            />
                            <path
                                d="M0,600 C180,550 350,650 550,590 C720,540 760,620 800,600 L800,800 L0,800 Z"
                                fill="#B1D0FA"
                                opacity="0.25"
                            />
                        </svg>
                    </div>

                    {/* Top: Brand Logo */}
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-slate-200/80 bg-white p-0.5 shadow-sm">
                            <Image
                                src="/logos/mainLogo.png"
                                alt="Prince Defence Academy"
                                fill
                                sizes="44px"
                                className="object-contain p-0.5"
                            />
                        </div>
                        <div>
                            <h2 className="montserrat text-sm font-extrabold tracking-tight text-[var(--navy)]">
                                Prince Defence Academy
                            </h2>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="relative z-10 mt-6 max-w-sm">
                        <h1 className="montserrat text-2xl xl:text-3xl font-extrabold leading-snug text-[var(--navy)]">
                            Manage Academy Portal <span className="text-[#3869D0]">&amp; Operations</span>
                        </h1>
                        <p className="mt-2 text-xs xl:text-sm text-slate-600 leading-relaxed">
                            Access student records, quiz database, admissions and site controls in one unified platform.
                        </p>
                    </div>

                    {/* Center: Lottie Login Animation */}
                    <div className="relative z-10 my-auto flex items-center justify-center py-4">
                        <div className="relative aspect-square w-full max-w-[320px] xl:max-w-[360px]">
                            <DotLottieReact
                                src="https://lottie.host/c2752204-0cec-41df-a3ff-40e47ec9fc89/er8HN6i2ly.lottie"
                                loop
                                autoplay
                                className="h-full w-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Bottom simple line */}
                    <div className="relative z-10">
                        <p className="text-[11px] font-semibold text-slate-500">
                            Authorized personnel only • Secure Gateway
                        </p>
                    </div>
                </div>

                {/* Right Column: Form Area (Mobile-Enhanced & Desktop-Refined) */}
                <div className="flex flex-col justify-center bg-white p-3.5 sm:p-8 lg:p-12 xl:p-14">

                    {/* MOBILE-ONLY HEADER: Enhanced Card with Brand & Lottie Animation */}
                    <div className="mb-2.5 overflow-hidden rounded-2xl border border-blue-100/80 bg-gradient-to-b from-[#EAF2FD] via-[#F2F7FE] to-[#F8FAFD] px-3 py-2 text-center shadow-xs sm:mb-6 sm:p-5 lg:hidden">

                        {/* Logo Badge */}
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/90 bg-white/95 px-2.5 py-0.5 shadow-xs sm:px-3 sm:py-1">
                            <div className="relative h-4 w-4 shrink-0 overflow-hidden rounded-full sm:h-5 sm:w-5">
                                <Image
                                    src="/logos/mainLogo.png"
                                    alt="Prince Defence Academy"
                                    fill
                                    sizes="20px"
                                    className="object-contain"
                                />
                            </div>
                            <span className="montserrat text-[10px] font-black tracking-wide text-[var(--navy)] sm:text-[11px]">
                                PRINCE DEFENCE ACADEMY
                            </span>
                        </div>

                        {/* Animated Lottie Character on Mobile - Significantly Enlarged */}
                        <div className="mx-auto my-1 h-40 w-40 sm:my-2.5 sm:h-44 sm:w-44">
                            <DotLottieReact
                                src="https://lottie.host/c2752204-0cec-41df-a3ff-40e47ec9fc89/er8HN6i2ly.lottie"
                                loop
                                autoplay
                                className="h-full w-full object-contain"
                            />
                        </div>

                        <h2 className="montserrat text-base font-black text-[var(--navy)] sm:text-xl">
                            Admin Login
                        </h2>
                        <p className="mt-0.5 text-[10.5px] text-slate-500 sm:mt-1 sm:text-xs">
                            Sign in to manage your academy portal
                        </p>
                    </div>

                    {/* DESKTOP-ONLY HEADER */}
                    <div className="mb-8 hidden lg:block">
                        <h2 className="montserrat text-2xl font-extrabold text-[var(--navy)] xl:text-3xl">
                            Admin Login
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Enter your credentials to access the admin dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-5">

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1 block text-xs font-bold text-[var(--navy)]"
                            >
                                Email Address
                            </label>

                            <div className="relative">
                                <User
                                    size={18}
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-11 pr-4 text-xs sm:py-3 sm:text-sm text-[var(--navy)] outline-none transition focus:border-[#3869D0] focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="mb-1 flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-bold text-[var(--navy)]"
                                >
                                    Password
                                </label>
                            </div>

                            <div className="relative">
                                <Lock
                                    size={18}
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-11 pr-11 text-xs sm:py-3 sm:text-sm text-[var(--navy)] outline-none transition focus:border-[#3869D0] focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((current) => !current)}
                                    disabled={loading}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.push("/admin/forgot-password")}
                            disabled={loading}
                            className="text-[11px] font-semibold text-[#3869D0] transition hover:text-[#2852aa] hover:underline disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
                        >
                            Forgot Password?
                        </button>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3869D0] py-2.5 text-xs font-bold text-white shadow-lg shadow-[#3869D0]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2e5bbd] hover:shadow-xl hover:shadow-[#3869D0]/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:mt-2 sm:py-3.5 sm:text-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={17} className="animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Login
                                    <ArrowRight
                                        size={17}
                                        className="transition-transform duration-200 group-hover:translate-x-1"
                                    />
                                </>
                            )}
                        </button>

                    </form>

                    {/* Bottom note */}
                    <div className="mt-2 text-center text-[10.5px] text-slate-400 sm:mt-8 sm:text-xs">
                        Prince Defence Academy • Palwas Road, Sikar
                    </div>

                </div>

            </div>

        </main>
    );
}
