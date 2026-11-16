"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BarChart3, BookOpenCheck, CalendarDays, ChevronDown, ChevronUp, ClipboardList, Loader2, RefreshCw, Target, Trash2, Trophy, Users } from "lucide-react";
import toast from "react-hot-toast";
import { deleteQuizVisitor, getQuizAnalytics, getQuizAttemptDetails } from "@/services/dashboardService";
import DeleteConfirmModal from "@/component/common/DeleteConfirmModal";
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

export default function QuizAnalyticsPage() {
    const [fromDate, setFromDate] = useState(() => getIndiaDateKey(-6));
    const [toDate, setToDate] = useState(() => getIndiaDateKey());
    const [category, setCategory] = useState("");
    const [subject, setSubject] = useState("");
    const [attemptPage, setAttemptPage] = useState(1);
    const [categories, setCategories] = useState([]);
    const [analytics, setAnalytics] = useState({
        summary: {},
        dailyStats: [],
        subjectStats: [],
        leaderboard: [],
        attempts: [],
        subjects: [],
        attemptsPagination: { page: 1, limit: 10, total: 0, pages: 0 },
    });
    const [loading, setLoading] = useState(true);
    const [deletingVisitorId, setDeletingVisitorId] = useState("");
    const [attemptToDelete, setAttemptToDelete] = useState(null);
    const [expandedAttemptId, setExpandedAttemptId] = useState("");
    const [attemptDetails, setAttemptDetails] = useState(null);
    const [loadingAttemptId, setLoadingAttemptId] = useState("");
    const requestIdRef = useRef(0);

    const loadAnalytics = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        try {
            const response = await getQuizAnalytics({ from: fromDate, to: toDate, category, subject, page: attemptPage });
            if (requestId !== requestIdRef.current) return;
            const result = response.data || {};
            setAnalytics({
                summary: result.summary || {},
                dailyStats: result.dailyStats || [],
                subjectStats: result.subjectStats || [],
                leaderboard: result.leaderboard || [],
                attempts: result.attempts || [],
                subjects: result.subjects || [],
                attemptsPagination: result.attemptsPagination || { page: 1, limit: 10, total: 0, pages: 0 },
            });
            setCategories(result.categories || []);
        } catch (fetchError) {
            if (requestId !== requestIdRef.current) return;
            toast.error(fetchError.message || "Unable to load quiz analytics.");
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, [fromDate, toDate, category, subject, attemptPage]);

    useEffect(() => {
        const timer = window.setTimeout(() => void loadAnalytics(), 0);
        return () => window.clearTimeout(timer);
    }, [loadAnalytics]);

    const refresh = () => {
        setLoading(true);
        void loadAnalytics();
    };

    const summary = analytics.summary || {};
    const selectedCategoryStats = analytics.subjectStats.filter((item) =>
        (!category || item.category === category) && (!subject || item.subject === subject)
    );
    const selectedAttemptedQuestions = selectedCategoryStats.reduce((sum, item) => sum + item.attemptedQuestions, 0);
    const selectedCorrectAnswers = selectedCategoryStats.reduce((sum, item) => sum + item.correctAnswers, 0);
    const selectedCategoryAccuracy = selectedAttemptedQuestions
        ? Number(((selectedCorrectAnswers / selectedAttemptedQuestions) * 100).toFixed(1))
        : undefined;
    const metrics = [
        { label: "Unique Quiz Visitors (24h)", value: summary.quizVisitors || 0, icon: Users, color: "from-[#2d7a63] to-[#1b5748]" },
        { label: "Quiz Page Views", value: summary.quizPageViews || 0, icon: BarChart3, color: "from-[#0ea5e9] to-[#0284c7]" },
        { label: "Quiz starts", value: summary.quizStarts || 0, icon: Target, color: "from-[#3869D0] to-[#244A9A]" },
        { label: "Completed", value: summary.completedAttempts || 0, icon: BookOpenCheck, color: "from-[#2d7a63] to-[#1b5748]" },
        { label: "Questions attempted", value: summary.attemptedQuestions || 0, icon: ClipboardList, color: "from-[#3869D0] to-[#244A9A]" },
        { label: "Questions skipped", value: summary.skippedQuestions || 0, icon: Target, color: "from-[#b89242] to-[#8A6820]" },
        { label: "Completion rate", value: `${Number(summary.completionRate || 0).toFixed(1)}%`, icon: BarChart3, color: "from-[#0ea5e9] to-[#0284c7]" },
        { label: category || subject ? `${[category, subject].filter(Boolean).join(" · ")} accuracy` : "Average score", value: `${Number((category || subject) ? selectedCategoryAccuracy ?? 0 : summary.averageScore || 0).toFixed(1)}%`, icon: Trophy, color: "from-[#b89242] to-[#8A6820]" },
    ];

    const setFilter = (setter) => (event) => {
        setLoading(true);
        setAttemptPage(1);
        setter(event.target.value);
    };

    const changeAttemptPage = (nextPage) => {
        setLoading(true);
        setAttemptPage(nextPage);
    };

    const removeQuizVisitor = async () => {
        if (!attemptToDelete) return;
        setDeletingVisitorId(attemptToDelete.visitorId);
        try {
            await deleteQuizVisitor(attemptToDelete.visitorId);
            if (attemptDetails?.visitorId === attemptToDelete.visitorId) {
                setExpandedAttemptId("");
                setAttemptDetails(null);
            }
            toast.success(`Quiz data for ${attemptToDelete.name} deleted.`);
            setAttemptToDelete(null);
            await loadAnalytics();
        } catch (deleteError) {
            toast.error(deleteError.message || "Unable to delete quiz participant data.");
        } finally {
            setDeletingVisitorId("");
        }
    };

    const toggleAttemptDetails = async (attempt) => {
        if (expandedAttemptId === attempt._id) {
            setExpandedAttemptId("");
            setAttemptDetails(null);
            return;
        }

        setExpandedAttemptId(attempt._id);
        setLoadingAttemptId(attempt._id);
        try {
            const response = await getQuizAttemptDetails(attempt._id);
            setAttemptDetails({ ...response.data, visitorId: attempt.visitorId });
        } catch (detailsError) {
            setExpandedAttemptId("");
            toast.error(detailsError.message || "Unable to load this quiz attempt.");
        } finally {
            setLoadingAttemptId("");
        }
    };

    return (
        <main className="min-h-screen bg-[#F2F6FF] px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
            <div className="mx-auto max-w-7xl">
                <header className="relative overflow-hidden rounded-3xl border border-white/70 bg-[var(--navy)] px-6 py-8 text-white shadow-[0_18px_50px_rgba(16,42,67,0.16)] backdrop-blur-xl sm:px-10">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[#3869D0]/20 blur-3xl" />
                    <div className="relative flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="montserrat text-3xl font-extrabold leading-tight text-white sm:text-4xl">Quiz Analytics</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Unique quiz visitors are counted once per 24-hour period. Review attempts, completion, skipped answers, and scores.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Link href="/admin/quiz/questions" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold hover:bg-white/20"><ClipboardList size={16} />Question bank</Link>
                            <button type="button" onClick={refresh} disabled={loading} aria-label="Refresh quiz analytics" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold hover:bg-white/20 disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} />Refresh</button>
                        </div>
                    </div>
                </header>

                <section className={`mt-6 rounded-2xl p-4 sm:p-5 ${glass}`} aria-label="Quiz analytics filters">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <label className="flex flex-col gap-1.5 min-w-0">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-[#526579]">
                                <CalendarDays size={14} className="shrink-0 text-[#3869D0]" />
                                <span className="truncate">From date</span>
                            </span>
                            <input
                                type="date"
                                value={fromDate}
                                max={toDate}
                                onChange={setFilter(setFromDate)}
                                className="min-h-11 w-full min-w-0 rounded-xl border border-[#C8D5EA] bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-[var(--navy)] shadow-sm outline-none transition focus:border-[#3869D0] focus:ring-2 focus:ring-[#3869D0]/15"
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
                                onChange={setFilter(setToDate)}
                                className="min-h-11 w-full min-w-0 rounded-xl border border-[#C8D5EA] bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-[var(--navy)] shadow-sm outline-none transition focus:border-[#3869D0] focus:ring-2 focus:ring-[#3869D0]/15"
                            />
                        </label>
                        <label className="flex flex-col gap-1.5 min-w-0">
                            <span className="text-xs font-bold text-[#526579] truncate">Quiz category</span>
                            <select
                                value={category}
                                onChange={setFilter(setCategory)}
                                className="min-h-11 w-full min-w-0 rounded-xl border border-[#C8D5EA] bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-[var(--navy)] shadow-sm outline-none transition focus:border-[#3869D0] focus:ring-2 focus:ring-[#3869D0]/15"
                            >
                                <option value="">All categories</option>
                                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </label>
                        <label className="flex flex-col gap-1.5 min-w-0">
                            <span className="text-xs font-bold text-[#526579] truncate">Subject</span>
                            <select
                                value={subject}
                                onChange={setFilter(setSubject)}
                                className="min-h-11 w-full min-w-0 rounded-xl border border-[#C8D5EA] bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-[var(--navy)] shadow-sm outline-none transition focus:border-[#3869D0] focus:ring-2 focus:ring-[#3869D0]/15"
                            >
                                <option value="">All subjects</option>
                                {analytics.subjects.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </label>
                    </div>
                </section>

                <section className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-label="Quiz summary">
                    {metrics.map(({ label, value, icon: Icon, color }) => (
                        <article key={label} className={`rounded-2xl p-3.5 sm:p-5 lg:p-6 ${glass}`}>
                            <span className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white`}><Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" /></span>
                            <p className="mt-3 sm:mt-5 text-xs sm:text-sm font-medium text-[#526579]">{label}</p>
                            <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-[var(--navy)]">{loading ? <Loader2 size={24} className="animate-spin text-[#3869D0]" /> : value}</p>
                        </article>
                    ))}
                </section>

                <AnalyticsTrendChart
                    from={fromDate}
                    to={toDate}
                    data={analytics.dailyStats}
                    title="Quiz performance"
                    description="Daily starts and completed attempts"
                    eyebrow="QUIZ ACTIVITY TERMINAL"
                    loading={loading}
                    emptyMessage="No quiz activity in this date range."
                    series={[
                        { key: "attempts", label: "Starts", color: "#34D399" },
                        { key: "completedAttempts", label: "Completed", color: "#F0BD5A" },
                    ]}
                />

                <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[1.2fr_1fr]">
                    <section className={`min-w-0 overflow-hidden rounded-2xl p-5 sm:p-6 ${glass}`}>
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dbeafe] text-[#3869D0]"><Users size={18} /></span>
                            <div className="min-w-0">
                                <h2 className="font-bold text-[var(--navy)]">Category and subject analysis</h2>
                                <p className="break-words text-xs text-[var(--muted)]">Participants, answers, and accuracy across the selected dates</p>
                            </div>
                        </div>
                        {analytics.subjectStats.length ? (
                            <div className="mt-5 max-w-full overflow-x-auto overscroll-x-contain">
                                <table className="w-full min-w-[680px] border-separate border-spacing-y-2 text-left text-sm">
                                    <thead className="text-[10px] uppercase tracking-wide text-[var(--muted)]"><tr><th className="px-3 py-2">Category</th><th className="px-3 py-2">Subject</th><th className="px-3 py-2">People</th><th className="px-3 py-2">Started</th><th className="px-3 py-2">Completed</th><th className="px-3 py-2">Attempted</th><th className="px-3 py-2">Correct</th><th className="px-3 py-2">Wrong</th><th className="px-3 py-2">Skipped</th><th className="px-3 py-2">Accuracy</th></tr></thead>
                                    <tbody>{analytics.subjectStats.map((item) => (
                                        <tr key={`${item.category}-${item.subject}`} className="bg-white/70 text-[var(--navy)]">
                                            <td className="rounded-l-xl px-3 py-3 font-semibold">{item.category}</td>
                                            <td className="px-3 py-3">{item.subject}</td>
                                            <td className="px-3 py-3">{item.visitors}</td>
                                            <td className="px-3 py-3">{item.attempts}</td>
                                            <td className="px-3 py-3">{item.completedAttempts}</td>
                                            <td className="px-3 py-3">{item.attemptedQuestions} / {item.totalQuestions}</td>
                                            <td className="px-3 py-3 text-[#2f7d59]">{item.correctAnswers}</td>
                                            <td className="px-3 py-3 text-red-600">{item.wrongAnswers}</td>
                                            <td className="px-3 py-3">{item.skippedAnswers}</td>
                                            <td className="rounded-r-xl px-3 py-3 font-bold text-[#2f7d59]">{item.accuracy}%</td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        ) : <p className="mt-5 rounded-xl border border-dashed border-[#C8D5EA] py-10 text-center text-sm text-[var(--muted)]">No category scores for this date range.</p>}
                    </section>

                    <section className={`min-w-0 overflow-hidden rounded-2xl p-5 sm:p-6 ${glass}`}>
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4d27e]/25 text-[#8A6820]"><Trophy size={18} /></span>
                            <div className="min-w-0">
                                <h2 className="font-bold text-[var(--navy)]">Top performers</h2>
                                <p className="break-words text-xs text-[var(--muted)]">Completed quiz attempts in this date range</p>
                            </div>
                        </div>
                        {analytics.leaderboard.length ? (
                            <div className="mt-5 max-w-full overflow-x-auto overscroll-x-contain">
                                <div className="min-w-[280px] space-y-3">
                                {analytics.leaderboard.map((entry, index) => (
                                    <div key={entry._id} className="flex items-center justify-between gap-3 rounded-xl border border-[#C8D5EA] bg-white/70 px-3 py-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3869D0] text-xs font-bold text-white">{index + 1}</span>
                                            <div className="min-w-0"><p className="truncate text-sm font-bold text-[var(--navy)]">{entry.name}</p><p className="text-[11px] text-[var(--muted)]">{entry.score}/{entry.totalQuestions} correct</p></div>
                                        </div>
                                        <p className="shrink-0 text-sm font-bold text-[#3869D0]">{Number(entry.percentage || 0).toFixed(1)}%</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                        ) : <p className="mt-5 rounded-xl border border-dashed border-[#C8D5EA] py-10 text-center text-sm text-[var(--muted)]">No completed attempts in this date range.</p>}
                    </section>
                </div>

                <section className={`mt-6 rounded-2xl p-5 sm:p-6 ${glass}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-[var(--navy)]">Visitor quiz attempts</h2>
                            <p className="mt-1 text-xs text-[var(--muted)]">Incomplete attempts stay incomplete; saved answers and name remain visible here.</p>
                        </div>
                        <span className="rounded-full border border-[#C8D5EA] bg-white/70 px-3 py-1 text-xs font-semibold text-[#526579]">{analytics.attemptsPagination.total} records</span>
                    </div>
                    {analytics.attempts.length ? (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
                                <thead className="text-[10px] uppercase tracking-wide text-[var(--muted)]"><tr><th className="px-3 py-2">Visitor / name</th><th className="px-3 py-2">Date</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Attempted</th><th className="px-3 py-2">Correct</th><th className="px-3 py-2">Wrong</th><th className="px-3 py-2">Skipped / pending</th><th className="px-3 py-2">Action</th></tr></thead>
                                <tbody>{analytics.attempts.map((attempt) => (
                                    <Fragment key={attempt._id}>
                                        <tr className="bg-white/70 text-[var(--navy)]">
                                            <td className="rounded-l-xl px-3 py-3"><strong>{attempt.name}</strong><span className="mt-1 block text-md text-[var(--muted)]">{attempt.phoneNumber || "No phone recorded"}</span><span className="mt-1 block text-[10px] text-[var(--muted)]">{attempt.visitorId.slice(0, 12)}…</span></td>
                                            <td className="px-3 py-3">{attempt.dateKey}</td>
                                            <td className="px-3 py-3">{attempt.categories.join(", ") || "—"}</td>
                                            <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${attempt.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{attempt.status === "completed" ? "Completed" : "Incomplete"}</span></td>
                                            <td className="px-3 py-3">{attempt.attemptedCount} / {attempt.totalQuestions}</td>
                                            <td className="px-3 py-3 font-semibold text-[#2f7d59]">{attempt.correctCount}</td>
                                            <td className="px-3 py-3 font-semibold text-red-600">{attempt.wrongCount}</td>
                                            <td className="px-3 py-3">{attempt.status === "completed" ? attempt.skippedCount : `${attempt.pendingCount} pending`}</td>
                                            <td className="rounded-r-xl px-3 py-3">
                                                <div className="flex flex-col items-start gap-2">
                                                    <button type="button" onClick={() => void toggleAttemptDetails(attempt)} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#C8D5EA] bg-white px-3 text-xs font-semibold text-[#3869D0] transition hover:bg-[#F2F6FF]">
                                                        {loadingAttemptId === attempt._id ? <Loader2 size={14} className="animate-spin" /> : expandedAttemptId === attempt._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        {expandedAttemptId === attempt._id ? "Hide answers" : "View answers"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setAttemptToDelete(attempt)}
                                                        disabled={Boolean(deletingVisitorId)}
                                                        aria-label={`Delete quiz data for ${attempt.name}`}
                                                        className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                                                    >
                                                        {deletingVisitorId === attempt.visitorId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                        Delete quiz user
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedAttemptId === attempt._id && (
                                            <tr>
                                                <td colSpan={9} className="rounded-xl bg-[#F2F6FF]/70 p-4">
                                                    {loadingAttemptId === attempt._id ? (
                                                        <div className="flex justify-center py-6"><Loader2 className="animate-spin text-[#3869D0]" /></div>
                                                    ) : attemptDetails?._id === attempt._id ? (
                                                        <div className="grid gap-3">
                                                            <p className="text-sm font-semibold text-[var(--navy)]">Name: {attemptDetails.name} · Mobile: {attemptDetails.phoneNumber || "Not recorded"}</p>
                                                            {attemptDetails.answers.map((answer, index) => (
                                                                <article key={answer.questionId} className="rounded-xl border border-[#C8D5EA] bg-white p-4">
                                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">Question {index + 1} · {answer.category} · {answer.subject}</p>
                                                                    <h3 className="mt-2 font-semibold text-[var(--navy)]">{answer.question}</h3>
                                                                    {answer.questionHi && <p className="mt-1 text-sm text-[var(--muted)]">{answer.questionHi}</p>}
                                                                    <p className="mt-2 text-sm text-[var(--navy)]">
                                                                        Selected: <strong>{answer.selectedIndex === null ? (attempt.status === "completed" ? "Skipped" : "Not answered yet") : `${String.fromCharCode(65 + answer.selectedIndex)}. ${answer.options[answer.selectedIndex]}`}</strong>
                                                                        <span className="mx-2 text-slate-300">|</span>
                                                                        Correct: <strong>{String.fromCharCode(65 + answer.correctIndex)}. {answer.options[answer.correctIndex]}</strong>
                                                                    </p>
                                                                    {answer.explanation && <p className="mt-2 text-sm leading-5 text-slate-600">{answer.explanation}</p>}
                                                                </article>
                                                            ))}
                                                        </div>
                                                    ) : <p className="py-4 text-center text-sm text-[var(--muted)]">No question details are available for this attempt.</p>}
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}</tbody>
                            </table>
                        </div>
                    ) : <p className="mt-5 rounded-xl border border-dashed border-[#C8D5EA] py-10 text-center text-sm text-[var(--muted)]">No quiz visitors in this date range.</p>}
                    {analytics.attemptsPagination.pages > 1 && (
                        <div className="mt-4 flex items-center justify-between gap-3">
                            <button type="button" onClick={() => changeAttemptPage(attemptPage - 1)} disabled={loading || attemptPage <= 1} className="rounded-lg border border-[#C8D5EA] bg-white px-4 py-2 text-xs font-semibold text-[#3869D0] disabled:opacity-40">Previous</button>
                            <span className="text-xs text-[var(--muted)]">Page {attemptPage} of {analytics.attemptsPagination.pages}</span>
                            <button type="button" onClick={() => changeAttemptPage(attemptPage + 1)} disabled={loading || attemptPage >= analytics.attemptsPagination.pages} className="rounded-lg border border-[#C8D5EA] bg-white px-4 py-2 text-xs font-semibold text-[#3869D0] disabled:opacity-40">Next</button>
                        </div>
                    )}
                </section>
            </div>
            <DeleteConfirmModal
                open={Boolean(attemptToDelete)}
                title="Delete this participant's quiz data?"
                description="This participant's quiz attempts, answers, and quiz visitor counts will be permanently deleted. General website analytics will be retained."
                itemName={attemptToDelete?.name}
                loading={Boolean(deletingVisitorId)}
                onCancel={() => setAttemptToDelete(null)}
                onConfirm={() => void removeQuizVisitor()}
            />
        </main>
    );
}
