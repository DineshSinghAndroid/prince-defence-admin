"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import {
    Shield,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Loader2,
    CheckCircle2,
    ArrowLeft,
    XCircle,
    Key,
} from "lucide-react";

import {
    resetPassword,
} from "@/services/passwordResetService";
import {
    clearPasswordResetSession,
    usePasswordResetSession,
} from "@/services/passwordResetSession";

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
                    <div className="flex items-center gap-3">
                        <Loader2 size={24} className="animate-spin text-[#3869D0]" />
                        <p className="text-sm font-semibold text-slate-600">
                            Loading password reset...
                        </p>
                    </div>
                </main>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const { hydrated, resetToken } = usePasswordResetSession();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const validatePassword = () => {
        if (newPassword.length < 12) {
            return "Password must be at least 12 characters.";
        }

        if (new TextEncoder().encode(newPassword).length > 72) {
            return "Password must be no more than 72 bytes.";
        }

        if (newPassword !== confirmPassword) {
            return "Passwords do not match.";
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading || !hydrated) return;

        if (!email || !resetToken) {
            toast.error("Invalid or expired password reset session.");
            return;
        }

        const validationError = validatePassword();

        if (validationError) {
            toast.error(validationError);
            return;
        }

        setLoading(true);

        try {
            await resetPassword(email, resetToken, newPassword);

            clearPasswordResetSession();

            toast.success("Password reset successfully.");

            router.replace("/login");
        } catch (error) {
            console.error("Reset Password Error:", error);
            toast.error(
                "Unable to reset your password. Please try again or restart the recovery process."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!hydrated) {
        return null;
    }

    if (!email || !resetToken) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB] p-3 sm:p-6 lg:p-10">
                <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
                    <h1 className="montserrat text-xl font-bold text-[var(--navy)]">
                        Recovery Session Expired
                    </h1>
                    <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                        {!email
                            ? "Your recovery email is missing. Start password recovery again."
                            : "Verify a new code to continue resetting your password."}
                    </p>
                    <button
                        type="button"
                        onClick={() => router.replace("/admin/forgot-password")}
                        className="mt-6 rounded-xl bg-[#3869D0] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#3869D0]/20 transition hover:bg-[#2e5bbd]"
                    >
                        Restart Recovery
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F4F7FB] lg:flex lg:items-center lg:justify-center lg:p-6 xl:p-10">

            {/* Split Card Container (Desktop: Split Card | Mobile: Top Image + Bottom Sheet) */}
            <div className="relative mx-auto flex min-h-screen w-full flex-col bg-white lg:min-h-0 lg:max-w-5xl lg:grid lg:grid-cols-12 lg:overflow-hidden lg:rounded-3xl lg:border lg:border-slate-200/80 lg:shadow-[0_20px_60px_rgba(16,42,67,0.08)]">

                {/* MOBILE-ONLY TOP IMAGE HERO (Screenshot Match) */}
                <div className="relative h-60 w-full shrink-0 overflow-hidden bg-[#0d1d36] sm:h-72 lg:hidden">
                    <Image
                        src="/images/auth-reset-lock.jpg"
                        alt="Reset Password Security"
                        fill
                        priority
                        className="object-cover object-center"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1d36] via-[#0d1d36]/40 to-black/30" />

                    {/* Mobile Back Button */}
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        disabled={loading}
                        aria-label="Back to Login"
                        className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition active:scale-95 disabled:opacity-50"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    {/* Mobile Hero Headline */}
                    <div className="absolute bottom-6 left-5 right-5 z-10">
                        <h2 className="montserrat text-xl font-black text-white">
                            Set New Password
                        </h2>
                        <p className="mt-1 text-xs text-blue-100/80">
                            Create a secure, strong password for account protection.
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

                        <button
                            type="button"
                            onClick={() => router.push("/login")}
                            disabled={loading}
                            className="group flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-[#3869D0] disabled:opacity-50"
                        >
                            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                            Back to login
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="my-auto">

                        {/* Icon badge */}
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-[#EAF2FD] text-[#3869D0] shadow-xs">
                            <Key size={22} />
                        </div>

                        {/* Title & Subtitle (NO EYEBROW) */}
                        <h1 className="montserrat text-2xl font-black tracking-tight text-[var(--navy)] sm:text-3xl">
                            Set new password
                        </h1>
                        <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
                            Must be at least 12 characters. Choose a unique password for maximum protection.
                        </p>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:space-y-5">

                            {/* New Password */}
                            <div>
                                <label
                                    htmlFor="newPassword"
                                    className="mb-1.5 block text-xs font-bold text-[var(--navy)]"
                                >
                                    New Password
                                </label>

                                <div className="relative">
                                    <Lock
                                        size={18}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Enter at least 12 characters"
                                        autoComplete="new-password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        minLength={12}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-11 text-sm text-[var(--navy)] outline-none transition placeholder:text-slate-400 focus:border-[#3869D0] focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((current) => !current)}
                                        disabled={loading}
                                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-1.5 block text-xs font-bold text-[var(--navy)]"
                                >
                                    Confirm Password
                                </label>

                                <div className="relative">
                                    <Lock
                                        size={18}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Re-enter your new password"
                                        autoComplete="new-password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-11 text-sm text-[var(--navy)] outline-none transition placeholder:text-slate-400 focus:border-[#3869D0] focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((current) => !current)}
                                        disabled={loading}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Password Match Status */}
                            {confirmPassword && (
                                <div
                                    className={`flex items-center gap-1.5 text-xs font-semibold ${
                                        newPassword === confirmPassword
                                            ? "text-emerald-600"
                                            : "text-red-500"
                                    }`}
                                >
                                    {newPassword === confirmPassword ? (
                                        <>
                                            <CheckCircle2 size={14} />
                                            Passwords match
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={14} />
                                            Passwords do not match
                                        </>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#3869D0] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#3869D0]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2e5bbd] hover:shadow-xl hover:shadow-[#3869D0]/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={17} className="animate-spin" />
                                        Resetting Password...
                                    </>
                                ) : (
                                    <>
                                        Reset Password
                                        <ArrowRight
                                            size={17}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    </>
                                )}
                            </button>

                        </form>

                        {/* Mobile Back Link */}
                        <div className="mt-5 text-center lg:hidden">
                            <button
                                type="button"
                                onClick={() => router.push("/login")}
                                disabled={loading}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#3869D0] disabled:opacity-50"
                            >
                                <ArrowLeft size={14} />
                                Back to login
                            </button>
                        </div>

                    </div>

                    {/* Footer note */}
                    <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                            <Shield size={13} className="text-[#3869D0]" />
                            End-to-End Encrypted
                        </span>
                        <span>Prince Defence Academy</span>
                    </div>

                </div>

                {/* DESKTOP-ONLY RIGHT COLUMN: 3D CYBER LOCK VISUAL (Untitled UI Match) */}
                <div className="relative hidden p-3 lg:col-span-5 lg:block">
                    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1b39] via-[#0d2752] to-[#12366f] shadow-inner">
                        <Image
                            src="/images/auth-reset-lock.jpg"
                            alt="3D Cyber Lock Security"
                            fill
                            priority
                            className="object-cover object-center"
                            sizes="50vw"
                        />

                        {/* Atmospheric gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#071326] via-[#071326]/30 to-transparent" />

                        {/* Bottom Floating Testimonial/Badge */}
                        <div className="absolute bottom-6 left-6 right-6 z-10 rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
                            <p className="text-xs font-bold leading-relaxed text-white">
                                &ldquo;Passwords are salted and cryptographically hashed with industry-standard bcrypt algorithms.&rdquo;
                            </p>
                            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                                <div>
                                    <p className="text-xs font-black text-white">
                                        Cryptographic Security
                                    </p>
                                    <p className="text-[10px] text-blue-200">
                                        SHA-256 / Bcrypt Hash
                                    </p>
                                </div>
                                <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-[10px] font-bold text-blue-200">
                                    Protected
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </main>
    );
}
