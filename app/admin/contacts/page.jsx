"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import {
    Search,
    Phone,
    BookOpen,
    MessageSquare,
    Trash2,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Loader2,
    X,
    Inbox,
    AlertCircle,
    CalendarDays,
    Filter,
    Users,
    FileSpreadsheet,
    Copy,
    Check,
    LayoutGrid,
    List,
} from "lucide-react";

import {
    getContacts,
    updateContactStatus,
    deleteContact,
    exportContacts,
} from "@/services/contactService";

import DeleteConfirmModal from "@/component/common/DeleteConfirmModal";

const statusStyles = {
    new: "border-[#3869D0]/20 bg-[#3869D0]/10 text-[#3869D0]",

    open: "border-[#b89242]/30 bg-[#b89242]/10 text-[#8A6820]",

    closed: "border-emerald-500/30 bg-emerald-50 text-emerald-700 font-semibold",
};

const statusOptions = [
    {
        label: "All",
        value: "",
    },
    {
        label: "New",
        value: "new",
    },
    {
        label: "Open",
        value: "open",
    },
    {
        label: "Closed",
        value: "closed",
    },
];

const commonCourses = [
    "NDA",
    "AIRFORCE",
    "Army",
    "Navy",
    "SSC",
    "Other",
];

const glass =
    "border border-[#C8D5EA]/70 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(16,42,67,0.10)]";

const getErrorMessage = (
    error,
    fallback = "Something went wrong."
) => {
    if (
        typeof navigator !== "undefined" &&
        !navigator.onLine
    ) {
        return "You are offline. Please check your internet connection.";
    }

    const status =
        error?.response?.status ||
        error?.status;

    if (status === 400) {
        return (
            error?.response?.data?.message ||
            error?.message ||
            "Invalid request."
        );
    }

    if (status === 401) {
        return "Your session has expired. Please login again.";
    }

    if (status === 403) {
        return "You do not have permission to perform this action.";
    }

    if (status === 404) {
        return "The requested contact was not found.";
    }

    if (status === 409) {
        return (
            error?.response?.data?.message ||
            "This action conflicts with the current data."
        );
    }

    if (status === 422) {
        return (
            error?.response?.data?.message ||
            "Please check the entered information."
        );
    }

    if (status === 429) {
        return "Too many requests. Please try again later.";
    }

    if (status >= 500) {
        return "Server error. Please try again later.";
    }

    if (error?.response?.data?.message) {
        return error.response.data.message;
    }

    if (error?.message) {
        const message =
            error.message.toLowerCase();

        if (
            message.includes("network") ||
            message.includes("failed to fetch")
        ) {
            return "Unable to connect to the server.";
        }

        return error.message;
    }

    return fallback;
};

const getApiPayload = (response) => {
    if (
        response?.data &&
        !Array.isArray(response.data) &&
        response.data.data !== undefined
    ) {
        return response.data;
    }

    return response;
};

