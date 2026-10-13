
"use client";

import {
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    Users,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const cardThemes = {
    nda: {
        background: "from-[#0b2148] via-[#194d91] to-[#4788d1]",
        accent: "#173f75",
        panel: "from-[#f7faff] to-[#e0ebfb]",
        text: "text-[#173153]",
        muted: "text-[#647994]",
        chip: "text-[#204b80]",
        label: "text-[#71849d]",
    },
    cds: {
        background: "from-[#172554] via-[#344d91] to-[#8296d0]",
        accent: "#263d7e",
        panel: "from-[#fafaff] to-[#e5e9f9]",
        text: "text-[#202d51]",
        muted: "text-[#59678a]",
        chip: "text-[#273d7b]",
        label: "text-[#69779b]",
    },
    afcat: {
        background: "from-[#103b46] via-[#087f8c] to-[#43b9b4]",
        accent: "#087781",
        panel: "from-[#f4fffe] to-[#d6f3ee]",
        text: "text-[#123e45]",
        muted: "text-[#426c70]",
        chip: "text-[#08656c]",
        label: "text-[#4e797d]",
    },
    army: {
        background: "from-[#20391d] via-[#426b2d] to-[#92ae4e]",
        accent: "#42652a",
        panel: "from-[#fcfff6] to-[#e7f0d5]",
        text: "text-[#293d21]",
        muted: "text-[#61764e]",
        chip: "text-[#385b26]",
        label: "text-[#70865d]",
    },
    navy: {
        background: "from-[#082746] via-[#075b88] to-[#35a4c7]",
        accent: "#075782",
        panel: "from-[#f5fcff] to-[#d9f0fa]",
        text: "text-[#12344d]",
        muted: "text-[#486a80]",
        chip: "text-[#07547d]",
        label: "text-[#557a91]",
    },
    airforce: {
        background: "from-[#183765] via-[#366db4] to-[#91baf0]",
        accent: "#315fa4",
        panel: "from-[#f7faff] to-[#e0eaff]",
        text: "text-[#1b3153]",
        muted: "text-[#5a7092]",
        chip: "text-[#28548e]",
        label: "text-[#687fa1]",
    },
    police: {
        background: "from-[#17233d] via-[#344b71] to-[#829bbf]",
        accent: "#2c4267",
        panel: "from-[#f8faff] to-[#e0e8f5]",
        text: "text-[#1e2e47]",
        muted: "text-[#596d89]",
        chip: "text-[#2b4266]",
        label: "text-[#6a7e9a]",
    },
    default: {
        background: "from-[#0b2148] via-[#194d91] to-[#4788d1]",
        accent: "#173f75",
        panel: "from-[#f7faff] to-[#e0ebfb]",
        text: "text-[#173153]",
        muted: "text-[#647994]",
        chip: "text-[#204b80]",
        label: "text-[#71849d]",
    },
};

function getCardTheme(exam = "") {
    const value = exam.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

    if (/\bnda\b/.test(value)) return cardThemes.nda;
    if (/\bcds\b/.test(value)) return cardThemes.cds;
    if (/\bafcat\b/.test(value)) return cardThemes.afcat;
    if (/\bnavy\b|\bssr\b|\bagniveer\s+navy\b/.test(value)) {
        return cardThemes.navy;
    }
    if (/\bair\s*force\b|\bagniveer\s+vayu\b/.test(value)) {
        return cardThemes.airforce;
    }
    if (/\barmy\b|\bagniveer\b|\btechnical\b|\bgd\b|\bclerk\b/.test(value)) {
        return cardThemes.army;
    }
    if (/\bpolice\b|\bconstable\b|\bsub\s*inspector\b|\bsi\b/.test(value)) {
        return cardThemes.police;
    }

    return cardThemes.default;
}

function getInitials(name = "") {
    return (
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word[0]?.toUpperCase())
            .join("") || "?"
    );
}

