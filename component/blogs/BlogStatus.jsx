"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { updateBlogStatus } from "@/services/blogService";

const BlogStatus = ({
    blogId,
    status,
    onStatusChange,
    onError,
}) => {
    const [updating, setUpdating] =
        useState(false);

    const isPublished =
        status === "published";

    const handleToggle = async () => {
        if (updating) {
            return;
        }

        const newStatus = isPublished
            ? "draft"
            : "published";

        try {
            setUpdating(true);

            await updateBlogStatus(
                blogId,
                newStatus
            );

            onStatusChange?.(
                blogId,
                newStatus
            );
        } catch (error) {
            onError?.(
                error?.message ||
                    "Failed to update blog status"
            );
        } finally {
            setUpdating(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={updating}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isPublished
                    ? "border-emerald-200 bg-emerald-50/90 text-emerald-700 hover:bg-emerald-100"
                    : "border-amber-200 bg-amber-50/90 text-amber-700 hover:bg-amber-100"
            }`}
        >
            <span className="flex items-center gap-1.5">
                {updating && (
                    <Loader2
                        size={13}
                        className="animate-spin"
                    />
                )}

                {isPublished
                    ? "Published"
                    : "Draft"}
            </span>
        </button>
    );
};

export default BlogStatus;