
"use client";

import { useState } from "react";
import { Plus, Tag } from "lucide-react";
import toast from "react-hot-toast";

import {
    createAchieverCategory,
    updateAchieverCategory,
    deleteAchieverCategory,
} from "@/services/achieverService";

import DeleteConfirmModal from "@/component/common/DeleteConfirmModal";

export default function AchieverCategoriesManager({
    categories = [],
    loading = false,
    onCategoriesChange,
    onRefresh,
}) {
    const [saving, setSaving] = useState(false);
    const [categoryName, setCategoryName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const resetForm = () => {
        setCategoryName("");
        setEditingId(null);
    };

    const refreshCategories = async () => {
        if (onRefresh) {
            await onRefresh();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (saving) return;

        if (!categoryName.trim()) {
            toast.error("Category name is required");
            return;
        }

        const toastId = toast.loading(
            editingId ? "Updating category..." : "Creating category..."
        );

        try {
            setSaving(true);

            if (editingId) {
                const response = await updateAchieverCategory(
                    editingId,
                    { name: categoryName.trim() }
                );

                toast.success(
                    response?.message || "Category updated successfully",
                    { id: toastId }
                );
            } else {
                const response = await createAchieverCategory(
                    categoryName.trim()
                );

                toast.success(
                    response?.message || "Category created successfully",
                    { id: toastId }
                );
            }

            resetForm();
            await refreshCategories();
        } catch (error) {
            toast.error(
                error?.message || "Category operation failed",
                { id: toastId }
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category._id);
        setCategoryName(category.name || "");
    };

    const handleStatusChange = async (category) => {
        if (saving) return;

        const newStatus = !category.isActive;
        const toastId = toast.loading(
            newStatus ? "Activating category..." : "Deactivating category..."
        );

        try {
            setSaving(true);

            await updateAchieverCategory(category._id, {
                isActive: newStatus,
            });

            toast.success(
                newStatus
                    ? "Category activated successfully"
                    : "Category deactivated successfully",
                { id: toastId }
            );

            await refreshCategories();
        } catch (error) {
            toast.error(
                error?.message || "Failed to update category status",
                { id: toastId }
            );
        } finally {
            setSaving(false);
        }
    };

    const requestDelete = (category) => {
        if (!category?._id || deletingId) return;
        setDeleteTarget(category);
    };

    const handleDelete = async () => {
        const id = deleteTarget?._id;

        if (!id || deletingId) return;

        const toastId = toast.loading("Deleting category...");

        try {
            setDeletingId(id);

            await deleteAchieverCategory(id);

            if (editingId === id) {
                resetForm();
            }

            toast.success("Category deleted successfully", {
                id: toastId,
            });

            setDeleteTarget(null);
            await refreshCategories();
        } catch (error) {
            toast.error(
                error?.message || "Failed to delete category",
                { id: toastId }
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>
            <main>
                <div className="mx-auto max-w-5xl">
                    {/* Category Form */}
                    <section className="mb-6 rounded-2xl border border-[#C8D5EA]/70 bg-white p-6 shadow-[0_8px_32px_rgba(16,42,67,0.08)]">
                        <div className="mb-4">
                            <h2 className="text-lg font-bold text-[var(--navy)]">
                                {editingId ? "Edit Category" : "Create Category"}
                            </h2>

                            <p className="mt-1 text-sm text-[var(--muted)]">
                                {editingId
                                    ? "Update the category name."
                                    : "Add a new category for your achievers."}
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-3 sm:flex-row"
                        >
                            <input
                                type="text"
                                value={categoryName}
                                onChange={(event) =>
                                    setCategoryName(event.target.value)
                                }
                                placeholder="Enter category name"
                                maxLength={100}
                                disabled={saving}
                                className="flex-1 rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm text-[var(--navy)] outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                            />

                            <button
                                type="submit"
                                disabled={saving || !categoryName.trim()}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Plus size={17} />
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Category"
                                        : "Create Category"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={saving}
                                    className="rounded-xl border border-[#C8D5EA] bg-white px-5 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#F8FAFF]"
                                >
                                    Cancel
                                </button>
                            )}
                        </form>
                    </section>

                    {/* Category List */}
                    <section className="rounded-2xl border border-[#C8D5EA]/70 bg-white p-6 shadow-[0_8px_32px_rgba(16,42,67,0.08)]">
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Tag
                                    size={20}
                                    className="text-[#3869D0]"
                                />

                                <h2 className="text-lg font-bold text-[var(--navy)]">
                                    Categories
                                </h2>
                            </div>

                            <span className="text-sm text-[var(--muted)]">
                                {categories.length} categories
                            </span>
                        </div>

                        {loading && categories.length === 0 ? (
                            <div className="flex min-h-32 items-center justify-center">
                                <p className="text-sm text-[var(--muted)]">
                                    Loading categories...
                                </p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-[#C8D5EA] bg-[#F8FAFF]">
                                <p className="text-sm text-[var(--muted)]">
                                    No categories found.
                                </p>
                            </div>
                        ) : (
                            <div className="max-h-[400px] space-y-3 overflow-y-auto overscroll-contain pr-2">
                                {categories.map((category) => (
                                    <div
                                        key={category._id}
                                        className="flex flex-col gap-4 rounded-xl border border-[#C8D5EA]/70 bg-[#F8FAFF] p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <h3 className="break-words font-semibold text-[var(--navy)]">
                                                {category.name}
                                            </h3>

                                            <p className="mt-1 break-all text-xs text-[var(--muted)]">
                                                /{category.slug}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                disabled={saving}
                                                onClick={() =>
                                                    handleStatusChange(category)
                                                }
                                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                                                    category.isActive
                                                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                            >
                                                {category.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={saving}
                                                onClick={() => handleEdit(category)}
                                                className="rounded-lg border border-[#C8D5EA] bg-white px-3 py-2 text-xs font-semibold text-[var(--navy)] transition hover:border-[#3869D0]/40 hover:bg-[#F8FAFF] disabled:opacity-50"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                disabled={!!deletingId}
                                                onClick={() => requestDelete(category)}
                                                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <DeleteConfirmModal
                open={!!deleteTarget}
                title="Delete this category?"
                description="This category will be permanently deleted. If achievers are linked to it, the server may reject the deletion."
                itemName={deleteTarget?.name}
                confirmText="Delete Category"
                loading={!!deletingId}
                onCancel={() => {
                    if (!deletingId) setDeleteTarget(null);
                }}
                onConfirm={handleDelete}
            />
        </>
    );
}
