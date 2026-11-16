"use client";

import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import { AuthContext } from "@/context/AuthContext";

import {
    User,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Loader2,
    Shield,
    ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
    const router = useRouter();

    const {
        checkAuth,
        user,
        loading: authLoading,
    } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
        <main className="min-h-screen bg-[#F4F7FB] lg:flex lg:items-center lg:justify-center lg:p-6 xl:p-10">

            {/* Split Card Container (Desktop: Split Card | Mobile: Top Image + Bottom Sheet) */}
            <div className="relative mx-auto flex min-h-screen w-full flex-col bg-white lg:min-h-0 lg:max-w-5xl lg:grid lg:grid-cols-12 lg:overflow-hidden lg:rounded-3xl lg:border lg:border-slate-200/80 lg:shadow-[0_20px_60px_rgba(16,42,67,0.08)]">

                {/* MOBILE-ONLY TOP IMAGE HERO (Screenshot Match) */}
                <div className="relative h-60 w-full shrink-0 overflow-hidden bg-[#0d1d36] sm:h-72 lg:hidden">
                    <Image
                        src="/images/auth-login-portal.jpg"
                        alt="Admin Command Portal"
                        fill
                        priority
                        className="object-cover object-center"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1d36] via-[#0d1d36]/40 to-black/30" />

                    {/* Mobile Top Brand Logo */}
                    <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-white backdrop-blur-md">
                        <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full">
                            <Image
                                src="/logos/mainLogo.png"
                                alt="Prince Defence Academy"
                                fill
                                sizes="20px"
                                className="object-contain"
                            />
                        </div>
                        <span className="montserrat text-[11px] font-black tracking-wide text-white">
                            PRINCE DEFENCE ACADEMY
                        </span>
                    </div>

                    {/* Mobile Hero Headline */}
                    <div className="absolute bottom-6 left-5 right-5 z-10">
                        <h2 className="montserrat text-xl font-black text-white">
                            Admin Command Portal
                        </h2>
                        <p className="mt-1 text-xs text-blue-100/80">
                            Sign in to manage academy operations &amp; records.
                        </p>
                    </div>
                </div>

                {/* FORM COLUMN (Left on Desktop, Bottom Sheet on Mobile) */}
                <div className="relative -mt-4 flex flex-1 flex-col justify-between rounded-t-3xl bg-white p-6 shadow-xl sm:p-8 lg:col-span-7 lg:mt-0 lg:rounded-none lg:p-12 lg:shadow-none xl:p-14">

                    {/* Mobile pull indicator */}
                    <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 lg:hidden" />

                    {/* Desktop Top Brand Header */}
                    <div className="mb-6 hidden items-center justify-between lg:flex">
                        <div className="flex items-center gap-3">
                            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200/80 bg-white p-0.5 shadow-xs">
                                <Image
                                    src="/logos/mainLogo.png"
                                    alt="Prince Defence Academy"
                                    fill
                                    sizes="36px"
                                    className="object-contain"
                                />
                            </div>
                            <span className="montserrat text-xs font-black tracking-wide text-[var(--navy)]">
                                PRINCE DEFENCE ACADEMY
                            </span>
                        </div>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-[#3869D0]">
                            <ShieldCheck size={13} />
                            Secure Admin Portal
                        </span>
                    </div>

                    {/* Main Form Area */}
                    <div className="my-auto">

                        {/* Icon badge */}
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-[#EAF2FD] text-[#3869D0] shadow-xs">
                            <Shield size={22} />
                        </div>

                        {/* Title & Subtitle (NO EYEBROW) */}
                        <h1 className="montserrat text-2xl font-black tracking-tight text-[var(--navy)] sm:text-3xl">
                            Admin Login
                        </h1>
                        <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
                            Enter your administrative credentials to access your dashboard.
                        </p>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:space-y-5">

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-xs font-bold text-[var(--navy)]"
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
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-4 text-sm text-[var(--navy)] outline-none transition placeholder:text-slate-400 focus:border-[#3869D0] focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="block text-xs font-bold text-[var(--navy)]"
                                    >
                                        Password
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => router.push("/admin/forgot-password")}
                                        disabled={loading}
                                        className="text-xs font-semibold text-[#3869D0] transition hover:text-[#2852aa] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Forgot Password?
                                    </button>
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
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-11 text-sm text-[var(--navy)] outline-none transition placeholder:text-slate-400 focus:border-[#3869D0] focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10 disabled:cursor-not-allowed disabled:opacity-60"
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

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#3869D0] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#3869D0]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2e5bbd] hover:shadow-xl hover:shadow-[#3869D0]/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={17} className="animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Login to Dashboard
                                        <ArrowRight
                                            size={17}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    </>
                                )}
                            </button>

                        </form>

                    </div>

                    {/* Footer Note */}
                    <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                            <Shield size={13} className="text-[#3869D0]" />
                            Authorized Personnel Only
                        </span>
                        <span>Palwas Road, Sikar</span>
                    </div>

                </div>

                {/* DESKTOP-ONLY RIGHT COLUMN: 3D CYBERSECURITY VISUAL (Untitled UI Match) */}
                <div className="relative hidden p-3 lg:col-span-5 lg:block">
                    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1b39] via-[#0d2752] to-[#12366f] shadow-inner">
                        <Image
                            src="/images/auth-login-portal.jpg"
                            alt="3D Admin Portal Security"
                            fill
                            priority
                            className="object-cover object-center"
                            sizes="50vw"
                        />

                        {/* Atmospheric gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#071326] via-[#071326]/30 to-transparent" />

                        {/* Bottom Floating Security Testimonial/Badge */}
                        <div className="absolute bottom-6 left-6 right-6 z-10 rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
                            <p className="text-xs font-bold leading-relaxed text-white">
                                &ldquo;Managing student admissions, quiz database, achievers, and operations with enterprise-grade security.&rdquo;
                            </p>
                            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                                <div>
                                    <p className="text-xs font-black text-white">
                                        Prince Defence Academy
                                    </p>
                                    <p className="text-[10px] text-blue-200">
                                        Central Command Gateway
                                    </p>
                                </div>
                                <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-[10px] font-bold text-blue-200">
                                    Encrypted
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </main>
    );
}
