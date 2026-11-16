"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BarChart3, CalendarDays, Eye, RefreshCw, Search, Users } from "lucide-react";
import toast from "react-hot-toast";

import AnalyticsTrendChart from "@/component/quiz/AnalyticsTrendChart";
import { getQuizPageViewAnalytics } from "@/services/dashboardService";

const glass = "rounded-2xl border border-[#C8D5EA]/70 bg-white/75 shadow-[0_8px_32px_rgba(16,42,67,0.08)] backdrop-blur-xl";
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

const formatTimestamp = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      }).format(new Date(value))
    : "—";

export default function QuizPageViewsPage() {
  const [fromDate, setFromDate] = useState(() => getIndiaDateKey(-6));
  const [toDate, setToDate] = useState(() => getIndiaDateKey());
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    summary: { views: 0, visitors: 0 },
    dailyStats: [],
    topPages: [],
    pageViews: [],
    pagination: { page: 1, pages: 0, total: 0 },
  });
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const loadData = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      const response = await getQuizPageViewAnalytics({
        from: fromDate,
        to: toDate,
        page,
        search,
      });
      if (requestId === requestIdRef.current) {
        setData(response.data);
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        toast.error(error.message || "Unable to load quiz page views.");
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [fromDate, toDate, page, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const changeRange = (setter) => (event) => {
    setPage(1);
    setter(event.target.value);
  };

  return (
    <main className="min-h-screen bg-[#F2F6FF] px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-7xl">
        <header className="relative overflow-hidden rounded-3xl border border-white/70 bg-[var(--navy)] px-6 py-8 text-white shadow-[0_18px_50px_rgba(16,42,67,0.16)] backdrop-blur-xl sm:px-10">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[#3869D0]/20 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="montserrat text-3xl font-extrabold leading-tight text-white sm:text-4xl">Quiz Page Views</h1>
              <p className="mt-2 text-sm text-white/70">Live traffic, popular quiz routes, and individual view history.</p>
            </div>
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </header>

        <section className={`mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 ${glass}`} aria-label="Page view filters">
          <label className="grid gap-2 text-xs font-semibold text-[#526579]">
            <span className="flex items-center gap-2"><CalendarDays size={15} /> From date</span>
            <input type="date" value={fromDate} max={toDate} onChange={changeRange(setFromDate)} className="min-h-11 rounded-xl border border-[#C8D5EA] bg-white px-3 text-sm text-[var(--navy)]" />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[#526579]">
            <span className="flex items-center gap-2"><CalendarDays size={15} /> To date</span>
            <input type="date" value={toDate} min={fromDate} max={getIndiaDateKey()} onChange={changeRange(setToDate)} className="min-h-11 rounded-xl border border-[#C8D5EA] bg-white px-3 text-sm text-[var(--navy)]" />
          </label>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2" aria-label="Quiz page view metrics">
          {[
            { label: "Total quiz page views", value: data.summary.views, icon: BarChart3, color: "from-[#3869D0] to-[#244A9A]" },
            { label: "Unique visitors", value: data.summary.visitors, icon: Users, color: "from-[#2d7a63] to-[#1b5748]" },
          ].map(({ label, value, icon: Icon, color }) => (
            <article key={label} className={`rounded-2xl p-3.5 sm:p-5 sm:p-6 ${glass}`}>
              <span className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white`}><Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" /></span>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-[#526579]">{label}</p>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-[var(--navy)]">{loading ? "…" : Number(value || 0).toLocaleString("en-IN")}</p>
            </article>
          ))}
        </section>

        <AnalyticsTrendChart
          from={fromDate}
          to={toDate}
          data={data.dailyStats}
          title="Traffic performance"
          description="Daily quiz page views and unique visitors"
          loading={loading}
          emptyMessage="No quiz page views in this date range."
          series={[
            { key: "views", label: "Views", color: "#34D399" },
            { key: "visitors", label: "Visitors", color: "#F0BD5A" },
          ]}
        />

        <section className={`mt-6 overflow-hidden p-5 sm:p-7 ${glass}`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--navy)]">Most viewed quiz pages</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">Top routes in the selected date range</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.topPages.map((item) => (
              <article key={item.path} className="rounded-xl border border-[#DCE5F1] bg-white/70 p-4">
                <p className="truncate text-sm font-bold text-[var(--navy)]" title={item.path}>{item.path}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">{Number(item.views).toLocaleString("en-IN")} views · {Number(item.visitors).toLocaleString("en-IN")} visitors</p>
              </article>
            ))}
            {!data.topPages.length && <p className="text-sm text-[var(--muted)]">{loading ? "Loading routes…" : "No route data for this period."}</p>}
          </div>
        </section>

        <section className={`mt-6 overflow-hidden p-5 sm:p-7 ${glass}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--navy)]">Recent page views</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">{Number(data.pagination.total || 0).toLocaleString("en-IN")} records</p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search route, visitor, device…" className="min-h-11 w-full rounded-xl border border-[#C8D5EA] bg-white pl-9 pr-3 text-sm text-[var(--navy)] outline-none focus:border-[#3869D0]" />
            </label>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[820px] border-separate border-spacing-y-2 text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <tr><th className="px-3 py-2">Visited at (IST)</th><th className="px-3 py-2">Page</th><th className="px-3 py-2">Visitor ID</th><th className="px-3 py-2">Device</th><th className="px-3 py-2">Source</th></tr>
              </thead>
              <tbody>
                {data.pageViews.map((view) => (
                  <tr key={view._id} className="bg-white/80 text-[#40556B]">
                    <td className="rounded-l-xl px-3 py-3">{formatTimestamp(view.createdAt)}</td>
                    <td className="max-w-56 truncate px-3 py-3 font-semibold text-[var(--navy)]" title={view.path}>{view.path}</td>
                    <td className="px-3 py-3 font-mono">{view.visitorId}</td>
                    <td className="px-3 py-3 capitalize">{view.device || "unknown"}</td>
                    <td className="rounded-r-xl px-3 py-3">{view.source || "direct"}</td>
                  </tr>
                ))}
                {!data.pageViews.length && <tr><td colSpan={5} className="py-10 text-center text-[var(--muted)]">{loading ? "Loading page views…" : "No page views match these filters."}</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-[var(--muted)]">Page {page} of {data.pagination.pages || 1}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={loading || page <= 1} className="rounded-lg border border-[#C8D5EA] bg-white px-4 py-2 text-xs font-semibold text-[#3869D0] disabled:opacity-40">Previous</button>
              <button type="button" onClick={() => setPage((value) => Math.min(data.pagination.pages, value + 1))} disabled={loading || page >= data.pagination.pages} className="rounded-lg border border-[#C8D5EA] bg-white px-4 py-2 text-xs font-semibold text-[#3869D0] disabled:opacity-40">Next</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
