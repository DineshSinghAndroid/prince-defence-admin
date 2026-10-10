import { api } from "./api";

// BLOG

export const getAdminBlogs = async ({
    page = 1,
    limit = 10,
    search = "",
    category = "",
    status = "",
} = {}) => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    if (search.trim()) {
        params.append("search", search.trim());
    }

    if (category) {
        params.append("category", category);
    }

    if (status) {
        params.append("status", status);
    }

    const query = params.toString();

    return api("/blogs/admin?" + query, {
        method: "GET",
    });
};

export const getBlogById = async (id) => {
    if (!id) {
        throw new Error("Blog ID is required");
    }

    return api(`/blogs/${id}`, {
        method: "GET",
    });
};

export const createBlog = async ({
    title = "",
    slug = "",
    excerpt = "",
    category,
    status = "draft",
    featuredImage = null,
    metaTitle = "",
    metaDescription = "",
    keywords = [],
    content = [],
}) => {
    if (!title.trim()) {
        throw new Error("Blog title is required");
    }

    if (!slug.trim()) {
        throw new Error("Blog slug is required");
    }

    if (!excerpt.trim()) {
        throw new Error("Blog excerpt is required");
    }

    if (!category) {
        throw new Error("Blog category is required");
    }

    if (!Array.isArray(keywords)) {
        throw new Error("Keywords must be an array");
    }

    if (!Array.isArray(content)) {
        throw new Error("Content must be an array");
    }

    if (!["draft", "published"].includes(status)) {
        throw new Error("Invalid blog status");
    }

    if (title.trim().length > 200) {
        throw new Error(
            "Title must not exceed 200 characters"
        );
    }

    if (excerpt.trim().length > 500) {
        throw new Error(
            "Excerpt must not exceed 500 characters"
        );
    }

    if (metaTitle.trim().length > 200) {
        throw new Error(
            "Meta title must not exceed 200 characters"
        );
    }

    if (metaDescription.trim().length > 500) {
        throw new Error(
            "Meta description must not exceed 500 characters"
        );
    }

    if (featuredImage) {
        validateImage(featuredImage);
    }

    const {
        preparedContent,
        imageFiles,
    } = prepareContentForUpload(content);

    const formData = new FormData();

    formData.append(
        "title",
        title.trim()
    );

    formData.append(
        "slug",
        slug.trim()
    );

    formData.append(
        "excerpt",
        excerpt.trim()
    );

    formData.append(
        "category",
        category
    );

    formData.append(
        "status",
        status
    );

    formData.append(
        "metaTitle",
        metaTitle.trim()
    );

    formData.append(
        "metaDescription",
        metaDescription.trim()
    );

    formData.append(
        "keywords",
        JSON.stringify(keywords)
    );

    formData.append(
        "content",
        JSON.stringify(preparedContent)
    );

    if (featuredImage) {
        formData.append(
            "featuredImage",
            featuredImage
        );
    }

    imageFiles.forEach((image) => {
        formData.append(
            "contentImages",
            image.file
        );
    });

    return api("/blogs", {
        method: "POST",
        body: formData,
    });
};

