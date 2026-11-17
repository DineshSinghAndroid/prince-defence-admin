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

    const otp = otpDigits.join("");

    // Resend countdown
    useEffect(() => {
        if (resendTimer <= 0) return;

        const timer = setInterval(() => {
            setResendTimer((current) => current - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resendTimer]);

    const handleDigitChange = (index, value) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const newDigits = [...otpDigits];
        newDigits[index] = digit;
        setOtpDigits(newDigits);

        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

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
                    <h1 className="cinzel text-xl font-bold text-[var(--navy)]">
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
        <main className="min-h-screen bg-[#F4F7FB] lg:flex lg:items-center lg:justify-center lg:p-6 xl:p-10">

            {/* Split Card Container (Desktop: Split Card | Mobile: Top Image + Bottom Sheet) */}
            <div className="relative mx-auto flex min-h-screen w-full flex-col bg-white lg:min-h-0 lg:max-w-5xl xl:max-w-6xl lg:grid lg:grid-cols-2 lg:overflow-hidden lg:rounded-3xl lg:border lg:border-slate-200/80 lg:shadow-[0_20px_60px_rgba(16,42,67,0.08)]">

                {/* MOBILE-ONLY TOP IMAGE HERO (Screenshot Match) */}
                <div className="relative h-60 w-full shrink-0 overflow-hidden bg-[#0d1d36] sm:h-72 lg:hidden">
                    <Image
                        src="/images/auth-verify-otp.jpg"
                        alt="OTP 2FA Security"
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
                        onClick={() => router.push("/admin/forgot-password")}
                        disabled={loading}
                        aria-label="Back"
                        className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition active:scale-95 disabled:opacity-50"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    {/* Mobile Hero Headline */}
                    <div className="absolute bottom-6 left-5 right-5 z-10">
                        <h2 className="montserrat text-xl font-black text-white">
                            Verify 2FA Code
                        </h2>
                        <p className="mt-1 text-xs text-blue-100/80">
                            Enter the 6-digit verification code sent to your email.
                        </p>
                    </div>
                </div>

                {/* FORM COLUMN (Left on Desktop, Bottom Sheet on Mobile) */}
                <div className="relative -mt-4 flex flex-1 flex-col justify-between rounded-t-3xl bg-white p-6 shadow-xl sm:p-8 lg:mt-0 lg:rounded-none lg:p-10 xl:p-14 lg:shadow-none">

                    {/* Mobile pull indicator */}
                    <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 lg:hidden" />

                    {/* Desktop Top Brand Header */}
                    <div className="mb-6 hidden items-center justify-between lg:flex">
                        

                        <button
                            type="button"
                            onClick={() => router.push("/admin/forgot-password")}
                            disabled={loading}
                            className="group flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-[#3869D0] disabled:opacity-50"
                        >
                            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                            Back
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="my-auto">

                        {/* Title & Subtitle (NO EYEBROW) */}
                        <h1 className="cinzel text-2xl font-bold tracking-tight text-[var(--navy)] sm:text-3xl">
                            Verify OTP code
                        </h1>
                        <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
                            We sent a 6-digit verification code to your registered admin email.
                        </p>

                        {/* Target Email Chip */}
                        <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2 text-xs font-semibold text-[var(--navy)]">
                            <Mail size={14} className="shrink-0 text-[#3869D0]" />
                            <span className="truncate">{email}</span>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="mt-6 space-y-5">

                            {/* 6-Box OTP Input (Match Reference) */}
                            <div>
                                <label className="mb-3 block text-xs font-bold text-[var(--navy)]">
                                    6-Digit Verification Code
                                </label>

                                <div
                                    className="flex items-center justify-between gap-2 sm:gap-3"
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

                                <p className="mt-2 text-xs text-slate-400">
                                    OTP is valid for 5 minutes.
                                </p>
                            </div>

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
                                        Verify &amp; Continue
                                        <ArrowRight
                                            size={17}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    </>
                                )}
                            </button>

                        </form>

                        {/* Resend Section */}
                        <div className="mt-5 text-center">
                            <span className="text-xs text-slate-500">
                                Didn&apos;t receive the email?{" "}
                            </span>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendLoading || resendTimer > 0}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#3869D0] hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
                            >
                                {resendLoading ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" />
                                        Resending...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw size={12} />
                                        {resendTimer > 0
                                            ? `Resend in ${resendTimer}s`
                                            : "Click to resend"}
                                    </>
                                )}
                            </button>
                        </div>

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
                            Protected Verification
                        </span>
                        
                    </div>

                </div>

                {/* DESKTOP-ONLY RIGHT COLUMN: 3D HERO VISUAL (Untitled UI Match - Flush without padding) */}
                <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
                    <div className="relative h-full w-full min-h-[600px]">
                        <Image
                            src="/images/auth-verify-otp.jpg"
                            alt="Two-Factor Security Verification"
                            fill
                            priority
                            className="object-cover object-center"
                            sizes="(min-width: 1024px) 50vw, 100vw"
                        />

                        {/* Atmospheric gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                        {/* Bottom Clean Typography Overlay (No background card, no academy badge) */}
                        <div className="absolute bottom-8 left-8 right-8 z-10 xl:bottom-12 xl:left-12 xl:right-12">
                            <blockquote className="text-base font-bold leading-snug text-white sm:text-lg xl:text-xl">
                                &ldquo;Two-factor authentication ensures strictly verified administrators have permission to access records.&rdquo;
                            </blockquote>
                            <p className="mt-2.5 text-xs font-medium text-slate-300">
                                Real-Time Cryptographic Token Verification
                            </p>
                        </div>
                    </div>
                </div>

            </div>

        </main>
    );
}