function AdminAchieverCard({ achiever, onEdit, onDelete }) {
    const name = achiever.name || "Achiever";
    const exam = achiever.examName || "Defence Examination";
    const year = achiever.year ? String(achiever.year) : "";
    const batch = achiever.batch || "target";
    const fatherName = achiever.fatherName?.trim();
    const address = achiever.address?.trim();
    const theme = getCardTheme(exam);
    const nameSize =
        name.length > 25
            ? "text-xs sm:text-sm"
            : name.length > 17
              ? "text-sm sm:text-base"
              : "text-sm sm:text-lg";

    return (
        <div className="flex min-w-0 flex-col">
            <article
                className={`group relative isolate flex aspect-[3/5] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br ${theme.background} font-sans shadow-[0_6px_22px_rgba(20,50,100,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(20,50,100,0.2)] motion-reduce:transform-none motion-reduce:transition-none`}
            >
                <div className="absolute inset-x-0 top-0 h-[70%] overflow-hidden">
                    {achiever.photo?.url ? (
                        <img
                            src={achiever.photo.url}
                            alt={`${name} - ${exam}`}
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                            className="h-full w-full object-cover object-top"
                        />
                    ) : (
                        <div className="grid h-full w-full place-items-center">
                            <span className="grid size-20 place-items-center rounded-full border border-white/40 bg-white/15 text-3xl font-extrabold text-white">
                                {getInitials(name)}
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#071a38]/65 via-[#071a38]/10 to-transparent" />
                </div>

                <span
                    className={`absolute left-3 top-3 z-20 rounded-lg px-2.5 py-1.5 text-[10px] font-extrabold sm:left-4 sm:top-4 sm:text-xs ${
                        achiever.isPublished
                            ? "border border-emerald-200/70 bg-emerald-50/95 text-emerald-800"
                            : "border border-amber-200/70 bg-amber-50/95 text-amber-800"
                    }`}
                >
                    {achiever.isPublished ? "Published" : "Draft"}
                </span>

                {year && (
                    <span className="absolute right-3 top-3 z-20 rounded-lg border border-amber-200/70 bg-gradient-to-br from-[#fff0bb] to-[#e5bd59] px-2.5 py-1.5 text-xs font-extrabold tracking-wide text-[#243958] shadow-md sm:right-4 sm:top-4 sm:text-sm">
                        {year}
                    </span>
                )}

                <div
                    className="absolute inset-x-3 top-[68%] z-30 flex min-h-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/40 px-3 py-2 shadow-lg sm:inset-x-4 sm:rounded-2xl sm:py-2.5"
                    style={{
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}ed)`,
                    }}
                >
                    <h3
                        title={name}
                        className={`m-0 max-w-full truncate text-center font-extrabold uppercase leading-tight tracking-wide text-white ${nameSize}`}
                    >
                        {name}
                    </h3>
                </div>

                <div
                    className={`absolute inset-x-0 bottom-0 z-20 flex h-[32%] flex-col justify-between bg-gradient-to-br ${theme.panel} px-3 pb-3 pt-7 sm:px-4 sm:pb-4 sm:pt-8`}
                >
                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5 text-center">
                        {fatherName && (
                            <p className={`m-0 max-w-full truncate text-xs font-bold sm:text-sm ${theme.text}`}>
                                S/o Sh. <span className="capitalize">{fatherName}</span>
                            </p>
                        )}
                        {address && (
                            <p
                                title={address}
                                className={`m-0 max-w-full truncate text-[11px] font-medium sm:text-xs ${theme.muted}`}
                            >
                                {address}
                            </p>
                        )}
                    </div>

                    <div className={`grid w-full gap-2 ${exam ? "grid-cols-[1.15fr_1fr]" : "grid-cols-1"}`}>
                        {exam && (
                            <div
                                className="min-w-0 rounded-lg border border-slate-200/80 bg-white px-2 py-2 shadow-sm sm:rounded-xl sm:px-3 sm:py-2.5"
                                style={{ borderTop: `2px solid ${theme.accent}` }}
                            >
                                <span className={`block truncate text-[9px] font-bold uppercase tracking-[0.09em] sm:text-[10px] ${theme.label}`}>
                                    Examination
                                </span>
                                <span className={`mt-1 block truncate text-[11px] font-extrabold uppercase leading-tight sm:text-sm ${theme.chip}`}>
                                    {exam}
                                </span>
                            </div>
                        )}
                        <div
                            className="min-w-0 rounded-lg border border-slate-200/80 bg-white px-2 py-2 shadow-sm sm:rounded-xl sm:px-3 sm:py-2.5"
                            style={{ borderTop: `2px solid ${theme.accent}` }}
                        >
                            <span className={`block truncate text-[9px] font-bold uppercase tracking-[0.09em] sm:text-[10px] ${theme.label}`}>
                                Batch
                            </span>
                            <span className={`mt-1 block truncate text-[11px] font-extrabold leading-tight capitalize sm:text-sm ${theme.chip}`}>
                                {batch}
                            </span>
                        </div>
                    </div>
                </div>
            </article>

            <div className="mt-2 flex gap-2">
                <button
                    type="button"
                    onClick={() => onEdit?.(achiever)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                    <Pencil size={16} />
                    Edit
                </button>
                <button
                    type="button"
                    onClick={() => onDelete?.(achiever)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            </div>
        </div>
    );
}

export default function AchieverList({
    achievers = [],
    categories = [],
    selectedCategory,
    onCategoryChange,
    filters,
    onFilterChange,
    pagination,
    loading = false,
    onSearch,
    onEdit,
    onDelete,
    onRefresh,
}) {
    const currentPage = pagination?.page || 1;
    const totalPages = pagination?.totalPages || 0;
    const total = pagination?.total || 0;

    const changeFilter = (name, value) => {
        onFilterChange?.({
            ...filters,
            [name]: value,
            page: 1,
        });
    };

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;

        onFilterChange?.({
            ...filters,
            page,
        });
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-bold text-[#0f1f4a]">
                        Achievers
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Students aur unki achievements manage karo.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            <div className="space-y-4 border-b border-slate-100 bg-[#F8FAFF] p-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                            Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(event) =>
                                onCategoryChange(event.target.value)
                            }
                            className={inputClass}
                        >
                            <option value="all">All</option>

                            {categories
                                .filter((category) => category.isActive)
                                .map((category) => (
                                    <option
                                        key={category._id}
                                        value={category.slug}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                            Search
                        </label>
                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={filters.search || ""}
                                onChange={(event) =>
                                    changeFilter("search", event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        onSearch?.();
                                    }
                                }}
                                placeholder="Name, father, exam..."
                                className={`${inputClass} pl-9`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                            Publication Status
                        </label>
                        <select
                            value={filters.status || "all"}
                            onChange={(event) =>
                                changeFilter("status", event.target.value)
                            }
                            className={inputClass}
                        >
                            <option value="all">All statuses</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                            Year
                        </label>
                        <input
                            type="number"
                            value={filters.year || ""}
                            onChange={(event) =>
                                changeFilter("year", event.target.value)
                            }
                            placeholder="e.g. 2026"
                            min={2000}
                            max={2100}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                            Batch
                        </label>
                        <select
                            value={filters.batch || ""}
                            onChange={(event) =>
                                changeFilter("batch", event.target.value)
                            }
                            className={inputClass}
                        >
                            <option value="">All batches</option>
                            <option value="foundation">Foundation</option>
                            <option value="target">Target</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                            Sort By
                        </label>
                        <select
                            value={filters.sort || "newest"}
                            onChange={(event) =>
                                changeFilter("sort", event.target.value)
                            }
                            className={inputClass}
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="name">Name A–Z</option>
                            <option value="order">Display order</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                        {total} record{total === 1 ? "" : "s"} found
                    </p>

                    <button
                        type="button"
                        onClick={onSearch}
                        disabled={loading}
                        className="rounded-xl bg-[#0f1f4a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d3774] disabled:opacity-50"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            <div className="p-5">
                {loading ? (
                    <div className="py-12 text-center text-sm text-slate-500">
                        Achievers load ho rahe hain...
                    </div>
                ) : achievers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">
                        <Users
                            size={34}
                            className="mx-auto mb-3 text-slate-400"
                        />
                        <p className="font-semibold text-slate-700">
                            No achievers found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Filters change karo ya naya achiever add karo.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {achievers.map((achiever) => (
                            <AdminAchieverCard
                                key={achiever._id}
                                achiever={achiever}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}

                {selectedCategory && totalPages > 1 && (
                    <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500">
                            Page {currentPage} of {totalPages}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={
                                    loading ||
                                    !pagination?.hasPrevPage
                                }
                                onClick={() => goToPage(currentPage - 1)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={17} />
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={
                                    loading ||
                                    !pagination?.hasNextPage
                                }
                                onClick={() => goToPage(currentPage + 1)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <ChevronRight size={17} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
