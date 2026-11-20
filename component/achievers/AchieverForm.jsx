
"use client";

import { useEffect, useRef, useState } from "react";
import {
    X,
    Upload,
    UserRound,
    Image as ImageIcon,
} from "lucide-react";

const initialForm = {
    name: "",
    fatherName: "",
    gender: "male",
    address: "",
    categorySlug: "",
    examName: "",
    year: new Date().getFullYear(),
    batch: "target",
    isPublished: true,
    displayOrder: 0,
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function AchieverForm({
    open,
    onClose,
    onSubmit,
    categories = [],
    selectedCategory = "",
    achiever = null,
    saving = false,
}) {
    const [form, setForm] = useState(initialForm);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [previewError, setPreviewError] = useState(false);
    const [formError, setFormError] = useState("");

    const fileInputRef = useRef(null);
    const previewUrlRef = useRef("");

    useEffect(() => {
        if (!open) return;

        const timer = window.setTimeout(() => {
            if (achiever) {
                setForm({
                    name: achiever.name || "",
                    fatherName: achiever.fatherName || "",
                    gender: achiever.gender || "male",
                    address: achiever.address || "",
                    categorySlug: achiever.categoryId?.slug || selectedCategory,
                    examName: achiever.examName || "",
                    year: achiever.year || new Date().getFullYear(),
                    batch:
                        achiever.batch === null || (achiever.batch && achiever.batch.toLowerCase() === "null")
                            ? "null"
                            : achiever.batch
                              ? achiever.batch.toLowerCase()
                              : "target",
                    isPublished: Boolean(achiever.isPublished),
                    displayOrder: achiever.displayOrder ?? 0,
                });

                setPhotoPreview(achiever.photo?.url || "");
            } else {
                setForm({
                    ...initialForm,
                    categorySlug: selectedCategory,
                    year: new Date().getFullYear(),
                });

                setPhotoPreview("");
            }

            setPhoto(null);
            setPreviewError(false);
            setFormError("");

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }, 0);

        return () => window.clearTimeout(timer);
    }, [open, achiever, selectedCategory]);

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = "";
            }
        };
    }, []);

    const releasePreviousPreview = () => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = "";
        }
    };

    if (!open) return null;

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0];

        console.log("Photo input fired:", file);

        if (!file) {
            console.log("No file selected");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setFormError("Only image files are allowed.");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setFormError("Image size must be less than 5 MB.");
            event.target.value = "";
            return;
        }

        try {
            releasePreviousPreview();

            const previewUrl = URL.createObjectURL(file);

            previewUrlRef.current = previewUrl;

            setPhoto(file);
            setPhotoPreview(previewUrl);
            setPreviewError(false);
            setFormError("");

            console.log("Selected photo:", file.name);
            console.log("Preview URL:", previewUrl);
        } catch (error) {
            console.error("Photo preview error:", error);
            setFormError("Photo preview could not be created. Please try again.");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");

        console.log("Submitting photo:", photo);

        if (!form.name.trim()) {
            setFormError("Student name is required.");
            return;
        }

        if (!form.examName.trim()) {
            setFormError("Exam name is required.");
            return;
        }

        if (!achiever && !photo) {
            setFormError("Please select a photo for the new student.");
            return;
        }

        if (categories.length === 0) {
            setFormError("Please create an active category first.");
            return;
        }

        if (!form.categorySlug) {
            setFormError("Please select a category.");
            return;
        }

        const year = Number(form.year);
        const displayOrder = Number(form.displayOrder);

        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            setFormError("Please enter a valid year.");
            return;
        }

        if (
            !Number.isInteger(displayOrder) ||
            displayOrder < 0 ||
            displayOrder > 100000
        ) {
            setFormError("Please enter a valid display order.");
            return;
        }

        const formData = new FormData();

        formData.append("name", form.name.trim());
        formData.append("fatherName", form.fatherName.trim());
        formData.append("gender", form.gender);
        formData.append("address", form.address.trim());
        formData.append("categorySlug", form.categorySlug);
        formData.append("examName", form.examName.trim());
        formData.append("year", String(year));
        formData.append("batch", form.batch);
        formData.append("isPublished", String(form.isPublished));
        formData.append("displayOrder", String(displayOrder));

        if (photo) {
            formData.append("photo", photo);
        }

        try {
            await onSubmit(formData, form);
        } catch (error) {
            console.error("Achiever submit error:", error);
            setFormError(
                error?.message || "Achiever could not be saved."
            );
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-6"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !saving
                ) {
                    onClose();
                }
            }}
        >
            <div className="my-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between bg-gradient-to-r from-[#0f1f4a] to-[#1d3774] px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-white/10 p-2.5 text-[#fbbf24]">
                            <UserRound size={22} />
                        </div>

                        <div>
                            <h2 className="font-bold text-white">
                                {achiever
                                    ? "Edit Achiever"
                                    : "Add Achiever"}
                            </h2>
                            <p className="mt-1 text-xs text-blue-100">
                                Student profile and achievement details
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg p-2 text-white transition hover:bg-white/10 disabled:opacity-50"
                        aria-label="Close form"
                    >
                        <X size={21} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="max-h-[calc(100vh-190px)] space-y-5 overflow-y-auto bg-[#F5F7FA] p-5 sm:p-6">
                        <section className="rounded-2xl border border-[#C8D5EA]/70 bg-white p-5 shadow-[0_8px_32px_rgba(16,42,67,0.08)] sm:p-6">
                            <div className="mb-5">
                                <h3 className="text-lg font-bold text-[var(--navy)]">
                                    Basic Information
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Add the student&apos;s profile and photo.
                                </p>
                            </div>

                            <div className="mb-5">
                                <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                                    Category *
                                </label>
                                <select
                                    name="categorySlug"
                                    value={form.categorySlug}
                                    onChange={handleChange}
                                    required
                                    disabled={saving}
                                    className="w-full rounded-xl border border-[#C8D5EA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category._id}
                                            value={category.slug}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                                        Student Photo {!achiever && "*"}
                                    </label>
                                    <div className="rounded-2xl border-2 border-dashed border-[#C8D5EA] bg-[#F8FAFF] p-4 transition hover:border-[#3869D0]">
                                        <div className="flex flex-col items-center">
                                            {photoPreview && !previewError ? (
                                                <img
                                                    key={photoPreview}
                                                    src={photoPreview}
                                                    alt="Student photo preview"
                                                    onLoad={() => setPreviewError(false)}
                                                    onError={() => setPreviewError(true)}
                                                    className="mb-3 h-36 w-36 rounded-xl border border-[#C8D5EA] bg-white object-cover"
                                                />
                                            ) : (
                                                <div className="mb-3 flex h-36 w-36 flex-col items-center justify-center rounded-xl border border-[#C8D5EA] bg-white text-slate-400">
                                                    <ImageIcon size={38} />
                                                    {previewError && (
                                                        <span className="mt-2 px-2 text-center text-xs text-red-600">
                                                            Preview failed to load
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <input
                                                ref={fileInputRef}
                                                id="achiever-photo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                disabled={saving}
                                                className="sr-only"
                                            />
                                            <label
                                                htmlFor="achiever-photo"
                                                className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#3869D0]/10 px-4 py-2 text-sm font-semibold text-[#3869D0] transition hover:bg-[#3869D0]/15"
                                            >
                                                <Upload size={17} />
                                                {photoPreview ? "Change Photo" : "Choose Photo"}
                                            </label>
                                            <span className="mt-2 text-center text-xs text-slate-500">
                                                Image file, maximum 5 MB
                                            </span>
                                            {photo && (
                                                <p className="mt-2 max-w-full break-all text-center text-xs font-medium text-slate-700">
                                                    Selected: {photo.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid content-start gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                                            Student Name *
                                        </label>
                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            maxLength={100}
                                            placeholder="Enter student name"
                                            className="w-full rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                                            Father&apos;s Name
                                        </label>
                                        <input
                                            name="fatherName"
                                            value={form.fatherName}
                                            onChange={handleChange}
                                            maxLength={100}
                                            placeholder="Enter father's name"
                                            className="w-full rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                                            Gender
                                        </label>
                                        <select
                                            name="gender"
                                            value={form.gender}
                                            onChange={handleChange}
                                            disabled={saving}
                                            className="w-full rounded-xl border border-[#C8D5EA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                                        >
                                            <option value="male">Male (S/o)</option>
                                            <option value="female">Female (D/o)</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                                            Address
                                        </label>
                                        <textarea
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            rows={3}
                                            maxLength={500}
                                            placeholder="Village, city, state"
                                            className="w-full resize-y rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-[#C8D5EA]/70 bg-white p-5 shadow-[0_8px_32px_rgba(16,42,67,0.08)] sm:p-6">
                            <div className="mb-5">
                                <h3 className="text-lg font-bold text-[var(--navy)]">
                                    Achievement Details
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Enter the exam, batch, and display settings.
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                                        Exam Name *
                                    </label>
                                    <input
                                        name="examName"
                                        value={form.examName}
                                        onChange={handleChange}
                                        required
                                        maxLength={100}
                                        placeholder="e.g. Navy SSR"
                                        className="w-full rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                                        Year *
                                    </label>
                                    <input
                                        type="number"
                                        name="year"
                                        value={form.year}
                                        onChange={handleChange}
                                        min={2000}
                                        max={2100}
                                        required
                                        className="w-full rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                                        Batch *
                                    </label>
                                    <select
                                        name="batch"
                                        value={form.batch}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-[#C8D5EA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                                    >
                                        <option value="foundation">Foundation</option>
                                        <option value="target">Target</option>
                                        <option value="null">Null</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        name="displayOrder"
                                        value={form.displayOrder}
                                        onChange={handleChange}
                                        min={0}
                                        max={100000}
                                        className="w-full rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none transition focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10 disabled:bg-gray-100"
                                    />
                                    <p className="mt-1.5 text-xs text-slate-500">
                                        Higher numbers will appear first (sabse bada number sabse pehle aayega).
                                    </p>
                                </div>
                            </div>
                        </section>

                        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#C8D5EA]/70 bg-white p-5 shadow-[0_8px_32px_rgba(16,42,67,0.08)] sm:p-6">
                            <input
                                type="checkbox"
                                name="isPublished"
                                checked={form.isPublished}
                                onChange={handleChange}
                                className="mt-0.5 h-4 w-4 accent-[#3869D0]"
                            />
                            <span>
                                <span className="block text-sm font-semibold text-[var(--navy)]">
                                    Publish Achiever
                                </span>
                                <span className="mt-1 block text-xs leading-5 text-slate-500">
                                    Published students can appear on the public website.
                                </span>
                            </span>
                        </label>

                        {formError && (
                            <p
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                            >
                                {formError}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-[#C8D5EA] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl border border-[#C8D5EA] bg-white px-5 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#F8FAFF] disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-[var(--navy)] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1d3774] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving
                                ? "Saving..."
                                : achiever
                                  ? "Save Changes"
                                  : "Add Achiever"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
