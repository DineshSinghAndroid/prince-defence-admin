"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ClipboardList,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  RefreshCw,
  Pencil,
  X,
} from "lucide-react";

import {
  createQuizCategory,
  deleteQuizCategory,
  getQuizCategories,
  updateQuizCategory,
  reorderQuizCategories,
} from "@/services/quizService";
import DeleteConfirmModal from "@/component/common/DeleteConfirmModal";

const glass = "rounded-2xl border border-[#C8D5EA]/70 bg-white/70 shadow-[0_8px_32px_rgba(16,42,67,0.10)] backdrop-blur-xl";
const glassModal = "rounded-2xl border border-white/80 bg-white/95 shadow-[0_20px_60px_rgba(16,42,67,0.18)] backdrop-blur-2xl";
const inputClass = "w-full rounded-xl border border-[#C8D5EA] bg-white px-3.5 py-2.5 text-sm text-[var(--navy)] outline-none transition focus:border-[#3869D0]/50 focus:ring-4 focus:ring-[#3869D0]/10";

export default function QuizCategoriesManager({ embedded = false }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [active, setActive] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getQuizCategories();
      setCategories(response?.categories || response?.data || []);
    } catch (error) {
      toast.error(error.message || "Unable to load quiz categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCategories();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCategories]);

  const openCreate = () => {
    setEditingCategory(null);
    setCategoryName("");
    setActive(true);
    setShowForm(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setActive(category.active !== false);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanName = categoryName.trim();

    if (cleanName.length < 2 || cleanName.length > 80) {
      toast.error("Category name must be between 2 and 80 characters.");
      return;
    }

    try {
      setSaving(true);
      if (editingCategory) {
        await updateQuizCategory(editingCategory._id, { name: cleanName, active });
        toast.success("Quiz category updated successfully.");
      } else {
        await createQuizCategory(cleanName);
        toast.success("Quiz category created successfully.");
      }
      closeForm();
      await loadCategories();
    } catch (error) {
      toast.error(error.message || "Unable to save quiz category.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (category) => {
    try {
      setSaving(true);
      await updateQuizCategory(category._id, { active: category.active === false });
      await loadCategories();
      toast.success(category.active === false ? "Category activated successfully." : "Category deactivated successfully.");
    } catch (error) {
      toast.error(error.message || "Unable to update category status.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deletingId) return;

    try {
      setDeletingId(deleteTarget._id);
      await deleteQuizCategory(deleteTarget._id);
      setDeleteTarget(null);
      await loadCategories();
      toast.success("Quiz category deleted successfully.");
    } catch (error) {
      toast.error(error.message || "Unable to delete quiz category.");
    } finally {
      setDeletingId("");
    }
  };

  const handleMove = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;

    const next = [...categories];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);

    setCategories(next);
    setReordering(true);

    try {
      await reorderQuizCategories(next.map((c) => c._id));
      toast.success("Category order updated.");
    } catch (error) {
      toast.error(error.message || "Failed to update category order.");
      await loadCategories();
    } finally {
      setReordering(false);
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const next = [...categories];
    const [moved] = next.splice(draggedIndex, 1);
    next.splice(dropIndex, 0, moved);

    setCategories(next);
    setDraggedIndex(null);
    setReordering(true);

    try {
      await reorderQuizCategories(next.map((c) => c._id));
      toast.success("Category order updated.");
    } catch (error) {
      toast.error(error.message || "Failed to update category order.");
      await loadCategories();
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className={embedded ? "mt-5" : "relative min-h-screen overflow-hidden bg-[#F2F6FF] px-4 pb-10 pt-20 md:px-6 lg:pt-8"}>
      {!embedded && <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#3869D0]/10 blur-3xl" />}
      {!embedded && <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[#B8C9F5]/20 blur-3xl" />}

      <div className={`relative mx-auto ${embedded ? "" : "max-w-7xl"}`}>
        {!embedded && (
          <header className="relative mb-6 overflow-hidden rounded-3xl bg-[var(--navy)] px-6 py-8 text-white shadow-[0_18px_50px_rgba(16,42,67,0.16)] md:px-10 md:py-10">
            <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-white/90">QUIZ CATALOG</span>
                <h1 className="montserrat mt-4 text-3xl font-extrabold italic leading-tight md:text-4xl">Quiz Categories</h1>
                <p className="mt-2 text-sm text-white/70">Manage subjects used by the daily quiz.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={loadCategories}
                  disabled={loading}
                  aria-label="Refresh quiz categories"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button type="button" onClick={openCreate} className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#3869D0] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#3869D0]/20 transition hover:-translate-y-0.5 hover:bg-[#2f5dbd]">
                  <Plus size={16} /> Add Category
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Gallery-style Toolbar */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">
            Reorder categories with buttons or drag and drop. Changes update across the quiz system immediately.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadCategories}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#C8D5EA] bg-white/70 px-3 py-2 text-xs font-semibold text-[var(--navy)] backdrop-blur-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              title="Refresh quiz categories"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#3869D0] px-3.5 py-2 text-sm font-bold text-white shadow-lg shadow-[#3869D0]/20 transition hover:-translate-y-0.5 hover:bg-[#2f5dbd]"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>
        </div>

        {/* Categories List (Gallery Category Rows) */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={`h-16 animate-pulse ${glass}`} />
            ))
          ) : categories.length === 0 ? (
            <div className={`col-span-full flex min-h-64 flex-col items-center justify-center p-12 text-center ${glass}`}>
              <ClipboardList size={30} className="text-[#3869D0]" />
              <p className="mt-4 font-bold text-[var(--navy)]">No quiz categories found.</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Create a category before adding quiz questions.</p>
            </div>
          ) : (
            categories.map((category, index) => (
              <div
                key={category._id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className={`flex flex-col gap-3 rounded-xl border border-[#C8D5EA] bg-white/60 p-4 backdrop-blur-md transition hover:bg-white sm:flex-row sm:items-center sm:justify-between ${
                  draggedIndex === index ? "opacity-50 border-dashed border-[#3869D0]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing"
                    title="Drag to reorder"
                  >
                    <GripVertical size={18} />
                  </button>

                  <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-[#3869D0]/10 px-2 text-xs font-bold text-[#3869D0]">
                    #{index + 1}
                  </span>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3869D0]/10 text-[#3869D0]">
                    <ClipboardList size={16} />
                  </span>

                  <div>
                    <p className="font-semibold text-[var(--navy)]">
                      {category.name}
                    </p>
                    {category.slug && (
                      <p className="text-xs text-[var(--muted)]">
                        {category.slug}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                    <button
                      type="button"
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0 || reordering}
                      title="Move up"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-[#E7EEFA] hover:text-[#3869D0] disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 1)}
                      disabled={index === categories.length - 1 || reordering}
                      title="Move down"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-[#E7EEFA] hover:text-[#3869D0] disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>

                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                      category.active !== false
                        ? "border-[#3869D0]/20 bg-[#3869D0]/10 text-[#3869D0]"
                        : "border-[#C8D5EA] bg-[#E7EEFA] text-[var(--muted)]"
                    }`}
                  >
                    {category.active !== false ? "Active" : "Inactive"}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleActive(category)}
                    disabled={saving || deletingId === category._id}
                    className="rounded-xl border border-[#C8D5EA] bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#40556B] backdrop-blur-md transition hover:bg-white hover:text-[var(--navy)] disabled:opacity-50"
                  >
                    {category.active !== false ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEdit(category)}
                    disabled={saving}
                    className="rounded-xl border border-[#C8D5EA] bg-white/60 p-2 text-[#3869D0] backdrop-blur-md transition hover:bg-[#3869D0] hover:text-white disabled:opacity-50"
                    title="Edit category"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(category)}
                    disabled={saving || deletingId === category._id}
                    className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-500 backdrop-blur-md transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    title="Delete category"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Category Modal (Gallery-Style) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy)]/45 p-4 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className={`${glassModal} w-full max-w-md p-6`}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--navy)]">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[#F2F6FF] hover:text-[var(--navy)]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <label className="mb-1.5 block text-sm font-semibold text-[#40556B]">
              Category Name
            </label>
            <input
              autoFocus
              type="text"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              maxLength={80}
              placeholder="Enter category name"
              className={inputClass}
            />
            <p className="mt-1 text-right text-xs text-[var(--muted)]">
              {categoryName.length}/80
            </p>

            <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--navy)]">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
                className="h-4 w-4 accent-[#3869D0]"
              />
              Active for quiz questions
            </label>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl border border-[#C8D5EA] bg-white/60 px-4 py-2.5 text-sm font-semibold text-[#40556B] backdrop-blur-md transition hover:bg-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#3869D0] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#3869D0]/20 transition hover:bg-[#2f5dbd] disabled:opacity-50"
              >
                {saving ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete quiz category?"
        description={`Delete ${deleteTarget?.name || "this category"}? Remove its questions first, including inactive questions scheduled on any date. Historical quiz results will remain unchanged.`}
        confirmText="Delete category"
        loading={Boolean(deletingId)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
