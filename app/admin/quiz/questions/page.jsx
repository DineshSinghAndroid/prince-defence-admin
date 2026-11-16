"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    Upload,
    Trash2,
    Power,
    Search,
    FileText,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    X,
    Pencil,
    Download,
    Save,
    RefreshCw,
} from "lucide-react";

import {
    getQuizSetting,
    updateQuizSetting,
    getQuizCategories,
    getQuizQuestions,
    importQuizQuestions,
    createQuizQuestion,
    updateQuizQuestion,
    updateQuizQuestionStatus,
    deleteQuizQuestion,
    deleteQuizQuestions,
} from "@/services/quizService";

import QuizQuestionForm from "@/component/quiz/QuizQuestionForm";
import QuizCategoriesManager from "@/component/quiz/QuizCategoriesManager";
import DeleteConfirmModal from "@/component/common/DeleteConfirmModal";

const glass =
    "rounded-2xl border border-[#C8D5EA]/70 bg-white/70 shadow-[0_8px_32px_rgba(16,42,67,0.10)] backdrop-blur-xl";

const glassModal =
    "rounded-3xl border border-[#C8D5EA]/70 bg-white/90 shadow-[0_20px_60px_rgba(16,42,67,0.20)] backdrop-blur-2xl";

const inputClass =
    "w-full min-w-0 h-11 rounded-xl border border-[#C8D5EA] bg-white px-3 text-xs sm:text-sm font-semibold text-[var(--navy)] outline-none transition placeholder:text-[var(--muted)] focus:border-[#3869D0] focus:ring-2 focus:ring-[#3869D0]/15";

const PAGE_LIMIT = 20;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const getToday = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    return `${year}-${month}-${day}`;
};

const emptyPagination = {
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
};

