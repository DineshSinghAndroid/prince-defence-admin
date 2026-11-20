"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
    ArrowRight,
    CalendarDays,
    Edit3,
    FileText,
    Tag,
    Trash2,
} from "lucide-react";

import BlogStatus from "./BlogStatus";

const BlogCard = ({
    blog,
    onStatusChange,
    onDeleteRequest,
    onError,
}) => {
    const router = useRouter();

    const handleCardClick = () => {
        router.push(
            `/admin/blogs/${blog._id}`
        );
    };

    const handleEdit = (event) => {
        event.stopPropagation();

        router.push(
            `/admin/blogs/${blog._id}/edit`
        );
    };

    const handleDelete = (event) => {
        event.stopPropagation();

        if (!blog?._id) {
            onError?.("Blog ID is missing.");
            return;
        }

        onDeleteRequest?.(blog);
    };

    const handleStatusChange = (
        blogId,
        newStatus
    ) => {
        onStatusChange?.(
            blogId,
            newStatus
        );
    };

    const categoryName =
        blog.category?.name ||
        "Uncategorized";

    const authorName =
        blog.author?.name ||
        "Admin";

    const publishedDate =
        blog.publishedAt
            ? new Date(
                  blog.publishedAt
              ).toLocaleDateString(
                  "en-IN",
                  {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                  }
              )
            : null;

    return (
        <article
            onClick={handleCardClick}
            className="
                group
                cursor-pointer
                overflow-hidden
                rounded-2xl
                border
                border-[#C8D5EA]/70
                bg-white/80
                shadow-[0_8px_32px_rgba(16,42,67,0.10)]
                backdrop-blur-xl
                transition
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_15px_40px_rgba(16,42,67,0.15)]
            "
        >
            {/* Image */}

            <div className="relative h-52 overflow-hidden bg-[#F2F6FF]">
                {blog.featuredImage?.url ? (
                    <Image
                        src={
                            blog.featuredImage.url
                        }
                        alt={
                            blog.title ||
                            "Blog featured image"
                        }
                        fill
                        sizes="
                            (max-width: 640px) 100vw,
                            (max-width: 1024px) 50vw,
                            33vw
                        "
                        className="
                            object-cover
                            transition
                            duration-500
                            group-hover:scale-105
                        "
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <FileText
                            size={42}
                            className="text-[#3869D0]/40"
                        />
                    </div>
                )}

                {/* Status */}

                <div
                    className="absolute left-3 top-3"
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                >
                    <BlogStatus
                        blogId={blog._id}
                        status={blog.status}
                        onStatusChange={
                            handleStatusChange
                        }
                        onError={onError}
                    />
                </div>

                {/* Actions */}

                <div className="absolute right-3 top-3 flex items-center gap-2">
                    {/* Edit */}

                    <button
                        type="button"
                        onClick={handleEdit}
                        aria-label="Edit blog"
                        title="Edit blog"
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/70
                            bg-white/90
                            text-[var(--navy)]
                            shadow-md
                            backdrop-blur-md
                            transition
                            hover:bg-white
                            hover:text-[#3869D0]
                        "
                    >
                        <Edit3 size={16} />
                    </button>

                    {/* Delete */}

                    <button
                        type="button"
                        onClick={handleDelete}
                        aria-label="Delete blog"
                        title="Delete blog"
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/70
                            bg-white/90
                            text-red-600
                            shadow-md
                            backdrop-blur-md
                            transition
                            hover:bg-red-50
                            hover:text-red-700
                        "
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}

            <div className="p-5">
                {/* Category */}

                <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#3869D0]">
                    <Tag size={14} />

                    <span>
                        {categoryName}
                    </span>
                </div>

                {/* Title */}

                <h3 className="line-clamp-2 min-h-12 text-lg font-bold leading-6 text-[var(--navy)] transition group-hover:text-[#3869D0]">
                    {blog.title}
                </h3>

                {/* Excerpt */}

                <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[var(--muted)]">
                    {blog.excerpt}
                </p>

                {/* Meta */}

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#C8D5EA]/60 pt-4 text-xs text-[var(--muted)]">
                    {publishedDate && (
                        <div className="flex items-center gap-1.5">
                            <CalendarDays
                                size={14}
                            />

                            <span>
                                {publishedDate}
                            </span>
                        </div>
                    )}

                    <span>
                        By {authorName}
                    </span>
                </div>

                {/* View */}

                <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--navy)]">
                        View Article
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3869D0]/10 text-[#3869D0] transition group-hover:bg-[#3869D0] group-hover:bg-[#3869D0] group-hover:text-white">
                        <ArrowRight
                            size={17}
                        />
                    </span>
                </div>
            </div>
        </article>
    );
};

export default BlogCard;