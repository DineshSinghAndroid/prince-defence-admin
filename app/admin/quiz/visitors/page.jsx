"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { BarChart3, CalendarDays, Eye, Loader2, RefreshCw, Search, ShieldAlert, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";

import AnalyticsTrendChart from "@/component/quiz/AnalyticsTrendChart";
import { AuthContext } from "@/context/AuthContext";
import { clearAnalyticsHistory, getVisitorAnalytics } from "@/services/dashboardService";

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

const formatPageLabel = (path) => (path === "/" ? "Home" : path.replace(/^\/+/, ""));

export default function VisitorAnalyticsPage() {
  const { user } = useContext(AuthContext);
  const isSuperAdmin = user?.role === "superAdmin";
  const [fromDate, setFromDate] = useState(() => getIndiaDateKey(-6));
  const [toDate, setToDate] = useState(() => getIndiaDateKey());
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [routePathInput, setRoutePathInput] = useState("");
  const [routePath, setRoutePath] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    summary: { visitors: 0, pageViews: 0, quizAttempts: 0 },
    dailyStats: [],
    topPages: [],
    visitors: [],
    pagination: { page: 1, pages: 0, total: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const requestIdRef = useRef(0);

  const loadData = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      const response = await getVisitorAnalytics({
        from: fromDate,
        to: toDate,
        page,
        search,
        routePath,
      });
      if (requestId === requestIdRef.current) {
        setData(response.data);
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        toast.error(error.message || "Unable to load visitor analytics.");
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [fromDate, toDate, page, search, routePath]);

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

  const applyRouteFilter = (event) => {
    event.preventDefault();
    const cleanRoute = routePathInput.trim();
    if (cleanRoute && !cleanRoute.startsWith("/")) {
      toast.error("Page path should start with /, for example /about.");
      return;
    }
    setPage(1);
    setRoutePath(cleanRoute);
  };

  const selectSuggestedRoute = (nextRoute) => {
    setRoutePathInput(nextRoute);
    setRoutePath(nextRoute);
    setPage(1);
  };

  const changeRange = (setter) => (event) => {
    setPage(1);
    setter(event.target.value);
  };

  const handleClearHistory = async () => {
    if (confirmationText !== "DELETE ALL HISTORY" || clearing) return;
    try {
      setClearing(true);
      const response = await clearAnalyticsHistory();
      setClearModalOpen(false);
      setConfirmationText("");
      toast.success(
        `Deleted ${Number(response.data?.deletedPageViews || 0).toLocaleString("en-IN")} page views and ${Number(response.data?.deletedVisitors || 0).toLocaleString("en-IN")} visitors.`
      );
      setPage(1);
      await loadData();
    } catch (error) {
      toast.error(error.message || "Unable to clear analytics history.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F2F6FF] px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-7xl">
        <header className="relative overflow-hidden rounded-3xl border border-white/70 bg-[var(--navy)] px-6 py-8 text-white shadow-[0_18px_50px_rgba(16,42,67,0.16)] backdrop-blur-xl sm:px-10">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-teal-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[#3869D0]/20 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="cinzel text-3xl font-extrabold leading-tight text-white sm:text-4xl">Visitor Analytics</h1>
              <p className="mt-2 text-sm text-white/70">Explore visitor activity, quiz engagement, and individual browsing history.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setClearModalOpen(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-200/30 bg-red-500/15 px-4 text-sm font-semibold text-white hover:bg-red-500/30"
                >
                  <Trash2 size={16} /> Clear all history
                </button>
              )}
              <button
                type="button"
                onClick={() => void loadData()}
                disabled={loading}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold hover:bg-white/20 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>
        </header>

        <section className={`mt-6 rounded-2xl p-4 sm:p-5 ${glass}`} aria-label="Visitor filters">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <label className="flex flex-col gap-1.5 min-w-0">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#526579]">
                <CalendarDays size={14} className="shrink-0 text-[#3869D0]" />
                <span className="truncate">From date</span>
              </span>
              <input
                type="date"
                value={fromDate}
                max={toDate}
                onChange={changeRange(setFromDate)}
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
                onChange={changeRange(setToDate)}
                className="h-11 w-full min-w-0 rounded-xl border border-[#C8D5EA] bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-[var(--navy)] shadow-sm outline-none transition focus:border-[#3869D0] focus:ring-2 focus:ring-[#3869D0]/15"
              />
            </label>
          </div>
        </section>

        <section className={`mt-6 p-4 sm:p-5 ${glass}`} aria-label="Filter traffic by page">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-bold text-[var(--navy)]">Traffic by page</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Enter a page path such as /, /about, or /quiz to see its traffic in the selected date range.
              </p>
            </div>
            <form onSubmit={applyRouteFilter} className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-2xl">
              <label className="sr-only" htmlFor="visitor-route-filter">Page path</label>
              <input
                id="visitor-route-filter"
                list="visitor-route-suggestions"
                value={routePathInput}
                onChange={(event) => setRoutePathInput(event.target.value)}
                placeholder="Enter page path, e.g. /about"
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#C8D5EA] bg-white px-3 text-sm text-[var(--navy)] outline-none focus:border-[#3869D0]"
              />
              <datalist id="visitor-route-suggestions">
                {data.topPages.map((item) => <option key={item.path} value={item.path} />)}
              </datalist>
              <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3869D0] px-5 text-sm font-bold text-white transition hover:bg-[#2f5dbd]">
                <Search size={16} /> Apply filter
              </button>
              {routePath && (
                <button
                  type="button"
                  onClick={() => selectSuggestedRoute("")}
                  className="min-h-11 rounded-xl border border-[#C8D5EA] bg-white px-4 text-sm font-semibold text-[#526579] hover:bg-[#F2F6FF]"
                >
                  Clear
                </button>
              )}
            </form>
          </div>
          {routePath && (
            <p className="mt-3 text-xs font-semibold text-[#3869D0]">
              Showing traffic for <span className="font-mono">{routePath}</span>
            </p>
          )}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {data.topPages.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => selectSuggestedRoute(routePath === item.path ? "" : item.path)}
                aria-pressed={routePath === item.path}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  routePath === item.path
                    ? "border-[#3869D0] bg-[#3869D0] text-white"
                    : "border-[#C8D5EA] bg-white text-[#526579] hover:border-[#3869D0]/50 hover:text-[#3869D0]"
                }`}
              >
                {formatPageLabel(item.path)} · {Number(item.views).toLocaleString("en-IN")}
              </button>
            ))}
            {!data.topPages.length && !loading && (
              <span className="text-xs text-[var(--muted)]">No popular routes in this date range.</span>
            )}
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Visitor metrics">
          {[
            { label: "Unique visitors", value: data.summary.visitors, icon: Users, color: "from-[#2d7a63] to-[#1b5748]" },
            { label: routePath ? `Page views · ${routePath}` : "Total page views", value: data.summary.pageViews, icon: Eye, color: "from-[#3869D0] to-[#244A9A]" },
            { label: "Quiz attempts", value: data.summary.quizAttempts, icon: BarChart3, color: "from-[#b89242] to-[#8A6820]", span: "col-span-2 sm:col-span-2 xl:col-span-1" },
          ].map(({ label, value, icon: Icon, color, span }) => (
            <article key={label} className={`rounded-2xl p-3.5 sm:p-5 sm:p-6 ${glass} ${span || ""}`}>
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
          title={routePath ? `Traffic trend · ${routePath}` : "Visitor and page-view trend"}
          description={routePath ? "Unique visitors and page views for this route" : "Daily unique browsers and page views"}
          eyebrow="VISITOR ANALYTICS TERMINAL"
          loading={loading}
          emptyMessage="No visitor activity in this date range."
          series={[
            { key: "visitors", label: "Visitors", color: "#34D399" },
            { key: "views", label: "Page views", color: "#F0BD5A" },
          ]}
        />

        <section className={`mt-6 overflow-hidden p-5 sm:p-7 ${glass}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--navy)]">Visitors</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">{Number(data.pagination.total || 0).toLocaleString("en-IN")} visitors in this range</p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search visitor, city, device…" className="min-h-11 w-full rounded-xl border border-[#C8D5EA] bg-white pl-9 pr-3 text-sm text-[var(--navy)] outline-none focus:border-[#3869D0]" />
            </label>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[1050px] border-separate border-spacing-y-2 text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <tr><th className="px-3 py-2">Visitor</th><th className="px-3 py-2">Last seen (IST)</th><th className="px-3 py-2">Page views</th><th className="px-3 py-2">Quiz views</th><th className="px-3 py-2">Quiz attempts</th><th className="px-3 py-2">Device / location</th><th className="px-3 py-2">Last page</th></tr>
              </thead>
              <tbody>
                {data.visitors.map((visitor) => (
                  <tr key={visitor.visitorId} className="bg-white/80 text-[#40556B]">
                    <td className="rounded-l-xl px-3 py-3">
                      <strong className="block text-[var(--navy)]">{visitor.name || "Anonymous visitor"}</strong>
                      {visitor.phoneNumber && <span className="mt-1 block">{visitor.phoneNumber}</span>}
                      <span className="mt-1 block font-mono text-[10px]">{visitor.visitorId}</span>
                    </td>
                    <td className="px-3 py-3">{formatTimestamp(visitor.lastSeenAt)}</td>
                    <td className="px-3 py-3 font-bold">{visitor.pageViews}</td>
                    <td className="px-3 py-3">{visitor.quizPageViews}</td>
                    <td className="px-3 py-3">{visitor.quizAttempts} <span className="text-[var(--muted)]">({visitor.completedAttempts} completed)</span></td>
                    <td className="px-3 py-3 capitalize">{visitor.device || "unknown"}{visitor.city || visitor.country ? <span className="block text-[10px] text-[var(--muted)]">{[visitor.city, visitor.country].filter(Boolean).join(", ")}</span> : null}</td>
                    <td className="max-w-48 truncate rounded-r-xl px-3 py-3" title={visitor.lastPage}>{visitor.lastPage || "—"}</td>
                  </tr>
                ))}
                {!data.visitors.length && <tr><td colSpan={7} className="py-10 text-center text-[var(--muted)]">{loading ? "Loading visitors…" : "No visitors match these filters."}</td></tr>}
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

        {isSuperAdmin && (
          <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50/80 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldAlert size={22} className="mt-0.5 shrink-0 text-red-600" />
              <div>
                <h2 className="font-bold text-red-900">Permanently clear analytics history</h2>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-red-800/80">
                  Removes visitor profiles, general website page views, quiz page views, daily participation, and quiz attempts. Questions, categories, and quiz settings are preserved.
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setClearModalOpen(true)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700">
              <Trash2 size={16} /> Clear history
            </button>
          </section>
        )}
      </div>

      {isSuperAdmin && clearModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[var(--navy)]/65 p-4 backdrop-blur-md">
          <div role="alertdialog" aria-modal="true" aria-labelledby="clear-history-title" className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><ShieldAlert size={22} /></span>
              <div>
                <h2 id="clear-history-title" className="text-xl font-extrabold text-[var(--navy)]">Delete all analytics history?</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  This permanently deletes every visitor profile, general page view, quiz page view, quiz attempt, and daily participation record. This cannot be undone.
                </p>
              </div>
            </div>
            <label className="mt-6 block text-xs font-bold text-[#526579]">
              Type <span className="font-mono text-red-600">DELETE ALL HISTORY</span> to continue
              <input
                autoFocus
                value={confirmationText}
                onChange={(event) => setConfirmationText(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-xl border border-[#C8D5EA] px-3 text-sm text-[var(--navy)] outline-none focus:border-red-400"
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => { setClearModalOpen(false); setConfirmationText(""); }} disabled={clearing} className="rounded-xl border border-[#C8D5EA] px-4 py-2.5 text-sm font-bold text-[#526579] disabled:opacity-50">Cancel</button>
              <button type="button" onClick={() => void handleClearHistory()} disabled={confirmationText !== "DELETE ALL HISTORY" || clearing} className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                {clearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {clearing ? "Deleting…" : "Delete all history"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
