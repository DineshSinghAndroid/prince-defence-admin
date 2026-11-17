"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    ArrowUpRight,
    BarChart3,
    CalendarDays,
    Contact,
    Images,
    Loader2,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Target,
    Trophy,
    Users,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { getDashboardStats, getQuizAnalytics } from "@/services/dashboardService";
import AnalyticsTrendChart from "@/component/quiz/AnalyticsTrendChart";

const glass = "border border-[#C8D5EA]/70 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(16,42,67,0.10)]";

const getIndiaDateKey = (offsetDays = 0) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    return new Date(Date.UTC(values.year, Number(values.month) - 1, Number(values.day) + offsetDays)).toISOString().slice(0, 10);
};

export default function DashboardPage() {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalContacts: 0,
        totalGalleryImages: 0,
        totalGalleryCategories: 0,
        totalAchievers: 0,
        // totalBlogs: 0,
        totalAdmins: 0,
        totalQuizAttempts: 0,
    });
    const [traffic, setTraffic] = useState({ visitors: 0, quizPageViews: 0, quizStarts: 0, completedAttempts: 0 });
    const [dailyStats, setDailyStats] = useState([]);
    const [fromDate, setFromDate] = useState(() => getIndiaDateKey(-6));
    const [toDate, setToDate] = useState(() => getIndiaDateKey());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const requestIdRef = useRef(0);

    const fetchDashboardData = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        try {
            const [dashboardResponse, analyticsResponse] = await Promise.all([
                getDashboardStats(),
                getQuizAnalytics({ from: fromDate, to: toDate }),
            ]);
            if (requestId !== requestIdRef.current) return;

            const dashboardData = dashboardResponse.data || {};
            const analyticsData = analyticsResponse.data || {};
            setStats({
                totalContacts: dashboardData.totalContacts || 0,
                totalGalleryImages: dashboardData.totalGalleryImages || 0,
                totalGalleryCategories: dashboardData.totalGalleryCategories || 0,
                totalAchievers: dashboardData.totalAchievers || 0,
                // totalBlogs: dashboardData.totalBlogs || 0,
                totalAdmins: dashboardData.totalAdmins || 0,
                totalQuizAttempts: analyticsData.summary?.quizStarts || 0,
            });
            setTraffic(analyticsData.summary || { visitors: 0, quizPageViews: 0, quizStarts: 0, completedAttempts: 0 });
            setDailyStats(analyticsData.dailyStats || []);
            setError("");
        } catch (fetchError) {
            if (requestId !== requestIdRef.current) return;
            setError(fetchError.message || "Unable to load dashboard statistics.");
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, [fromDate, toDate]);

    useEffect(() => {
        const timer = window.setTimeout(() => void fetchDashboardData(), 0);
        return () => window.clearTimeout(timer);
    }, [fetchDashboardData]);

    const refreshData = () => {
        setLoading(true);
        setError("");
        void fetchDashboardData();
    };

    const cards = [
        { label: "Contacts", value: stats.totalContacts, href: "/admin/contacts", icon: Contact, gradient: "from-[#3869D0] to-[#244A9A]" },
        { label: "Gallery Images", value: stats.totalGalleryImages, href: "/admin/gallery", icon: Images, gradient: "from-[#244A9A] to-[#3869D0]" },
        // { label: "Total Blogs", value: stats.totalBlogs, href: "/admin/blogs", icon: NotebookPen, gradient: "from-[#3869D0] to-[#5D83D8]" },
        { label: "Achievers", value: stats.totalAchievers, href: "/admin/achievers", icon: Trophy, gradient: "from-[#d97706] to-[#b89242]" },
        { label: "Visitors (once per day)", value: traffic.visitors, href: "/admin/quiz/visitors", icon: Users, gradient: "from-[#2d7a63] to-[#1b5748]" },
        { label: "Quiz Page Views", value: traffic.quizPageViews, href: "/admin/quiz", icon: BarChart3, gradient: "from-[#0ea5e9] to-[#0284c7]" },
        { label: "Quiz Starts", value: traffic.quizStarts ?? stats.totalQuizAttempts, href: "/admin/quiz", icon: Target, gradient: "from-[#8b5cf6] to-[#6d28d9]" },
        { label: "Quiz Completions", value: traffic.completedAttempts, href: "/admin/quiz", icon: Target, gradient: "from-[#b89242] to-[#8A6820]" },
        ...(user?.role === "superAdmin" ? [{ label: "Admins", value: stats.totalAdmins, href: "/admin/admins", icon: ShieldCheck, gradient: "from-[#b89242] to-[#8A6820]" }] : []),
    ];

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#F2F6FF] px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
            <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#3869D0]/10 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[#B8C9F5]/20 blur-3xl" />

            <div className="relative mx-auto max-w-7xl">
                <header className="relative overflow-hidden rounded-3xl border border-white/70 bg-[var(--navy)] px-6 py-8 text-white shadow-[0_18px_50px_rgba(16,42,67,0.16)] sm:px-10">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#3869D0]/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[var(--gold)]/10 blur-3xl" />
                    <div className="relative flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="cinzel text-3xl font-extrabold leading-tight text-white sm:text-4xl">Dashboard</h1>
                            <p className="mt-2 text-sm text-white/70">A quick view of academy pages, traffic, and quiz totals.</p>
                        </div>
                        <button type="button" onClick={refreshData} disabled={loading} aria-label="Refresh dashboard" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold hover:bg-white/20 disabled:opacity-50">
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />Refresh
                        </button>
                    </div>
                </header>

                {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                <section className={`mt-6 rounded-2xl p-4 sm:p-5 ${glass}`} aria-label="Traffic date filter">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <label className="flex flex-col gap-1.5 min-w-0">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-[#526579]">
                                <CalendarDays size={14} className="shrink-0 text-[#3869D0]" />
                                <span className="truncate">From date</span>
                            </span>
                            <input
                                type="date"
                                value={fromDate}
                                max={toDate}
                                onChange={(event) => { setLoading(true); setFromDate(event.target.value); }}
                                className="h-11 w-full min-w-0 rounded-xl border border-[#C8D5EA] bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-[var(--navy)] shadow-sm outline-none transition focus:border-[#3869D0] focus:ring-2 focus:ring-[#3869D0]/15"
                            />
                        </label>
                        <label className="flex flex-col gap-1.5 min-w-0">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-[#526579]">
                                <CalendarDays size={14} className="shrink-0 text-[#3869D0]" />
                                <span className="truncate">To date</span>
                            </span>
                            <input
                                type="date"
                                value={toDate}
                                min={fromDate}
                                max={getIndiaDateKey()}
                                onChange={(event) => { setLoading(true); setToDate(event.target.value); }}
                                className="h-11 w-full min-w-0 rounded-xl border border-[#C8D5EA] bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-[var(--navy)] shadow-sm outline-none transition focus:border-[#3869D0] focus:ring-2 focus:ring-[#3869D0]/15"
                            />
                        </label>
                    </div>
                </section>

                <section className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard totals">
                    {cards.map(({ label, value, href, icon: Icon, gradient }) => (
                        <Link key={label} href={href} className={`group relative overflow-hidden rounded-2xl p-3.5 sm:p-5 lg:p-6 transition hover:-translate-y-1 hover:bg-white/90 ${glass}`}>
                            <div className="relative flex items-center justify-between">
                                <span className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}><Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" /></span>
                                <ArrowUpRight size={16} className="text-[#526579] transition group-hover:text-[var(--gold)]" />
                            </div>
                            <p className="mt-3 sm:mt-5 text-xs sm:text-sm font-semibold text-[#526579] line-clamp-1">{label}</p>
                            <p className="mt-0.5 sm:mt-1 text-2xl font-extrabold text-[var(--navy)] sm:text-3xl lg:text-4xl">
                                {loading ? <Loader2 size={24} className="animate-spin text-[#3869D0]" /> : Number(value || 0).toLocaleString("en-IN")}
                            </p>
                        </Link>
                    ))}
                </section>

                <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Content management shortcuts">
                    {/* <Link
                        href="/admin/blogs"
                        className={`flex items-center justify-between rounded-2xl p-4 transition hover:-translate-y-0.5 hover:bg-white/90 ${glass}`}
                    >
                        <span className="flex items-center gap-3 text-sm font-semibold text-[var(--navy)]">
                            <NotebookPen size={19} className="text-[#3869D0]" />
                            Manage blogs
                        </span>
                        <ArrowUpRight size={17} className="text-[#526579]" />
                    </Link> */}
                    {/* <Link
                        href="/admin/blogs/create"
                        className={`flex items-center justify-between rounded-2xl p-4 transition hover:-translate-y-0.5 hover:bg-white/90 ${glass}`}
                    >
                        <span className="flex items-center gap-3 text-sm font-semibold text-[var(--navy)]">
                            <NotebookPen size={19} className="text-[var(--gold)]" />
                            Create a blog
                        </span>
                        <ArrowUpRight size={17} className="text-[#526579]" />
                    </Link> */}
                    <Link
                        href="/admin/gallery"
                        className={`flex items-center justify-between rounded-2xl p-4 transition hover:-translate-y-0.5 hover:bg-white/90 ${glass}`}
                    >
                        <span className="flex items-center gap-3 text-sm font-semibold text-[var(--navy)]">
                            <Images size={19} className="text-[#2d7a63]" />
                            Manage images &amp; categories
                        </span>
                        <ArrowUpRight size={17} className="text-[#526579]" />
                    </Link>
                </section>

                <AnalyticsTrendChart
                    from={fromDate}
                    to={toDate}
                    data={dailyStats}
                    title="Traffic performance"
                    description="Daily visitors and quiz page views · Each browser is counted once per India date"
                    loading={loading}
                    emptyMessage="No traffic data for this date range."
                    series={[
                        { key: "visitors", label: "Visitors", color: "#34D399" },
                        { key: "quizPageViews", label: "Quiz page views", color: "#F0BD5A" },
                    ]}
                />
            </div>
        </main>
    );
}
