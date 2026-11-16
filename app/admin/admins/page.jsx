"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
    Search,
    RefreshCw,
    Plus,
    Pencil,
    Trash2,
    X,
    ShieldCheck,
    UserPlus,
    AlertCircle,
    Eye,
    EyeOff,
    Mail,
    User,
    Lock,
    Users,
    UserCheck,
    UserX,
    Loader2,
    WifiOff,
    LayoutGrid,
    List,
} from "lucide-react";

import ProtectedRoute from "@/component/common/ProtectedRoute";
import DeleteConfirmModal from "@/component/common/DeleteConfirmModal";

import {
    getAdmins,
    getAdminById,
    createAdmin,
    updateAdmin,
    updateAdminStatus,
    deleteAdmin,
} from "@/services/adminService";

const EMAIL_REGEX =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const glass =
    "border border-[#C8D5EA]/70 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(16,42,67,0.10)]";

const getId = (admin) =>
    admin?._id || admin?.id;

const getErrorMessage = (
    err,
    fallback
) => {
    if (!err) {
        return fallback;
    }

    if (typeof err === "string") {
        return err;
    }

    if (
        typeof navigator !== "undefined" &&
        navigator.onLine === false
    ) {
        return "You are offline. Check your internet connection and try again.";
    }

    const status =
        err?.status ||
        err?.response?.status;

    if (status === 400) {
        return (
            err?.response?.data?.message ||
            err?.message ||
            "Invalid request."
        );
    }

    if (status === 401) {
        return "Your session has expired. Please log in again.";
    }

    if (status === 403) {
        return "You don't have permission to do this.";
    }

    if (status === 404) {
        return "This admin no longer exists. Refresh the list.";
    }

    if (status === 409) {
        return "An admin with this email already exists.";
    }

    if (status === 422) {
        return (
            err?.response?.data?.message ||
            "Please check the entered information."
        );
    }

    if (status === 429) {
        return "Too many requests. Please try again later.";
    }

    if (status >= 500) {
        return "Server error. Please try again in a moment.";
    }

    return (
        err?.response?.data?.message ||
        err?.message ||
        fallback
    );
};

const formatDate = (date) => {
    if (!date) {
        return "—";
    }

    const parsedDate = new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "—";
    }

    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

const formatTime = (date) => {
    if (!date) {
        return "";
    }

    const parsedDate = new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "";
    }

    return parsedDate.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};

const inputBase =
    "w-full rounded-xl border bg-white/75 py-3 pl-10 pr-4 text-sm text-[var(--navy)] outline-none transition placeholder:text-[var(--muted)] backdrop-blur-md disabled:cursor-not-allowed disabled:bg-[#F2F6FF]";

const inputClass = (hasError) =>
    `${inputBase} ${
        hasError
            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
            : "border-[#C8D5EA] focus:border-[#3869D0] focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10"
    }`;

