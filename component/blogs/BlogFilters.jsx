"use client";

import {
    Filter,
    Search,
} from "lucide-react";

const BlogFilters = ({
    search = "",
    category = "",
    status = "",
    categories = [],
    onSearchChange,
    onCategoryChange,
    onStatusChange,
}) => {
    return (
        <section className="rounded-2xl border border-[#C8D5EA]/70 bg-white/70 p-4 shadow-[0_8px_32px_rgba(16,42,67,0.10)] backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2">
                <Filter
                    size={17}
                    className="text-[#3869D0]"
                />

                <h2 className="text-sm font-semibold text-[var(--navy)]">
                    Filter Blogs
                </h2>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row">
                {/* Search */}
                <div className="relative flex-1">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            onSearchChange?.(
                                event.target.value
                            )
                        }
                        placeholder="Search blogs..."
                        className="w-full rounded-xl border border-[#C8D5EA] bg-white/70 py-2.5 pl-10 pr-3.5 text-sm text-[var(--navy)] outline-none backdrop-blur-md transition placeholder:text-[var(--muted)] focus:border-[#3869D0]/50 focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10"
                    />
                </div>

                {/* Category */}
                <select
                    value={category}
                    onChange={(event) =>
                        onCategoryChange?.(
                            event.target.value
                        )
                    }
                    className="rounded-xl border border-[#C8D5EA] bg-white/70 px-3.5 py-2.5 text-sm text-[var(--navy)] outline-none transition focus:border-[#3869D0]/50 focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10 lg:w-52"
                >
                    <option value="">
                        All Categories
                    </option>

                    {categories.map(
                        (item) => (
                            <option
                                key={item._id}
                                value={item._id}
                            >
                                {item.name}
                            </option>
                        )
                    )}
                </select>

                {/* Status */}
                <select
                    value={status}
                    onChange={(event) =>
                        onStatusChange?.(
                            event.target.value
                        )
                    }
                    className="rounded-xl border border-[#C8D5EA] bg-white/70 px-3.5 py-2.5 text-sm text-[var(--navy)] outline-none transition focus:border-[#3869D0]/50 focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10 lg:w-44"
                >
                    <option value="">
                        All Status
                    </option>

                    <option value="published">
                        Published
                    </option>

                    <option value="draft">
                        Draft
                    </option>
                </select>
            </div>
        </section>
    );
};

export default BlogFilters;