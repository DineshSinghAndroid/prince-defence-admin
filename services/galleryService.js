import { api } from "./api";

// GALLERY

export const getGallery = async ({
    page = 1,
    limit = 12,
    category = "",
} = {}) => {
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);

    if (category) {
        params.append("category", category);
    }

    return api(`/gallery?${params.toString()}`, {
        method: "GET",
    });
};


export const createGallery = async ({
    title = "",
    description = "",
    category,
    alt,
    images = [],
}) => {
    if (!category) {
        throw new Error("Gallery category is required");
    }

    if (!alt?.trim()) {
        throw new Error("Alt text is required");
    }

    if (!Array.isArray(images) || images.length === 0) {
        throw new Error("At least one image is required");
    }

    if (images.length > 10) {
        throw new Error(
            "Maximum 10 images can be uploaded at once"
        );
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
    ];

    for (const image of images) {
        if (!allowedTypes.includes(image.type)) {
            throw new Error(
                `${image.name} is not a supported image type`
            );
        }

        if (image.size > 5 * 1024 * 1024) {
            throw new Error(
                `${image.name} must not exceed 5 MB`
            );
        }
    }

    if (title.trim().length > 100) {
        throw new Error(
            "Title must not exceed 100 characters"
        );
    }

    if (description.trim().length > 500) {
        throw new Error(
            "Description must not exceed 500 characters"
        );
    }

    if (alt.trim().length > 150) {
        throw new Error(
            "Alt text must not exceed 150 characters"
        );
    }

    const formData = new FormData();

    formData.append("title", title.trim());
    formData.append(
        "description",
        description.trim()
    );
    formData.append("category", category);
    formData.append("alt", alt.trim());

    images.forEach((image) => {
        formData.append("images", image);
    });

    return api("/gallery", {
        method: "POST",
        body: formData,
    });
};


export const updateGallery = async ({
    id,
    title = "",
    description = "",
    category,
    alt = "",
    image = null,
}) => {
    if (!id) {
        throw new Error(
            "Gallery image ID is required"
        );
    }

    if (!category) {
        throw new Error(
            "Gallery category is required"
        );
    }

    if (title.trim().length > 100) {
        throw new Error(
            "Title must not exceed 100 characters"
        );
    }

    if (description.trim().length > 500) {
        throw new Error(
            "Description must not exceed 500 characters"
        );
    }

    if (alt.trim().length > 150) {
        throw new Error(
            "Alt text must not exceed 150 characters"
        );
    }

    if (image) {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
        ];

        if (!allowedTypes.includes(image.type)) {
            throw new Error(
                `${image.name} is not a supported image type`
            );
        }

        if (image.size > 5 * 1024 * 1024) {
            throw new Error(
                `${image.name} must not exceed 5 MB`
            );
        }
    }

    const formData = new FormData();

    formData.append("title", title.trim());
    formData.append(
        "description",
        description.trim()
    );
    formData.append("category", category);
    formData.append("alt", alt.trim());

    if (image) {
        formData.append("image", image);
    }

    return api(`/gallery/${id}`, {
        method: "PUT",
        body: formData,
    });
};


export const deleteGallery = async (id) => {
    if (!id) {
        throw new Error(
            "Gallery image ID is required"
        );
    }

    return api(`/gallery/${id}`, {
        method: "DELETE",
    });
};


// GALLERY CATEGORIES

export const getGalleryCategories = async () => {
    return api("/gallery-categories", {
        method: "GET",
    });
};


export const getGalleryCategoryById = async (id) => {
    if (!id) {
        throw new Error(
            "Gallery category ID is required"
        );
    }

    return api(`/gallery-categories/${id}`, {
        method: "GET",
    });
};


export const createGalleryCategory = async (name) => {
    const cleanName = name?.trim();

    if (!cleanName) {
        throw new Error(
            "Category name is required"
        );
    }

    return api("/gallery-categories", {
        method: "POST",
        body: JSON.stringify({
            name: cleanName,
        }),
    });
};


export const updateGalleryCategory = async (
    id,
    name
) => {
    if (!id) {
        throw new Error(
            "Gallery category ID is required"
        );
    }

    const cleanName = name?.trim();

    if (!cleanName) {
        throw new Error(
            "Category name is required"
        );
    }

    return api(`/gallery-categories/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            name: cleanName,
        }),
    });
};


export const updateGalleryCategoryStatus = async (
    id,
    isActive
) => {
    if (!id) {
        throw new Error(
            "Gallery category ID is required"
        );
    }

    return api(
        `/gallery-categories/${id}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({
                isActive: Boolean(isActive),
            }),
        }
    );
};


export const deleteGalleryCategory = async (
    id
) => {
    if (!id) {
        throw new Error(
            "Gallery category ID is required"
        );
    }

    return api(`/gallery-categories/${id}`, {
        method: "DELETE",
    });
};

export const reorderGalleryCategories = async (orderedIds) => {
    return api("/gallery-categories/reorder", {
        method: "PUT",
        body: JSON.stringify({ orderedIds }),
    });
};