function AdminsContent() {
    const [admins, setAdmins] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [loadError, setLoadError] =
        useState("");

    const [formError, setFormError] =
        useState("");

    const [fieldErrors, setFieldErrors] =
        useState({});

    const [search, setSearch] =
        useState("");

    const [showModal, setShowModal] =
        useState(false);

    const [showPassword, setShowPassword] =
        useState(false);

    const [editingId, setEditingId] =
        useState(null);

    const [saving, setSaving] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const [deleteTarget, setDeleteTarget] =
        useState(null);

    const [statusLoadingId, setStatusLoadingId] =
        useState(null);

    const [viewMode, setViewMode] =
        useState("cards");

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const loadAdmins = async (
        showRefreshLoader = false
    ) => {
        try {
            setLoadError("");

            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response =
                await getAdmins();

            const adminData =
                Array.isArray(
                    response?.data
                )
                    ? response.data
                    : [];

            setAdmins(adminData);
        } catch (err) {
            console.error(
                "Failed to load admins:",
                err
            );

            const message =
                getErrorMessage(
                    err,
                    "Failed to load admins. Please try again."
                );

            setLoadError(message);

            if (!showRefreshLoader) {
                setAdmins([]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadAdmins();
        }, 0);

        return () => window.clearTimeout(timer);
    }, []);

    const filteredAdmins =
        admins.filter((admin) => {
            const searchValue =
                search.trim().toLowerCase();

            if (!searchValue) {
                return true;
            }

            return (
                admin?.name
                    ?.toLowerCase()
                    .includes(searchValue) ||
                admin?.email
                    ?.toLowerCase()
                    .includes(searchValue) ||
                admin?.role
                    ?.toLowerCase()
                    .includes(searchValue)
            );
        });

    const activeCount =
        admins.filter(
            (admin) => admin?.isActive
        ).length;

    const inactiveCount =
        admins.length - activeCount;

    const resetForm = useCallback(() => {
        setForm({
            name: "",
            email: "",
            password: "",
        });

        setEditingId(null);
        setFieldErrors({});
        setFormError("");
        setShowPassword(false);
    }, []);

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = async (
        id
    ) => {
        if (!id) {
            toast.error(
                "Admin ID is missing."
            );
            return;
        }

        try {
            setSaving(true);

            const response =
                await getAdminById(id);

            const admin =
                response?.data;

            if (!admin) {
                throw new Error(
                    "Admin data not found."
                );
            }

            resetForm();

            setEditingId(id);

            setForm({
                name: admin.name || "",
                email:
                    admin.email || "",
                password: "",
            });

            setShowModal(true);
        } catch (err) {
            console.error(
                "Failed to fetch admin:",
                err
            );

            toast.error(
                getErrorMessage(
                    err,
                    "Failed to fetch admin details."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    const closeModal = useCallback((
        force = false
    ) => {
        if (saving && !force) {
            return;
        }

        setShowModal(false);
        resetForm();
    }, [saving, resetForm]);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key !== "Escape") return;

            if (deleteTarget && !deletingId) {
                setDeleteTarget(null);
            } else if (showModal && !saving) {
                closeModal();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [showModal, saving, deleteTarget, deletingId, closeModal]);

    const handleInputChange = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setFieldErrors((previous) =>
            previous[name]
                ? {
                      ...previous,
                      [name]: "",
                  }
                : previous
        );

        setFormError("");
    };

    const validateForm = () => {
        const errors = {};

        const name =
            form.name.trim();

        const email =
            form.email.trim();

        if (!name) {
            errors.name =
                "Admin name is required.";
        } else if (name.length < 2) {
            errors.name =
                "Name must be at least 2 characters.";
        }

        if (!email) {
            errors.email =
                "Admin email is required.";
        } else if (
            !EMAIL_REGEX.test(email)
        ) {
            errors.email =
                "Enter a valid email address.";
        }

        if (
            !editingId &&
            !form.password
        ) {
            errors.password =
                "Admin password is required.";
        } else if (
            form.password &&
            form.password.length < 6
        ) {
            errors.password =
                "Password must be at least 6 characters.";
        }

        setFieldErrors(errors);

        return (
            Object.keys(errors)
                .length === 0
        );
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        if (saving) {
            return;
        }

        setFormError("");

        if (!validateForm()) {
            return;
        }

        const name =
            form.name.trim();

        const email =
            form.email.trim();

        try {
            setSaving(true);

            if (editingId) {
                const updateData = {
                    name,
                    email,
                };

                if (form.password) {
                    updateData.password =
                        form.password;
                }

                await updateAdmin(
                    editingId,
                    updateData
                );

                toast.success(
                    "Admin updated successfully."
                );
            } else {
                await createAdmin({
                    name,
                    email,
                    password:
                        form.password,
                });

                toast.success(
                    "Admin created successfully."
                );
            }

            closeModal(true);

            await loadAdmins();
        } catch (err) {
            console.error(
                "Failed to save admin:",
                err
            );

            setFormError(
                getErrorMessage(
                    err,
                    "Failed to save admin. Please try again."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (
        id,
        currentStatus
    ) => {
        if (
            !id ||
            statusLoadingId
        ) {
            return;
        }

        try {
            setStatusLoadingId(id);

            const newStatus =
                !currentStatus;

            await updateAdminStatus(
                id,
                newStatus
            );

            setAdmins((previous) =>
                previous.map(
                    (admin) =>
                        admin._id === id ||
                        admin.id === id
                            ? {
                                  ...admin,
                                  isActive:
                                      newStatus,
                              }
                            : admin
                )
            );

            toast.success(
                newStatus
                    ? "Admin activated successfully."
                    : "Admin deactivated successfully."
            );
        } catch (err) {
            console.error(
                "Failed to update admin status:",
                err
            );

            toast.error(
                getErrorMessage(
                    err,
                    "Failed to update admin status."
                )
            );
        } finally {
            setStatusLoadingId(null);
        }
    };

    const requestDelete = (
        admin
    ) => {
        if (
            !getId(admin) ||
            deletingId
        ) {
            return;
        }

        setDeleteTarget(admin);
    };

    const handleDelete = async () => {
        const id =
            getId(deleteTarget);

        if (!id || deletingId) {
            return;
        }

        try {
            setDeletingId(id);

            await deleteAdmin(id);

            setAdmins((previous) =>
                previous.filter(
                    (admin) =>
                        admin._id !== id &&
                        admin.id !== id
                )
            );

            toast.success(
                "Admin deleted successfully."
            );

            setDeleteTarget(null);
        } catch (err) {
            console.error(
                "Failed to delete admin:",
                err
            );

            setDeleteTarget(null);

            toast.error(
                getErrorMessage(
                    err,
                    "Failed to delete admin."
                )
            );
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="relative min-h-screen w-full overflow-hidden bg-[#F2F6FF] px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
                <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#3869D0]/10 blur-3xl" />

                <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[#B8C9F5]/20 blur-3xl" />

                <div className="relative mx-auto max-w-7xl animate-pulse">
                    <div className="mb-6 h-32 rounded-3xl bg-white/60 backdrop-blur-xl" />

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[1, 2, 3].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="h-28 rounded-2xl bg-white/60"
                                />
                            )
                        )}
                    </div>

                    <div className="rounded-2xl bg-white/60 p-6">
                        <div className="mb-5 h-10 w-60 rounded-xl bg-[#DCE6FF]" />

                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="h-16 rounded-xl bg-[#DCE6FF]"
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#F2F6FF] px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">

            <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-[#3869D0]/10 blur-3xl" />

            <div className="pointer-events-none absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-[#B8C9F5]/20 blur-3xl" />

            <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#b89242]/5 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-7xl">

                {/* Header */}

                <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/70 bg-[var(--navy)] px-6 py-8 text-white shadow-[0_18px_50px_rgba(16,42,67,0.16)] backdrop-blur-xl sm:px-10">

                    <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#3869D0]/20 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[var(--gold)]/10 blur-3xl" />

                    <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">

                        <div>
                            <h1 className="montserrat text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                                Admin Management
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                                Manage admin accounts, permissions and account status from one place.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                            <div className="relative">

                                <Search
                                    size={18}
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(
                                        event
                                    ) =>
                                        setSearch(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="Search by name, email or role"
                                    className="w-full rounded-xl border border-[#C8D5EA] bg-white/80 py-3 pl-10 pr-10 text-sm text-[var(--navy)] outline-none backdrop-blur-md transition placeholder:text-[var(--muted)] focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10 sm:w-72"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearch(
                                                ""
                                            )
                                        }
                                        aria-label="Clear search"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--muted)] transition hover:bg-[#F2F6FF] hover:text-[var(--navy)]"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    loadAdmins(
                                        true
                                    )
                                }
                                disabled={
                                    refreshing
                                }
                                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={17}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                Refresh
                            </button>

                            <button
                                type="button"
                                onClick={
                                    openAddModal
                                }
                                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--gold)] px-5 py-3 text-sm font-bold text-[var(--navy)] shadow-lg shadow-[var(--gold)]/20 transition hover:bg-[#c5a253] hover:shadow-xl"
                            >
                                <Plus size={18} />

                                Add Admin
                            </button>
                        </div>
                    </div>
                </div>

                {loadError && (
                    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50/95 p-5 backdrop-blur-xl sm:flex-row sm:items-center">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                            <WifiOff size={20} />
                        </div>

                        <div className="flex-1">
                            <p className="text-sm font-bold text-red-800">
                                Couldn&apos;t load admins
                            </p>

                            <p className="mt-0.5 text-sm text-red-700">
                                {loadError}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                loadAdmins(
                                    admins.length >
                                        0
                                )
                            }
                            disabled={
                                refreshing
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={15}
                                className={
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Try again
                        </button>
                    </div>
                )}

                <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3">

                    <StatCard
                        icon={
                            <Users size={20} />
                        }
                        label="Total Admins"
                        value={
                            admins.length
                        }
                        tone="blue"
                    />

                    <StatCard
                        icon={
                            <UserCheck
                                size={20}
                            />
                        }
                        label="Active"
                        value={
                            activeCount
                        }
                        tone="gold"
                    />

                    <StatCard
                        className="col-span-2 sm:col-span-1"
                        icon={
                            <UserX size={20} />
                        }
                        label="Inactive"
                        value={
                            inactiveCount
                        }
                        tone="red"
                    />
                </div>

                {search && (
                    <div className="mb-5">
                        <div
                            className={`${glass} inline-flex rounded-xl px-4 py-2`}
                        >
                            <p className="text-sm text-[var(--muted)]">
                                Showing{" "}
                                <span className="font-bold text-[var(--navy)]">
                                    {
                                        filteredAdmins.length
                                    }
                                </span>{" "}
                                of{" "}
                                <span className="font-bold text-[var(--navy)]">
                                    {
                                        admins.length
                                    }
                                </span>{" "}
                                admins
                            </p>
                        </div>
                    </div>
                )}

                <div
                    className={`${glass} overflow-hidden transition-opacity ${
                        refreshing
                            ? "opacity-60"
                            : ""
                    }`}
                >

                    <div className="border-b border-[#D5DFEC] px-5 py-4 sm:px-6">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <h2 className="text-lg font-bold text-[var(--navy)]">
                                    All Administrators
                                </h2>

                                <p className="mt-0.5 text-xs text-[var(--muted)]">
                                    Manage admin accounts, profiles, and current access status.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                                {refreshing && (
                                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
                                        <Loader2
                                            size={15}
                                            className="animate-spin"
                                        />
                                        Refreshing...
                                    </div>
                                )}

                                <div className="inline-flex rounded-xl border border-[#C8D5EA] bg-white/80 p-0.5 shadow-xs">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("cards")}
                                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                            viewMode === "cards"
                                                ? "bg-[#3869D0] text-white shadow-xs"
                                                : "text-[#526579] hover:text-[var(--navy)]"
                                        }`}
                                    >
                                        <LayoutGrid size={13} />
                                        Profile Cards
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("table")}
                                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                            viewMode === "table"
                                                ? "bg-[#3869D0] text-white shadow-xs"
                                                : "text-[#526579] hover:text-[var(--navy)]"
                                        }`}
                                    >
                                        <List size={13} />
                                        Table
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {filteredAdmins.length === 0 ? (
                        <div>
                            <EmptyState
                                search={search}
                                onAdd={openAddModal}
                                onClear={() => setSearch("")}
                            />
                        </div>
                    ) : viewMode === "cards" ? (
                        <div className="grid grid-cols-1 gap-3.5 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-3">
                            {filteredAdmins.map((admin) => {
                                const id = getId(admin);
                                return (
                                    <AdminProfileCard
                                        key={id}
                                        admin={admin}
                                        id={id}
                                        statusLoadingId={statusLoadingId}
                                        handleStatusChange={handleStatusChange}
                                        openEditModal={openEditModal}
                                        requestDelete={requestDelete}
                                        deletingId={deletingId}
                                        formatDate={formatDate}
                                        formatTime={formatTime}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="border-b border-[#D5DFEC] bg-[#F2F6FF]/80">
                                        {[
                                            "Name",
                                            "Email",
                                            "Role",
                                            "Status",
                                            "Created At",
                                            "Actions",
                                        ].map((heading) => (
                                            <th
                                                key={heading}
                                                className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAdmins.map((admin) => {
                                        const id = getId(admin);
                                        return (
                                            <tr
                                                key={id}
                                                className="border-b border-[#E1E7F0] transition hover:bg-[#F2F6FF]/70"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar name={admin?.name} />
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-[var(--navy)]">
                                                                {admin?.name || "Unnamed Admin"}
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-[var(--muted)]">
                                                                Administrator
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3869D0]/10 text-[#3869D0]">
                                                            <Mail size={15} />
                                                        </div>
                                                        <p className="text-sm font-medium text-[#40556B]">
                                                            {admin?.email || "—"}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <RoleBadge role={admin?.role} />
                                                </td>

                                                <td className="px-6 py-5">
                                                    <StatusButton
                                                        active={admin.isActive}
                                                        loading={statusLoadingId === id}
                                                        onClick={() => handleStatusChange(id, admin.isActive)}
                                                    />
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="text-sm font-semibold text-[#40556B]">
                                                        {formatDate(admin?.createdAt)}
                                                    </div>
                                                    {admin?.createdAt && (
                                                        <div className="mt-0.5 text-xs text-[var(--muted)]">
                                                            {formatTime(admin.createdAt)}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <Actions
                                                        onEdit={() => openEditModal(id)}
                                                        onDelete={() => requestDelete(admin)}
                                                        deleting={deletingId === id}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}

            {showModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--navy)]/65 p-4 backdrop-blur-md"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#C8D5EA] bg-[#F2F6FF]/95 shadow-2xl backdrop-blur-2xl"
                    >
                        <div className="border-b border-[#D5DFEC] px-6 py-5">
                            <div className="flex items-center justify-between">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--navy)] text-[var(--gold)] shadow-md">

                                        {editingId ? (
                                            <Pencil
                                                size={
                                                    19
                                                }
                                            />
                                        ) : (
                                            <UserPlus
                                                size={
                                                    19
                                                }
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-extrabold text-[var(--navy)]">
                                            {editingId
                                                ? "Edit Admin"
                                                : "Add New Admin"}
                                        </h2>

                                        <p className="text-xs text-[var(--muted)]">
                                            {editingId
                                                ? "Update admin account details."
                                                : "Create a new admin account."}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        closeModal()
                                    }
                                    disabled={
                                        saving
                                    }
                                    aria-label="Close"
                                    className="rounded-xl p-2 text-[var(--muted)] transition hover:bg-white hover:text-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            noValidate
                            className="p-6"
                        >
                            {formError && (
                                <div
                                    role="alert"
                                    className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-700"
                                >
                                    <AlertCircle
                                        size={
                                            18
                                        }
                                        className="mt-0.5 shrink-0"
                                    />

                                    <span>
                                        {
                                            formError
                                        }
                                    </span>
                                </div>
                            )}

                            <Field
                                label="Name"
                                icon={
                                    <User
                                        size={
                                            17
                                        }
                                    />
                                }
                                error={
                                    fieldErrors.name
                                }
                            >
                                <input
                                    type="text"
                                    name="name"
                                    value={
                                        form.name
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Enter admin name"
                                    disabled={
                                        saving
                                    }
                                    autoFocus
                                    className={inputClass(
                                        fieldErrors.name
                                    )}
                                />
                            </Field>

                            <Field
                                label="Email"
                                icon={
                                    <Mail
                                        size={
                                            17
                                        }
                                    />
                                }
                                error={
                                    fieldErrors.email
                                }
                            >
                                <input
                                    type="email"
                                    name="email"
                                    value={
                                        form.email
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Enter admin email"
                                    disabled={
                                        saving
                                    }
                                    className={inputClass(
                                        fieldErrors.email
                                    )}
                                />
                            </Field>

                            <Field
                                label="Password"
                                hint={
                                    editingId
                                        ? "Leave blank to keep current password"
                                        : "Minimum 6 characters"
                                }
                                icon={
                                    <Lock
                                        size={
                                            17
                                        }
                                    />
                                }
                                error={
                                    fieldErrors.password
                                }
                            >
                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={
                                        form.password
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder={
                                        editingId
                                            ? "Enter new password"
                                            : "Enter password"
                                    }
                                    disabled={
                                        saving
                                    }
                                    autoComplete="new-password"
                                    className={`${inputClass(
                                        fieldErrors.password
                                    )} pr-11`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (
                                                value
                                            ) =>
                                                !value
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--muted)] transition hover:text-[var(--navy)]"
                                >
                                    {showPassword ? (
                                        <EyeOff
                                            size={
                                                17
                                            }
                                        />
                                    ) : (
                                        <Eye
                                            size={
                                                17
                                            }
                                        />
                                    )}
                                </button>
                            </Field>

                            <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={() =>
                                        closeModal()
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="rounded-xl border border-[#C8D5EA] bg-[#F2F6FF] px-5 py-3 text-sm font-bold text-[var(--navy)] backdrop-blur-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className="flex items-center justify-center gap-2 rounded-xl bg-[var(--navy)] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--navy)]/20 transition hover:bg-[#1B3D5C] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving && (
                                        <Loader2
                                            size={
                                                16
                                            }
                                            className="animate-spin"
                                        />
                                    )}

                                    {saving
                                        ? "Saving..."
                                        : editingId
                                        ? "Update Admin"
                                        : "Create Admin"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reusable Delete Modal */}

            <DeleteConfirmModal
                open={!!deleteTarget}
                title="Delete this admin?"
                description="will lose access immediately. This action cannot be undone."
                itemName={
                    deleteTarget?.name ||
                    deleteTarget?.email ||
                    "This admin"
                }
                confirmText="Delete Admin"
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

function AdminProfileCard({
    admin,
    id,
    statusLoadingId,
    handleStatusChange,
    openEditModal,
    requestDelete,
    deletingId,
    formatDate,
    formatTime,
}) {
    const initial = admin?.name?.trim()?.charAt(0)?.toUpperCase() || "A";

    return (
        <div
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#C8D5EA]/80 bg-white/85 p-4 sm:p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#3869D0]/50 hover:bg-white hover:shadow-lg hover:shadow-[#3869D0]/10"
        >
            {/* Ambient Corner Accent */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-[#3869D0] to-[#B8C9F5] opacity-10 blur-xl transition group-hover:opacity-20" />

            <div>
                {/* Header: Initial Monogram + Name + Role + Actions */}
                <div className="relative flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Profile Initial Badge (No photo) */}
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#102A43] via-[#1b3d63] to-[#3869D0] text-lg font-black text-white shadow-md shadow-[#3869D0]/20 ring-2 ring-white">
                            {initial}

                            {/* Active status pulse dot */}
                            <span
                                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                                    admin.isActive ? "bg-emerald-500" : "bg-red-500"
                                }`}
                                title={admin.isActive ? "Active" : "Inactive"}
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-base font-extrabold text-[var(--navy)]">
                                {admin?.name || "Unnamed Admin"}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                <RoleBadge role={admin?.role} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Edit/Delete Actions */}
                    <Actions
                        onEdit={() => openEditModal(id)}
                        onDelete={() => requestDelete(admin)}
                        deleting={deletingId === id}
                    />
                </div>

                {/* Email Chip */}
                <div className="relative mt-3.5 flex items-center gap-2 rounded-xl border border-[#D5DFEC]/80 bg-[#F2F6FF]/80 px-3 py-2 text-xs text-[#40556B]">
                    <Mail size={14} className="shrink-0 text-[#3869D0]" />
                    <span className="truncate font-medium" title={admin?.email}>
                        {admin?.email || "No email available"}
                    </span>
                </div>
            </div>

            {/* Bottom Row: Status Toggle + Join Date */}
            <div className="relative mt-4 flex items-center justify-between gap-2 border-t border-[#E8EFF8] pt-3">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        Status
                    </p>
                    <div className="mt-1">
                        <StatusButton
                            active={admin.isActive}
                            loading={statusLoadingId === id}
                            onClick={() => handleStatusChange(id, admin.isActive)}
                        />
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        Joined
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#40556B]">
                        {formatDate(admin?.createdAt)}
                    </p>
                    {admin?.createdAt && (
                        <p className="text-[10px] text-[var(--muted)]">
                            {formatTime(admin.createdAt)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    tone,
    className = "",
}) {
    const tones = {
        blue: {
            icon: "bg-[#3869D0]/10 text-[#3869D0]",
            glow: "from-[#3869D0] to-[#B8C9F5]",
        },

        gold: {
            icon: "bg-[#b89242]/10 text-[#8A6820]",
            glow: "from-[#b89242] to-[#E8D39A]",
        },

        red: {
            icon: "bg-red-100 text-red-600",
            glow: "from-red-400 to-red-200",
        },
    };

    const selected =
        tones[tone] ||
        tones.blue;

    return (
        <div
            className={`${glass} relative overflow-hidden rounded-2xl p-3.5 sm:p-5 ${className}`}
        >
            <div
                className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${selected.glow} opacity-15 blur-2xl`}
            />

            <div className="relative flex items-center justify-between gap-2">

                <div>
                    <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        {label}
                    </p>

                    <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-[var(--navy)]">
                        {value}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl ${selected.icon}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function Avatar({
    name,
    large = false,
}) {
    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-xl bg-[var(--navy)] text-sm font-extrabold text-white shadow-md ${
                large
                    ? "h-11 w-11"
                    : "h-10 w-10"
            }`}
        >
            {name
                ?.charAt(0)
                ?.toUpperCase() ||
                "A"}
        </div>
    );
}

function RoleBadge({ role }) {
    return (
        <span className="inline-flex shrink-0 items-center rounded-full border border-[#3869D0]/20 bg-[#3869D0]/10 px-3 py-1.5 text-xs font-bold capitalize text-[#244A9A]">
            {role || "admin"}
        </span>
    );
}

function StatusButton({
    active,
    loading,
    onClick,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading}
            title={
                active
                    ? "Click to deactivate"
                    : "Click to activate"
            }
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                    ? "border-[#3869D0]/20 bg-[#3869D0]/10 text-[#244A9A] hover:bg-[#3869D0]/15"
                    : "border-red-300/50 bg-red-100/70 text-red-700 hover:bg-red-100"
            }`}
        >
            {loading ? (
                <Loader2
                    size={12}
                    className="animate-spin"
                />
            ) : (
                <span
                    className={`h-2 w-2 rounded-full ${
                        active
                            ? "bg-[#3869D0]"
                            : "bg-red-500"
                    }`}
                />
            )}

            {loading
                ? "Updating..."
                : active
                ? "Active"
                : "Inactive"}
        </button>
    );
}

function Field({
    label,
    hint,
    icon,
    error,
    children,
}) {
    return (
        <div className="mb-5">
            <label className="mb-2 flex flex-wrap items-baseline justify-between gap-x-2 text-sm font-bold text-[var(--navy)]">
                {label}

                {hint && (
                    <span className="text-xs font-medium text-[var(--muted)]">
                        {hint}
                    </span>
                )}
            </label>

            <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                    {icon}
                </span>

                {children}
            </div>

            {error && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <AlertCircle
                        size={13}
                    />

                    {error}
                </p>
            )}
        </div>
    );
}

function Actions({
    onEdit,
    onDelete,
    deleting,
}) {
    return (
        <div className="flex items-center gap-2">

            <button
                type="button"
                onClick={onEdit}
                disabled={deleting}
                title="Edit admin"
                aria-label="Edit admin"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#C8D5EA] bg-[#F2F6FF] text-[#3869D0] transition hover:bg-[#DCE6FF] hover:text-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Pencil size={16} />
            </button>

            <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                title="Delete admin"
                aria-label="Delete admin"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {deleting ? (
                    <Loader2
                        size={16}
                        className="animate-spin"
                    />
                ) : (
                    <Trash2 size={16} />
                )}
            </button>
        </div>
    );
}

function EmptyState({
    search,
    onAdd,
    onClear,
}) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3869D0]/10 text-[#3869D0]">

                {search ? (
                    <Search size={27} />
                ) : (
                    <ShieldCheck
                        size={27}
                    />
                )}
            </div>

            <h3 className="text-lg font-extrabold text-[var(--navy)]">
                {search
                    ? "No admins found"
                    : "No admins available"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                {search
                    ? "No admin matches your search. Try a different name, email or role."
                    : "Create your first admin account to get started."}
            </p>

            {search ? (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-5 rounded-xl border border-[#C8D5EA] bg-[#F2F6FF] px-5 py-3 text-sm font-bold text-[var(--navy)] backdrop-blur-md transition hover:bg-white"
                >
                    Clear Search
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onAdd}
                    className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--navy)] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--navy)]/20 transition hover:bg-[#1B3D5C]"
                >
                    <Plus size={17} />

                    Add Admin
                </button>
            )}
        </div>
    );
}

export default function AdminsPage() {
    return (
        <ProtectedRoute allowedRole="superAdmin">
            <AdminsContent />
        </ProtectedRoute>
    );
}