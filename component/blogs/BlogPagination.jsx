"use client";

import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const BlogPagination = ({
    page = 1,
    totalPages = 0,
    onPageChange,
}) => {
    if (totalPages <= 1) {
        return null;
    }

    const handlePrevious = () => {
        if (page > 1) {
            onPageChange?.(page - 1);
        }
    };

    const handleNext = () => {
        if (page < totalPages) {
            onPageChange?.(page + 1);
        }
    };

    const getPages = () => {
        const pages = [];

        for (
            let current = 1;
            current <= totalPages;
            current++
        ) {
            pages.push(current);
        }

        return pages;
    };

    return (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
                type="button"
                onClick={handlePrevious}
                disabled={page === 1}
                aria-label="Previous page"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C8D5EA] bg-white/70 text-[var(--navy)] transition hover:border-[#3869D0]/40 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronLeft size={18} />
            </button>

            {getPages().map(
                (pageNumber) => (
                    <button
                        key={pageNumber}
                        type="button"
                        onClick={() =>
                            onPageChange?.(
                                pageNumber
                            )
                        }
                        className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                            pageNumber === page
                                ? "bg-[var(--navy)] text-white shadow-md"
                                : "border border-[#C8D5EA] bg-white/70 text-[var(--navy)] hover:border-[#3869D0]/40 hover:bg-white"
                        }`}
                    >
                        {pageNumber}
                    </button>
                )
            )}

            <button
                type="button"
                onClick={handleNext}
                disabled={
                    page === totalPages
                }
                aria-label="Next page"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C8D5EA] bg-white/70 text-[var(--navy)] transition hover:border-[#3869D0]/40 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default BlogPagination;