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
    const [showPassword, setShowPassword] = useState(false);
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
        <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB] p-3 sm:p-6 lg:p-10">

            {/* Card Container */}
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)] sm:p-10">

                {/* Back to Login */}
                <button
                    type="button"
                    onClick={() => router.push("/login")}
                    disabled={loading}
                    className="group mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-[#3869D0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
                    Back to Login
                </button>

                {/* Header */}
                <div className="mb-5 text-center">

                    {/* Academy Badge */}
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1 shadow-xs">
                        <div className="relative h-4.5 w-4.5 shrink-0 overflow-hidden rounded-full">
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

                    {/* Lock Icon Badge */}
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-[#EAF2FD] via-[#F0F5FE] to-[#DFECFD] text-[#3869D0] shadow-sm">
                        <Lock size={26} />
                    </div>

                    <h1 className="montserrat text-2xl font-black text-[var(--navy)] sm:text-3xl">
                        Reset Password
                    </h1>

                    <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                        Create a strong new password for your admin account.
                    </p>
                </div>

                {/* Account info */}
                <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-xs">
                    <span className="font-semibold text-slate-400">Account:</span>
                    <span className="truncate max-w-[240px] font-bold text-[var(--navy)]">
                        {email}
                    </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

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
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter at least 12 characters"
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength={12}
                                disabled={loading}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-11 text-sm text-[var(--navy)] outline-none transition focus:border-[#3869D0] focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10 disabled:cursor-not-allowed disabled:opacity-60"
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

                        <p className="mt-1.5 text-[11px] text-slate-400">
                            Must be at least 12 characters (maximum 72 bytes).
                        </p>
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
                                placeholder="Re-enter new password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-11 text-sm text-[var(--navy)] outline-none transition focus:border-[#3869D0] focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10 disabled:cursor-not-allowed disabled:opacity-60"
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

                    {/* Submit Button */}
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

                {/* Security Note */}
                <div className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
                    <Shield size={13} className="text-slate-400" />
                    <span>Your password is securely encrypted • Prince Defence Academy</span>
                </div>

            </div>

        </main>
    );
}
