"use client";

import { useState } from "react";
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
                        router.push("/login")
                    }
                    disabled={loading}
                    className="relative mb-7 flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ArrowLeft size={16} />

                    Back to Login
                </button>

                {/* Header */}

                <div className="relative mb-8 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/40 bg-gradient-to-br from-[#3869D0] via-[#5b8de0] to-[#94CCF9] text-white shadow-lg shadow-[#3869D0]/50">

                        <KeyRound size={30} />

                    </div>

                    <h1 className="montserrat mt-4 text-3xl font-extrabold text-white">
                        Forgot Password?
                    </h1>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/60">
                        Enter your registered admin email
                        address and we&apos;ll send you a
                        verification code.
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
                            Registered Email
                        </label>

                        <div className="relative">

                            <Mail
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                            />

                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your registered email"
                                autoComplete="email"
                                maxLength={254}
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

                    {/* Submit */}

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

                                Sending Code...
                            </>
                        ) : (
                            <>
                                Send Verification Code

                                <ArrowRight
                                    size={17}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </>
                        )}

                    </button>

                </form>

                {/* Security Message */}

                <div className="relative mt-7 flex items-center justify-center gap-2 text-center text-[11px] text-white/45">

                    <Shield size={12} />

                    <span>
                        Your account information remains secure
                    </span>

                </div>

            </div>

        </main>
    );
}