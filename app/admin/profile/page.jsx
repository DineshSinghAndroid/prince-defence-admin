"use client";

import { useContext, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";
import {
    User,
    Mail,
    ShieldCheck,
    CheckCircle2,
    Shield,
    Copy,
    Check,
    ArrowLeft,
    LogOut,
    KeyRound,
    Sparkles,
} from "lucide-react";

const glass =
    "border border-[#C8D5EA]/70 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(16,42,67,0.08)]";

export default function AdminProfilePage() {
    const { user, handleLogout } = useContext(AuthContext);
    const [copied, setCopied] = useState(false);

    const getAvatarLetter = (name) => {
        if (!name) return "A";
        return name.trim().charAt(0).toUpperCase();
    };

    const handleCopyId = () => {
        const id = user?.id || user?._id;
        if (!id) return;
        navigator.clipboard.writeText(String(id));
        setCopied(true);
        toast.success("Admin ID copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const isSuperAdmin = user?.role === "superAdmin";

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#F2F6FF] px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:pt-8">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#3869D0]/10 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[#B8C9F5]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-[var(--gold)]/10 blur-3xl" />

            <div className="relative mx-auto max-w-5xl">
                {/* Back button */}
                <div className="mb-4">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center gap-2 rounded-xl border border-[#C8D5EA] bg-white/80 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[var(--navy)] shadow-xs transition hover:bg-white hover:text-[#3869D0]"
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </Link>
                </div>

                {/* Header Banner */}
                <header className="relative overflow-hidden rounded-3xl border border-white/70 bg-[var(--navy)] px-6 py-8 text-white shadow-[0_18px_50px_rgba(16,42,67,0.16)] sm:px-10">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#3869D0]/25 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[var(--gold)]/15 blur-3xl" />

                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-[#E8D39A]">
                                <Sparkles size={13} />
                                ADMINISTRATOR PROFILE
                            </div>
                            <h1 className="montserrat mt-2 text-2xl font-extrabold leading-tight text-white sm:text-4xl">
                                Account Overview
                            </h1>
                            <p className="mt-1.5 text-xs sm:text-sm text-white/70">
                                View your verified administrator credentials and portal permissions.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/15 px-4 text-xs sm:text-sm font-bold text-red-200 transition hover:bg-red-500/25 hover:text-white"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </header>

                {/* Identity Hero Card */}
                <section className={`mt-6 rounded-3xl p-5 sm:p-7 ${glass}`} aria-label="Administrator Identity">
                    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                        {/* Monogram Avatar (No photo required) */}
                        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#102A43] via-[#1b3d63] to-[#3869D0] text-3xl sm:h-24 sm:w-24 sm:text-4xl font-black text-white shadow-[0_10px_30px_rgba(36,74,154,0.35)] ring-4 ring-white">
                            {getAvatarLetter(user?.name)}

                            {/* Active Status Badge Indicator */}
                            <span
                                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-sm"
                                title="Active Status"
                            >
                                <Check size={13} className="text-white" />
                            </span>
                        </div>

                        {/* Name & Role */}
                        <div className="min-w-0 flex-1 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                <h2 className="text-xl font-extrabold text-[var(--navy)] sm:text-2xl">
                                    {user?.name || "Administrator"}
                                </h2>

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                        isSuperAdmin
                                            ? "border border-[#b89242]/30 bg-[#b89242]/10 text-[#8A6820]"
                                            : "border border-[#3869D0]/30 bg-[#3869D0]/10 text-[#3869D0]"
                                    }`}
                                >
                                    <ShieldCheck size={13} />
                                    {isSuperAdmin ? "Super Admin" : "Admin"}
                                </span>

                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active Account
                                </span>
                            </div>

                            <p className="mt-1 flex items-center justify-center gap-1.5 text-xs sm:text-sm text-[#526579] sm:justify-start">
                                <Mail size={14} className="text-[#3869D0]" />
                                <span className="break-all font-medium">{user?.email || "—"}</span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* 2-Column Mobile Grid for Stat Boxes (Consistent with mobile layout) */}
                <section className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Profile Details">
                    {/* Name Card */}
                    <article className={`rounded-2xl p-3.5 sm:p-5 ${glass}`}>
                        <div className="flex items-center justify-between">
                            <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#3869D0]/10 text-[#3869D0]">
                                <User size={18} />
                            </span>
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Name</span>
                        </div>
                        <p className="mt-3 truncate text-base sm:text-lg font-extrabold text-[var(--navy)]">
                            {user?.name || "—"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#526579]">Display identity</p>
                    </article>

                    {/* Email Card */}
                    <article className={`rounded-2xl p-3.5 sm:p-5 ${glass}`}>
                        <div className="flex items-center justify-between">
                            <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#244A9A]/10 text-[#244A9A]">
                                <Mail size={18} />
                            </span>
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Email</span>
                        </div>
                        <p className="mt-3 truncate text-base sm:text-lg font-extrabold text-[var(--navy)]" title={user?.email}>
                            {user?.email || "—"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#526579]">Login credential</p>
                    </article>

                    {/* Role Card */}
                    <article className={`rounded-2xl p-3.5 sm:p-5 ${glass}`}>
                        <div className="flex items-center justify-between">
                            <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#b89242]/10 text-[#8A6820]">
                                <Shield size={18} />
                            </span>
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Role</span>
                        </div>
                        <p className="mt-3 truncate text-base sm:text-lg font-extrabold text-[var(--navy)]">
                            {isSuperAdmin ? "Super Admin" : "Administrator"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#526579]">Access clearance</p>
                    </article>

                    {/* Status Card */}
                    <article className={`rounded-2xl p-3.5 sm:p-5 ${glass}`}>
                        <div className="flex items-center justify-between">
                            <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                                <CheckCircle2 size={18} />
                            </span>
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Status</span>
                        </div>
                        <p className="mt-3 text-base sm:text-lg font-extrabold text-emerald-600">
                            {user?.isActive !== false ? "Active" : "Inactive"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#526579]">Portal authorization</p>
                    </article>
                </section>

                {/* Account Security & System Reference */}
                <section className={`mt-6 rounded-3xl p-5 sm:p-7 ${glass}`} aria-label="System Security">
                    <h3 className="flex items-center gap-2 text-sm sm:text-base font-bold text-[var(--navy)]">
                        <KeyRound size={17} className="text-[#3869D0]" />
                        System Security &amp; Credentials
                    </h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {/* Admin Identifier */}
                        <div className="rounded-2xl border border-[#C8D5EA]/70 bg-white/70 p-3.5 sm:p-4">
                            <p className="text-xs font-semibold text-[var(--muted)]">Administrator ID</p>
                            <div className="mt-1 flex items-center justify-between gap-2">
                                <span className="truncate font-mono text-xs sm:text-sm font-semibold text-[var(--navy)]">
                                    {user?.id || user?._id || "Not available"}
                                </span>
                                {(user?.id || user?._id) && (
                                    <button
                                        type="button"
                                        onClick={handleCopyId}
                                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#C8D5EA] bg-white px-2.5 py-1 text-xs font-semibold text-[#526579] transition hover:bg-[#F2F6FF] hover:text-[#3869D0]"
                                        title="Copy Admin ID"
                                    >
                                        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Session Security */}
                        <div className="rounded-2xl border border-[#C8D5EA]/70 bg-white/70 p-3.5 sm:p-4">
                            <p className="text-xs font-semibold text-[var(--muted)]">Security Protocol</p>
                            <p className="mt-1 text-xs sm:text-sm font-bold text-emerald-700">
                                HttpOnly Secure Token Active
                            </p>
                        </div>
                    </div>

                    {/* Permissions summary */}
                    <div className="mt-4 rounded-2xl border border-[#C8D5EA]/60 bg-[#F2F6FF]/60 p-4">
                        <p className="text-xs font-bold text-[var(--navy)]">Permissions Summary:</p>
                        <p className="mt-1 text-xs leading-relaxed text-[#526579]">
                            {isSuperAdmin
                                ? "You have elevated Super Administrator rights. You can manage administrators, contact submissions, gallery images, achievers records, and quiz analytics."
                                : "You have Administrator access. You can view contacts, manage gallery pictures, publish achievers, and monitor quiz activity."}
                        </p>
                    </div>

                    {/* Action Links */}
                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#C8D5EA]/60 pt-5">
                        <Link
                            href="/admin/dashboard"
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#3869D0] px-4 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#3869D0]/20 transition hover:bg-[#2b58b8]"
                        >
                            Open Dashboard
                        </Link>
                        {isSuperAdmin && (
                            <Link
                                href="/admin/admins"
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#C8D5EA] bg-white px-4 text-xs sm:text-sm font-bold text-[var(--navy)] shadow-xs transition hover:bg-[#F2F6FF] hover:text-[#3869D0]"
                            >
                                Manage All Admins
                            </Link>
                        )}
                        <Link
                            href="/admin/contacts"
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#C8D5EA] bg-white px-4 text-xs sm:text-sm font-bold text-[var(--navy)] shadow-xs transition hover:bg-[#F2F6FF] hover:text-[#3869D0]"
                        >
                            View Contacts
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
