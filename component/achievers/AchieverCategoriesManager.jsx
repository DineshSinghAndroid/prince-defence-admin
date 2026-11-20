
"use client";

import { useState } from "react";
import { Plus, Tag, ArrowUp, ArrowDown, GripVertical, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import {
    createAchieverCategory,
    updateAchieverCategory,
    deleteAchieverCategory,
    reorderAchieverCategories,
} from "@/services/achieverService";

import DeleteConfirmModal from "@/component/common/DeleteConfirmModal";

export default function AchieverCategoriesManager({
    categories = [],
    loading = false,
    onCategoriesChange,
    onRefresh,
}) {
    const [saving, setSaving] = useState(false);
    const [reordering, setReordering] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
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

    const handleMove = async (index, direction) => {
        const targetIndex = index + direction;
        if (
            targetIndex < 0 ||
            targetIndex >= categories.length ||
            reordering ||
            saving
        ) {
            return;
        }

        const newCategories = [...categories];
        const [moved] = newCategories.splice(index, 1);
        newCategories.splice(targetIndex, 0, moved);

        const orderedIds = newCategories.map((c) => c._id);

        try {
            setReordering(true);
            await reorderAchieverCategories(orderedIds);
            toast.success("Category order updated");
            await refreshCategories();
        } catch (error) {
            toast.error(error?.message || "Failed to update category order");
            await refreshCategories();
        } finally {
            setReordering(false);
        }
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(index));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e, targetIndex) => {
        e.preventDefault();
        if (
            draggedIndex === null ||
            draggedIndex === targetIndex ||
            reordering ||
            saving
        ) {
            setDraggedIndex(null);
            return;
        }

        const newCategories = [...categories];
        const [moved] = newCategories.splice(draggedIndex, 1);
        newCategories.splice(targetIndex, 0, moved);
        setDraggedIndex(null);

        const orderedIds = newCategories.map((c) => c._id);

        try {
            setReordering(true);
            await reorderAchieverCategories(orderedIds);
            toast.success("Category order updated");
            await refreshCategories();
        } catch (error) {
            toast.error(error?.message || "Failed to update category order");
            await refreshCategories();
        } finally {
            setReordering(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (saving || reordering) return;

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
        if (saving || reordering) return;

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
        if (!category?._id || deletingId || reordering) return;
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
                                disabled={saving || reordering}
                                className="flex-1 rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm text-[var(--navy)] outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                            />

                            <button
                                type="submit"
                                disabled={saving || reordering || !categoryName.trim()}
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
                                    disabled={saving || reordering}
                                    className="rounded-xl border border-[#C8D5EA] bg-white px-5 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#F8FAFF]"
                                >
                                    Cancel
                                </button>
                            )}
                        </form>
                    </section>

                    {/* Category List */}
                    <section className="rounded-2xl border border-[#C8D5EA]/70 bg-white p-6 shadow-[0_8px_32px_rgba(16,42,67,0.08)]">
                        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <Tag
                                    size={20}
                                    className="text-[#3869D0]"
                                />

                                <h2 className="text-lg font-bold text-[var(--navy)]">
                                    Categories
                                </h2>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-xs text-[var(--muted)]">
                                    Use <span className="font-semibold text-[var(--navy)]">▲ ▼</span> or drag to reorder
                                </span>
                                <span className="text-xs font-semibold rounded-md bg-[#F0F4FA] px-2.5 py-1 text-[var(--navy)]">
                                    {categories.length} categories
                                </span>
                                {onRefresh && (
                                    <button
                                        type="button"
                                        onClick={onRefresh}
                                        disabled={loading || saving || reordering}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                                        title="Refresh categories"
                                    >
                                        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                                        Refresh
                                    </button>
                                )}
                            </div>
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
                            <div className="max-h-[460px] space-y-3 overflow-y-auto overscroll-contain pr-2">
                                {categories.map((category, index) => (
                                    <div
                                        key={category._id}
                                        draggable={!saving && !reordering}
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, index)}
                                        className={`flex flex-col gap-4 rounded-xl border border-[#C8D5EA]/70 bg-[#F8FAFF] p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                                            draggedIndex === index
                                                ? "opacity-50 border-dashed border-[#3869D0]"
                                                : "hover:border-[#C8D5EA]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Drag Handle & Order Badge */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span
                                                    title="Drag to reorder"
                                                    className="cursor-grab text-slate-400 hover:text-[var(--navy)] active:cursor-grabbing"
                                                >
                                                    <GripVertical size={18} />
                                                </span>
                                                <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-white border border-[#C8D5EA] px-1.5 text-xs font-bold text-[var(--navy)]">
                                                    #{index + 1}
                                                </span>
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="break-words font-semibold text-[var(--navy)]">
                                                    {category.name}
                                                </h3>

                                                <p className="mt-0.5 break-all text-xs text-[var(--muted)]">
                                                    /{category.slug}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                                            {/* Order Up / Down buttons */}
                                            <div className="flex items-center rounded-lg border border-[#C8D5EA] bg-white p-0.5 shadow-xs">
                                                <button
                                                    type="button"
                                                    title="Move Up"
                                                    disabled={
                                                        index === 0 ||
                                                        reordering ||
                                                        saving
                                                    }
                                                    onClick={() =>
                                                        handleMove(index, -1)
                                                    }
                                                    className="rounded p-1 text-[var(--navy)] transition hover:bg-[#F8FAFF] disabled:cursor-not-allowed disabled:opacity-25"
                                                >
                                                    <ArrowUp size={14} />
                                                </button>
                                                <div className="h-4 w-px bg-[#C8D5EA]" />
                                                <button
                                                    type="button"
                                                    title="Move Down"
                                                    disabled={
                                                        index ===
                                                            categories.length -
                                                                1 ||
                                                        reordering ||
                                                        saving
                                                    }
                                                    onClick={() =>
                                                        handleMove(index, 1)
                                                    }
                                                    className="rounded p-1 text-[var(--navy)] transition hover:bg-[#F8FAFF] disabled:cursor-not-allowed disabled:opacity-25"
                                                >
                                                    <ArrowDown size={14} />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={saving || reordering}
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
                                                disabled={saving || reordering}
                                                onClick={() => handleEdit(category)}
                                                className="rounded-lg border border-[#C8D5EA] bg-white px-3 py-2 text-xs font-semibold text-[var(--navy)] transition hover:border-[#3869D0]/40 hover:bg-[#F8FAFF] disabled:opacity-50"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                disabled={!!deletingId || reordering}
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
