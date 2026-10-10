"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";

import { AuthContext } from "@/context/AuthContext";

import {
    getBlogCategories,
} from "@/services/blogService";

import BlogForm from "@/component/blogs/BlogForm";

const CreateBlogPage = () => {
    const router = useRouter();

    const {
        user,
        loading: authLoading,
    } = useContext(AuthContext);

    const [categories, setCategories] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            router.replace("/login");
            return;
        }

        if (!["superAdmin", "admin"].includes(user.role)) {
            router.replace("/admin/dashboard");
            return;
        }

        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getBlogCategories();

                setCategories(
                    response?.data || []
                );
            } catch (error) {
                setError(
                    error?.message ||
                        "Failed to load categories"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [
        user,
        authLoading,
        router,
    ]);

    if (
        authLoading ||
        loading
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F2F6FF]">
                <p className="text-sm text-[var(--navy)]">
                    Loading...
                </p>
            </main>
        );
    }

    if (!user || !["superAdmin", "admin"].includes(user.role)) {
        return null;
    }

    return (
        <main className="min-h-screen bg-[#F2F6FF] px-4 pb-10 pt-20 md:px-6 lg:pt-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/admin/blogs"
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-[#C8D5EA] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--navy)] transition hover:border-[#3869D0]/40 hover:bg-[#F8FAFF]"
                    >
                        <ArrowLeft size={17} />
                        Back to Blogs
                    </button>
                </div>

                <section className="mb-6 rounded-3xl bg-[var(--navy)] p-6 shadow-[0_15px_50px_rgba(16,42,67,0.15)]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                            <FileText size={21} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-white md:text-3xl">
                                Create Blog
                            </h1>

                            <p className="mt-1 text-sm text-white/70">
                                Create a new academy blog article.
                            </p>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                )}

                <BlogForm
                    mode="create"
                    categories={categories}
                />
            </div>
        </main>
    );
};

export default CreateBlogPage;