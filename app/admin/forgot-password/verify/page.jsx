"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import {
    Shield,
    Mail,
    ArrowRight,
    Loader2,
    KeyRound,
    ArrowLeft,
    RefreshCw,
} from "lucide-react";

import {
    verifyOtp,
    resendOtp,
} from "@/services/passwordResetService";
import {
    savePasswordResetToken,
} from "@/services/passwordResetSession";

export default function VerifyOtpPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-gradient-to-br from-[#0f1f4a] via-[#1a3577] to-[#3869D0]" />
            }
        >
            <VerifyOtpForm />
        </Suspense>
    );
}

function VerifyOtpForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const email = searchParams.get("email") || "";
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const [resendLoading, setResendLoading] =
        useState(false);

    const [resendTimer, setResendTimer] =
        useState(60);

    // Resend countdown
    useEffect(() => {
        if (resendTimer <= 0) return;

        const timer = setInterval(() => {
            setResendTimer(
                (current) => current - 1
            );
        }, 1000);

        return () => clearInterval(timer);
    }, [resendTimer]);

    const handleOtpChange = (e) => {
        const value = e.target.value
            .replace(/\D/g, "")
            .slice(0, 6);

        setOtp(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        if (otp.length !== 6) {
            toast.error(
                "Please enter the complete 6-digit OTP."
            );
            return;
        }

        if (!email) {
            toast.error(
                "Email information is missing."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await verifyOtp(
                email,
                otp
            );

            const resetToken =
                response?.data?.resetToken;

            if (!resetToken) {
                throw new Error(
                    "Reset token was not received."
                );
            }

            savePasswordResetToken(resetToken);

            toast.success(
                "OTP verified successfully."
            );

            router.replace(
                `/admin/forgot-password/reset?email=${encodeURIComponent(
                    email
                )}`
            );
        } catch (error) {
            console.error("OTP Verification Error:", error);
            toast.error("Invalid or expired verification code.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (
            resendLoading ||
            resendTimer > 0
        ) {
            return;
        }

        if (!email) {
            toast.error(
                "Email information is missing."
            );
            return;
        }

        setResendLoading(true);

        try {
            await resendOtp(email);

            setOtp("");
            setResendTimer(60);

            toast.success(
                "If an account exists with this email, a verification code has been sent."
            );
        } catch (error) {
            console.error("Resend OTP Error:", error);
            toast.error("Unable to process your request. Please try again.");
        } finally {
            setResendLoading(false);
        }
    };

    if (!email) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f1f4a] via-[#1a3577] to-[#3869D0] p-4">
                <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/15 p-8 text-center text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                    <h1 className="text-xl font-bold">
                        Recovery session expired
                    </h1>
                    <p className="mt-3 text-sm text-white/70">
                        Start password recovery again to request a new verification code.
                    </p>
                    <button
                        type="button"
                        onClick={() => router.replace("/admin/forgot-password")}
                        className="mt-6 rounded-xl bg-[#fde68a] px-5 py-3 text-sm font-bold text-[#0f1f4a]"
                    >
                        Restart recovery
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f1f4a] via-[#1a3577] to-[#3869D0] p-4">

            {/* Background Effects */}

            <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#94CCF9]/40 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#3869D0]/60 blur-3xl" />

            <div className="pointer-events-none absolute right-1/4 top-1/4 h-64 w-64 rounded-full bg-[#7c3aed]/30 blur-3xl" />

            <div className="pointer-events-none absolute bottom-1/4 left-1/4 h-56 w-56 rounded-full bg-[#fbbf24]/25 blur-3xl" />

            {/* Card */}

            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/30 bg-white/15 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-10">

                {/* Top Glow */}

                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/20 to-transparent" />

                {/* Back */}

                <button
                    type="button"
                    onClick={() =>
                        router.push(
                            "/admin/forgot-password"
                        )
                    }
                    disabled={loading}
                    className="relative mb-7 flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ArrowLeft size={16} />

                    Back
                </button>

                {/* Header */}

                <div className="relative mb-8 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/40 bg-gradient-to-br from-[#3869D0] via-[#5b8de0] to-[#94CCF9] text-white shadow-lg shadow-[#3869D0]/50">

                        <KeyRound size={30} />

                    </div>

                    <p className="mt-5 text-[10px] font-bold tracking-[0.25em] text-[#fde68a]">
                        VERIFY IDENTITY
                    </p>

                    <h1 className="montserrat mt-2 text-3xl font-extrabold text-white">
                        Verify OTP
                    </h1>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/60">
                        Enter the 6-digit verification
                        code sent to your registered
                        email address.
                    </p>

                </div>

                {/* Email */}

                <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3">

                    <Mail
                        size={17}
                        className="shrink-0 text-[#fde68a]"
                    />

                    <p className="min-w-0 truncate text-sm text-white/75">
                        {email || "Email not available"}
                    </p>

                </div>

                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="relative space-y-5"
                >

                    {/* OTP */}

                    <div>

                        <label
                            htmlFor="otp"
                            className="mb-2 block text-sm font-semibold text-white/90"
                        >
                            Verification Code
                        </label>

                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            placeholder="000000"
                            value={otp}
                            onChange={handleOtpChange}
                            maxLength={6}
                            disabled={loading}
                            className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-white outline-none backdrop-blur-md transition-all placeholder:text-white/25 focus:border-[#94CCF9] focus:bg-white/20 focus:ring-4 focus:ring-[#94CCF9]/20 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <p className="mt-2 text-center text-xs text-white/45">
                            OTP is valid for 5 minutes.
                        </p>

                    </div>

                    {/* Verify Button */}

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            otp.length !== 6
                        }
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#fbbf24] via-[#fcd34d] to-[#fde68a] px-4 py-3.5 text-sm font-extrabold text-[#0f1f4a] shadow-lg shadow-[#fbbf24]/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#fbbf24]/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >

                        {loading ? (
                            <>
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />

                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify OTP

                                <ArrowRight
                                    size={17}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </>
                        )}

                    </button>

                </form>

                {/* Resend */}

                <div className="mt-6 text-center">

                    <p className="mb-2 text-xs text-white/45">
                        Didn&apos;t receive the code?
                    </p>

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={
                            resendLoading ||
                            resendTimer > 0
                        }
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#fde68a] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {resendLoading ? (
                            <>
                                <Loader2
                                    size={15}
                                    className="animate-spin"
                                />

                                Sending...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={15} />

                                {resendTimer > 0
                                    ? `Resend in ${resendTimer}s`
                                    : "Resend OTP"}
                            </>
                        )}

                    </button>

                </div>

                {/* Security */}

                <div className="relative mt-7 flex items-center justify-center gap-2 text-center text-[11px] text-white/45">

                    <Shield size={12} />

                    <span>
                        Never share your verification code
                    </span>

                </div>

            </div>

        </main>
    );
}