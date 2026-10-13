"use client";

import { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    LayoutDashboard,
    Contact,
    Images,
    ShieldCheck,
    LogOut,
    Menu,
    X,
    Shield,
    NotebookPen,
    ClipboardList,
    BarChart3,
    Users,
    Eye,
    Trophy,
} from "lucide-react";

const links = [
    {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
    },
    {
        href: "/admin/quiz",
        label: "Quiz Analytics",
        icon: BarChart3,
    },
    {
        href: "/admin/quiz/page-views",
        label: "Quiz Page Views",
        icon: Eye,
    },
    {
        href: "/admin/quiz/visitors",
        label: "Visitor Analytics",
        icon: Users,
    },
    {
        href: "/admin/quiz/questions",
        label: "Quiz Questions",
        icon: ClipboardList,
    },
    {
        href: "/admin/contacts",
        label: "Contacts",
        icon: Contact,
    },
    {
        href: "/admin/gallery",
        label: "Gallery",
        icon: Images,
    },
    {
        href: "/admin/admins",
        label: "Admins",
        icon: ShieldCheck,
        allowedRoles: ["superAdmin"],
    }, 
    {
        href: "/admin/blogs",
        label: "Blogs",
        icon: NotebookPen,
    },
    {
        href: "/admin/achievers",
        label: "Achievers",
        icon: Trophy,
        allowedRoles: ["superAdmin"],
    },
];

const Sidebar = () => {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const { user, handleLogout } = useContext(AuthContext);
    const visibleLinks = links.filter(
        (link) =>
            !link.allowedRoles ||
            link.allowedRoles.includes(user?.role)
    );
    const activeHref = visibleLinks
        .filter(
            ({ href }) =>
                pathname === href ||
                pathname.startsWith(`${href}/`)
        )
        .sort((first, second) => second.href.length - first.href.length)[0]
        ?.href;

    const getAvatarLetter = (name) => {
        if (!name) {
            return "A";
        }

        return name
            .trim()
            .charAt(0)
            .toUpperCase();
    };

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-[#102A43] px-5 py-3 text-white shadow-lg lg:hidden">
                <span className="montserrat text-base font-extrabold italic">
                    Prince Defence
                </span>

                <button
                    onClick={() => setOpen(true)}
                    aria-label="Open menu"
                    className="rounded-lg p-2 text-white transition hover:bg-white/10"
                >
                    <Menu size={22} />
                </button>
            </div>

            {/* Mobile Overlay */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-40 bg-[#102A43]/60 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex h-screen min-h-screen w-72 shrink-0 flex-col overflow-hidden bg-[#102A43] text-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 ${
                    open
                        ? "translate-x-0"
                        : "-translate-x-full"
                }`}
            >
                {/* Decorative Glow */}

                <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#3869D0]/20 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#94CCF9]/15 blur-3xl" />

                <div className="pointer-events-none absolute right-1/3 top-1/3 h-48 w-48 rounded-full bg-[#F0F4FF]/5 blur-3xl" />

                {/* Brand */}

                <div className="relative flex items-center justify-between px-6 pb-6 pt-7">
                    <div className="flex items-center gap-3">

                        <div className="flex items-center justify-center rounded-full shadow-lg shadow-[#3869D0]/30">
                            <img
                                src="/logos/mainLogo.png"
                                alt="Prince Defence logo"
                                className="h-10 w-10 object-contain"
                            />
                        </div>

                        <div>
                            <h2 className="montserrat text-lg font-extrabold italic leading-tight text-white">
                                Prince Defence
                            </h2>

                            <p className="text-[10px] font-bold tracking-[0.25em] text-[#B89242]">
                                ADMIN PANEL
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setOpen(false)}
                        aria-label="Close menu"
                        className="rounded-lg p-1.5 text-[#CBD5E1] transition hover:bg-white/10 hover:text-white lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Divider */}

                <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[#F0F4FF]/20 to-transparent" />

                {/* Navigation */}

                <nav className="relative flex-1 space-y-3 overflow-y-auto px-4 py-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                    <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.25em] text-[#CBD5E1]/50">
                        MENU
                    </p>

                    {visibleLinks
                        .map(
                            ({
                                href,
                                label,
                                icon: Icon,
                            }) => {
                                const active = activeHref === href;

                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() =>
                                            setOpen(false)
                                        }
                                        className={`group relative flex items-center gap-3 rounded-xl px-4 py-4 text-base font-semibold transition-all duration-300 ${
                                            active
                                                ? "bg-gradient-to-r from-[#3869D0] to-[#244A9A] text-white shadow-lg shadow-[#3869D0]/25"
                                                : "text-[#CBD5E1] hover:translate-x-1 hover:bg-[#F0F4FF]/10 hover:text-white"
                                        }`}
                                    >
                                        {active && (
                                            <span className="absolute -left-4 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-r-full bg-[#B89242]" />
                                        )}

                                        <span
                                            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                                                active
                                                    ? "bg-white/20 text-white"
                                                    : "bg-[#F0F4FF]/5 text-[#CBD5E1] group-hover:bg-[#F0F4FF]/10 group-hover:text-white"
                                            }`}
                                        >
                                            <Icon size={18} />
                                        </span>

                                        {label}
                                    </Link>
                                );
                            }
                        )}
                </nav>

                {/* User Card + Logout */}

                <div className="relative border-t border-[#F0F4FF]/10 p-4">

                    <div className="flex items-center gap-3 rounded-xl border border-[#F0F4FF]/10 bg-[#F0F4FF]/5 p-3">

                        {/* Avatar */}

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3869D0] to-[#94CCF9] text-sm font-extrabold text-white shadow-md">
                            {getAvatarLetter(user?.name)}
                        </div>

                        {/* User Details */}

                        <div className="min-w-0 flex-1">

                            <p className="whitespace-nowrap text-sm font-bold text-white">
                                {user?.name || "Admin"}
                            </p>

                            <p className="break-all text-xs leading-5 text-[#CBD5E1]">
                                {user?.email ||
                                    "Email not available"}
                            </p>
                        </div>

                        {/* Logout */}

                        <button
                            aria-label="Logout"
                            className="rounded-lg p-2 text-[#CBD5E1] transition-colors hover:bg-[#B89242]/15 hover:text-[#B89242]"
                            onClick={handleLogout}
                        >
                            <LogOut size={17} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;