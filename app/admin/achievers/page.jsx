
"use client";

import {
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import {
    Trophy,
    Plus,
    Users,
    FolderOpen,
    RefreshCw,
    ShieldAlert,
    Sparkles,
} from "lucide-react";

import toast from "react-hot-toast";

import { AuthContext } from "@/context/AuthContext";

import AchieverCategoriesManager from "@/component/achievers/AchieverCategoriesManager";
import AchieverForm from "@/component/achievers/AchieverForm";
import AchieverList from "@/component/achievers/AchieverList";

import {
    getAchieverCategories,
    getAdminAchievers,
    createAchiever,
    updateAchiever,
    deleteAchiever,
} from "@/services/achieverService";

const initialFilters = {
    search: "",
    year: "",
    batch: "",
    status: "all",
    sort: "order",
    page: 1,
    limit: 12,
};

export default function AchieversPage() {
    const router = useRouter();
    const auth = useContext(AuthContext);

    const user = auth?.user;
    const authLoading = auth?.loading;
    const canManageAchievers = user?.role === "superAdmin" || user?.role === "admin";

    const [authChecked, setAuthChecked] = useState(false);

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");

    const [achievers, setAchievers] = useState([]);
    const [pagination, setPagination] = useState(null);

    const [filters, setFilters] = useState({ ...initialFilters });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [formOpen, setFormOpen] = useState(false);
    const [editingAchiever, setEditingAchiever] = useState(null);
    const [deletingAchiever, setDeletingAchiever] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Authentication
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        if (user.role !== "superAdmin" && user.role !== "admin") {
            router.replace("/admin/dashboard");
            return;
        }

        const timer = setTimeout(() => {
            setAuthChecked(true);
        }, 0);
        return () => clearTimeout(timer);
    }, [authLoading, user, router]);

    // Keep the category selection valid.
    const handleCategoriesChange = useCallback((list) => {
        setCategories(list);

        setSelectedCategory((current) => {
            if (current === "all") {
                return current;
            }

            const currentIsActive = list.some(
                (item) => item.slug === current && item.isActive
            );

            if (current && currentIsActive) {
                return current;
            }

            return list.find((item) => item.isActive)?.slug || "";
        });
    }, []);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        setCategoriesLoading(true);

        try {
            const response = await getAchieverCategories(true);
            const result = response?.data;

            const list = Array.isArray(result)
                ? result
                : Array.isArray(result?.items)
                    ? result.items
                    : [];

            handleCategoriesChange(list);
        } catch (error) {
            toast.error(
                error?.message || "Could not load categories."
            );
        } finally {
            setCategoriesLoading(false);
        }
    }, [handleCategoriesChange]);

    useEffect(() => {
        if (!authChecked || !canManageAchievers) return;

        const timer = setTimeout(() => {
            void fetchCategories();
        }, 0);
        return () => clearTimeout(timer);
    }, [authChecked, canManageAchievers, fetchCategories]);

    // Fetch achievers
    const fetchAchievers = useCallback(async () => {
        if (!selectedCategory) {
            setAchievers([]);
            setPagination(null);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const response = await getAdminAchievers(
                selectedCategory,
                {
                    ...filters,
                    page: filters.page || 1,
                    limit: filters.limit || 12,
                }
            );

            const result = response?.data;

            setAchievers(
                Array.isArray(result?.items) ? result.items : []
            );

            setPagination(result?.pagination || null);
        } catch (error) {
            setAchievers([]);
            setPagination(null);

            toast.error(
                error?.message || "Could not load achievers."
            );
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, filters]);

    useEffect(() => {
        if (!authChecked || !canManageAchievers) return;

        const timer = setTimeout(() => {
            void fetchAchievers();
        }, 0);
        return () => clearTimeout(timer);
    }, [authChecked, canManageAchievers, fetchAchievers]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([fetchCategories(), fetchAchievers()]);
            toast.success("Achievers refreshed successfully.");
        } catch (error) {
            toast.error(error?.message || "Could not refresh achievers.");
        } finally {
            setRefreshing(false);
        }
    };

    // Filters
    const handleFilterChange = useCallback((nextFilters) => {
        setFilters((current) => ({
            ...current,
            ...nextFilters,
        }));
    }, []);

    const handleCategoryChange = useCallback((slug) => {
        setSelectedCategory(slug);
        setFilters({ ...initialFilters });
    }, []);

    // Create
    const openCreateForm = () => {
        if (!activeCategories.length) {
            toast.error("Please select or create an active category first.");
            return;
        }

        setEditingAchiever(null);
        setFormOpen(true);
    };

    // Edit
    const openEditForm = (achiever) => {
        setEditingAchiever(achiever);
        setFormOpen(true);
    };

    // Save
    const handleSaveAchiever = async (formData) => {
        const categorySlug = formData.get("categorySlug");

        if (!categorySlug && !editingAchiever) {
            throw new Error("Please select a category first.");
        }

        setSaving(true);

        try {
            if (editingAchiever) {
                await updateAchiever(editingAchiever._id, formData);
                toast.success("Achiever updated successfully.");
            } else {
                formData.delete("categorySlug");
                await createAchiever(categorySlug, formData);
                toast.success("Achiever added successfully.");
            }

            setFormOpen(false);
            setEditingAchiever(null);

            await fetchCategories();
            await fetchAchievers();
        } catch (error) {
            toast.error(
                error?.message || "Could not save achiever."
            );
            throw error;
        } finally {
            setSaving(false);
        }
    };

    // Delete
    const handleDeleteAchiever = async () => {
        if (!deletingAchiever || saving) return;

        setSaving(true);

        try {
            await deleteAchiever(deletingAchiever._id);

            toast.success("Achiever deleted successfully.");
            setDeletingAchiever(null);

            await fetchAchievers();
        } catch (error) {
            toast.error(
                error?.message || "Could not delete achiever."
            );
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || !authChecked) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F2F6FF]">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <RefreshCw size={18} className="animate-spin" />
                    Checking access...
                </div>
            </div>
        );
    }

    if (!canManageAchievers) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F2F6FF] p-6">
                <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                    <ShieldAlert
                        size={42}
                        className="mx-auto mb-4 text-red-500"
                    />

                    <h1 className="text-xl font-bold text-slate-900">
                        Access Denied
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Only administrators can access Achievers Management.
                    </p>
                </div>
            </main>
        );
    }

    const activeCategories = categories.filter(
        (item) => item.isActive
    );

    const publishedCount = achievers.filter(
        (item) => item.isPublished
    ).length;

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#F2F6FF] px-4 pb-10 pt-20 md:px-6 lg:px-8 lg:pt-8">

            {/* Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#3869D0]/10 blur-3xl" />
                <div className="absolute -right-32 top-40 h-80 w-80 rounded-full bg-[#B8C9F5]/20 blur-3xl" />
                <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--gold)]/5 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl">

                {/* Header */}
                <section className="relative mb-6 overflow-hidden rounded-3xl border border-white/70 bg-[var(--navy)] px-6 py-8 text-white shadow-[0_18px_50px_rgba(16,42,67,0.16)] backdrop-blur-xl sm:px-10">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[var(--gold)]/15 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[#3869D0]/20 blur-3xl" />
                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="montserrat text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                                Achievers Management
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                                Manage student profiles, categories, exam achievements and publication status.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={refreshing || loading || categoriesLoading}
                                aria-label="Refresh achievers"
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm backdrop-blur-md transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    size={16}
                                    className={refreshing || loading || categoriesLoading ? "animate-spin" : ""}
                                />
                                Refresh
                            </button>

                            <button
                                type="button"
                                onClick={openCreateForm}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--gold)] px-5 text-sm font-semibold text-[var(--navy)] shadow-lg transition hover:scale-[1.02] hover:shadow-xl"
                            >
                                <Plus size={18} />
                                Add Achiever
                            </button>
                        </div>
                    </div>
                </section>

                {/* Statistics */}
                <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-[#C8D5EA]/70 bg-white/70 p-5 shadow-[0_8px_32px_rgba(16,42,67,0.10)] backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Total Categories
                            </p>
                            <FolderOpen size={20} className="text-[#3869D0]" />
                        </div>

                        <p className="mt-3 text-3xl font-extrabold text-[var(--navy)]">
                            {categories.length}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            {activeCategories.length} active
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#C8D5EA]/70 bg-white/70 p-5 shadow-[0_8px_32px_rgba(16,42,67,0.10)] backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Current Results
                            </p>
                            <Users size={20} className="text-[#3869D0]" />
                        </div>

                        <p className="mt-3 text-3xl font-extrabold text-[var(--navy)]">
                            {pagination?.total ?? achievers.length}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Selected category and filters
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#C8D5EA]/70 bg-white/70 p-5 shadow-[0_8px_32px_rgba(16,42,67,0.10)] backdrop-blur-xl sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Published on Current Page
                            </p>
                            <Trophy size={20} className="text-amber-500" />
                        </div>

                        <p className="mt-3 text-3xl font-extrabold text-[var(--navy)]">
                            {publishedCount}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Published achievers on this page
                        </p>
                    </div>
                </section>

                {/* Category Manager */}
                <details
                    id="achiever-categories"
                    className="mb-6 rounded-2xl border border-[#C8D5EA]/70 bg-white/70 p-5 shadow-[0_8px_32px_rgba(16,42,67,0.10)] backdrop-blur-xl sm:p-6"
                >
                    <summary className="cursor-pointer text-lg font-bold text-[var(--navy)] marker:text-[#3869D0]">
                        Manage achiever categories
                    </summary>

                    <div className="mt-5">
                        <AchieverCategoriesManager
                            categories={categories}
                            loading={categoriesLoading}
                            onRefresh={fetchCategories}
                        />
                    </div>
                </details>

                {/* Achiever List */}
                <AchieverList
                    achievers={achievers}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    pagination={pagination}
                    loading={loading}
                    onSearch={fetchAchievers}
                    onEdit={openEditForm}
                    onDelete={setDeletingAchiever}
                    onRefresh={fetchAchievers}
                />

                {/* Create / Edit Form */}
                <AchieverForm
                    open={formOpen}
                    onClose={() => {
                        if (saving) return;

                        setFormOpen(false);
                        setEditingAchiever(null);
                    }}
                    onSubmit={handleSaveAchiever}
                    categories={activeCategories}
                    selectedCategory={
                        selectedCategory === "all"
                            ? activeCategories[0]?.slug || ""
                            : selectedCategory
                    }
                    achiever={editingAchiever}
                    saving={saving}
                />

                {/* Delete Confirmation */}
                {deletingAchiever && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                <Trophy size={23} />
                            </div>

                            <h2 className="text-lg font-bold text-slate-900">
                                Delete Achiever?
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Are you sure you want to permanently delete{" "}
                                <strong>{deletingAchiever.name}</strong>{" "}
                                ? This action cannot be undone.
                            </p>

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => setDeletingAchiever(null)}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={handleDeleteAchiever}
                                    className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                                >
                                    {saving ? "Deleting..." : "Yes, Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