export const updateBlog = async ({
    id,
    title = "",
    slug = "",
    excerpt = "",
    category,
    metaTitle = "",
    metaDescription = "",
    keywords = [],
    content,
    featuredImage = null,
}) => {
    if (!id) {
        throw new Error("Blog ID is required");
    }

    if (!title.trim()) {
        throw new Error("Blog title is required");
    }

    if (!slug.trim()) {
        throw new Error("Blog slug is required");
    }

    if (!excerpt.trim()) {
        throw new Error("Blog excerpt is required");
    }

    if (!category) {
        throw new Error("Blog category is required");
    }

    if (!Array.isArray(keywords)) {
        throw new Error("Keywords must be an array");
    }

    if (
        content !== undefined &&
        !Array.isArray(content)
    ) {
        throw new Error(
            "Content must be an array"
        );
    }

    if (title.trim().length > 200) {
        throw new Error(
            "Title must not exceed 200 characters"
        );
    }

    if (excerpt.trim().length > 500) {
        throw new Error(
            "Excerpt must not exceed 500 characters"
        );
    }

    if (metaTitle.trim().length > 200) {
        throw new Error(
            "Meta title must not exceed 200 characters"
        );
    }

    if (metaDescription.trim().length > 500) {
        throw new Error(
            "Meta description must not exceed 500 characters"
        );
    }

    if (featuredImage) {
        validateImage(featuredImage);
    }

    const formData = new FormData();

    formData.append(
        "title",
        title.trim()
    );

    formData.append(
        "slug",
        slug.trim()
    );

    formData.append(
        "excerpt",
        excerpt.trim()
    );

    formData.append(
        "category",
        category
    );

    formData.append(
        "metaTitle",
        metaTitle.trim()
    );

    formData.append(
        "metaDescription",
        metaDescription.trim()
    );

    formData.append(
        "keywords",
        JSON.stringify(keywords)
    );

    if (content !== undefined) {
        const {
            preparedContent,
            imageFiles,
        } = prepareContentForUpload(content);

        formData.append(
            "content",
            JSON.stringify(preparedContent)
        );

        imageFiles.forEach((image) => {
            formData.append(
                "contentImages",
                image.file
            );
        });
    }

    if (featuredImage) {
        formData.append(
            "featuredImage",
            featuredImage
        );
    }

    return api(`/blogs/${id}`, {
        method: "PUT",
        body: formData,
    });
};

export const deleteBlog = async (id) => {
    if (!id) {
        throw new Error(
            "Blog ID is required"
        );
    }

    return api(`/blogs/${id}`, {
        method: "DELETE",
    });
};

export const updateBlogStatus = async (
    id,
    status
) => {
    if (!id) {
        throw new Error(
            "Blog ID is required"
        );
    }

    if (
        !["draft", "published"].includes(status)
    ) {
        throw new Error(
            "Invalid blog status"
        );
    }

    return api(`/blogs/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
            status,
        }),
    });
};


// BLOG CATEGORIES

export const getBlogCategories = async () => {
    return api("/blog-categories/admin", {
        method: "GET",
    });
};

export const getBlogCategoryById = async (id) => {
    if (!id) {
        throw new Error(
            "Blog category ID is required"
        );
    }

    return api(`/blog-categories/${id}`, {
        method: "GET",
    });
};

export const createBlogCategory = async (
    name
) => {
    const cleanName = name?.trim();

    if (!cleanName) {
        throw new Error(
            "Category name is required"
        );
    }

    return api("/blog-categories", {
        method: "POST",
        body: JSON.stringify({
            name: cleanName,
        }),
    });
};

export const updateBlogCategory = async (
    id,
    name
) => {
    if (!id) {
        throw new Error(
            "Blog category ID is required"
        );
    }

    const cleanName = name?.trim();

    if (!cleanName) {
        throw new Error(
            "Category name is required"
        );
    }

    return api(`/blog-categories/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            name: cleanName,
        }),
    });
};

export const updateBlogCategoryStatus = async (
    id,
    isActive
) => {
    if (!id) {
        throw new Error(
            "Blog category ID is required"
        );
    }

    return api(
        `/blog-categories/${id}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({
                isActive: Boolean(isActive),
            }),
        }
    );
};

export const deleteBlogCategory = async (
    id
) => {
    if (!id) {
        throw new Error(
            "Blog category ID is required"
        );
    }

    return api(`/blog-categories/${id}`, {
        method: "DELETE",
    });
};


// HELPERS

const validateImage = (image) => {
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
};

const prepareContentForUpload = (
    content = []
) => {
    const preparedContent = [];
    const imageFiles = [];

    content.forEach((block, index) => {
        if (
            block.type !== "image" ||
            !block.file
        ) {
            preparedContent.push(block);
            return;
        }

        validateImage(block.file);

        const fileKey =
            `content-image-${index}`;

        const {
            file,
            ...rest
        } = block;

        preparedContent.push({
            ...rest,
            fileKey,
        });

        imageFiles.push({
            file,
            fileKey,
        });
    });

    return {
        preparedContent,
        imageFiles,
    };
};