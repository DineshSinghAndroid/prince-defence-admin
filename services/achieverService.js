
import { api } from "./api";

const buildQuery = (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            query.set(key, String(value));
        }
    });

    const result = query.toString();
    return result ? `?${result}` : "";
};

// Categories

export const getAchieverCategories = async (
    includeInactive = true
) => {
    return api(
        `/achiever-categories${buildQuery({
            includeInactive,
        })}`
    );
};

export const createAchieverCategory = async (name) => {
    return api("/achiever-categories", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
    });
};

export const updateAchieverCategory = async (id, data) => {
    return api(`/achiever-categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};

export const deleteAchieverCategory = async (id) => {
    return api(`/achiever-categories/${id}`, {
        method: "DELETE",
    });
};

export const reorderAchieverCategories = async (orderedIds) => {
    return api("/achiever-categories/reorder", {
        method: "PUT",
        body: JSON.stringify({ orderedIds }),
    });
};

// Achievers

export const getAdminAchievers = async (
    categorySlug,
    params = {}
) => {
    const endpoint = categorySlug === "all"
        ? "/achievers/admin"
        : `/achievers/admin/${encodeURIComponent(categorySlug)}`;

    return api(
        `${endpoint}${buildQuery(params)}`
    );
};

export const createAchiever = async (
    categorySlug,
    formData
) => {
    return api(
        `/achievers/admin/${encodeURIComponent(categorySlug)}`,
        {
            method: "POST",
            body: formData,
        }
    );
};

export const updateAchiever = async (id, formData) => {
    return api(`/achievers/admin/${id}`, {
        method: "PATCH",
        body: formData,
    });
};

export const deleteAchiever = async (id) => {
    return api(`/achievers/admin/${id}`, {
        method: "DELETE",
    });
};