export default function QuizQuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        category: "",
        subject: "",
        date: getToday(),
        search: "",
    });

    const [searchInput, setSearchInput] = useState("");

    const [pagination, setPagination] =
        useState(emptyPagination);

    const [showCreateModal, setShowCreateModal] =
        useState(false);

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [editingQuestion, setEditingQuestion] =
        useState(null);

    const [showImportModal, setShowImportModal] =
        useState(false);

    const [selectedFile, setSelectedFile] =
        useState(null);

    const [importDurationMinutes, setImportDurationMinutes] =
        useState(15);

    const [quizDurationMinutes, setQuizDurationMinutes] =
        useState(15);

    const [quizSettingLoading, setQuizSettingLoading] =
        useState(false);

    const [quizSettingSaving, setQuizSettingSaving] =
        useState(false);

    const [quizIsActive, setQuizIsActive] =
        useState(true);

    const [importLoading, setImportLoading] =
        useState(false);

    const [createLoading, setCreateLoading] =
        useState(false);

    const [editLoading, setEditLoading] =
        useState(false);

    const [deleteTarget, setDeleteTarget] =
        useState(null);

    const [selectedQuestionIds, setSelectedQuestionIds] =
        useState([]);

    const [bulkDeleteOpen, setBulkDeleteOpen] =
        useState(false);

    const [bulkDeleting, setBulkDeleting] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const [updatingId, setUpdatingId] =
        useState(null);

    const isPreviousQuizDate =
        Boolean(filters.date) && filters.date < getToday();

    const isDeleteAllowedForDate =
        Boolean(filters.date) && filters.date <= getToday();

    const [refreshing, setRefreshing] = useState(false);

    const fetchCategories = useCallback(async () => {
        try {
            setCategoryLoading(true);

            const response =
                await getQuizCategories();

            setCategories(
                response?.categories ||
                    response?.data ||
                    []
            );
        } catch (error) {
            toast.error(
                error.message ||
                    "Failed to load quiz categories."
            );
        } finally {
            setCategoryLoading(false);
        }
    }, []);

    const fetchQuestions = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getQuizQuestions({
                        category: filters.category,
                        subject: filters.subject,
                        date: filters.date,
                        search: filters.search,
                        page,
                        limit: PAGE_LIMIT,
                    });

                setQuestions(
                    response?.questions ||
                        response?.data ||
                        []
                );

                setPagination(
                    response?.pagination || {
                        ...emptyPagination,
                        page,
                    }
                );
            } catch (error) {
                setQuestions([]);
                setError(
                    error.message ||
                        "Failed to load quiz questions."
                );
            } finally {
                setLoading(false);
            }
        },
        [
            filters.category,
            filters.subject,
            filters.date,
            filters.search,
        ]
    );

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchCategories();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [fetchCategories]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchQuestions(1);
        }, 0);
        return () => window.clearTimeout(timer);
    }, [fetchQuestions]);

    useEffect(() => {
        let cancelled = false;
        const loadSetting = async () => {
            if (!filters.date) return;
            try {
                setQuizSettingLoading(true);
                const response = await getQuizSetting(filters.date);
                if (cancelled) return;
                setQuizDurationMinutes(
                    Number(response?.setting?.durationMinutes || 15)
                );
                setQuizIsActive(
                    response?.setting?.isActive !== false
                );
            } catch (error) {
                if (!cancelled) {
                    toast.error(
                        error.message || "Failed to load quiz timing."
                    );
                }
            } finally {
                if (!cancelled) {
                    setQuizSettingLoading(false);
                }
            }
        };
        void loadSetting();
        return () => {
            cancelled = true;
        };
    }, [filters.date]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const promises = [
                fetchCategories(),
                fetchQuestions(pagination.page || 1),
            ];
            if (filters.date) {
                promises.push(
                    getQuizSetting(filters.date)
                        .then((response) => {
                            setQuizDurationMinutes(
                                Number(response?.setting?.durationMinutes || 15)
                            );
                            setQuizIsActive(
                                response?.setting?.isActive !== false
                            );
                        })
                        .catch(() => {})
                );
            }
            await Promise.all(promises);
            toast.success("Quiz questions refreshed.");
        } catch (error) {
            toast.error(error?.message || "Failed to refresh quiz questions.");
        } finally {
            setRefreshing(false);
        }
    };

    const handleSaveQuizDuration = async () => {
        const duration = Number(quizDurationMinutes);
        if (
            !filters.date ||
            !Number.isInteger(duration) ||
            duration < 1 ||
            duration > 180
        ) {
            toast.error("Duration must be between 1 and 180 minutes.");
            return;
        }

        try {
            setQuizSettingSaving(true);
            const response = await updateQuizSetting({
                dateKey: filters.date,
                durationMinutes: duration,
                isActive: quizIsActive,
            });
            toast.success(
                response?.message || "Quiz timing updated."
            );
        } catch (error) {
            toast.error(error.message || "Failed to update quiz timing.");
        } finally {
            setQuizSettingSaving(false);
        }
    };

    const handleFilterChange = (
        field,
        value
    ) => {
        setSelectedQuestionIds([]);
        if (field === "date" && !value) {
            setQuizSettingLoading(false);
            setQuizDurationMinutes(15);
            setQuizIsActive(true);
        }
        setFilters((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSearch = (event) => {
        event.preventDefault();
        setSelectedQuestionIds([]);

        setFilters((previous) => ({
            ...previous,
            search: searchInput.trim(),
        }));
    };

    const clearSearch = () => {
        setSearchInput("");
        setSelectedQuestionIds([]);

        setFilters((previous) => ({
            ...previous,
            search: "",
        }));
    };

    const openCreateModal = () => {
        setEditingQuestion(null);
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        if (createLoading) return;

        setShowCreateModal(false);
    };

    const openEditModal = (question) => {
        if (
            !question?._id ||
            updatingId ||
            deletingId
        ) {
            return;
        }

        setEditingQuestion(question);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        if (editLoading) return;

        setShowEditModal(false);
        setEditingQuestion(null);
    };

    const handleImportFile = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) return;

        if (
            !file.name
                .toLowerCase()
                .endsWith(".docx")
        ) {
            toast.error(
                "Please select a .docx Word document."
            );

            event.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error(
                "Word document must not exceed 5 MB."
            );

            event.target.value = "";
            return;
        }

        setSelectedFile(file);
    };

    const closeImportModal = () => {
        if (importLoading) return;

        setShowImportModal(false);
        setSelectedFile(null);
    };

    const handleImport = async () => {
        if (!selectedFile) {
            toast.error(
                "Please select a Word document."
            );
            return;
        }

        const duration = Number(
            importDurationMinutes
        );
        if (
            !Number.isInteger(duration) ||
            duration < 1 ||
            duration > 180
        ) {
            toast.error(
                "Quiz duration must be between 1 and 180 minutes."
            );
            return;
        }

        try {
            setImportLoading(true);

            const response =
                await importQuizQuestions(
                    selectedFile,
                    duration
                );

            setShowImportModal(false);
            setSelectedFile(null);
            setSelectedQuestionIds([]);
            setSearchInput("");
            setFilters({
                category: "",
                subject: "",
                date: response?.scheduledDate || getToday(),
                search: "",
            });

            toast.success(
                response?.message ||
                    `Quiz questions added to ${response?.scheduledDate || "today's quiz"}.`
            );
        } catch (error) {
            toast.error(
                error.message ||
                    "Failed to import quiz questions."
            );
        } finally {
            setImportLoading(false);
        }
    };

    const handleCreateQuestion = async (
        question
    ) => {
        try {
            setCreateLoading(true);

            const response =
                await createQuizQuestion(
                    question
                );

            setShowCreateModal(false);

            await fetchQuestions(1);

            toast.success(
                response?.message ||
                    "Quiz question created successfully."
            );
        } catch (error) {
            toast.error(
                error.message ||
                    "Failed to create quiz question."
            );
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEditQuestion = async (
        question
    ) => {
        if (!editingQuestion?._id) return;

        try {
            setEditLoading(true);

            const response =
                await updateQuizQuestion(
                    editingQuestion._id,
                    question
                );

            setShowEditModal(false);
            setEditingQuestion(null);

            await fetchQuestions(
                pagination.page
            );

            toast.success(
                response?.message ||
                    "Quiz question updated successfully."
            );
        } catch (error) {
            toast.error(
                error.message ||
                    "Failed to update quiz question."
            );
        } finally {
            setEditLoading(false);
        }
    };

    const handleStatusChange = async (
        question
    ) => {
        if (
            !question?._id ||
            updatingId ||
            deletingId
        ) {
            return;
        }

        try {
            setUpdatingId(question._id);

            await updateQuizQuestionStatus(
                question._id,
                !question.active
            );

            setQuestions((previous) =>
                previous.map((item) =>
                    item._id === question._id
                        ? {
                              ...item,
                              active:
                                  !item.active,
                          }
                        : item
                )
            );

            toast.success(
                question.active
                    ? "Question deactivated successfully."
                    : "Question activated successfully."
            );
        } catch (error) {
            toast.error(
                error.message ||
                    "Failed to update question status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const requestDelete = (
        question
    ) => {
        if (
            !question?._id ||
            deletingId ||
            updatingId
        ) {
            return;
        }

        setDeleteTarget(question);
    };

    const handleDelete = async () => {
        const id = deleteTarget?._id;

        if (!id || deletingId) return;

        try {
            setDeletingId(id);

            await deleteQuizQuestion(id);

            setDeleteTarget(null);

            const nextPage =
                questions.length === 1 &&
                pagination.page > 1
                    ? pagination.page - 1
                    : pagination.page;

            await fetchQuestions(nextPage);

            toast.success(
                "Quiz question deleted successfully."
            );
        } catch (error) {
            toast.error(
                error.message ||
                    "Failed to delete quiz question."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const toggleQuestionSelection = (questionId) => {
        setSelectedQuestionIds((previous) =>
            previous.includes(questionId)
                ? previous.filter((id) => id !== questionId)
                : [...previous, questionId]
        );
    };

    const toggleCurrentPageSelection = () => {
        const pageQuestionIds = questions.map((question) => question._id);
        const allSelected = pageQuestionIds.every((id) =>
            selectedQuestionIds.includes(id)
        );

        setSelectedQuestionIds((previous) =>
            allSelected
                ? previous.filter((id) => !pageQuestionIds.includes(id))
                : [...new Set([...previous, ...pageQuestionIds])]
        );
    };

    const handleBulkDelete = async () => {
        if (!selectedQuestionIds.length || bulkDeleting) return;

        try {
            setBulkDeleting(true);
            const response = await deleteQuizQuestions(selectedQuestionIds);
            setBulkDeleteOpen(false);
            setSelectedQuestionIds([]);

            const nextPage =
                questions.length <= (response.deletedCount || 0) &&
                pagination.page > 1
                    ? pagination.page - 1
                    : pagination.page;

            await fetchQuestions(nextPage);
            toast.success(
                response.message || `${response.deletedCount || 0} questions deleted.`
            );
        } catch (error) {
            toast.error(error.message || "Failed to delete selected questions.");
        } finally {
            setBulkDeleting(false);
        }
    };

    const handlePageChange = (page) => {
        if (
            loading ||
            page < 1 ||
            page > pagination.totalPages
        ) {
            return;
        }

        fetchQuestions(page);
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#F2F6FF] px-4 pb-10 pt-20 md:px-6 lg:pt-8">
            <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#3869D0]/10 blur-3xl" />

            <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[#B8C9F5]/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-[var(--gold)]/5 blur-3xl" />

            <div className="relative mx-auto max-w-7xl">
                {/* Header */}

                <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/70 bg-[var(--navy)] px-6 py-8 text-white shadow-[0_18px_50px_rgba(16,42,67,0.16)] backdrop-blur-xl sm:px-10">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sky-500/15 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[#3869D0]/20 blur-3xl" />

                    <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="montserrat text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                                Quiz Questions
                            </h1>

                            <p className="mt-2 text-sm text-white/70">
                                Manage daily quiz questions, categories and question status.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={refreshing || loading || categoryLoading || quizSettingLoading}
                                aria-label="Refresh questions"
                                className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white shadow-sm backdrop-blur-md transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    size={16}
                                    className={refreshing || loading || categoryLoading || quizSettingLoading ? "animate-spin" : ""}
                                />
                                Refresh
                            </button>

                            <button
                                type="button"
                                onClick={
                                    openCreateModal
                                }
                                className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#3869D0] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#3869D0]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2f5dbd]"
                            >
                                <FileText size={16} />
                                Add Question
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedFile(null);
                                    setShowImportModal(
                                        true
                                    );
                                }}
                                className="inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--gold)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a98134]"
                            >
                                <Upload size={16} />
                                Import Word
                            </button>
                        </div>
                    </div>
                </div>

                <details
                    id="quiz-categories"
                    className="mb-6 rounded-2xl border border-[#C8D5EA]/70 bg-white/70 p-5 shadow-[0_8px_32px_rgba(16,42,67,0.10)] backdrop-blur-xl sm:p-6"
                >
                    <summary className="cursor-pointer text-lg font-bold text-[var(--navy)] marker:text-[#3869D0]">
                        Manage quiz categories
                    </summary>
                    <QuizCategoriesManager embedded />
                </details>

                {/* Filters */}

                <section
                    className={`${glass} mb-6 p-4 md:p-5`}
                >
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
                        <div className="min-w-0">
                            <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#40556B] truncate">
                                Quiz Date
                            </label>

                            <input
                                type="date"
                                value={
                                    filters.date
                                }
                                onChange={(event) =>
                                    handleFilterChange(
                                        "date",
                                        event.target.value
                                    )
                                }
                                className={inputClass}
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#40556B] truncate">
                                Category
                            </label>

                            <select
                                value={
                                    filters.category
                                }
                                onChange={(event) =>
                                    handleFilterChange(
                                        "category",
                                        event.target.value
                                    )
                                }
                                disabled={
                                    categoryLoading
                                }
                                className={inputClass}
                            >
                                <option value="">
                                    All Categories
                                </option>

                                {categories.map(
                                    (category) => (
                                        <option
                                            key={
                                                category._id
                                            }
                                            value={
                                                category.name
                                            }
                                        >
                                            {
                                                category.name
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="min-w-0">
                            <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#40556B] truncate">
                                Subject
                            </label>
                            <input
                                type="text"
                                value={filters.subject}
                                onChange={(event) => handleFilterChange("subject", event.target.value)}
                                placeholder="Filter by subject"
                                className={inputClass}
                            />
                        </div>

                        <form
                            onSubmit={
                                handleSearch
                            }
                            className="min-w-0"
                        >
                            <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#40556B] truncate">
                                Search
                            </label>

                            <div className="flex gap-1.5 sm:gap-2">
                                <div className="relative min-w-0 flex-1">
                                    <Search
                                        size={15}
                                        className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 text-[var(--muted)] sm:block"
                                    />

                                    <input
                                        type="text"
                                        value={
                                            searchInput
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSearchInput(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Search..."
                                        className={`${inputClass} px-2.5 sm:pl-9`}
                                    />

                                    {searchInput && (
                                        <button
                                            type="button"
                                            onClick={
                                                clearSearch
                                            }
                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[var(--muted)] transition hover:bg-[#F2F6FF] hover:text-[var(--navy)]"
                                            aria-label="Clear search"
                                        >
                                            <X
                                                size={14}
                                            />
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    title="Search"
                                    aria-label="Search"
                                    className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#3869D0] px-3 sm:px-4 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#3869D0]/20 transition hover:bg-[#2f5dbd]"
                                >
                                    <Search size={15} className="sm:hidden" />
                                    <span className="hidden sm:inline">Search</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                <section className={`${glass} mb-6 p-4 md:p-5`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-[var(--navy)]">
                                Quiz timing for {filters.date || "selected date"}
                            </h2>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                                Set the total quiz duration for this date. The same timing is used for every question in the quiz.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-end gap-3">
                            <label className="block w-36">
                                <span className="mb-1.5 block text-sm font-semibold text-[#40556B]">
                                    Duration (minutes)
                                </span>
                                <input
                                    type="number"
                                    min="1"
                                    max="180"
                                    step="1"
                                    value={quizDurationMinutes}
                                    onChange={(event) =>
                                        setQuizDurationMinutes(event.target.value)
                                    }
                                    disabled={quizSettingLoading || quizSettingSaving}
                                    className={inputClass}
                                />
                            </label>
                            <label className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-[#40556B]">
                                <input
                                    type="checkbox"
                                    checked={quizIsActive}
                                    onChange={(event) =>
                                        setQuizIsActive(event.target.checked)
                                    }
                                    disabled={quizSettingLoading || quizSettingSaving}
                                    className="h-4 w-4 accent-[#3869D0]"
                                />
                                Active
                            </label>
                            <button
                                type="button"
                                onClick={handleSaveQuizDuration}
                                disabled={quizSettingLoading || quizSettingSaving || !filters.date}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#3869D0] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2f5dbd] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save size={16} />
                                {quizSettingSaving ? "Saving..." : "Save timing"}
                            </button>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-[var(--muted)]">
                        {isDeleteAllowedForDate
                            ? "You can delete today’s and previous quiz questions. Future-date questions remain protected."
                            : "Question deletion is available only for today’s and previous quiz dates; future questions are protected."}
                    </p>
                </section>

                {/* Summary */}

                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--navy)]">
                            Questions
                        </h2>

                        <p className="text-sm text-[var(--muted)]">
                            {pagination.total}{" "}
                            total questions
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#C8D5EA] bg-white/60 px-3 py-2 text-xs font-semibold text-[var(--navy)] backdrop-blur-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            title="Refresh questions list"
                        >
                            <RefreshCw
                                size={14}
                                className={refreshing || loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        <div className="rounded-xl border border-[#C8D5EA] bg-white/60 px-4 py-2 text-sm font-semibold text-[#40556B] backdrop-blur-md">
                            {filters.date || "All dates"}
                        </div>
                    </div>
                    {questions.length > 0 && isDeleteAllowedForDate && (
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#40556B]">
                                <input
                                    type="checkbox"
                                    checked={
                                        questions.length > 0 &&
                                        questions.every((question) =>
                                            selectedQuestionIds.includes(question._id)
                                        )
                                    }
                                    onChange={toggleCurrentPageSelection}
                                    disabled={!isDeleteAllowedForDate || Boolean(deletingId) || bulkDeleting}
                                    className="h-4 w-4 accent-[#3869D0]"
                                />
                                Select all on this page
                            </label>
                            {selectedQuestionIds.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setBulkDeleteOpen(true)}
                                    disabled={!isDeleteAllowedForDate || Boolean(deletingId) || bulkDeleting}
                                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Trash2 size={15} />
                                    Delete selected ({selectedQuestionIds.length})
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Questions */}

                {loading ? (
                    <div className="grid grid-cols-1 gap-5">
                        {Array.from({
                            length: 6,
                        }).map((_, index) => (
                            <div
                                key={index}
                                className={`h-40 animate-pulse ${glass}`}
                            />
                        ))}
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6 text-center text-red-700 backdrop-blur-xl">
                        {error}
                    </div>
                ) : questions.length ===
                  0 ? (
                    <div
                        className={`${glass} flex flex-col items-center justify-center border-dashed p-12 text-center`}
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3869D0]/10 text-[#3869D0]">
                            <FileText
                                size={26}
                            />
                        </div>

                        <p className="mt-4 font-semibold text-[var(--navy)]">
                            No quiz questions
                            found.
                        </p>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                            Try changing the
                            date, category or
                            search.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questions.map(
                            (
                                question,
                                index
                            ) => {
                                const questionNumber =
                                    (pagination.page -
                                        1) *
                                        pagination.limit +
                                    index +
                                    1;

                                return (
                                    <article
                                        key={
                                            question._id
                                        }
                                        className={`${glass} p-5 transition hover:bg-white/90 md:p-6`}
                                    >
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div className="flex min-w-0 items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedQuestionIds.includes(question._id)}
                                                        onChange={() => toggleQuestionSelection(question._id)}
                                                        disabled={!isDeleteAllowedForDate || Boolean(deletingId) || bulkDeleting}
                                                        aria-label={`Select question ${questionNumber}`}
                                                        className="mt-1 h-4 w-4 shrink-0 accent-[#3869D0]"
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                                            <span className="rounded-lg bg-[#3869D0]/10 px-2.5 py-1 text-xs font-bold text-[#3869D0]">
                                                                Q
                                                                {
                                                                    questionNumber
                                                                }
                                                            </span>

                                                            <span className="rounded-full border border-[#C8D5EA] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[#40556B]">
                                                                {question.category ||
                                                                    "General"}
                                                            </span>

                                                            <span className="rounded-full border border-[#C8D5EA] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[#40556B]">
                                                                {question.subject ||
                                                                    "General Knowledge"}
                                                            </span>

                                                            <span
                                                                className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                                                                    question.active
                                                                        ? "border-green-200 bg-green-50 text-green-700"
                                                                        : "border-slate-200 bg-slate-100 text-slate-500"
                                                                }`}
                                                            >
                                                                {question.active
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-base font-bold leading-7 text-[var(--navy)] md:text-lg">
                                                            {question
                                                                .text
                                                                ?.en ||
                                                                question.text ||
                                                                "Question text unavailable"}
                                                        </h3>

                                                        {question
                                                            .text
                                                            ?.hi && (
                                                            <p className="mt-2 text-sm leading-6 text-[#526579]">
                                                                {
                                                                    question
                                                                        .text
                                                                        .hi
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 flex-wrap items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                question
                                                            )
                                                        }
                                                        disabled={
                                                            !isPreviousQuizDate ||
                                                            Boolean(
                                                                deletingId
                                                            ) ||
                                                            Boolean(
                                                                updatingId
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#3869D0]/20 bg-[#3869D0]/10 px-3 py-2 text-xs font-semibold text-[#3869D0] transition hover:bg-[#3869D0] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <Pencil
                                                            size={
                                                                14
                                                            }
                                                        />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                question
                                                            )
                                                        }
                                                        disabled={
                                                            updatingId ===
                                                                question._id ||
                                                            Boolean(
                                                                deletingId
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#C8D5EA] bg-white/60 px-3 py-2 text-xs font-semibold text-[#40556B] backdrop-blur-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <Power
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        {updatingId ===
                                                        question._id
                                                            ? "Updating..."
                                                            : question.active
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                    </button>

                                                    {isDeleteAllowedForDate && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                requestDelete(
                                                                    question
                                                                )
                                                            }
                                                            disabled={
                                                                !isDeleteAllowedForDate ||
                                                                Boolean(deletingId) ||
                                                                Boolean(updatingId)
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                {question.options?.map(
                                                    (
                                                        option,
                                                        optionIndex
                                                    ) => (
                                                        <div
                                                            key={`${question._id}-${optionIndex}`}
                                                            className={`rounded-xl border px-4 py-3 text-sm ${
                                                                optionIndex ===
                                                                question.correctIndex
                                                                    ? "border-green-200 bg-green-50/70 font-semibold text-green-800"
                                                                    : "border-[#C8D5EA] bg-white/50 text-[#40556B]"
                                                            }`}
                                                        >
                                                            <span className="mr-2 font-bold">
                                                                {String.fromCharCode(
                                                                    65 +
                                                                        optionIndex
                                                                )}
                                                                .
                                                            </span>

                                                            {
                                                                option
                                                            }

                                                            {optionIndex ===
                                                                question.correctIndex && (
                                                                <span className="ml-2 text-xs">
                                                                    ✓
                                                                    Correct
                                                                </span>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[#C8D5EA]/60 pt-4 text-xs text-[var(--muted)]">
                                                <span>
                                                    Difficulty:{" "}
                                                    <strong className="text-[#40556B]">
                                                        {question.difficulty ||
                                                            1}
                                                    </strong>
                                                </span>

                                                <span>
                                                    Date:{" "}
                                                    <strong className="text-[#40556B]">
                                                        {question.scheduledDate
                                                            ? new Date(
                                                                  question.scheduledDate
                                                              ).toLocaleDateString(
                                                                  "en-IN"
                                                              )
                                                            : "Unscheduled"}
                                                    </strong>
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>
                )}

                {/* Pagination */}

                {!loading &&
                    !error &&
                    pagination.totalPages >
                        1 && (
                        <div
                            className={`${glass} mt-6 flex items-center justify-center gap-3 px-4 py-3`}
                        >
                            <button
                                type="button"
                                disabled={
                                    loading ||
                                    !pagination.hasPreviousPage
                                }
                                onClick={() =>
                                    handlePageChange(
                                        pagination.page -
                                            1
                                    )
                                }
                                className="rounded-xl border border-[#C8D5EA] bg-white/60 p-2 text-[#40556B] backdrop-blur-md transition hover:bg-white hover:text-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Previous page"
                            >
                                <ChevronLeft
                                    size={17}
                                />
                            </button>

                            <span className="rounded-xl bg-[#3869D0] px-3 py-2 text-sm font-semibold text-white shadow-md shadow-[#3869D0]/20">
                                Page{" "}
                                {pagination.page}{" "}
                                of{" "}
                                {
                                    pagination.totalPages
                                }
                            </span>

                            <button
                                type="button"
                                disabled={
                                    loading ||
                                    !pagination.hasNextPage
                                }
                                onClick={() =>
                                    handlePageChange(
                                        pagination.page +
                                            1
                                    )
                                }
                                className="rounded-xl border border-[#C8D5EA] bg-white/60 p-2 text-[#40556B] backdrop-blur-md transition hover:bg-white hover:text-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Next page"
                            >
                                <ChevronRight
                                    size={17}
                                />
                            </button>
                        </div>
                    )}
            </div>

            {/* Create Modal */}

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[var(--navy)]/45 p-4 backdrop-blur-sm">
                    <div
                        className={`${glassModal} my-8 w-full max-w-4xl p-5 md:p-7`}
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-[var(--navy)] md:text-2xl">
                                    Add Quiz Question
                                </h2>

                                <p className="mt-1 text-sm text-[var(--muted)]">
                                    Create a question for the daily quiz.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeCreateModal
                                }
                                disabled={
                                    createLoading
                                }
                                className="rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[#F2F6FF] hover:text-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Close create question modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <QuizQuestionForm
                            categories={
                                categories
                            }
                            loading={
                                createLoading
                            }
                            submitLabel="Create Question"
                            onSubmit={
                                handleCreateQuestion
                            }
                            onCancel={
                                closeCreateModal
                            }
                        />
                    </div>
                </div>
            )}

            {/* Edit Modal */}

            {showEditModal &&
                editingQuestion && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[var(--navy)]/45 p-4 backdrop-blur-sm">
                        <div
                            className={`${glassModal} my-8 w-full max-w-4xl p-5 md:p-7`}
                        >
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--navy)] md:text-2xl">
                                        Edit Quiz Question
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--muted)]">
                                        Update the selected quiz question.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeEditModal
                                    }
                                    disabled={
                                        editLoading
                                    }
                                    className="rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[#F2F6FF] hover:text-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label="Close edit question modal"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <QuizQuestionForm
                                categories={
                                    categories
                                }
                                initialData={
                                    editingQuestion
                                }
                                loading={
                                    editLoading
                                }
                                submitLabel="Update Question"
                                onSubmit={
                                    handleEditQuestion
                                }
                                onCancel={
                                    closeEditModal
                                }
                            />
                        </div>
                    </div>
                )}

            {/* Import Modal */}

            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy)]/45 p-4 backdrop-blur-sm">
                    <div
                        className={`${glassModal} w-full max-w-lg p-6`}
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-[var(--navy)]">
                                    Import Quiz Questions
                                </h2>

                                <p className="mt-1 text-sm text-[var(--muted)]">
                                    Upload the prepared Word question file.
                                </p>
                                <a
                                    href="/quiz-sample-questions.docx"
                                    download
                                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#3869D0] hover:text-[#244A9A]"
                                >
                                    <Download size={14} />
                                    Download sample Word file
                                </a>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeImportModal
                                }
                                disabled={
                                    importLoading
                                }
                                className="rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[#F2F6FF] hover:text-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Close import modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#3869D0]/30 bg-[#F2F6FF]/70 p-8 text-center backdrop-blur-md transition hover:border-[#3869D0]/60 hover:bg-[#E7EEFA]">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3869D0]/10 text-[#3869D0]">
                                <Upload size={20} />
                            </div>

                            <span className="text-sm font-bold text-[#40556B]">
                                Click to select .docx
                                file
                            </span>

                            <span className="mt-1 text-xs text-[var(--muted)]">
                                Maximum 5 MB · Maximum
                                500 questions
                            </span>
                            <span className="mt-2 text-xs font-semibold text-[#3869D0]">
                                All imported questions are scheduled for the upload date. No date column is needed.
                            </span>

                            <input
                                type="file"
                                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={
                                    handleImportFile
                                }
                                className="hidden"
                                disabled={
                                    importLoading
                                }
                            />
                        </label>

                        <div className="mt-4">
                            <label
                                htmlFor="word-import-duration"
                                className="mb-2 block text-sm font-semibold text-[#40556B]"
                            >
                                Quiz duration for upload date (minutes)
                            </label>
                            <input
                                id="word-import-duration"
                                type="number"
                                min={1}
                                max={180}
                                step={1}
                                value={importDurationMinutes}
                                onChange={(event) =>
                                    setImportDurationMinutes(
                                        event.target.value
                                    )
                                }
                                disabled={importLoading}
                                className={inputClass}
                            />
                            <p className="mt-1 text-xs text-[var(--muted)]">
                                Enter 1–180 minutes. This duration applies to all quiz questions uploaded from this file.
                            </p>
                        </div>

                        {selectedFile && (
                            <div className="mt-4 rounded-xl border border-[#C8D5EA] bg-white/60 p-3">
                                <p className="truncate text-sm font-semibold text-[var(--navy)]">
                                    {
                                        selectedFile.name
                                    }
                                </p>

                                <p className="mt-1 text-xs text-[var(--muted)]">
                                    {(
                                        selectedFile.size /
                                        1024 /
                                        1024
                                    ).toFixed(
                                        2
                                    )}{" "}
                                    MB
                                </p>
                            </div>
                        )}

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={
                                    closeImportModal
                                }
                                disabled={
                                    importLoading
                                }
                                className="rounded-xl border border-[#C8D5EA] bg-white/60 px-4 py-2.5 text-sm font-semibold text-[#40556B] backdrop-blur-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleImport
                                }
                                disabled={
                                    importLoading ||
                                    !selectedFile
                                }
                                className="rounded-xl bg-[var(--gold)] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#a98134] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {importLoading
                                    ? "Importing..."
                                    : "Import Questions"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmModal
                open={Boolean(deleteTarget) || bulkDeleteOpen}
                title={bulkDeleteOpen ? "Delete selected quiz questions?" : "Delete this quiz question?"}
                description={bulkDeleteOpen
                    ? "Selected questions that are already used by quiz attempts will be kept. Other selected questions will be permanently deleted."
                    : "will be permanently deleted. This action cannot be undone."}
                itemName={
                    bulkDeleteOpen
                        ? `${selectedQuestionIds.length} selected questions`
                        : deleteTarget?.text?.en || "This quiz question"
                }
                confirmText={bulkDeleteOpen ? "Delete selected" : "Delete Question"}
                loading={Boolean(deletingId) || bulkDeleting}
                onCancel={() => {
                    setDeleteTarget(null);
                    setBulkDeleteOpen(false);
                }}
                onConfirm={bulkDeleteOpen ? handleBulkDelete : handleDelete}
            />
        </div>
    );
}