"use client";

import { useCallback, useEffect, useState } from "react";
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
    Loader2,
    X,
    Inbox,
    AlertCircle,
    CalendarDays,
    Filter,
    Users,
} from "lucide-react";

import {
    getContacts,
    updateContactStatus,
    deleteContact,
} from "@/services/contactService";

import DeleteConfirmModal from "@/component/common/DeleteConfirmModal";

const statusStyles = {
    new: "border-[#3869D0]/20 bg-[#3869D0]/10 text-[#3869D0]",

    open: "border-[#b89242]/30 bg-[#b89242]/10 text-[#8A6820]",

    closed: "border-[#3D7A57]/30 bg-[#3D7A57]/10 text-[#2F6546]",
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

    const [course, setCourse] =
        useState("");

    const [updatingId, setUpdatingId] =
        useState(null);

    const [deletingId, setDeletingId] =
        useState(null);

    const [deleteTarget, setDeleteTarget] =
        useState(null);

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
    }, [page, limit, searchQuery, course, status]);

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

                <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/70 bg-[var(--navy)] px-6 py-8 text-white shadow-[0_18px_50px_rgba(16,42,67,0.16)] backdrop-blur-xl sm:px-10 sm:py-9">

                    <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#3869D0]/15 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[var(--gold)]/10 blur-3xl" />

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-start gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-[var(--gold)] shadow-lg backdrop-blur-md">
                                <Inbox size={27} />
                            </div>

                            <div>

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-white/90 backdrop-blur-md sm:text-xs">
                                    CONTACT MANAGEMENT
                                </span>

                                <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
                                    Enquiries
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                                    Manage student enquiries, contact details, courses and enquiry status from one place.
                                </p>

                            </div>

                        </div>

                        <button
                            onClick={
                                fetchContacts
                            }
                            disabled={loading}
                            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white shadow-sm backdrop-blur-md transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                size={17}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh
                        </button>

                    </div>

                </div>

                {/* Stats */}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                    <div
                        className={`${glass} group p-5 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/90`}
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                                    Total Enquiries
                                </p>

                                <p className="mt-2 text-3xl font-extrabold text-[var(--navy)]">
                                    {totalContacts}
                                </p>

                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3869D0]/10 text-[#3869D0] shadow-sm">
                                <Users size={21} />
                            </div>

                        </div>

                    </div>

                    <div
                        className={`${glass} group p-5 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/90`}
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                                    Showing
                                </p>

                                <p className="mt-2 text-3xl font-extrabold text-[var(--navy)]">
                                    {currentCount}
                                </p>

                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--gold)]/10 text-[#8A6820] shadow-sm">
                                <Inbox size={21} />
                            </div>

                        </div>

                    </div>

                    <div
                        className={`${glass} group p-5 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/90`}
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                                    Current Page
                                </p>

                                <p className="mt-2 text-3xl font-extrabold text-[var(--navy)]">
                                    {page}

                                    <span className="ml-1 text-base font-medium text-[var(--muted)]">
                                        / {totalPages}
                                    </span>
                                </p>

                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7EEFA] text-[#3869D0] shadow-sm">
                                <CalendarDays size={21} />
                            </div>

                        </div>

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

                <div
                    className={`${glass} mb-6 p-5 sm:p-6`}
                >

                    <div className="mb-5 flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--navy)] text-[var(--gold)] shadow-md">
                            <Filter size={18} />
                        </div>

                        <div>

                            <h2 className="text-sm font-bold text-[var(--navy)]">
                                Filters
                            </h2>

                            <p className="mt-0.5 text-xs text-[var(--muted)]">
                                Find enquiries quickly
                            </p>

                        </div>

                    </div>

                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_250px_auto]">

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
                                placeholder="Search name, number, course or message..."
                                className="h-12 w-full rounded-xl border border-[#C8D5EA] bg-white/70 pl-11 pr-10 text-sm text-[var(--navy)] outline-none backdrop-blur-md transition placeholder:text-[var(--muted)] focus:border-[#3869D0]/50 focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10"
                            />

                            {search && (
                                <button
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[var(--muted)] transition hover:bg-[#F2F6FF] hover:text-[var(--navy)]"
                                >
                                    <X size={16} />
                                </button>
                            )}

                        </div>

                        <div className="relative">

                            <BookOpen
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                            />

                            <input
                                type="text"
                                value={course}
                                onChange={(e) => {
                                    setCourse(
                                        e.target.value
                                    );

                                    setPage(1);
                                }}
                                placeholder="Filter by course"
                                className="h-12 w-full rounded-xl border border-[#C8D5EA] bg-white/70 pl-11 pr-4 text-sm text-[var(--navy)] outline-none backdrop-blur-md transition placeholder:text-[var(--muted)] focus:border-[#3869D0]/50 focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10"
                            />

                        </div>

                        <button
                            onClick={
                                clearFilters
                            }
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#C8D5EA] bg-white/60 px-5 text-sm font-semibold text-[#40556B] backdrop-blur-md transition hover:bg-white hover:text-[var(--navy)] hover:shadow-sm"
                        >
                            <X size={16} />
                            Clear Filters
                        </button>

                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2">

                        <span className="mr-1 text-xs font-semibold text-[var(--muted)]">
                            Status:
                        </span>

                        {statusOptions.map(
                            (option) => {
                                const active =
                                    status ===
                                    option.value;

                                return (
                                    <button
                                        key={
                                            option.value ||
                                            "all"
                                        }
                                        onClick={() => {
                                            setStatus(
                                                option.value
                                            );

                                            setPage(
                                                1
                                            );
                                        }}
                                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                                            active
                                                ? "border-[#3869D0] bg-[#3869D0] text-white shadow-md shadow-[#3869D0]/20"
                                                : "border-[#C8D5EA] bg-white/60 text-[var(--muted)] hover:bg-white hover:text-[var(--navy)]"
                                        }`}
                                    >
                                        {
                                            option.label
                                        }
                                    </button>
                                );
                            }
                        )}

                    </div>

                </div>

                {/* Contacts */}

                <div
                    className={`${glass} overflow-hidden`}
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

                            {/* Desktop Table */}

                            <div className="hidden overflow-x-auto xl:block">

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
                                                Message
                                            </th>

                                            <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                                                Status
                                            </th>

                                            <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                                                Date
                                            </th>

                                            <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {contacts.map(
                                            (
                                                contact
                                            ) => (

                                                <tr
                                                    key={
                                                        contact._id
                                                    }
                                                    className="border-b border-[#D8E1EE]/70 transition duration-200 hover:bg-[#EEF4FF]"
                                                >

                                                    <td className="px-5 py-5 align-top">

                                                        <div className="flex items-center gap-3">

                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3869D0]/10 text-sm font-bold text-[#3869D0]">
                                                                {contact?.name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    ?.toUpperCase() ||
                                                                    "U"}
                                                            </div>

                                                            <div className="min-w-0">

                                                                <p className="font-semibold text-[var(--navy)]">
                                                                    {contact?.name ||
                                                                        "—"}
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-[var(--muted)]">
                                                                    Website Enquiry
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    <td className="px-5 py-5 align-top">

                                                        <div className="flex items-center gap-2">

                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3869D0]/10 text-[#3869D0]">
                                                                <Phone
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            </div>

                                                            <span className="whitespace-nowrap text-sm font-medium text-[#526579]">
                                                                {contact?.number ||
                                                                    "—"}
                                                            </span>

                                                        </div>

                                                    </td>

                                                    <td className="px-5 py-5 align-top">

                                                        <div className="inline-flex max-w-[170px] items-center gap-2 rounded-xl border border-[#C8D5EA] bg-white/60 px-3 py-2">

                                                            <BookOpen
                                                                size={
                                                                    15
                                                                }
                                                                className="shrink-0 text-[#3869D0]"
                                                            />

                                                            <span className="break-words text-sm font-medium text-[#526579]">
                                                                {contact?.course ||
                                                                    "—"}
                                                            </span>

                                                        </div>

                                                    </td>

                                                    <td className="max-w-[360px] px-5 py-5 align-top">

                                                        <div className="flex gap-2">

                                                            <MessageSquare
                                                                size={
                                                                    16
                                                                }
                                                                className="mt-1 shrink-0 text-[#3869D0]/70"
                                                            />

                                                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#526579]">
                                                                {contact?.message ||
                                                                    "—"}
                                                            </p>

                                                        </div>

                                                    </td>

                                                    <td className="px-5 py-5 align-top">

                                                        <div className="flex items-center">

                                                            <select
                                                                value={
                                                                    contact?.status ||
                                                                    "new"
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleStatusChange(
                                                                        contact._id,
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                disabled={
                                                                    updatingId ===
                                                                    contact._id
                                                                }
                                                                className={`rounded-full border px-3 py-2 text-xs font-bold outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                                                    statusStyles[
                                                                        contact?.status
                                                                    ] ||
                                                                    statusStyles.new
                                                                }`}
                                                            >

                                                                <option value="new">
                                                                    New
                                                                </option>

                                                                <option value="open">
                                                                    Open
                                                                </option>

                                                                <option value="closed">
                                                                    Closed
                                                                </option>

                                                            </select>

                                                            {updatingId ===
                                                                contact._id && (
                                                                <Loader2
                                                                    size={
                                                                        14
                                                                    }
                                                                    className="ml-2 animate-spin text-[var(--muted)]"
                                                                />
                                                            )}

                                                        </div>

                                                    </td>

                                                    <td className="px-5 py-5 align-top">

                                                        <div className="flex items-start gap-2">

                                                            <CalendarDays
                                                                size={
                                                                    15
                                                                }
                                                                className="mt-0.5 shrink-0 text-[var(--muted)]"
                                                            />

                                                            <div>

                                                                <p className="whitespace-nowrap text-sm font-medium text-[#526579]">
                                                                    {formatDate(
                                                                        contact?.createdAt
                                                                    )}
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-[var(--muted)]">
                                                                    {formatTime(
                                                                        contact?.createdAt
                                                                    )}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    <td className="px-5 py-5 text-right align-top">

                                                        <button
                                                            onClick={() =>
                                                                requestDelete(
                                                                    contact
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                contact._id
                                                            }
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                            title="Delete enquiry"
                                                        >
                                                            {deletingId ===
                                                            contact._id ? (
                                                                <Loader2
                                                                    size={
                                                                        16
                                                                    }
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <Trash2
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            )}
                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                            {/* Mobile Cards */}

                            <div className="grid grid-cols-1 gap-4 p-4 xl:hidden">

                                {contacts.map(
                                    (
                                        contact
                                    ) => (

                                        <div
                                            key={
                                                contact._id
                                            }
                                            className="rounded-2xl border border-[#C8D5EA] bg-white/70 p-4 shadow-sm backdrop-blur-md transition hover:bg-white hover:shadow-md"
                                        >

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3869D0]/10 text-sm font-bold text-[#3869D0]">

                                                        {contact?.name
                                                            ?.charAt(
                                                                0
                                                            )
                                                            ?.toUpperCase() ||
                                                            "U"}

                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="truncate font-bold text-[var(--navy)]">
                                                            {contact?.name ||
                                                                "—"}
                                                        </p>

                                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">

                                                            <CalendarDays
                                                                size={
                                                                    12
                                                                }
                                                            />

                                                            {formatDate(
                                                                contact?.createdAt
                                                            )}

                                                        </div>

                                                    </div>

                                                </div>

                                                <button
                                                    onClick={() =>
                                                        requestDelete(
                                                            contact
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        contact._id
                                                    }
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                    title="Delete enquiry"
                                                >

                                                    {deletingId ===
                                                    contact._id ? (
                                                        <Loader2
                                                            size={
                                                                16
                                                            }
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Trash2
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    )}

                                                </button>

                                            </div>

                                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                                                <div className="rounded-xl border border-[#C8D5EA] bg-white/60 p-3">

                                                    <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">

                                                        <Phone
                                                            size={
                                                                14
                                                            }
                                                            className="text-[#3869D0]"
                                                        />

                                                        Number

                                                    </div>

                                                    <p className="break-all text-sm font-medium text-[#526579]">
                                                        {contact?.number ||
                                                            "—"}
                                                    </p>

                                                </div>

                                                <div className="rounded-xl border border-[#C8D5EA] bg-white/60 p-3">

                                                    <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">

                                                        <BookOpen
                                                            size={
                                                                14
                                                            }
                                                            className="text-[#3869D0]"
                                                        />

                                                        Course

                                                    </div>

                                                    <p className="break-words text-sm font-medium text-[#526579]">
                                                        {contact?.course ||
                                                            "—"}
                                                    </p>

                                                </div>

                                            </div>

                                            <div className="mt-3 rounded-xl border border-[#C8D5EA] bg-white/60 p-3">

                                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">

                                                    <MessageSquare
                                                        size={
                                                            14
                                                        }
                                                        className="text-[#3869D0]"
                                                    />

                                                    Message

                                                </div>

                                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#526579]">
                                                    {contact?.message ||
                                                        "—"}
                                                </p>

                                            </div>

                                            <div className="mt-3 grid grid-cols-1 gap-3 border-t border-[#D8E1EE] pt-3 sm:grid-cols-2">

                                                <div>

                                                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                                                        Status
                                                    </p>

                                                    <div className="flex items-center">

                                                        <select
                                                            value={
                                                                contact?.status ||
                                                                "new"
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleStatusChange(
                                                                    contact._id,
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            disabled={
                                                                updatingId ===
                                                                contact._id
                                                            }
                                                            className={`rounded-full border px-3 py-2 text-xs font-bold outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                                                                statusStyles[
                                                                    contact?.status
                                                                ] ||
                                                                statusStyles.new
                                                            }`}
                                                        >

                                                            <option value="new">
                                                                New
                                                            </option>

                                                            <option value="open">
                                                                Open
                                                            </option>

                                                            <option value="closed">
                                                                Closed
                                                            </option>

                                                        </select>

                                                        {updatingId ===
                                                            contact._id && (
                                                            <Loader2
                                                                size={
                                                                    14
                                                                }
                                                                className="ml-2 animate-spin text-[var(--muted)]"
                                                            />
                                                        )}

                                                    </div>

                                                </div>

                                                <div className="sm:text-right">

                                                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                                                        Submitted
                                                    </p>

                                                    <p className="text-xs font-medium text-[#526579]">

                                                        {formatDate(
                                                            contact?.createdAt
                                                        )}

                                                        {" • "}

                                                        {formatTime(
                                                            contact?.createdAt
                                                        )}

                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

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