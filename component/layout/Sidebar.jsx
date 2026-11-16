"use client";

import { useEffect, useState, useContext } from "react";
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
    ClipboardList,
    BarChart3,
    Users,
    Eye,
    Trophy,
    User,
    ChevronLeft,
    ChevronRight,
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
    // {
    //     href: "/admin/blogs",
    //     label: "Blogs",
    //     icon: NotebookPen,
    // },
    {
        href: "/admin/achievers",
        label: "Achievers",
        icon: Trophy,
        allowedRoles: ["superAdmin", "admin"],
    },
    {
        href: "/admin/admins",
        label: "Admins",
        icon: ShieldCheck,
        allowedRoles: ["superAdmin"],
    },
    {
        href: "/admin/profile",
        label: "Profile",
        icon: User,
    },
];

const Sidebar = () => {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("admin_sidebar_collapsed");
            if (saved !== null) {
                queueMicrotask(() => {
                    setCollapsed(saved === "true");
                });
            }
        } catch {
            // ignore
        }
    }, []);

    const toggleCollapse = () => {
        setCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem("admin_sidebar_collapsed", String(next));
            } catch {
                // ignore
            }
            return next;
        });
    };

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
                <div className="flex items-center gap-2.5">
                    <img
                        src="/logos/mainLogo.png"
                        alt="Prince Defence Academy"
                        className="h-8 w-8 object-contain"
                    />
                    <span className="montserrat text-sm font-extrabold">
                        Prince Defence Academy
                    </span>
                </div>

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

            {/* Unhide Arrow Button (Desktop - when sidebar is hidden) */}
            {collapsed && (
                <button
                    type="button"
                    onClick={toggleCollapse}
                    title="Unhide sidebar"
                    aria-label="Unhide sidebar"
                    className="fixed left-0 top-7 z-40 hidden items-center gap-2 rounded-r-xl border border-l-0 border-white/20 bg-[#102A43] py-2.5 pl-2.5 pr-3.5 text-xs font-bold text-white shadow-[4px_8px_30px_rgba(16,42,67,0.3)] backdrop-blur-md transition-all hover:bg-[#1A365D] hover:pl-3.5 hover:border-[#3869D0]/60 lg:flex group"
                >
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#3869D0]/30 text-[#B89242] transition-all group-hover:bg-[#3869D0] group-hover:text-white">
                        <ChevronRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                    <span className="tracking-wider text-[11px] uppercase text-[#CBD5E1] group-hover:text-white">
                        Sidebar
                    </span>
                </button>
            )}

            {/* Sidebar Desktop Wrapper */}
            <div
                className={`relative shrink-0 transition-all duration-300 ease-in-out ${collapsed ? "lg:w-0" : "lg:w-72"
                    }`}
            >
                <aside
                    className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] max-h-[100dvh] w-72 shrink-0 flex-col overflow-hidden bg-[#102A43] text-white shadow-2xl transition-all duration-300 lg:sticky lg:top-0 ${open
                        ? "translate-x-0"
                        : "-translate-x-full"
                        } ${collapsed
                            ? "lg:-translate-x-full lg:opacity-0 lg:pointer-events-none"
                            : "lg:translate-x-0 lg:opacity-100"
                        }`}
                >
                    {/* Decorative Glow */}

                    <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#3869D0]/20 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#94CCF9]/15 blur-3xl" />

                    <div className="pointer-events-none absolute right-1/3 top-1/3 h-48 w-48 rounded-full bg-[#F0F4FF]/5 blur-3xl" />

                    {/* Brand */}

                    <div className="relative flex shrink-0 items-center justify-between px-6 pb-5 pt-6">
                        <div className="flex items-center gap-3">

                            <div className="flex items-center justify-center rounded-full shadow-lg shadow-[#3869D0]/30">
                                <img
                                    src="/logos/mainLogo.png"
                                    alt="Prince Defence logo"
                                    className="h-10 w-10 object-contain"
                                />
                            </div>

                            <div>
                                <h2 className="montserrat text-xs lg:text-base font-extrabold leading-tight text-white">
                                    Prince Defence Academy
                                </h2>

                                <p className="text-[10px] font-bold tracking-[0.25em] text-[#B89242]">
                                    ADMIN PANEL
                                </p>
                            </div>
                        </div>

                        {/* Desktop Arrow Toggle Button in Header */}
                        <button
                            type="button"
                            onClick={toggleCollapse}
                            aria-label="Hide sidebar"
                            title="Hide sidebar"
                            className="hidden h-8 w-8 items-center justify-center rounded-lg border border-[#F0F4FF]/15 bg-[#F0F4FF]/5 text-[#CBD5E1] transition-all hover:border-[#3869D0]/50 hover:bg-[#3869D0] hover:text-white lg:flex"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Close menu"
                            title="Close menu"
                            className="rounded-lg p-1.5 text-[#CBD5E1] transition hover:bg-white/10 hover:text-white lg:hidden"
                        >
                            <ChevronLeft size={22} />
                        </button>
                    </div>

                    {/* Divider */}

                    <div className="mx-6 h-px shrink-0 bg-gradient-to-r from-transparent via-[#F0F4FF]/20 to-transparent" />

                    {/* Navigation - Scrollable only in this middle section */}

                    <nav className="relative flex-1 min-h-0 space-y-2.5 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                        <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.25em] text-[#CBD5E1]/50">
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
                                            className={`group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-300 ${active
                                                ? "bg-gradient-to-r from-[#3869D0] to-[#244A9A] text-white shadow-lg shadow-[#3869D0]/25"
                                                : "text-[#CBD5E1] hover:translate-x-1 hover:bg-[#F0F4FF]/10 hover:text-white"
                                                }`}
                                        >
                                            {active && (
                                                <span className="absolute -left-4 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-r-full bg-[#B89242]" />
                                            )}

                                            <span
                                                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${active
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

                    {/* User Card + Logout - Fixed at bottom */}

                    <div className="relative shrink-0 mt-auto border-t border-[#F0F4FF]/10 bg-[#102A43] p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.25)]">

                        <div className="flex items-center gap-3 rounded-xl border border-[#F0F4FF]/10 bg-[#F0F4FF]/5 p-3">

                            {/* Clickable Profile Card */}
                            <Link
                                href="/admin/profile"
                                onClick={() => setOpen(false)}
                                className="group flex min-w-0 flex-1 items-center gap-3 transition"
                                title="View your profile"
                            >
                                {/* Avatar */}
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3869D0] to-[#94CCF9] text-sm font-extrabold text-white shadow-md transition group-hover:scale-105 group-hover:ring-2 group-hover:ring-[#B89242]">
                                    {getAvatarLetter(user?.name)}
                                </div>

                                {/* User Details */}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-white transition group-hover:text-[#B89242]">
                                        {user?.name || "Admin"}
                                    </p>

                                    <p className="truncate text-xs leading-5 text-[#CBD5E1]">
                                        {user?.email || "Email not available"}
                                    </p>
                                </div>
                            </Link>

                            {/* Logout */}

                            <button
                                aria-label="Logout"
                                title="Logout"
                                className="rounded-lg p-2 text-[#CBD5E1] transition-colors hover:bg-[#B89242]/15 hover:text-[#B89242]"
                                onClick={handleLogout}
                            >
                                <LogOut size={17} />
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
};

export default Sidebar;