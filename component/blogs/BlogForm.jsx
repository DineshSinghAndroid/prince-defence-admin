"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
    createBlog,
    updateBlog,
    updateBlogStatus,
} from "@/services/blogService";

import BlogContentEditor from "./BlogContentEditor";

const BlogForm = ({
    mode = "create",
    initialData = null,
    categories = [],
}) => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        excerpt: initialData?.excerpt || "",

        category:
            initialData?.category?._id ||
            initialData?.category ||
            "",

        status:
            initialData?.status || "draft",

        metaTitle:
            initialData?.metaTitle || "",

        metaDescription:
            initialData?.metaDescription || "",

        keywords:
            initialData?.keywords || [],

        content:
            initialData?.content || [],

        featuredImage: null,
    });

    const [loading, setLoading] =
        useState(false);

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleFeaturedImageChange = (
        event
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (
            ![
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/avif",
            ].includes(file.type)
        ) {
            toast.error(
                "Please select a valid image"
            );

            event.target.value = "";

            return;
        }

        setFormData((current) => ({
            ...current,
            featuredImage: file,
        }));
    };

    const handleContentChange = (
        content
    ) => {
        setFormData((current) => ({
            ...current,
            content,
        }));
    };

    // Remove empty rich text items
    const cleanRichText = (
        content = []
    ) => {
        if (!Array.isArray(content)) {
            return [];
        }

        return content.filter(
            (item) =>
                item &&
                typeof item.text ===
                    "string" &&
                item.text.length > 0
        );
    };

    // Clean content before submit
    const cleanContent = (
        content = []
    ) => {
        if (!Array.isArray(content)) {
            return [];
        }

        return content.reduce(
            (cleaned, block) => {
                if (
                    !block ||
                    typeof block !==
                        "object"
                ) {
                    return cleaned;
                }

                // Heading
                if (
                    block.type ===
                    "heading"
                ) {
                    const richText =
                        cleanRichText(
                            block.content
                        );

                    if (
                        richText.length ===
                        0
                    ) {
                        return cleaned;
                    }

                    cleaned.push({
                        ...block,
                        content: richText,
                    });

                    return cleaned;
                }

                // Paragraph
                if (
                    block.type ===
                    "paragraph"
                ) {
                    const richText =
                        cleanRichText(
                            block.content
                        );

                    if (
                        richText.length ===
                        0
                    ) {
                        return cleaned;
                    }

                    cleaned.push({
                        ...block,
                        content: richText,
                    });

                    return cleaned;
                }

                // Quote
                if (
                    block.type ===
                    "quote"
                ) {
                    const richText =
                        cleanRichText(
                            block.content
                        );

                    if (
                        richText.length ===
                        0
                    ) {
                        return cleaned;
                    }

                    cleaned.push({
                        ...block,
                        content: richText,
                    });

                    return cleaned;
                }

                // List
                if (
                    block.type ===
                    "list"
                ) {
                    const items = (
                        block.items || []
                    )
                        .map(
                            (item) =>
                                cleanRichText(
                                    item
                                )
                        )
                        .filter(
                            (item) =>
                                item.length >
                                0
                        );

                    if (
                        items.length === 0
                    ) {
                        return cleaned;
                    }

                    cleaned.push({
                        ...block,
                        items,
                    });

                    return cleaned;
                }

                // FAQ
                if (
                    block.type ===
                    "faq"
                ) {
                    const items = (
                        block.items || []
                    )
                        .map((faq) => {
                            if (
                                !faq ||
                                typeof faq !==
                                    "object"
                            ) {
                                return null;
                            }

                            const question =
                                cleanRichText(
                                    faq.question
                                );

                            const answer =
                                cleanRichText(
                                    faq.answer
                                );

                            if (
                                question.length ===
                                    0 ||
                                answer.length ===
                                    0
                            ) {
                                return null;
                            }

                            return {
                                ...faq,
                                question,
                                answer,
                            };
                        })
                        .filter(Boolean);

                    if (
                        items.length === 0
                    ) {
                        return cleaned;
                    }

                    cleaned.push({
                        ...block,
                        items,
                    });

                    return cleaned;
                }

                // Image, link, table
                cleaned.push(block);

                return cleaned;
            },
            []
        );
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        if (!formData.title.trim()) {
            toast.error(
                "Blog title is required"
            );

            return;
        }

        if (!formData.slug.trim()) {
            toast.error(
                "Blog slug is required"
            );

            return;
        }

        if (!formData.excerpt.trim()) {
            toast.error(
                "Blog excerpt is required"
            );

            return;
        }

        if (!formData.category) {
            toast.error(
                "Please select a blog category"
            );

            return;
        }

        if (
            !["draft", "published"].includes(
                formData.status
            )
        ) {
            toast.error(
                "Invalid blog status"
            );

            return;
        }

        const cleanedContent =
            cleanContent(
                formData.content
            );

        const toastId = toast.loading(
            mode === "edit"
                ? "Updating blog..."
                : "Creating blog..."
        );

        try {
            setLoading(true);

            if (mode === "create") {
                const response =
                    await createBlog({
                        title:
                            formData.title,
                        slug:
                            formData.slug,
                        excerpt:
                            formData.excerpt,
                        category:
                            formData.category,
                        status:
                            formData.status,
                        featuredImage:
                            formData.featuredImage,
                        metaTitle:
                            formData.metaTitle,
                        metaDescription:
                            formData.metaDescription,
                        keywords:
                            formData.keywords,
                        content:
                            cleanedContent,
                    });

                toast.success(
                    response?.message ||
                        "Blog created successfully",
                    {
                        id: toastId,
                    }
                );

                router.push(
                    "/admin/blogs"
                );

                return;
            }

            if (mode === "edit") {
                if (!initialData?._id) {
                    throw new Error(
                        "Blog ID is missing"
                    );
                }

                const response =
                    await updateBlog({
                        id: initialData._id,

                        title:
                            formData.title,

                        slug:
                            formData.slug,

                        excerpt:
                            formData.excerpt,

                        category:
                            formData.category,

                        metaTitle:
                            formData.metaTitle,

                        metaDescription:
                            formData.metaDescription,

                        keywords:
                            formData.keywords,

                        content:
                            cleanedContent,

                        featuredImage:
                            formData.featuredImage,
                    });

                const oldStatus =
                    initialData.status ||
                    "draft";

                if (
                    formData.status !==
                    oldStatus
                ) {
                    await updateBlogStatus(
                        initialData._id,
                        formData.status
                    );
                }

                toast.success(
                    response?.message ||
                        "Blog updated successfully",
                    {
                        id: toastId,
                    }
                );

                router.push(
                    "/admin/blogs"
                );
            }
        } catch (error) {
            console.error(
                "Blog Error:",
                error
            );

            toast.error(
                error?.message ||
                    (mode === "edit"
                        ? "Failed to update blog"
                        : "Failed to create blog"),
                {
                    id: toastId,
                }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* Basic Information */}

            <section className="rounded-2xl border border-[#C8D5EA]/70 bg-white p-6 shadow-[0_8px_32px_rgba(16,42,67,0.08)]">
                <h2 className="text-lg font-bold text-[var(--navy)]">
                    Basic Information
                </h2>

                <div className="mt-5 space-y-5">
                    {/* Title */}

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            Blog Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={
                                formData.title
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter blog title"
                            disabled={loading}
                            className="w-full rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                        />
                    </div>

                    {/* Slug */}

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            Slug
                        </label>

                        <input
                            type="text"
                            name="slug"
                            value={
                                formData.slug
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="nda-exam-preparation-guide-2026"
                            disabled={loading}
                            className="w-full rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                        />
                    </div>

                    {/* Excerpt */}

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            Excerpt
                        </label>

                        <textarea
                            name="excerpt"
                            value={
                                formData.excerpt
                            }
                            onChange={
                                handleChange
                            }
                            rows={4}
                            placeholder="Write a short description of the blog..."
                            disabled={loading}
                            className="w-full resize-none rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                        />
                    </div>

                    {/* Featured Image */}

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            Featured Image
                        </label>

                        <p className="mb-3 text-xs text-[var(--muted)]">
                            This image will be used as
                            the main image of the blog.
                        </p>

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            onChange={
                                handleFeaturedImageChange
                            }
                            disabled={loading}
                            className="w-full rounded-xl border border-[#C8D5EA] bg-white px-4 py-3 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--navy)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                        />

                        {formData.featuredImage && (
                            <div className="mt-4 overflow-hidden rounded-2xl border border-green-200 bg-green-50">
                                <div className="border-b border-green-200 px-4 py-3">
                                    <p className="text-sm font-semibold text-green-700">
                                        New Featured Image
                                    </p>

                                    <p className="mt-1 break-all text-xs text-green-600">
                                        {
                                            formData
                                                .featuredImage
                                                .name
                                        }
                                    </p>
                                </div>

                                <div className="flex min-h-[280px] w-full items-center justify-center bg-[#F5F7FA] p-3 sm:min-h-[360px] lg:min-h-[450px]">
                                    <img
                                        src={URL.createObjectURL(
                                            formData.featuredImage
                                        )}
                                        alt="Selected featured image"
                                        className="max-h-[450px] w-full object-contain"
                                    />
                                </div>
                            </div>
                        )}

                        {!formData.featuredImage &&
                            initialData
                                ?.featuredImage
                                ?.url && (
                                <div className="mt-4 overflow-hidden rounded-2xl border border-[#C8D5EA] bg-white">
                                    <div className="border-b border-[#C8D5EA] bg-[#F8FAFF] px-4 py-3">
                                        <p className="text-sm font-semibold text-[var(--navy)]">
                                            Current Featured Image
                                        </p>
                                    </div>

                                    <div className="flex min-h-[280px] w-full items-center justify-center bg-[#F5F7FA] p-3 sm:min-h-[360px] lg:min-h-[450px]">
                                        <img
                                            src={
                                                initialData
                                                    .featuredImage
                                                    .url
                                            }
                                            alt={
                                                initialData.title ||
                                                "Featured image"
                                            }
                                            className="max-h-[450px] w-full object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* Category + Status */}

                    <div className="grid gap-5 md:grid-cols-2">
                        {/* Category */}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                                Category
                            </label>

                            <select
                                name="category"
                                value={
                                    formData.category
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={loading}
                                className="w-full rounded-xl border border-[#C8D5EA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                            >
                                <option value="">
                                    Select category
                                </option>

                                {categories.map(
                                    (
                                        category
                                    ) => (
                                        <option
                                            key={
                                                category._id
                                            }
                                            value={
                                                category._id
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

                        {/* Status */}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                                Status
                            </label>

                            <select
                                name="status"
                                value={
                                    formData.status
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={loading}
                                className="w-full rounded-xl border border-[#C8D5EA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                            >
                                <option value="draft">
                                    Draft
                                </option>

                                <option value="published">
                                    Published
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEO Information */}

            <section className="rounded-2xl border border-[#C8D5EA]/70 bg-white p-6 shadow-[0_8px_32px_rgba(16,42,67,0.08)]">
                <h2 className="text-lg font-bold text-[var(--navy)]">
                    SEO Information
                </h2>

                <div className="mt-5 space-y-5">
                    {/* Meta Title */}

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            Meta Title
                        </label>

                        <input
                            type="text"
                            name="metaTitle"
                            value={
                                formData.metaTitle
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="SEO title"
                            disabled={loading}
                            className="w-full rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                        />
                    </div>

                    {/* Meta Description */}

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            Meta Description
                        </label>

                        <textarea
                            name="metaDescription"
                            value={
                                formData.metaDescription
                            }
                            onChange={
                                handleChange
                            }
                            rows={4}
                            placeholder="Write SEO meta description..."
                            disabled={loading}
                            className="w-full resize-none rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                        />
                    </div>
                </div>
            </section>

            {/* Blog Content */}

            <section className="rounded-2xl border border-[#C8D5EA]/70 bg-white p-6 shadow-[0_8px_32px_rgba(16,42,67,0.08)]">
                <h2 className="text-lg font-bold text-[var(--navy)]">
                    Blog Content
                </h2>

                <p className="mt-1 text-sm text-[var(--muted)]">
                    Build your article using
                    different content blocks.
                </p>

                <div className="mt-5">
                    <BlogContentEditor
                        value={
                            formData.content
                        }
                        onChange={
                            handleContentChange
                        }
                    />
                </div>
            </section>

            {/* Submit */}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-[var(--navy)] px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading
                        ? mode === "edit"
                            ? "Updating..."
                            : "Creating..."
                        : mode === "edit"
                        ? "Update Blog"
                        : "Create Blog"}
                </button>
            </div>
        </form>
    );
};

export default BlogForm;