"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    Plus,
    Trash2,
    Pencil,
    Eye,
    ArrowLeft,
    Upload,
    X,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    FolderOpen,
    Sparkles,
    ArrowUp,
    ArrowDown,
    GripVertical,
    RefreshCw,
} from "lucide-react";

import { AuthContext } from "@/context/AuthContext";

import {
    getGallery,
    createGallery,
    updateGallery,
    deleteGallery,
    getGalleryCategories,
    createGalleryCategory,
    updateGalleryCategory,
    updateGalleryCategoryStatus,
    deleteGalleryCategory,
    reorderGalleryCategories,
} from "@/services/galleryService";

import DeleteConfirmModal from "@/component/common/DeleteConfirmModal";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];

const glass =
    "rounded-2xl border border-[#C8D5EA]/70 bg-white/70 shadow-[0_8px_32px_rgba(16,42,67,0.10)] backdrop-blur-xl";

const glassModal =
    "rounded-3xl border border-[#C8D5EA]/70 bg-white/90 shadow-[0_20px_60px_rgba(16,42,67,0.20)] backdrop-blur-2xl";

const inputClass =
    "w-full rounded-xl border border-[#C8D5EA] bg-white/70 px-3.5 py-2.5 text-sm text-[var(--navy)] outline-none backdrop-blur-md transition placeholder:text-[var(--muted)] focus:border-[#3869D0]/50 focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10";

