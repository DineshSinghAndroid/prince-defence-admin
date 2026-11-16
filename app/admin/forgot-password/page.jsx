"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
    Shield,
    Mail,
    ArrowRight,
    Loader2,
    KeyRound,
    ArrowLeft,
} from "lucide-react";

import {
    forgotPassword,
} from "@/services/passwordResetService";
import {
    savePasswordResetEmail,
} from "@/services/passwordResetSession";

export default function ForgotPasswordPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            toast.error("Please enter your registered email address.");
            return;
        }

        setLoading(true);

        try {
            savePasswordResetEmail(normalizedEmail);
            await forgotPassword(normalizedEmail);

            toast.success(
                "If an account exists with this email, a verification code has been sent."
            );

            router.replace(
                `/admin/forgot-password/verify?email=${encodeURIComponent(
                    normalizedEmail
                )}`
            );
        } catch (error) {
            console.error("Forgot Password Error:", error);
            toast.error("Unable to process your request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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

                {/* Header with Academy Badge & Key Icon */}
                <div className="mb-6 text-center">

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
                        Forgot Password?
                    </h1>

                    <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                        Enter your registered admin email address and we&apos;ll send you a verification code.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

                    {/* Email Input */}
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1.5 block text-xs font-bold text-[var(--navy)]"
                        >
                            Registered Email Address
                        </label>

                        <div className="relative">
                            <Mail
                                size={18}
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your registered email"
                                autoComplete="email"
                                maxLength={254}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-4 text-sm text-[var(--navy)] outline-none transition placeholder:text-slate-400 focus:border-[#3869D0] focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#3869D0] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#3869D0]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2e5bbd] hover:shadow-xl hover:shadow-[#3869D0]/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={17} className="animate-spin" />
                                Sending Code...
                            </>
                        ) : (
                            <>
                                Send Verification Code
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
                    <span>Your account information remains secure • Prince Defence Academy</span>
                </div>

            </div>

        </main>
    );
}