export default function ContactsPage() {
    const [contacts, setContacts] =
        useState([]);

    const [viewMode, setViewMode] =
        useState("cards");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [limit] =
        useState(10);

    const [pagination, setPagination] =
        useState({
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
        });

    const [search, setSearch] =
        useState("");

    const [searchQuery, setSearchQuery] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [selectedCourses, setSelectedCourses] =
        useState([]);
    const course = selectedCourses.join(",");
    const setCourse = (val) => {
        setSelectedCourses(
            val
                ? String(val)
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean)
                : []
        );
    };
    const [isCourseOpen, setIsCourseOpen] =
        useState(false);
    const courseDropdownRef = useRef(null);

    const toggleCourseSelection = (courseName) => {
        setSelectedCourses((prev) => {
            if (prev.includes(courseName)) {
                return prev.filter((c) => c !== courseName);
            } else {
                return [...prev, courseName];
            }
        });
        setPage(1);
    };

    const selectAllCourses = () => {
        setSelectedCourses([...commonCourses]);
        setPage(1);
    };

    const clearAllCourses = () => {
        setSelectedCourses([]);
        setPage(1);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                courseDropdownRef.current &&
                !courseDropdownRef.current.contains(event.target)
            ) {
                setIsCourseOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const formatLocalDate = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const getCurrentMonthStart = () => {
        const d = new Date();
        return formatLocalDate(new Date(d.getFullYear(), d.getMonth(), 1));
    };

    const getCurrentMonthEnd = () => {
        const d = new Date();
        return formatLocalDate(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    };

    const getLastMonthStart = () => {
        const d = new Date();
        return formatLocalDate(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    };

    const getLastMonthEnd = () => {
        const d = new Date();
        return formatLocalDate(new Date(d.getFullYear(), d.getMonth(), 0));
    };

    const getTodayDateStr = () => {
        return formatLocalDate(new Date());
    };

    const getLast30DaysStart = () => {
        const d = new Date();
        d.setDate(d.getDate() - 29);
        return formatLocalDate(d);
    };

    // Defaults automatically to CURRENT MONTH on load
    const [startDate, setStartDate] =
        useState(getCurrentMonthStart);

    const [endDate, setEndDate] =
        useState(getCurrentMonthEnd);

    const [updatingId, setUpdatingId] =
        useState(null);

    const [deletingId, setDeletingId] =
        useState(null);

    const [deleteTarget, setDeleteTarget] =
        useState(null);

    const [exporting, setExporting] =
        useState(false);

    const [copiedNumber, setCopiedNumber] =
        useState(null);

    const isCurrentMonthActive =
        startDate === getCurrentMonthStart() && endDate === getCurrentMonthEnd();

    const isLastMonthActive =
        startDate === getLastMonthStart() && endDate === getLastMonthEnd();

    const isTodayActive =
        startDate === getTodayDateStr() && endDate === getTodayDateStr();

    const isLast30DaysActive =
        startDate === getLast30DaysStart() && endDate === getTodayDateStr();

    const isAllTimeActive =
        !startDate && !endDate;

    const handleCopyNumber = (num, e) => {
        e?.stopPropagation?.();
        if (!num) return;
        const clean = String(num).trim();
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(clean);
        }
        setCopiedNumber(clean);
        toast.success(`Copied: ${clean}`);
        setTimeout(() => setCopiedNumber(null), 2000);
    };

    const handleDirectCall = (num, e) => {
        e?.stopPropagation?.();
        if (!num) return;
        const clean = String(num).trim().replace(/[^\d+]/g, "");
        if (!clean) return;
        if (typeof window !== "undefined") {
            window.location.href = `tel:${clean}`;
        }
    };

    const showToast = (
        message,
        type = "success"
    ) => {
        if (type === "error") {
            toast.error(message);
        } else {
            toast.success(message);
        }
    };

    // Exports EXACTLY whatever filter is currently active on screen
    const handleExportExcel = async () => {
        if (exporting) return;

        try {
            setExporting(true);
            const toastId = toast.loading("Preparing Excel sheet from active filters...");

            let allContacts = [];

            try {
                const response = await exportContacts({
                    search: searchQuery,
                    course,
                    status,
                    startDate,
                    endDate,
                });
                const payload = getApiPayload(response);
                allContacts = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
            } catch (apiErr) {
                console.warn("Export API fallback:", apiErr);
                const firstPageRes = await getContacts({
                    page: 1,
                    limit: 100,
                    search: searchQuery,
                    course,
                    status,
                    startDate,
                    endDate,
                });
                const firstPayload = getApiPayload(firstPageRes);
                allContacts = Array.isArray(firstPayload?.data)
                    ? [...firstPayload.data]
                    : [];
                const totalPagesCount = Number(
                    firstPayload?.pagination?.totalPages ||
                    firstPayload?.pagination?.totalpages ||
                    1
                );

                for (let p = 2; p <= totalPagesCount; p++) {
                    const nextRes = await getContacts({
                        page: p,
                        limit: 100,
                        search: searchQuery,
                        course,
                        status,
                        startDate,
                        endDate,
                    });
                    const nextPayload = getApiPayload(nextRes);
                    if (Array.isArray(nextPayload?.data)) {
                        allContacts.push(...nextPayload.data);
                    }
                }
            }

            if (!allContacts || allContacts.length === 0) {
                toast.error("No enquiries found for current filters to export.", { id: toastId });
                return;
            }

            const headers = [
                "S.No.",
                "Candidate Name",
                "Mobile Number",
                "Target Course",
                "Status",
                "Message / Enquiry",
                "Submitted Date",
                "Submitted Time",
            ];

            const escapeCSV = (val, isPhone = false) => {
                if (val === null || val === undefined) return '""';
                let s = String(val);
                if (!isPhone && /^[=+\-@\t\r]/.test(s)) {
                    s = "'" + s;
                }
                s = s.replace(/"/g, '""');
                return `"${s}"`;
            };

            const csvRows = allContacts.map((item, idx) => {
                const dateObj = item.createdAt ? new Date(item.createdAt) : null;
                const formattedDate = dateObj
                    ? dateObj.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                      })
                    : "—";
                const formattedTime = dateObj
                    ? dateObj.toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                      })
                    : "—";

                const rawNumber = item.number ? String(item.number).trim() : "—";

                return [
                    idx + 1,
                    escapeCSV(item.name || "—"),
                    escapeCSV(rawNumber, true),
                    escapeCSV(item.course || "—"),
                    escapeCSV((item.status || "new").toUpperCase()),
                    escapeCSV(item.message || "—"),
                    escapeCSV(formattedDate),
                    escapeCSV(formattedTime),
                ].join(",");
            });

            const csvData = "\uFEFF" + [headers.join(","), ...csvRows].join("\r\n");
            const blob = new Blob([csvData], {
                type: "text/csv;charset=utf-8;",
            });
            const blobUrl = URL.createObjectURL(blob);
            const downloadAnchor = document.createElement("a");

            // Build dynamic filename based on active filters
            const parts = ["Prince_Defence_Enquiries"];
            if (status) parts.push(status.toUpperCase());
            if (course) parts.push(course.trim().replace(/\s+/g, "_"));
            if (startDate && endDate) {
                if (isCurrentMonthActive) {
                    const now = new Date();
                    const monthName = now.toLocaleString("en-IN", { month: "short" });
                    parts.push(`${monthName}_${now.getFullYear()}`);
                } else {
                    parts.push(`${startDate}_to_${endDate}`);
                }
            } else if (startDate) {
                parts.push(`from_${startDate}`);
            } else if (endDate) {
                parts.push(`to_${endDate}`);
            } else {
                parts.push("All_Time");
            }

            downloadAnchor.href = blobUrl;
            downloadAnchor.setAttribute(
                "download",
                `${parts.join("_")}.csv`
            );
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            document.body.removeChild(downloadAnchor);
            URL.revokeObjectURL(blobUrl);

            const filterDesc = [
                status ? status.toUpperCase() : null,
                course ? course : null,
                isCurrentMonthActive ? "This Month" : startDate && endDate ? `${startDate} to ${endDate}` : "All Time"
            ].filter(Boolean).join(" • ");

            toast.success(
                `Successfully exported ${allContacts.length} enquiries! (${filterDesc})`,
                { id: toastId }
            );
        } catch (err) {
            console.error("Export failed:", err);
            toast.error(err?.message || "Failed to download Excel sheet.");
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        const timer =
            setTimeout(() => {
                setSearchQuery(search);
                setPage(1);
            }, 400);

        return () =>
            clearTimeout(timer);
    }, [search]);

    const fetchContacts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await getContacts({
                    page,
                    limit,
                    search: searchQuery,
                    course,
                    status,
                    startDate,
                    endDate,
                });

            const payload =
                getApiPayload(response);

            const contactsData =
                Array.isArray(payload?.data)
                    ? payload.data
                    : [];

            const apiPagination =
                payload?.pagination || {};

            const total =
                Number(
                    apiPagination.total ?? 0
                );

            const responseLimit =
                Number(
                    apiPagination.limit ||
                    limit
                );

            const responsePage =
                Number(
                    apiPagination.page ||
                    page
                );

            const receivedTotalPages =
                Number(
                    apiPagination.totalpages ??
                    apiPagination.totalPages ??
                    0
                );

            const calculatedTotalPages =
                total > 0
                    ? Math.ceil(
                        total /
                        responseLimit
                    )
                    : 1;

            const totalPages =
                receivedTotalPages ||
                calculatedTotalPages;

            setContacts(
                contactsData
            );

            setPagination({
                page: responsePage,
                limit: responseLimit,
                total,
                totalPages,
            });
        } catch (error) {
            console.error(
                "Failed to fetch contacts:",
                error
            );

            const message =
                getErrorMessage(
                    error,
                    "Failed to load contacts."
                );

            setError(message);

            showToast(
                message,
                "error"
            );
        } finally {
            setLoading(false);
        }
    }, [page, limit, searchQuery, course, status, startDate, endDate]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchContacts();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [fetchContacts]);

    const handleStatusChange = async (
        id,
        newStatus
    ) => {
        try {
            setUpdatingId(id);
            setError("");

            const response =
                await updateContactStatus(
                    id,
                    newStatus
                );

            const payload =
                getApiPayload(response);

            const updatedContact =
                payload?.data;

            setContacts(
                (prevContacts) =>
                    prevContacts.map(
                        (contact) =>
                            contact._id === id
                                ? updatedContact ||
                                {
                                    ...contact,
                                    status: newStatus,
                                }
                                : contact
                    )
            );

            showToast(
                "Contact status updated successfully.",
                "success"
            );
        } catch (error) {
            console.error(
                "Failed to update contact:",
                error
            );

            const message =
                getErrorMessage(
                    error,
                    "Failed to update contact status."
                );

            setError(message);

            showToast(
                message,
                "error"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // Open delete confirmation modal
    const requestDelete = (
        contact
    ) => {
        if (
            !contact?._id ||
            deletingId
        ) {
            return;
        }

        setDeleteTarget(contact);
    };

    // Delete contact
    const handleDelete = async () => {
        const id =
            deleteTarget?._id;

        if (!id || deletingId) {
            return;
        }

        try {
            setDeletingId(id);
            setError("");

            await deleteContact(id);

            setContacts(
                (prevContacts) =>
                    prevContacts.filter(
                        (contact) =>
                            contact._id !== id
                    )
            );

            showToast(
                "Contact deleted successfully.",
                "success"
            );

            setDeleteTarget(null);

            if (
                contacts.length === 1 &&
                page > 1
            ) {
                setPage(
                    (prev) => prev - 1
                );
            } else {
                fetchContacts();
            }
        } catch (error) {
            console.error(
                "Failed to delete contact:",
                error
            );

            const message =
                getErrorMessage(
                    error,
                    "Failed to delete contact."
                );

            setError(message);

            showToast(
                message,
                "error"
            );

            setDeleteTarget(null);
        } finally {
            setDeletingId(null);
        }
    };

    // Close delete modal with Escape
    useEffect(() => {
        const handleEscape = (
            event
        ) => {
            if (
                event.key === "Escape" &&
                deleteTarget &&
                !deletingId
            ) {
                setDeleteTarget(null);
            }
        };

        window.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [
        deleteTarget,
        deletingId,
    ]);

    const clearFilters = () => {
        setSearch("");
        setSearchQuery("");
        setCourse("");
        setStatus("");
        setStartDate(getCurrentMonthStart());
        setEndDate(getCurrentMonthEnd());
        setPage(1);
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        try {
            return new Date(
                date
            ).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );
        } catch {
            return "—";
        }
    };

    const formatTime = (date) => {
        if (!date) {
            return "";
        }

        try {
            return new Date(
                date
            ).toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );
        } catch {
            return "";
        }
    };

    const totalPages =
        Number(
            pagination?.totalPages
        ) || 1;

    const totalContacts =
        Number(
            pagination?.total
        ) || 0;

    const currentCount =
        contacts.length;

    const startItem =
        totalContacts === 0
            ? 0
            : (page - 1) * limit + 1;

    const endItem =
        totalContacts === 0
            ? 0
            : Math.min(
                page * limit,
                totalContacts
            );

    const goToPreviousPage = () => {
        if (page > 1) {
            setPage(
                (prev) => prev - 1
            );
        }
    };

    const goToNextPage = () => {
        if (page < totalPages) {
            setPage(
                (prev) => prev + 1
            );
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#F2F6FF] px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">

            {/* Background */}

            <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#3869D0]/10 blur-3xl" />

            <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[#B8C9F5]/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-[var(--gold)]/5 blur-3xl" />

            <div className="relative mx-auto max-w-7xl">

                {/* Header */}

                <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/70 bg-[var(--navy)] px-6 py-8 text-white shadow-[0_18px_50px_rgba(16,42,67,0.16)] backdrop-blur-xl sm:px-10">

                    <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#3869D0]/20 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[var(--gold)]/10 blur-3xl" />

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <h1 className="cinzel text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                                Enquiries
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                                Manage student enquiries, contact details, courses and enquiry status from one place.
                            </p>

                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={handleExportExcel}
                                disabled={exporting || loading}
                                className="group relative inline-flex h-12 shrink-0 items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1f4ba8] via-[#244A9A] to-[#3869D0] px-5 text-sm font-bold text-white shadow-[0_8px_25px_rgba(36,74,154,0.35)] ring-1 ring-white/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(36,74,154,0.50)] hover:ring-white/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                                title="Download enquiries matching active filter"
                            >
                                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                                {exporting ? (
                                    <Loader2 size={18} className="animate-spin text-white" />
                                ) : (
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 shadow-inner">
                                        <FileSpreadsheet size={16} className="text-white" />
                                    </span>
                                )}
                                <span className="font-bold tracking-wide">
                                    {exporting ? "Preparing Excel..." : "Download Excel"}
                                </span>
                                <span className="hidden rounded-full bg-black/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 sm:inline-block">
                                    {status ? status : isCurrentMonthActive ? "This Month" : "Filtered"}
                                </span>
                            </button>

                            <button
                                onClick={fetchContacts}
                                disabled={loading}
                                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white shadow-sm backdrop-blur-md transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    size={17}
                                    className={loading ? "animate-spin" : ""}
                                />
                                Refresh
                            </button>
                        </div>

                    </div>

                </div>

                {/* Stats Cards - Interactive CRM Filter Cards */}

                <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">

                    <div
                        onClick={() => { setStatus(""); setPage(1); }}
                        className={`cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:-translate-y-1 ${
                            status === ""
                                ? "border-[#3869D0] bg-white shadow-md shadow-[#3869D0]/10 ring-2 ring-[#3869D0]/20"
                                : `${glass} hover:bg-white`
                        }`}
                        title="Click to view all statuses"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                                Total Enquiries
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3869D0]/10 text-[#3869D0]">
                                <Users size={18} />
                            </div>
                        </div>

                        <p className="mt-3 text-2xl font-extrabold text-[var(--navy)] sm:text-3xl">
                            {totalContacts}
                        </p>

                        <p className="mt-1 text-[11px] font-medium text-[var(--muted)]">
                            {isCurrentMonthActive ? "This Month" : startDate && endDate ? `${startDate} to ${endDate}` : "All Time"}
                        </p>
                    </div>

                    <div
                        onClick={() => { setStatus("new"); setPage(1); }}
                        className={`cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:-translate-y-1 ${
                            status === "new"
                                ? "border-[#3869D0] bg-blue-50/70 shadow-md shadow-[#3869D0]/15 ring-2 ring-[#3869D0]/20"
                                : `${glass} hover:bg-white`
                        }`}
                        title="Click to filter New enquiries"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#3869D0]">
                                New Leads
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3869D0]/15 text-[#3869D0]">
                                <Inbox size={18} />
                            </div>
                        </div>

                        <p className="mt-3 text-2xl font-extrabold text-[#1f4ba8] sm:text-3xl">
                            {status === "new" ? totalContacts : "New"}
                        </p>

                        <p className="mt-1 text-[11px] font-semibold text-[#3869D0]">
                            {status === "new" ? "● Currently Filtered" : "Filter New Enquiries"}
                        </p>
                    </div>

                    <div
                        onClick={() => { setStatus("open"); setPage(1); }}
                        className={`cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:-translate-y-1 ${
                            status === "open"
                                ? "border-amber-500 bg-amber-50/70 shadow-md shadow-amber-500/15 ring-2 ring-amber-500/20"
                                : `${glass} hover:bg-white`
                        }`}
                        title="Click to filter In Progress (Open) enquiries"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#8A6820]">
                                In Progress (Open)
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-[#8A6820]">
                                <CalendarDays size={18} />
                            </div>
                        </div>

                        <p className="mt-3 text-2xl font-extrabold text-[#8A6820] sm:text-3xl">
                            {status === "open" ? totalContacts : "Open"}
                        </p>

                        <p className="mt-1 text-[11px] font-semibold text-[#8A6820]">
                            {status === "open" ? "● Currently Filtered" : "Filter Open Enquiries"}
                        </p>
                    </div>

                    <div
                        onClick={() => { setStatus("closed"); setPage(1); }}
                        className={`cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:-translate-y-1 ${
                            status === "closed"
                                ? "border-emerald-600 bg-emerald-50/80 shadow-md shadow-emerald-600/15 ring-2 ring-emerald-600/20"
                                : `${glass} hover:bg-white`
                        }`}
                        title="Click to filter Closed (Resolved) enquiries"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                                Closed (Resolved)
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <Check size={18} />
                            </div>
                        </div>

                        <p className="mt-3 text-2xl font-extrabold text-emerald-700 sm:text-3xl">
                            {status === "closed" ? totalContacts : "Closed"}
                        </p>

                        <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                            {status === "closed" ? "● Currently Filtered" : "Filter Closed Enquiries"}
                        </p>
                    </div>

                </div>

                {/* Error */}

                {error && (
                    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-start gap-3">

                            <AlertCircle
                                size={20}
                                className="mt-0.5 shrink-0 text-red-500"
                            />

                            <div>

                                <p className="text-sm font-semibold text-red-700">
                                    Unable to load enquiries
                                </p>

                                <p className="mt-0.5 text-sm text-red-600">
                                    {error}
                                </p>

                            </div>

                        </div>

                        <button
                            onClick={
                                fetchContacts
                            }
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Retry
                        </button>

                    </div>
                )}

                {/* Filters */}

                <div className={`${glass} relative mb-6 p-5 sm:p-6 ${isCourseOpen ? "z-40" : "z-10"}`}>

                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--navy)] text-[var(--gold)] shadow-md">
                                <Filter size={18} />
                            </div>

                            <div>
                                <h2 className="text-sm font-bold text-[var(--navy)]">
                                    Filters & Date Range
                                </h2>
                                <p className="mt-0.5 text-xs text-[var(--muted)]">
                                    Filter enquiries by status, course, search, and custom date or month
                                </p>
                            </div>
                        </div>

                        {(search || course || status || !isCurrentMonthActive) && (
                            <button
                                onClick={clearFilters}
                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 px-3.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700"
                            >
                                <X size={14} />
                                Reset to Current Month
                            </button>
                        )}

                    </div>

                    {/* Search & Course Inputs */}
                    <div className={`grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[1fr_320px] ${isCourseOpen ? "relative z-50" : "relative z-10"}`}>

                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search name, number, course, or message..."
                                className="h-11 w-full rounded-xl border border-[#C8D5EA] bg-white/70 pl-11 pr-10 text-sm text-[var(--navy)] outline-none backdrop-blur-md transition placeholder:text-[var(--muted)] focus:border-[#3869D0]/50 focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10"
                            />

                            {search && (
                                <button
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[var(--muted)] transition hover:bg-[#F2F6FF] hover:text-[var(--navy)]"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        <div
                            ref={courseDropdownRef}
                            className={`relative ${isCourseOpen ? "z-[60]" : "z-10"}`}
                        >
                            <div
                                onClick={() => setIsCourseOpen((prev) => !prev)}
                                className="flex min-h-[44px] cursor-pointer items-center justify-between gap-2 rounded-xl border border-[#C8D5EA] bg-white/80 px-3.5 py-1.5 backdrop-blur-md transition hover:border-[#3869D0]/60 focus-within:border-[#3869D0] focus-within:ring-4 focus-within:ring-[#3869D0]/10"
                            >
                                <div className="flex flex-1 flex-wrap items-center gap-1.5 overflow-hidden">
                                    <BookOpen
                                        size={17}
                                        className="shrink-0 text-[var(--muted)]"
                                    />
                                    {selectedCourses.length === 0 ? (
                                        <span className="text-sm text-[var(--muted)] select-none">
                                            Filter by course (Select Multiple)
                                        </span>
                                    ) : (
                                        selectedCourses.map((c) => (
                                            <span
                                                key={c}
                                                className="inline-flex items-center gap-1 rounded-lg bg-[#3869D0]/10 px-2 py-0.5 text-xs font-bold text-[#3869D0]"
                                            >
                                                {c}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleCourseSelection(c);
                                                    }}
                                                    className="rounded-full p-0.5 hover:bg-[#3869D0]/20"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))
                                    )}
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                    {selectedCourses.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearAllCourses();
                                            }}
                                            className="rounded-lg p-1 text-[var(--muted)] transition hover:bg-[#F2F6FF] hover:text-[var(--navy)]"
                                            title="Clear all courses"
                                        >
                                            <X size={15} />
                                        </button>
                                    )}
                                    <div className="p-1 text-[var(--muted)]">
                                        <ChevronDown
                                            size={15}
                                            className={`transition-transform duration-200 ${
                                                isCourseOpen
                                                    ? "rotate-180 text-[#3869D0]"
                                                    : ""
                                            }`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Custom Multi-Select Dropdown Menu matching Academy Theme */}
                            {isCourseOpen && (
                                <div className="absolute left-0 right-0 top-full z-[100] mt-1.5 overflow-hidden rounded-2xl border-2 border-[#C8D5EA] bg-white p-2 shadow-[0_24px_60px_rgba(16,42,67,0.28)]">
                                    <div className="flex items-center justify-between border-b border-[#F0F4FA] px-2.5 pb-2 pt-1">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)]">
                                            Courses ({selectedCourses.length}/{commonCourses.length})
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={selectAllCourses}
                                                className="text-[11px] font-bold text-[#3869D0] hover:underline"
                                            >
                                                Select All
                                            </button>
                                            <span className="text-slate-300">•</span>
                                            <button
                                                type="button"
                                                onClick={clearAllCourses}
                                                className="text-[11px] font-semibold text-slate-500 hover:text-red-600 hover:underline"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>

                                    <div className="py-1">
                                        {commonCourses.map((c) => {
                                            const isSelected =
                                                selectedCourses.includes(c);
                                            return (
                                                <button
                                                    type="button"
                                                    key={c}
                                                    onClick={() =>
                                                        toggleCourseSelection(c)
                                                    }
                                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                                                        isSelected
                                                            ? "bg-[#3869D0]/10 font-bold text-[#3869D0]"
                                                            : "font-semibold text-[var(--navy)] hover:bg-[#F2F6FF] hover:text-[#3869D0]"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                                                                isSelected
                                                                    ? "border-[#3869D0] bg-[#3869D0] text-white"
                                                                    : "border-[#C8D5EA] bg-white"
                                                            }`}
                                                        >
                                                            {isSelected && (
                                                                <Check
                                                                    size={12}
                                                                    strokeWidth={3}
                                                                />
                                                            )}
                                                        </div>
                                                        <span>{c}</span>
                                                    </div>
                                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                                        {isSelected
                                                            ? "Selected"
                                                            : ""}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-1 flex items-center justify-between border-t border-[#F0F4FA] px-2 pt-2">
                                        <span className="text-xs text-[var(--muted)]">
                                            {selectedCourses.length === 0
                                                ? "Showing all courses"
                                                : `${selectedCourses.length} selected`}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsCourseOpen(false)
                                            }
                                            className="rounded-lg bg-[var(--navy)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#3869D0]"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Date Pickers & Presets */}
                    <div className="mt-4 rounded-2xl border-2 border-[#D8E1EE] bg-white p-3.5 shadow-sm sm:p-5">
                        <div className="flex flex-col gap-3.5 xl:flex-row xl:items-center xl:justify-between">

                            {/* Date inputs (2 columns on mobile side by side) */}
                            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                                    <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-[var(--navy)] sm:text-xs">
                                        <CalendarDays size={14} className="text-[#3869D0]" />
                                        <span>From:</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            setPage(1);
                                        }}
                                        className="h-10 w-full rounded-xl border-2 border-[#C8D5EA] bg-[#F8FAFC] px-2.5 text-xs font-bold text-[var(--navy)] outline-none transition focus:border-[#3869D0] focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10 sm:w-auto sm:px-3.5"
                                    />
                                </div>

                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                                    <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-[var(--navy)] sm:text-xs">
                                        <CalendarDays size={14} className="text-[#3869D0]" />
                                        <span>To:</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        min={startDate || undefined}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            setPage(1);
                                        }}
                                        className="h-10 w-full rounded-xl border-2 border-[#C8D5EA] bg-[#F8FAFC] px-2.5 text-xs font-bold text-[var(--navy)] outline-none transition focus:border-[#3869D0] focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10 sm:w-auto sm:px-3.5"
                                    />
                                </div>
                            </div>

                            {/* Quick Presets (Symmetrical wrap on mobile) */}
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="w-full text-[10px] font-extrabold uppercase tracking-wider text-[var(--navy)] sm:w-auto sm:text-xs">
                                    Presets:
                                </span>
                                {[
                                    {
                                        label: "This Month",
                                        active: isCurrentMonthActive,
                                        onClick: () => {
                                            setStartDate(getCurrentMonthStart());
                                            setEndDate(getCurrentMonthEnd());
                                            setPage(1);
                                        },
                                    },
                                    {
                                        label: "Last Month",
                                        active: isLastMonthActive,
                                        onClick: () => {
                                            setStartDate(getLastMonthStart());
                                            setEndDate(getLastMonthEnd());
                                            setPage(1);
                                        },
                                    },
                                    {
                                        label: "Last 30 Days",
                                        active: isLast30DaysActive,
                                        onClick: () => {
                                            setStartDate(getLast30DaysStart());
                                            setEndDate(getTodayDateStr());
                                            setPage(1);
                                        },
                                    },
                                    {
                                        label: "Today",
                                        active: isTodayActive,
                                        onClick: () => {
                                            setStartDate(getTodayDateStr());
                                            setEndDate(getTodayDateStr());
                                            setPage(1);
                                        },
                                    },
                                    {
                                        label: "All Time",
                                        active: isAllTimeActive,
                                        onClick: () => {
                                            setStartDate("");
                                            setEndDate("");
                                            setPage(1);
                                        },
                                    },
                                ].map((preset) => (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        onClick={preset.onClick}
                                        className={`flex-1 sm:flex-none text-center whitespace-nowrap rounded-xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold transition-all ${
                                            preset.active
                                                ? "bg-[#3869D0] text-white shadow-md shadow-[#3869D0]/30 ring-2 ring-[#3869D0]/30 scale-[1.02]"
                                                : "border-2 border-[#C8D5EA] bg-white text-[var(--navy)] hover:border-[#3869D0] hover:bg-[#F2F6FF]"
                                        }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

                        </div>

                        {/* Visible Active Date Filter Callout */}
                        <div className="mt-3 flex flex-col gap-2 border-t border-[#E2E8F0] pt-2.5 sm:flex-row sm:items-center sm:justify-between text-xs">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--navy)] sm:text-xs">
                                    Active Date Filter:
                                </span>
                                <span className="inline-flex w-fit items-center gap-1.5 rounded-xl border-2 border-[#3869D0]/30 bg-[#3869D0]/10 px-2.5 py-1 text-[11px] font-bold text-[#1f4ba8] sm:px-3 sm:text-xs">
                                    <CalendarDays size={13} className="shrink-0 text-[#3869D0]" />
                                    <span>
                                        {isCurrentMonthActive
                                            ? `This Month (${startDate} to ${endDate})`
                                            : isLastMonthActive
                                            ? `Last Month (${startDate} to ${endDate})`
                                            : isTodayActive
                                            ? `Today (${startDate})`
                                            : isLast30DaysActive
                                            ? `Last 30 Days (${startDate} to ${endDate})`
                                            : startDate && endDate
                                            ? `Custom Dates (${startDate} to ${endDate})`
                                            : startDate
                                            ? `From ${startDate}`
                                            : endDate
                                            ? `Up to ${endDate}`
                                            : "All Time (Complete History)"}
                                    </span>
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* Status Filter Chips + Active Filter Summary */}
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="mr-1 text-xs font-extrabold uppercase tracking-wider text-[var(--navy)]">
                                Status:
                            </span>

                            {statusOptions.map((option) => {
                                const active = status === option.value;

                                return (
                                    <button
                                        key={option.value || "all"}
                                        onClick={() => {
                                            setStatus(option.value);
                                            setPage(1);
                                        }}
                                        className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                                            active
                                                ? "border-[#3869D0] bg-[#3869D0] text-white shadow-md shadow-[#3869D0]/25"
                                                : "border-[#C8D5EA] bg-white text-[#526579] hover:border-[#3869D0]/40 hover:bg-[#F2F6FF] hover:text-[var(--navy)]"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Filter Pill badge */}
                        <div className="flex items-center gap-2 text-xs font-medium text-[var(--navy)]">
                            <span className="font-extrabold">Active Filter:</span>
                            <span className="rounded-xl border-2 border-[#3869D0]/30 bg-white px-3 py-1 text-xs font-bold text-[var(--navy)] shadow-sm">
                                {status ? `${status.toUpperCase()} Only` : "All Statuses"}
                                {course ? ` • ${course}` : ""}
                                {isCurrentMonthActive
                                    ? " • This Month"
                                    : startDate && endDate
                                    ? ` • ${startDate} to ${endDate}`
                                    : startDate
                                    ? ` • From ${startDate}`
                                    : endDate
                                    ? ` • Till ${endDate}`
                                    : " • All Time"}
                            </span>
                        </div>

                    </div>

                </div>

                {/* Contacts */}

                <div
                    className={`${glass} relative z-0 overflow-hidden`}
                >

                    <div className="border-b border-[#D8E1EE] px-5 py-5 sm:px-6">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <h2 className="text-lg font-bold text-[var(--navy)]">
                                    All Enquiries
                                </h2>

                                <p className="mt-1 text-xs text-[var(--muted)]">
                                    {totalContacts >
                                        0
                                        ? `Showing ${startItem}-${endItem} of ${totalContacts} enquiries`
                                        : "No enquiries found"}
                                </p>

                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* View Mode Toggle (Cards vs Table) */}
                                <div className="inline-flex rounded-xl border border-[#C8D5EA] bg-white/80 p-0.5 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("cards")}
                                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                            viewMode === "cards"
                                                ? "bg-[#3869D0] text-white shadow-xs"
                                                : "text-[#526579] hover:text-[var(--navy)]"
                                        }`}
                                        title="Cards View"
                                    >
                                        <LayoutGrid size={13} />
                                        <span>Cards</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("table")}
                                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                            viewMode === "table"
                                                ? "bg-[#3869D0] text-white shadow-xs"
                                                : "text-[#526579] hover:text-[var(--navy)]"
                                        }`}
                                        title="Table View"
                                    >
                                        <List size={13} />
                                        <span>Table</span>
                                    </button>
                                </div>

                                <button
                                    onClick={handleExportExcel}
                                    disabled={exporting || loading || totalContacts === 0}
                                    className="group relative inline-flex h-9 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#244A9A] to-[#3869D0] px-3.5 text-xs font-bold text-white shadow-sm transition hover:from-[#1e3e82] hover:to-[#2f5dbd] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Export currently filtered enquiries to Excel"
                                >
                                    {exporting ? (
                                        <Loader2 size={14} className="animate-spin text-white" />
                                    ) : (
                                        <FileSpreadsheet size={14} className="text-white" />
                                    )}
                                    <span>{exporting ? "Exporting..." : "Export Excel"}</span>
                                </button>

                                {loading && (
                                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
                                        <Loader2
                                            size={15}
                                            className="animate-spin"
                                        />
                                        Loading enquiries...
                                    </div>
                                )}
                            </div>

                        </div>

                    </div>

                    {loading ? (
                        <div className="flex min-h-[420px] flex-col items-center justify-center px-6">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3869D0]/10 text-[#3869D0]">
                                <Loader2
                                    size={26}
                                    className="animate-spin"
                                />
                            </div>

                            <p className="mt-4 text-sm font-semibold text-[var(--navy)]">
                                Loading enquiries...
                            </p>

                            <p className="mt-1 text-xs text-[var(--muted)]">
                                Please wait while we fetch the latest data.
                            </p>

                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3869D0]/10 text-[#3869D0]">
                                <Inbox size={30} />
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-[var(--navy)]">
                                No enquiries found
                            </h3>

                            <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                                There are no contact enquiries matching your current search or filters.
                            </p>

                            {(search ||
                                course ||
                                status) && (
                                    <button
                                        onClick={
                                            clearFilters
                                        }
                                        className="mt-5 rounded-xl bg-[#3869D0] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#3869D0]/20 transition hover:bg-[#2f5dbd]"
                                    >
                                        Clear Filters
                                    </button>
                                )}

                        </div>
                    ) : (
                        <>
                            {viewMode === "table" ? (
                        /* Table View */
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-[#D8E1EE] bg-[#F2F6FF]/70">
                                        <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                                            Contact
                                        </th>
                                        <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                                            Number
                                        </th>
                                        <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                                            Course
                                        </th>
                                        <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                                            Enquiry Message
                                        </th>
                                        <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                                            Status
                                        </th>
                                        <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                                            Date &amp; Time
                                        </th>
                                        <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.map((contact) => {
                                        const cleanNumber = contact?.number
                                            ? String(contact.number).trim().replace(/[^\d+]/g, "")
                                            : "";
                                        const waNumber = cleanNumber ? cleanNumber.replace(/[^\d]/g, "") : "";

                                        return (
                                            <tr
                                                key={contact._id}
                                                className="border-b border-[#D8E1EE]/70 transition duration-150 hover:bg-[#EEF4FF]/70"
                                            >
                                                {/* Contact Name (No first letter avatar logo) */}
                                                <td className="px-5 py-4 align-top">
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-[var(--navy)]">
                                                            {contact?.name || "—"}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            Website Enquiry
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Contact Number */}
                                                <td className="px-5 py-4 align-top">
                                                    {contact?.number ? (
                                                        <div className="flex items-center gap-2">
                                                            <a
                                                                href={`tel:${cleanNumber}`}
                                                                onClick={(e) => handleDirectCall(cleanNumber, e)}
                                                                className="group/call inline-flex items-center gap-1.5 rounded-xl border border-[#3869D0]/20 bg-blue-50/70 px-2.5 py-1.5 transition-all hover:border-[#3869D0] hover:bg-blue-100 hover:shadow-2xs"
                                                                title={`Click to call ${contact.number}`}
                                                            >
                                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#3869D0] text-white shadow-2xs transition group-hover/call:scale-105">
                                                                    <Phone size={12} />
                                                                </div>
                                                                <span className="whitespace-nowrap text-xs font-bold text-[var(--navy)] group-hover/call:text-[#3869D0]">
                                                                    {contact.number}
                                                                </span>
                                                            </a>

                                                            {waNumber && (
                                                                <a
                                                                    href={`https://wa.me/${waNumber}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex h-8 items-center gap-1 rounded-xl bg-emerald-50 px-2 text-xs font-bold text-emerald-700 border border-emerald-200/80 transition hover:bg-emerald-100"
                                                                    title="WhatsApp message"
                                                                >
                                                                    WA
                                                                </a>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleCopyNumber(contact.number, e)}
                                                                className="rounded-xl border border-[#C8D5EA] bg-white/80 p-2 text-[var(--muted)] transition hover:border-[#3869D0]/50 hover:bg-white hover:text-[#3869D0] hover:shadow-2xs"
                                                                title="Copy phone number"
                                                            >
                                                                {copiedNumber === String(contact.number).trim() ? (
                                                                    <Check size={13} className="text-[#3869D0]" />
                                                                ) : (
                                                                    <Copy size={13} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="whitespace-nowrap text-sm font-medium text-[var(--muted)]">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Target Course */}
                                                <td className="px-5 py-4 align-top">
                                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/70 px-3 py-1 text-xs font-bold text-[#3869D0]">
                                                        <BookOpen size={12} className="shrink-0" />
                                                        <span>{contact?.course || "—"}</span>
                                                    </div>
                                                </td>

                                                {/* Enquiry Message - PROPERLY VISIBLE in dedicated container */}
                                                <td className="min-w-[280px] max-w-[420px] px-5 py-4 align-top">
                                                    <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 shadow-2xs transition hover:bg-white hover:border-[#3869D0]/30">
                                                        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                                            <MessageSquare size={12} className="text-[#3869D0]" />
                                                            <span>Enquiry Message</span>
                                                        </div>
                                                        <p className="whitespace-pre-wrap break-words text-xs font-medium leading-relaxed text-slate-700">
                                                            {contact?.message ? (
                                                                contact.message
                                                            ) : (
                                                                <span className="italic text-slate-400">No message provided</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4 align-top">
                                                    <div className="flex items-center">
                                                        <select
                                                            value={contact?.status || "new"}
                                                            onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                                                            disabled={updatingId === contact._id}
                                                            className={`rounded-full border px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                                                statusStyles[contact?.status] || statusStyles.new
                                                            }`}
                                                        >
                                                            <option value="new">New</option>
                                                            <option value="open">Open</option>
                                                            <option value="closed">Closed</option>
                                                        </select>
                                                        {updatingId === contact._id && (
                                                            <Loader2 size={14} className="ml-2 animate-spin text-[var(--muted)]" />
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Date & Time */}
                                                <td className="px-5 py-4 align-top">
                                                    <div className="flex items-start gap-2">
                                                        <CalendarDays size={14} className="mt-0.5 shrink-0 text-slate-400" />
                                                        <div>
                                                            <p className="whitespace-nowrap text-xs font-bold text-[#526579]">
                                                                {formatDate(contact?.createdAt)}
                                                            </p>
                                                            <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                                                                {formatTime(contact?.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Action */}
                                                <td className="px-5 py-4 text-right align-top">
                                                    <button
                                                        onClick={() => requestDelete(contact)}
                                                        disabled={deletingId === contact._id}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        title="Delete enquiry"
                                                    >
                                                        {deletingId === contact._id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                    ) : (
                        /* Cards View - Human-crafted CRM cards */
                        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:gap-5 sm:p-5 xl:grid-cols-3">
                            {contacts.map((contact) => {
                                const cleanNumber = contact?.number
                                    ? String(contact.number).trim().replace(/[^\d+]/g, "")
                                    : "";
                                const waNumber = cleanNumber ? cleanNumber.replace(/[^\d]/g, "") : "";

                                return (
                                    <div
                                        key={contact._id}
                                        className="flex flex-col justify-between rounded-2xl border border-[#C8D5EA]/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3869D0]/40 hover:shadow-md"
                                    >
                                        {/* Top Row: Candidate Name & Course + Delete Button */}
                                        <div>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate text-base font-bold text-[var(--navy)] tracking-tight">
                                                        {contact?.name || "Anonymous Candidate"}
                                                    </h3>
                                                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                        {contact?.course ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#3869D0]">
                                                                <BookOpen size={11} />
                                                                {contact.course}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-medium text-slate-400">General Enquiry</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => requestDelete(contact)}
                                                    disabled={deletingId === contact._id}
                                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                                    title="Delete enquiry"
                                                >
                                                    {deletingId === contact._id ? (
                                                        <Loader2 size={15} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={15} />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Phone Strip with Direct Actions (Call, WhatsApp, Copy) */}
                                            {contact?.number ? (
                                                <div className="my-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-[#F6F9FD] p-2.5">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#3869D0] text-white shadow-2xs">
                                                            <Phone size={12} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Contact</p>
                                                            <p className="truncate text-xs font-bold text-[var(--navy)]">{contact.number}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <a
                                                            href={`tel:${cleanNumber}`}
                                                            onClick={(e) => handleDirectCall(cleanNumber, e)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-[#3869D0]/30 bg-white px-2.5 py-1 text-xs font-bold text-[#3869D0] shadow-2xs transition hover:bg-blue-50 active:scale-95"
                                                            title={`Call ${contact.number}`}
                                                        >
                                                            Call
                                                        </a>
                                                        {waNumber && (
                                                            <a
                                                                href={`https://wa.me/${waNumber}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-700 active:scale-95"
                                                                title="Chat on WhatsApp"
                                                            >
                                                                WhatsApp
                                                            </a>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleCopyNumber(contact.number, e)}
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:text-[#3869D0] hover:border-[#3869D0]/40"
                                                            title="Copy phone number"
                                                        >
                                                            {copiedNumber === String(contact.number).trim() ? (
                                                                <Check size={13} className="text-[#3869D0]" />
                                                            ) : (
                                                                <Copy size={13} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="my-3.5 flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 text-xs text-slate-400">
                                                    <Phone size={13} />
                                                    <span>No phone number provided</span>
                                                </div>
                                            )}

                                            {/* Dedicated Message Block - Crystal Clear Visibility */}
                                            <div className="my-1 rounded-xl border border-slate-200/90 bg-slate-50/90 p-3.5 shadow-2xs">
                                                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                                    <MessageSquare size={12} className="text-[#3869D0]" />
                                                    <span className="text-slate-600 font-bold">Enquiry Message</span>
                                                </div>
                                                <p className="whitespace-pre-wrap break-words text-xs sm:text-sm font-medium leading-relaxed text-slate-700">
                                                    {contact?.message ? (
                                                        contact.message
                                                    ) : (
                                                        <span className="italic text-slate-400">No message entered.</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bottom Status & Date Row */}
                                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                                <CalendarDays size={13} className="text-slate-400" />
                                                <span>{formatDate(contact?.createdAt)}</span>
                                                <span className="text-slate-300">•</span>
                                                <span>{formatTime(contact?.createdAt)}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <select
                                                    value={contact?.status || "new"}
                                                    onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                                                    disabled={updatingId === contact._id}
                                                    className={`rounded-full border px-3 py-1 text-xs font-bold outline-none cursor-pointer transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                                        statusStyles[contact?.status] || statusStyles.new
                                                    }`}
                                                >
                                                    <option value="new">New</option>
                                                    <option value="open">Open</option>
                                                    <option value="closed">Closed</option>
                                                </select>
                                                {updatingId === contact._id && (
                                                    <Loader2 size={13} className="animate-spin text-[#3869D0]" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                            )}

                            {/* Pagination */}

                            <div className="border-t border-[#D8E1EE] px-4 py-4 sm:px-6">

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                    <p className="text-xs font-medium text-[var(--muted)]">

                                        {totalContacts >
                                            0
                                            ? `Showing ${startItem}-${endItem} of ${totalContacts}`
                                            : "No records"}

                                    </p>

                                    <div className="flex items-center justify-between gap-2 sm:justify-end">

                                        <button
                                            onClick={
                                                goToPreviousPage
                                            }
                                            disabled={
                                                page <=
                                                1 ||
                                                loading
                                            }
                                            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#C8D5EA] bg-white/60 px-3 text-sm font-semibold text-[#40556B] transition hover:bg-white hover:text-[var(--navy)] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                                        >

                                            <ChevronLeft
                                                size={
                                                    16
                                                }
                                            />

                                            <span className="hidden sm:inline">
                                                Previous
                                            </span>

                                        </button>

                                        <div className="flex h-10 min-w-[100px] items-center justify-center rounded-xl border border-[#C8D5EA] bg-white/60 px-4 text-xs font-semibold text-[#40556B]">

                                            Page{" "}
                                            {page}{" "}
                                            of{" "}
                                            {
                                                totalPages
                                            }

                                        </div>

                                        <button
                                            onClick={
                                                goToNextPage
                                            }
                                            disabled={
                                                page >=
                                                totalPages ||
                                                loading
                                            }
                                            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#C8D5EA] bg-white/60 px-3 text-sm font-semibold text-[#40556B] transition hover:bg-white hover:text-[var(--navy)] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                                        >

                                            <span className="hidden sm:inline">
                                                Next
                                            </span>

                                            <ChevronRight
                                                size={
                                                    16
                                                }
                                            />

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </>
                    )}

                </div>

            </div>

            {/* Delete Confirmation Modal */}

            <DeleteConfirmModal
                open={!!deleteTarget}
                title="Delete this enquiry?"
                description="will be permanently deleted. This action cannot be undone."
                itemName={
                    deleteTarget?.name ||
                    "This enquiry"
                }
                confirmText="Delete Enquiry"
                loading={!!deletingId}
                onCancel={() =>
                    setDeleteTarget(null)
                }
                onConfirm={
                    handleDelete
                }
            />

        </div>
    );
}