export default function GalleryPage() {
    const { user } = useContext(AuthContext);

    const canManageGalleryCategories =
        ["superAdmin", "admin"].includes(user?.role);

    const [categories, setCategories] =
        useState([]);

    const [reordering, setReordering] =
        useState(false);

    const [draggedCategoryIndex, setDraggedCategoryIndex] =
        useState(null);

    const [categoryLoading, setCategoryLoading] =
        useState(true);

    const [categoryError, setCategoryError] =
        useState("");

    const [categoryPreviews, setCategoryPreviews] =
        useState({});

    const [previewLoading, setPreviewLoading] =
        useState(false);

    const [selectedCategory, setSelectedCategory] =
        useState(null);

    const [gallery, setGallery] =
        useState([]);

    const [pagination, setPagination] =
        useState({
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
        });

    const [galleryLoading, setGalleryLoading] =
        useState(false);

    const [galleryError, setGalleryError] =
        useState("");

    const [showUploadModal, setShowUploadModal] =
        useState(false);

    const [uploadForm, setUploadForm] =
        useState({
            title: "",
            description: "",
            category: "",
            alt: "",
            images: [],
        });

    const [uploadLoading, setUploadLoading] =
        useState(false);

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [editForm, setEditForm] =
        useState({
            id: "",
            title: "",
            description: "",
            category: "",
            alt: "",
            image: null,
        });

    const [editLoading, setEditLoading] =
        useState(false);

    const [viewImage, setViewImage] =
        useState(null);

    const [showCategoryModal, setShowCategoryModal] =
        useState(false);

    const [editingCategory, setEditingCategory] =
        useState(null);

    const [categoryName, setCategoryName] =
        useState("");

    const [categorySaving, setCategorySaving] =
        useState(false);

    // Delete states

    const [deleteImageTarget, setDeleteImageTarget] =
        useState(null);

    const [deletingImageId, setDeletingImageId] =
        useState(null);

    const [deleteCategoryTarget, setDeleteCategoryTarget] =
        useState(null);

    const [deletingCategoryId, setDeletingCategoryId] =
        useState(null);

    const [refreshing, setRefreshing] = useState(false);

    const fetchCategories = async () => {
        try {
            setCategoryLoading(true);
            setCategoryError("");

            const response =
                await getGalleryCategories();

            setCategories(
                response?.data || []
            );
        } catch (error) {
            setCategoryError(
                error.message ||
                    "Failed to fetch categories"
            );
        } finally {
            setCategoryLoading(false);
        }
    };

    const fetchCategoryPreviews = useCallback(async () => {
        const activeCategories =
            categories.filter(
                (category) =>
                    category.isActive
            );

        if (!activeCategories.length) {
            setCategoryPreviews({});
            return;
        }

        try {
            setPreviewLoading(true);

            const results =
                await Promise.all(
                    activeCategories.map(
                        async (category) => {
                            const response =
                                await getGallery({
                                    category:
                                        category._id,
                                    page: 1,
                                    limit: 4,
                                });

                            return {
                                categoryId:
                                    category._id,
                                images:
                                    response?.data ||
                                    [],
                            };
                        }
                    )
                );

            const previewMap = {};

            results.forEach((item) => {
                previewMap[
                    item.categoryId
                ] = item.images;
            });

            setCategoryPreviews(
                previewMap
            );
        } catch (error) {
            toast.error(
                error.message ||
                    "Failed to load gallery previews"
            );
        } finally {
            setPreviewLoading(false);
        }
    }, [categories]);

    const fetchSelectedCategory = async (
        category,
        page = 1
    ) => {
        try {
            setGalleryLoading(true);
            setGalleryError("");

            const response =
                await getGallery({
                    category:
                        category._id,
                    page,
                    limit: 12,
                });

            setGallery(
                response?.data || []
            );

            setPagination(
                response?.pagination || {
                    page,
                    limit: 12,
                    total: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                }
            );
        } catch (error) {
            setGalleryError(
                error.message ||
                    "Failed to load gallery"
            );
        } finally {
            setGalleryLoading(false);
        }
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchCategories();
        }, 0);

        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!categoryLoading) {
            const timer = window.setTimeout(() => {
                void fetchCategoryPreviews();
            }, 0);

            return () => window.clearTimeout(timer);
        }
    }, [categoryLoading, fetchCategoryPreviews]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            if (selectedCategory) {
                await Promise.all([
                    fetchCategories(),
                    fetchSelectedCategory(
                        selectedCategory,
                        pagination.page || 1
                    ),
                ]);
            } else {
                const response = await getGalleryCategories();
                const fetchedCats = response?.data || [];
                setCategories(fetchedCats);
                const activeCategories = fetchedCats.filter((c) => c.isActive);
                if (activeCategories.length) {
                    const results = await Promise.all(
                        activeCategories.map(async (category) => {
                            const res = await getGallery({
                                category: category._id,
                                page: 1,
                                limit: 4,
                            });
                            return {
                                categoryId: category._id,
                                images: res?.data || [],
                            };
                        })
                    );
                    const previewMap = {};
                    results.forEach((item) => {
                        previewMap[item.categoryId] = item.images;
                    });
                    setCategoryPreviews(previewMap);
                } else {
                    setCategoryPreviews({});
                }
            }
            toast.success("Gallery refreshed successfully.");
        } catch (error) {
            toast.error(error?.message || "Failed to refresh gallery.");
        } finally {
            setRefreshing(false);
        }
    };

    const showSuccess = (message) => {
        toast.success(message);
    };

    const showError = (message) => {
        toast.error(message);
    };

    const validateImages = (images) => {
        if (!images.length) {
            return "Please select at least one image";
        }

        if (images.length > MAX_IMAGES) {
            return `Maximum ${MAX_IMAGES} images can be uploaded at once`;
        }

        for (const image of images) {
            if (
                !ALLOWED_IMAGE_TYPES.includes(
                    image.type
                )
            ) {
                return `${image.name} is not a supported image type`;
            }

            if (image.size > MAX_FILE_SIZE) {
                return `${image.name} must not exceed 5 MB`;
            }
        }

        return null;
    };

    const validateUploadForm = () => {
        if (!uploadForm.category) {
            return "Please select a gallery category";
        }

        if (!uploadForm.alt.trim()) {
            return "Alt text is required";
        }

        if (
            uploadForm.alt.trim().length >
            150
        ) {
            return "Alt text must not exceed 150 characters";
        }

        if (
            uploadForm.title.trim().length >
            100
        ) {
            return "Title must not exceed 100 characters";
        }

        if (
            uploadForm.description.trim().length >
            500
        ) {
            return "Description must not exceed 500 characters";
        }

        return validateImages(
            uploadForm.images
        );
    };

    const handleImageSelect = (event) => {
        const files =
            Array.from(
                event.target.files || []
            );

        const validationError =
            validateImages(files);

        if (validationError) {
            showError(validationError);
            event.target.value = "";
            return;
        }

        setUploadForm((previous) => ({
            ...previous,
            images: files,
        }));
    };

    const handleUpload = async () => {
        const validationError =
            validateUploadForm();

        if (validationError) {
            showError(validationError);
            return;
        }

        try {
            setUploadLoading(true);

            await createGallery({
                title: uploadForm.title,
                description:
                    uploadForm.description,
                category:
                    uploadForm.category,
                alt: uploadForm.alt,
                images:
                    uploadForm.images,
            });

            setUploadForm({
                title: "",
                description: "",
                category: "",
                alt: "",
                images: [],
            });

            setShowUploadModal(false);

            await fetchCategories();

            if (selectedCategory) {
                await fetchSelectedCategory(
                    selectedCategory,
                    pagination.page
                );
            }

            showSuccess(
                "Gallery images uploaded successfully"
            );
        } catch (error) {
            showError(
                error.message ||
                    "Failed to upload gallery images"
            );
        } finally {
            setUploadLoading(false);
        }
    };

    const handleOpenCategory = async (
        category
    ) => {
        setSelectedCategory(category);

        await fetchSelectedCategory(
            category,
            1
        );
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setGallery([]);
        setGalleryError("");
    };

    const handleOpenEdit = (image) => {
        setEditForm({
            id: image._id,
            title: image.title || "",
            description:
                image.description || "",
            category:
                image.category?._id ||
                image.category ||
                "",
            alt: image.alt || "",
            image: null,
        });

        setShowEditModal(true);
    };

    const handleEditImageSelect = (
        event
    ) => {
        const image =
            event.target.files?.[0];

        if (!image) {
            return;
        }

        const validationError =
            validateImages([image]);

        if (validationError) {
            showError(validationError);
            event.target.value = "";
            return;
        }

        setEditForm((previous) => ({
            ...previous,
            image,
        }));
    };

    const validateEditForm = () => {
        if (!editForm.category) {
            return "Please select a gallery category";
        }

        if (
            editForm.title.trim().length >
            100
        ) {
            return "Title must not exceed 100 characters";
        }

        if (
            editForm.description.trim().length >
            500
        ) {
            return "Description must not exceed 500 characters";
        }

        if (
            editForm.alt.trim().length >
            150
        ) {
            return "Alt text must not exceed 150 characters";
        }

        if (editForm.image) {
            return validateImages([
                editForm.image,
            ]);
        }

        return null;
    };

    const handleUpdate = async () => {
        const validationError =
            validateEditForm();

        if (validationError) {
            showError(validationError);
            return;
        }

        try {
            setEditLoading(true);

            await updateGallery({
                id: editForm.id,
                title: editForm.title,
                description:
                    editForm.description,
                category:
                    editForm.category,
                alt: editForm.alt,
                image: editForm.image,
            });

            setShowEditModal(false);

            if (selectedCategory) {
                await fetchSelectedCategory(
                    selectedCategory,
                    pagination.page
                );
            }

            await fetchCategories();

            showSuccess(
                "Gallery image updated successfully"
            );
        } catch (error) {
            showError(
                error.message ||
                    "Failed to update gallery image"
            );
        } finally {
            setEditLoading(false);
        }
    };

    // Open image delete confirmation

    const requestDeleteImage = (
        image
    ) => {
        if (
            !image?._id ||
            deletingImageId ||
            deletingCategoryId
        ) {
            return;
        }

        setDeleteImageTarget(image);
    };

    // Delete gallery image

    const handleDeleteImage = async () => {
        const id =
            deleteImageTarget?._id;

        if (
            !id ||
            deletingImageId
        ) {
            return;
        }

        try {
            setDeletingImageId(id);

            await deleteGallery(id);

            setDeleteImageTarget(null);

            if (selectedCategory) {
                const currentPage =
                    pagination.page;

                const isLastImageOnPage =
                    gallery.length === 1;

                const nextPage =
                    isLastImageOnPage &&
                    currentPage > 1
                        ? currentPage - 1
                        : currentPage;

                await fetchSelectedCategory(
                    selectedCategory,
                    nextPage
                );
            }

            await fetchCategories();

            showSuccess(
                "Gallery image deleted successfully"
            );
        } catch (error) {
            showError(
                error.message ||
                    "Failed to delete gallery image"
            );
        } finally {
            setDeletingImageId(null);
        }
    };

    const handleOpenCreateCategory =
        () => {
            setEditingCategory(null);
            setCategoryName("");
            setShowCategoryModal(true);
        };

    const handleOpenEditCategory =
        (category) => {
            setEditingCategory(category);
            setCategoryName(
                category.name || ""
            );
            setShowCategoryModal(true);
        };

    const handleSaveCategory =
        async () => {
            const cleanName =
                categoryName.trim();

            if (!cleanName) {
                showError(
                    "Category name is required"
                );
                return;
            }

            if (cleanName.length > 100) {
                showError(
                    "Category name must not exceed 100 characters"
                );
                return;
            }

            try {
                setCategorySaving(true);

                if (editingCategory) {
                    await updateGalleryCategory(
                        editingCategory._id,
                        cleanName
                    );

                    showSuccess(
                        "Category updated successfully"
                    );
                } else {
                    await createGalleryCategory(
                        cleanName
                    );

                    showSuccess(
                        "Category created successfully"
                    );
                }

                setShowCategoryModal(false);
                setCategoryName("");
                setEditingCategory(null);

                await fetchCategories();
            } catch (error) {
                showError(
                    error.message ||
                        "Failed to save category"
                );
            } finally {
                setCategorySaving(false);
            }
        };

    const handleCategoryStatus =
        async (category) => {
            try {
                await updateGalleryCategoryStatus(
                    category._id,
                    !category.isActive
                );

                await fetchCategories();

                showSuccess(
                    `Category ${
                        category.isActive
                            ? "deactivated"
                            : "activated"
                    } successfully`
                );
            } catch (error) {
                showError(
                    error.message ||
                        "Failed to update category status"
                );
            }
        };

    // Open category delete confirmation

    const requestDeleteCategory = (
        category
    ) => {
        if (
            !category?._id ||
            deletingImageId ||
            deletingCategoryId
        ) {
            return;
        }

        setDeleteCategoryTarget(
            category
        );
    };

    // Delete gallery category

    const handleDeleteCategory =
        async () => {
            const id =
                deleteCategoryTarget?._id;

            if (
                !id ||
                deletingCategoryId
            ) {
                return;
            }

            try {
                setDeletingCategoryId(id);

                await deleteGalleryCategory(
                    id
                );

                setDeleteCategoryTarget(
                    null
                );

                if (
                    selectedCategory?._id ===
                    id
                ) {
                    setSelectedCategory(null);
                    setGallery([]);
                }

                await fetchCategories();

                showSuccess(
                    "Category deleted successfully"
                );
            } catch (error) {
                showError(
                    error.message ||
                        "Category cannot be deleted"
                );
            } finally {
                setDeletingCategoryId(null);
            }
        };

    const handlePageChange = async (
        page
    ) => {
        if (
            !selectedCategory ||
            page < 1 ||
            page > pagination.totalPages
        ) {
            return;
        }

        await fetchSelectedCategory(
            selectedCategory,
            page
        );
    };

    const handleMoveCategory = async (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= categories.length) return;

        const next = [...categories];
        const [moved] = next.splice(index, 1);
        next.splice(target, 0, moved);

        setCategories(next);
        setReordering(true);

        try {
            await reorderGalleryCategories(next.map((c) => c._id));
            toast.success("Category order updated");
        } catch (error) {
            toast.error(error?.message || "Failed to update category order");
            await fetchCategories();
        } finally {
            setReordering(false);
        }
    };

    const handleCategoryDragStart = (index) => {
        setDraggedCategoryIndex(index);
    };

    const handleCategoryDragOver = (e, index) => {
        e.preventDefault();
    };

    const handleCategoryDrop = async (dropIndex) => {
        if (
            draggedCategoryIndex === null ||
            draggedCategoryIndex === dropIndex
        ) {
            setDraggedCategoryIndex(null);
            return;
        }

        const next = [...categories];
        const [moved] = next.splice(draggedCategoryIndex, 1);
        next.splice(dropIndex, 0, moved);

        setCategories(next);
        setDraggedCategoryIndex(null);
        setReordering(true);

        try {
            await reorderGalleryCategories(next.map((c) => c._id));
            toast.success("Category order updated");
        } catch (error) {
            toast.error(error?.message || "Failed to update category order");
            await fetchCategories();
        } finally {
            setReordering(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#F2F6FF] px-4 pb-10 pt-20 md:px-6 lg:pt-8">

            <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#3869D0]/10 blur-3xl" />

            <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[#B8C9F5]/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-[var(--gold)]/5 blur-3xl" />

            <div className="relative mx-auto max-w-7xl">

                {/* Header */}

                <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/70 bg-[var(--navy)] px-6 py-8 text-white shadow-[0_18px_50px_rgba(16,42,67,0.16)] backdrop-blur-xl sm:px-10">

                    <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[#3869D0]/20 blur-3xl" />

                    <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

                        <div>

                            <h1 className="cinzel text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                                Gallery
                            </h1>

                            <p className="mt-2 text-sm text-white/70">
                                Manage academy gallery images and categories.
                            </p>

                        </div>

                        <div className="flex flex-wrap items-center gap-3">

                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={refreshing || categoryLoading || galleryLoading || previewLoading}
                                aria-label="Refresh gallery"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    size={16}
                                    className={refreshing || categoryLoading || galleryLoading || previewLoading ? "animate-spin" : ""}
                                />
                                Refresh
                            </button>

                            {canManageGalleryCategories && (
                                <button
                                    onClick={
                                        handleOpenCreateCategory
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                                >
                                    <Plus size={16} />
                                    Add Category
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    setUploadForm({
                                        title: "",
                                        description: "",
                                        category:
                                            selectedCategory?._id ||
                                            "",
                                        alt: "",
                                        images: [],
                                    });

                                    setShowUploadModal(
                                        true
                                    );
                                }}
                                className="inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a98134]"
                            >
                                <Upload size={16} />
                                Add Images
                            </button>

                        </div>

                    </div>

                </div>

                {/* Manage Gallery Categories (Top Placement) */}
                {canManageGalleryCategories && (
                    <details
                        id="gallery-categories"
                        className="mb-6 rounded-2xl border border-[#C8D5EA]/70 bg-white/70 p-5 shadow-[0_8px_32px_rgba(16,42,67,0.10)] backdrop-blur-xl sm:p-6"
                    >
                        <summary className="cursor-pointer text-lg font-bold text-[var(--navy)] marker:text-[#3869D0]">
                            Manage gallery categories
                        </summary>

                        <div className="mt-5">
                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-[var(--muted)]">
                                    Reorder categories with buttons or drag and drop. Changes update across admin and frontend immediately.
                                </p>
                                <button
                                    onClick={handleOpenCreateCategory}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#3869D0] px-3.5 py-2 text-sm font-bold text-white shadow-lg shadow-[#3869D0]/20 transition hover:-translate-y-0.5 hover:bg-[#2f5dbd] w-fit"
                                >
                                    <Plus size={16} />
                                    Add Category
                                </button>
                            </div>

                            <div className="space-y-3">
                                {categories.map((category, index) => (
                                    <div
                                        key={category._id}
                                        draggable
                                        onDragStart={() => handleCategoryDragStart(index)}
                                        onDragOver={(e) => handleCategoryDragOver(e, index)}
                                        onDrop={() => handleCategoryDrop(index)}
                                        className={`flex flex-col gap-3 rounded-xl border border-[#C8D5EA] bg-white/60 p-4 backdrop-blur-md transition hover:bg-white sm:flex-row sm:items-center sm:justify-between ${
                                            draggedCategoryIndex === index ? "opacity-50 border-dashed border-[#3869D0]" : ""
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
                                                <FolderOpen size={16} />
                                            </span>

                                            <div>
                                                <p className="font-semibold text-[var(--navy)]">
                                                    {category.name}
                                                </p>
                                                <p className="text-xs text-[var(--muted)]">
                                                    {category.slug}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveCategory(index, -1)}
                                                    disabled={index === 0 || reordering}
                                                    title="Move up"
                                                    className="rounded-lg p-1.5 text-slate-500 hover:bg-[#E7EEFA] hover:text-[#3869D0] disabled:opacity-30 disabled:hover:bg-transparent"
                                                >
                                                    <ArrowUp size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveCategory(index, 1)}
                                                    disabled={index === categories.length - 1 || reordering}
                                                    title="Move down"
                                                    className="rounded-lg p-1.5 text-slate-500 hover:bg-[#E7EEFA] hover:text-[#3869D0] disabled:opacity-30 disabled:hover:bg-transparent"
                                                >
                                                    <ArrowDown size={16} />
                                                </button>
                                            </div>

                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                                                    category.isActive
                                                        ? "border-[#3869D0]/20 bg-[#3869D0]/10 text-[#3869D0]"
                                                        : "border-[#C8D5EA] bg-[#E7EEFA] text-[var(--muted)]"
                                                }`}
                                            >
                                                {category.isActive ? "Active" : "Inactive"}
                                            </span>

                                            <button
                                                onClick={() => handleCategoryStatus(category)}
                                                className="rounded-xl border border-[#C8D5EA] bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#40556B] backdrop-blur-md transition hover:bg-white hover:text-[var(--navy)]"
                                            >
                                                {category.isActive ? "Deactivate" : "Activate"}
                                            </button>

                                            <button
                                                onClick={() => handleOpenEditCategory(category)}
                                                className="rounded-xl border border-[#C8D5EA] bg-white/60 p-2 text-[#3869D0] backdrop-blur-md transition hover:bg-[#3869D0] hover:text-white"
                                                title="Edit category"
                                            >
                                                <Pencil size={15} />
                                            </button>

                                            <button
                                                onClick={() => requestDeleteCategory(category)}
                                                disabled={deletingCategoryId === category._id}
                                                className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-500 backdrop-blur-md transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                title="Delete category"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </details>
                )}

                {/* Selected Category */}

                {selectedCategory ? (

                    <div>

                        <button
                            onClick={
                                handleBackToCategories
                            }
                            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#3869D0] transition hover:text-[#8A6820]"
                        >
                            <ArrowLeft size={16} />
                            Back to Categories
                        </button>

                        <div
                            className={`${glass} mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between`}
                        >

                            <div>

                                <h2 className="text-xl font-bold text-[var(--navy)]">
                                    {selectedCategory.name}
                                </h2>

                                <p className="text-sm text-[var(--muted)]">
                                    {pagination.total} images
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={refreshing || galleryLoading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#C8D5EA] bg-white/60 px-4 py-2 text-sm font-semibold text-[var(--navy)] backdrop-blur-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 w-fit"
                            >
                                <RefreshCw
                                    size={15}
                                    className={refreshing || galleryLoading ? "animate-spin" : ""}
                                />
                                Refresh Images
                            </button>

                        </div>

                        {galleryLoading ? (

                            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                                {Array.from({
                                    length: 8,
                                }).map(
                                    (_, index) => (
                                        <div
                                            key={index}
                                            className={`h-72 animate-pulse ${glass}`}
                                        />
                                    )
                                )}

                            </div>

                        ) : galleryError ? (

                            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/80 p-6 text-center text-red-700 backdrop-blur-xl">
                                {galleryError}
                            </div>

                        ) : gallery.length === 0 ? (

                            <div
                                className={`${glass} mt-6 flex flex-col items-center justify-center border-dashed p-12 text-center`}
                            >

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3869D0]/10 text-[#3869D0]">
                                    <ImageIcon size={26} />
                                </div>

                                <p className="mt-4 text-[var(--muted)]">
                                    No images found in
                                    this category.
                                </p>

                            </div>

                        ) : (

                            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                                {gallery.map(
                                    (image) => (

                                        <div
                                            key={image._id}
                                            className={`overflow-hidden p-3 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/90 ${glass}`}
                                        >

                                            <div className="group relative aspect-square overflow-hidden rounded-xl bg-[#E7EEFA]">

                                                <img
                                                    src={
                                                        image.imageUrl
                                                    }
                                                    alt={
                                                        image.alt ||
                                                        image.title ||
                                                        "Gallery image"
                                                    }
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                                />

                                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[var(--navy)]/0 opacity-100 transition group-hover:bg-[var(--navy)]/40 sm:opacity-0 sm:group-hover:opacity-100">

                                                    <button
                                                        onClick={() =>
                                                            setViewImage(
                                                                image
                                                            )
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/50 bg-white/40 text-white backdrop-blur-md transition hover:bg-white hover:text-[var(--navy)]"
                                                        title="View"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleOpenEdit(
                                                                image
                                                            )
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/50 bg-white/40 text-white backdrop-blur-md transition hover:bg-white hover:text-[var(--navy)]"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            requestDeleteImage(
                                                                image
                                                            )
                                                        }
                                                        disabled={
                                                            deletingImageId ===
                                                            image._id
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/50 bg-white/40 text-white backdrop-blur-md transition hover:bg-red-500/90 disabled:cursor-not-allowed disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>

                                                </div>

                                            </div>

                                            <div className="px-1 pb-1 pt-4">

                                                <h3 className="truncate font-bold text-[var(--navy)]">
                                                    {image.title ||
                                                        "Untitled"}
                                                </h3>

                                                {image.description && (
                                                    <p className="mt-1 line-clamp-2 text-sm text-[#526579]">
                                                        {image.description}
                                                    </p>
                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                        {pagination.totalPages >
                            1 && (

                            <div
                                className={`${glass} mt-6 flex items-center justify-center gap-3 px-4 py-3`}
                            >

                                <button
                                    disabled={
                                        !pagination.hasPreviousPage
                                    }
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.page -
                                                1
                                        )
                                    }
                                    className="rounded-xl border border-[#C8D5EA] bg-white/60 p-2 text-[#40556B] backdrop-blur-md transition hover:bg-white hover:text-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft
                                        size={17}
                                    />
                                </button>

                                <span className="rounded-xl bg-[#3869D0] px-3 py-2 text-sm font-semibold text-white shadow-md shadow-[#3869D0]/20">
                                    Page{" "}
                                    {pagination.page}{" "}
                                    of{" "}
                                    {
                                        pagination.totalPages
                                    }
                                </span>

                                <button
                                    disabled={
                                        !pagination.hasNextPage
                                    }
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.page +
                                                1
                                        )
                                    }
                                    className="rounded-xl border border-[#C8D5EA] bg-white/60 p-2 text-[#40556B] backdrop-blur-md transition hover:bg-white hover:text-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronRight
                                        size={17}
                                    />
                                </button>

                            </div>
                        )}

                    </div>

                ) : (

                    <div>

                        {categoryLoading ? (

                            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

                                {Array.from({
                                    length: 6,
                                }).map(
                                    (_, index) => (
                                        <div
                                            key={index}
                                            className={`h-80 animate-pulse ${glass}`}
                                        />
                                    )
                                )}

                            </div>

                        ) : categoryError ? (

                            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/80 p-6 text-center text-red-700 backdrop-blur-xl">
                                {categoryError}
                            </div>

                        ) : categories.filter(
                            (category) =>
                                category.isActive
                        ).length === 0 ? (

                            <div
                                className={`${glass} mt-6 flex flex-col items-center justify-center border-dashed p-12 text-center`}
                            >

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3869D0]/10 text-[#3869D0]">
                                    <ImageIcon size={26} />
                                </div>

                                <p className="mt-4 text-[var(--muted)]">
                                    No active gallery
                                    categories found.
                                </p>

                            </div>

                        ) : (

                            <div className="mt-6 space-y-6">

                                {categories
                                    .filter(
                                        (category) =>
                                            category.isActive
                                    )
                                    .map(
                                        (category) => {

                                            const images =
                                                categoryPreviews[
                                                    category._id
                                                ] || [];

                                            return (
                                                <section
                                                    key={
                                                        category._id
                                                    }
                                                    className={`${glass} p-4 md:p-6`}
                                                >

                                                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                                        <div className="flex items-center gap-3">

                                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3869D0]/10 text-[#3869D0]">
                                                                <FolderOpen size={18} />
                                                            </span>

                                                            <div>

                                                                <h2 className="text-xl font-bold text-[var(--navy)]">
                                                                    {
                                                                        category.name
                                                                    }
                                                                </h2>

                                                                <p className="text-sm text-[var(--muted)]">
                                                                    Gallery
                                                                </p>

                                                            </div>

                                                        </div>

                                                        <button
                                                            onClick={() =>
                                                                handleOpenCategory(
                                                                    category
                                                                )
                                                            }
                                                            className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#3869D0] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#3869D0]/20 transition hover:-translate-y-0.5 hover:bg-[#2f5dbd]"
                                                        >
                                                            View All
                                                        </button>

                                                    </div>

                                                    {previewLoading ? (

                                                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

                                                            {Array.from({
                                                                length: 4,
                                                            }).map(
                                                                (
                                                                    _,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="aspect-square animate-pulse rounded-xl bg-white/60"
                                                                    />
                                                                )
                                                            )}

                                                        </div>

                                                    ) : images.length ===
                                                      0 ? (

                                                        <div className="rounded-xl border border-dashed border-[#C8D5EA] bg-white/40 p-8 text-center text-sm text-[var(--muted)] backdrop-blur-md">
                                                            No images in
                                                            this category.
                                                        </div>

                                                    ) : (

                                                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

                                                            {images.map(
                                                                (
                                                                    image
                                                                ) => (
                                                                    <button
                                                                        key={
                                                                            image._id
                                                                        }
                                                                        onClick={() =>
                                                                            handleOpenCategory(
                                                                                category
                                                                            )
                                                                        }
                                                                        className="group relative aspect-square overflow-hidden rounded-xl border border-[#C8D5EA] bg-white/60"
                                                                    >

                                                                        <img
                                                                            src={
                                                                                image.imageUrl
                                                                            }
                                                                            alt={
                                                                                image.alt ||
                                                                                "Gallery image"
                                                                            }
                                                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                                                        />

                                                                    </button>
                                                                )
                                                            )}

                                                        </div>

                                                    )}

                                                </section>
                                            );
                                        }
                                    )}

                            </div>
                        )}

                    </div>
                )}

                {/* Upload Modal */}

                {showUploadModal && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy)]/45 p-4 backdrop-blur-sm">

                        <div
                            className={`${glassModal} max-h-[90vh] w-full max-w-lg overflow-y-auto p-6`}
                        >

                            <div className="mb-5 flex items-center justify-between">

                                <h2 className="text-xl font-bold text-[var(--navy)]">
                                    Add Gallery Images
                                </h2>

                                <button
                                    onClick={() =>
                                        setShowUploadModal(
                                            false
                                        )
                                    }
                                    className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[#F2F6FF] hover:text-[var(--navy)]"
                                >
                                    <X size={20} />
                                </button>

                            </div>

                            <div className="space-y-4">

                                <div>

                                    <label className="mb-1.5 block text-sm font-semibold text-[#40556B]">
                                        Title
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            uploadForm.title
                                        }
                                        onChange={(event) =>
                                            setUploadForm(
                                                (previous) => ({
                                                    ...previous,
                                                    title:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        maxLength={100}
                                        className={
                                            inputClass
                                        }
                                        placeholder="Enter image title"
                                    />

                                    <p className="mt-1 text-right text-xs text-[var(--muted)]">
                                        {
                                            uploadForm.title
                                                .length
                                        }
                                        /100
                                    </p>

                                </div>

                                <div>

                                    <label className="mb-1.5 block text-sm font-semibold text-[#40556B]">
                                        Description
                                    </label>

                                    <textarea
                                        value={
                                            uploadForm.description
                                        }
                                        onChange={(event) =>
                                            setUploadForm(
                                                (previous) => ({
                                                    ...previous,
                                                    description:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        maxLength={500}
                                        rows={4}
                                        className={`${inputClass} resize-none`}
                                        placeholder="Enter image description"
                                    />

                                    <p className="mt-1 text-right text-xs text-[var(--muted)]">
                                        {
                                            uploadForm
                                                .description
                                                .length
                                        }
                                        /500
                                    </p>

                                </div>

                                <div>

                                    <label className="mb-1.5 block text-sm font-semibold text-[#40556B]">
                                        Category *
                                    </label>

                                    <select
                                        value={
                                            uploadForm.category
                                        }
                                        onChange={(event) =>
                                            setUploadForm(
                                                (previous) => ({
                                                    ...previous,
                                                    category:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    >

                                        <option value="">
                                            Select category
                                        </option>

                                        {categories
                                            .filter(
                                                (
                                                    category
                                                ) =>
                                                    category.isActive
                                            )
                                            .map(
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

                                <div>

                                    <label className="mb-1.5 block text-sm font-semibold text-[#40556B]">
                                        Alt Text *
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            uploadForm.alt
                                        }
                                        onChange={(event) =>
                                            setUploadForm(
                                                (previous) => ({
                                                    ...previous,
                                                    alt:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        maxLength={150}
                                        className={
                                            inputClass
                                        }
                                        placeholder="Describe the image for accessibility"
                                    />

                                    <p className="mt-1 text-right text-xs text-[var(--muted)]">
                                        {
                                            uploadForm.alt
                                                .length
                                        }
                                        /150
                                    </p>

                                </div>

                                <div>

                                    <label className="mb-1.5 block text-sm font-semibold text-[#40556B]">
                                        Images *
                                    </label>

                                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#3869D0]/30 bg-[#F2F6FF]/70 p-6 backdrop-blur-md transition hover:border-[#3869D0]/60 hover:bg-[#E7EEFA]">

                                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#3869D0]/10 text-[#3869D0]">
                                            <Upload size={18} />
                                        </div>

                                        <span className="text-sm font-semibold text-[#40556B]">
                                            Click to select images
                                        </span>

                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
                                            multiple
                                            onChange={
                                                handleImageSelect
                                            }
                                            className="hidden"
                                        />

                                    </label>

                                    <p className="mt-2 text-xs text-[var(--muted)]">
                                        JPG, PNG, WebP or
                                        AVIF · Max 5 MB
                                        each · Maximum 10
                                        images
                                    </p>

                                    {uploadForm.images
                                        .length >
                                        0 && (
                                        <p className="mt-2 text-sm font-semibold text-[#3869D0]">
                                            {
                                                uploadForm
                                                    .images
                                                    .length
                                            }{" "}
                                            image(s)
                                            selected
                                        </p>
                                    )}

                                </div>

                                <div className="flex justify-end gap-3 pt-3">

                                    <button
                                        onClick={() =>
                                            setShowUploadModal(
                                                false
                                            )
                                        }
                                        disabled={
                                            uploadLoading
                                        }
                                        className="rounded-xl border border-[#C8D5EA] bg-white/60 px-4 py-2.5 text-sm font-semibold text-[#40556B] backdrop-blur-md transition hover:bg-white"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={
                                            handleUpload
                                        }
                                        disabled={
                                            uploadLoading
                                        }
                                        className="rounded-xl bg-[var(--gold)] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#a98134] disabled:opacity-50"
                                    >
                                        {uploadLoading
                                            ? "Uploading..."
                                            : "Upload"}
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                )}

                {/* Edit Modal */}

                {showEditModal && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy)]/45 p-4 backdrop-blur-sm">

                        <div
                            className={`${glassModal} max-h-[90vh] w-full max-w-lg overflow-y-auto p-6`}
                        >

                            <div className="mb-5 flex items-center justify-between">

                                <h2 className="text-xl font-bold text-[var(--navy)]">
                                    Edit Gallery Image
                                </h2>

                                <button
                                    onClick={() =>
                                        setShowEditModal(
                                            false
                                        )
                                    }
                                    className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[#F2F6FF] hover:text-[var(--navy)]"
                                >
                                    <X size={20} />
                                </button>

                            </div>

                            <div className="space-y-4">

                                <div>

                                    <label className="mb-1.5 block text-sm font-semibold text-[#40556B]">
                                        Title
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            editForm.title
                                        }
                                        maxLength={100}
                                        onChange={(event) =>
                                            setEditForm(
                                                (previous) => ({
                                                    ...previous,
                                                    title:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />

                                </div>

                                <div>

                                    <label className="mb-1.5 block text-sm font-semibold text-[#40556B]">
                                        Description
                                    </label>

                                    <textarea
                                        value={
                                            editForm.description
                                        }
                                        maxLength={500}
                                        rows={4}
                                        onChange={(event) =>
                                            setEditForm(
                                                (previous) => ({
                                                    ...previous,
                                                    description:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        className={`${inputClass} resize-none`}
                                    />

                                </div>

                                <div>

                                    <label className="mb-1.5 block text-sm font-semibold text-[#40556B]">
                                        Category
                                    </label>

                                    <select
                                        value={
                                            editForm.category
                                        }
                                        onChange={(event) =>
                                            setEditForm(
                                                (previous) => ({
                                                    ...previous,
                                                    category:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    >

                                        <option value="">
                                            Select category
                                        </option>

                                        {categories
                                            .filter(
                                                (
                                                    category
                                                ) =>
                                                    category.isActive
                                            )
                                            .map(
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

                                <div>

                                    <label className="mb-1.5 block text-sm font-semibold text-[#40556B]">
                                        Alt Text
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            editForm.alt
                                        }
                                        maxLength={150}
                                        onChange={(event) =>
                                            setEditForm(
                                                (previous) => ({
                                                    ...previous,
                                                    alt:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />

                                </div>

                                <div>

                                    <label className="mb-1.5 block text-sm font-semibold text-[#40556B]">
                                        Replace Image
                                    </label>

                                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#3869D0]/30 bg-[#F2F6FF]/70 p-4 text-sm font-semibold text-[#40556B] backdrop-blur-md transition hover:bg-[#E7EEFA]">

                                        <Upload size={16} />

                                        Choose a new image

                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
                                            onChange={
                                                handleEditImageSelect
                                            }
                                            className="hidden"
                                        />

                                    </label>

                                    <p className="mt-2 text-xs text-[var(--muted)]">
                                        Optional · Max 5 MB
                                    </p>

                                    {editForm.image && (
                                        <p className="mt-2 text-sm font-semibold text-[#3869D0]">
                                            Selected:{" "}
                                            {
                                                editForm
                                                    .image
                                                    .name
                                            }
                                        </p>
                                    )}

                                </div>

                                <div className="flex justify-end gap-3 pt-3">

                                    <button
                                        onClick={() =>
                                            setShowEditModal(
                                                false
                                            )
                                        }
                                        disabled={
                                            editLoading
                                        }
                                        className="rounded-xl border border-[#C8D5EA] bg-white/60 px-4 py-2.5 text-sm font-semibold text-[#40556B] backdrop-blur-md transition hover:bg-white"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={
                                            handleUpdate
                                        }
                                        disabled={
                                            editLoading
                                        }
                                        className="rounded-xl bg-[#3869D0] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#3869D0]/20 transition hover:bg-[#2f5dbd] disabled:opacity-50"
                                    >
                                        {editLoading
                                            ? "Updating..."
                                            : "Update"}
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                )}

                {/* Image View */}

                {viewImage && (

                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy)]/75 p-4 backdrop-blur-md"
                        onClick={() =>
                            setViewImage(null)
                        }
                    >

                        <div
                            className={`${glassModal} relative max-h-[90vh] w-full max-w-4xl overflow-hidden`}
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >

                            <button
                                onClick={() =>
                                    setViewImage(null)
                                }
                                className="absolute right-3 top-3 z-10 rounded-xl border border-[#C8D5EA] bg-white/70 p-2 text-[var(--navy)] backdrop-blur-md hover:bg-white"
                            >
                                <X size={20} />
                            </button>

                            <div className="max-h-[65vh] bg-[var(--navy)]">

                                <img
                                    src={
                                        viewImage.imageUrl
                                    }
                                    alt={
                                        viewImage.alt ||
                                        "Gallery image"
                                    }
                                    className="mx-auto max-h-[65vh] w-auto max-w-full object-contain"
                                />

                            </div>

                            <div className="p-5">

                                <h2 className="text-xl font-bold text-[var(--navy)]">
                                    {viewImage.title ||
                                        "Untitled"}
                                </h2>

                                {viewImage.description && (
                                    <p className="mt-2 text-sm leading-6 text-[#526579]">
                                        {
                                            viewImage.description
                                        }
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>
                )}

                {/* Category Modal */}

                {showCategoryModal && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy)]/45 p-4 backdrop-blur-sm">

                        <div
                            className={`${glassModal} w-full max-w-md p-6`}
                        >

                            <div className="mb-5 flex items-center justify-between">

                                <h2 className="text-xl font-bold text-[var(--navy)]">
                                    {editingCategory
                                        ? "Edit Category"
                                        : "Add Category"}
                                </h2>

                                <button
                                    onClick={() =>
                                        setShowCategoryModal(
                                            false
                                        )
                                    }
                                    className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[#F2F6FF] hover:text-[var(--navy)]"
                                >
                                    <X size={20} />
                                </button>

                            </div>

                            <label className="mb-1.5 block text-sm font-semibold text-[#40556B]">
                                Category Name
                            </label>

                            <input
                                type="text"
                                value={categoryName}
                                maxLength={100}
                                onChange={(event) =>
                                    setCategoryName(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter category name"
                                className={
                                    inputClass
                                }
                            />

                            <p className="mt-1 text-right text-xs text-[var(--muted)]">
                                {categoryName.length}
                                /100
                            </p>

                            <div className="mt-5 flex justify-end gap-3">

                                <button
                                    onClick={() =>
                                        setShowCategoryModal(
                                            false
                                        )
                                    }
                                    disabled={
                                        categorySaving
                                    }
                                    className="rounded-xl border border-[#C8D5EA] bg-white/60 px-4 py-2.5 text-sm font-semibold text-[#40556B] backdrop-blur-md transition hover:bg-white"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={
                                        handleSaveCategory
                                    }
                                    disabled={
                                        categorySaving
                                    }
                                    className="rounded-xl bg-[#3869D0] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#3869D0]/20 transition hover:bg-[#2f5dbd] disabled:opacity-50"
                                >
                                    {categorySaving
                                        ? "Saving..."
                                        : "Save"}
                                </button>

                            </div>

                        </div>

                    </div>
                )}

                {/* Delete Image Modal */}

                <DeleteConfirmModal
                    open={
                        !!deleteImageTarget
                    }
                    title="Delete this gallery image?"
                    description="will be permanently deleted. This action cannot be undone."
                    itemName={
                        deleteImageTarget?.title ||
                        "This gallery image"
                    }
                    confirmText="Delete Image"
                    loading={
                        !!deletingImageId
                    }
                    onCancel={() =>
                        setDeleteImageTarget(
                            null
                        )
                    }
                    onConfirm={
                        handleDeleteImage
                    }
                />

                {/* Delete Category Modal */}

                <DeleteConfirmModal
                    open={
                        !!deleteCategoryTarget
                    }
                    title="Delete this category?"
                    description="will be permanently deleted. This action cannot be undone."
                    itemName={
                        deleteCategoryTarget?.name ||
                        "This category"
                    }
                    confirmText="Delete Category"
                    loading={
                        !!deletingCategoryId
                    }
                    onCancel={() =>
                        setDeleteCategoryTarget(
                            null
                        )
                    }
                    onConfirm={
                        handleDeleteCategory
                    }
                />

            </div>
        </div>
    );
}