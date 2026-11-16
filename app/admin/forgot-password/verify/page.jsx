"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
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
                <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
                    <div className="flex items-center gap-3">
                        <Loader2 size={24} className="animate-spin text-[#3869D0]" />
                        <p className="text-sm font-semibold text-slate-600">
                            Loading verification...
                        </p>
                    </div>
                </main>
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
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);

    // Keep combined otp string in sync
    const otp = otpDigits.join("");

    // Resend countdown
    useEffect(() => {
        if (resendTimer <= 0) return;

        const timer = setInterval(() => {
            setResendTimer((current) => current - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resendTimer]);

    // Handle single digit entry in specific box
    const handleDigitChange = (index, value) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const newDigits = [...otpDigits];
        newDigits[index] = digit;
        setOtpDigits(newDigits);

        // Auto-focus next box
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace and arrow navigation
    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (!otpDigits[index] && index > 0) {
                const newDigits = [...otpDigits];
                newDigits[index - 1] = "";
                setOtpDigits(newDigits);
                inputRefs.current[index - 1]?.focus();
            } else {
                const newDigits = [...otpDigits];
                newDigits[index] = "";
                setOtpDigits(newDigits);
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle pasting complete 6-digit OTP
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!pastedData) return;

        const newDigits = ["", "", "", "", "", ""];
        for (let i = 0; i < pastedData.length; i++) {
            newDigits[i] = pastedData[i];
        }
        setOtpDigits(newDigits);

        const focusTarget = Math.min(pastedData.length, 5);
        inputRefs.current[focusTarget]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        if (otp.length !== 6) {
            toast.error("Please enter the complete 6-digit OTP.");
            return;
        }

        if (!email) {
            toast.error("Email information is missing.");
            return;
        }

        setLoading(true);

        try {
            const response = await verifyOtp(email, otp);

            const resetToken = response?.data?.resetToken;

            if (!resetToken) {
                throw new Error("Reset token was not received.");
            }

            savePasswordResetToken(resetToken);

            toast.success("OTP verified successfully.");

            router.replace(
                `/admin/forgot-password/reset?email=${encodeURIComponent(email)}`
            );
        } catch (error) {
            console.error("OTP Verification Error:", error);
            toast.error("Invalid or expired verification code.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendLoading || resendTimer > 0) {
            return;
        }

        if (!email) {
            toast.error("Email information is missing.");
            return;
        }

        setResendLoading(true);

        try {
            await resendOtp(email);

            setOtpDigits(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
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
            <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB] p-3 sm:p-6 lg:p-10">
                <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
                    <h1 className="montserrat text-xl font-bold text-[var(--navy)]">
                        Recovery Session Expired
                    </h1>
                    <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                        Start password recovery again to request a new verification code.
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

                {/* Back Link */}
                <button
                    type="button"
                    onClick={() => router.push("/admin/forgot-password")}
                    disabled={loading}
                    className="group mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-[#3869D0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
                    Back
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

                    {/* Key Icon Badge */}
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-[#EAF2FD] via-[#F0F5FE] to-[#DFECFD] text-[#3869D0] shadow-sm">
                        <KeyRound size={26} />
                    </div>

                    <h1 className="montserrat text-2xl font-black text-[var(--navy)] sm:text-3xl">
                        Verify OTP
                    </h1>

                    <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                        Enter the 6-digit verification code sent to your registered email address.
                    </p>
                </div>

                {/* Email Chip */}
                <div className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-xs font-semibold text-[var(--navy)]">
                    <Mail size={15} className="shrink-0 text-[#3869D0]" />
                    <span className="truncate max-w-[260px] sm:max-w-[300px]">
                        {email}
                    </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* 6-Box OTP Input */}
                    <div>
                        <label className="mb-2.5 block text-center text-xs font-bold text-[var(--navy)]">
                            Verification Code
                        </label>

                        {/* Digit Boxes */}
                        <div
                            className="flex items-center justify-between gap-2 sm:gap-2.5"
                            onPaste={handlePaste}
                        >
                            {otpDigits.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    autoComplete="one-time-code"
                                    value={digit}
                                    onChange={(e) =>
                                        handleDigitChange(index, e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        handleKeyDown(index, e)
                                    }
                                    disabled={loading}
                                    className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl border text-center text-xl sm:text-2xl font-black outline-none transition-all ${
                                        digit
                                            ? "border-[#3869D0] bg-blue-50/60 text-[#3869D0] shadow-xs ring-2 ring-[#3869D0]/20"
                                            : "border-slate-200 bg-slate-50/70 text-[var(--navy)] focus:border-[#3869D0] focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10"
                                    } disabled:cursor-not-allowed disabled:opacity-60`}
                                />
                            ))}
                        </div>

                        <p className="mt-2.5 text-center text-[11px] text-slate-400">
                            OTP is valid for 5 minutes.
                        </p>
                    </div>

                    {/* Verify Button */}
                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#3869D0] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#3869D0]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2e5bbd] hover:shadow-xl hover:shadow-[#3869D0]/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={17} className="animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify OTP
                                <ArrowRight
                                    size={17}
                                    className="transition-transform duration-200 group-hover:translate-x-1"
                                />
                            </>
                        )}
                    </button>

                </form>

                {/* Resend Section */}
                <div className="mt-6 text-center">
                    <p className="mb-1.5 text-xs text-slate-400">
                        Didn&apos;t receive the code?
                    </p>

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendLoading || resendTimer > 0}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3869D0] transition hover:text-[#2852aa] hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
                    >
                        {resendLoading ? (
                            <>
                                <Loader2 size={13} className="animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={13} />
                                {resendTimer > 0
                                    ? `Resend in ${resendTimer}s`
                                    : "Resend OTP"}
                            </>
                        )}
                    </button>
                </div>

                {/* Security Note */}
                <div className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
                    <Shield size={13} className="text-slate-400" />
                    <span>Never share your verification code • Prince Defence Academy</span>
                </div>

            </div>

        </main>
    );
}
