import { api } from "./api";

// GET /api/admin

export const getAdmins = async () => {
    try {
        const response = await api("/admin", {
            method: "GET",
        });

        return response;
    } catch (error) {
        throw new Error(
            error.message || "Failed to fetch admins"
        );
    }
};


// GET /api/admin/:id

export const getAdminById = async (id) => {
    if (!id) {
        throw new Error("Admin ID is required");
    }

    try {
        const response = await api(`/admin/${id}`, {
            method: "GET",
        });

        return response;
    } catch (error) {
        throw new Error(
            error.message || "Failed to fetch admin"
        );
    }
};


// POST /api/admin

export const createAdmin = async ({
    name,
    email,
    password,
}) => {
    if (!name?.trim()) {
        throw new Error("Admin name is required");
    }

    if (!email?.trim()) {
        throw new Error("Admin email is required");
    }

    if (!password) {
        throw new Error("Admin password is required");
    }

    try {
        const response = await api("/admin", {
            method: "POST",
            body: JSON.stringify({
                name: name.trim(),
                email: email.trim(),
                password,
            }),
        });

        return response;
    } catch (error) {
        throw new Error(
            error.message || "Failed to create admin"
        );
    }
};


// Update admin fields (PUT /api/admin/:id).

export const updateAdmin = async (
    id,
    {
        name,
        email,
        password,
    }
) => {
    if (!id) {
        throw new Error("Admin ID is required");
    }

    const body = {};

    if (name !== undefined) {
        if (!name.trim()) {
            throw new Error("Admin name is required");
        }

        body.name = name.trim();
    }

    if (email !== undefined) {
        if (!email.trim()) {
            throw new Error("Admin email is required");
        }

        body.email = email.trim();
    }

    // Omit empty passwords to keep the current password unchanged.

    if (password) {
        body.password = password;
    }

    try {
        const response = await api(`/admin/${id}`, {
            method: "PUT",
            body: JSON.stringify(body),
        });

        return response;
    } catch (error) {
        throw new Error(
            error.message || "Failed to update admin"
        );
    }
};


// Update admin status (PATCH /api/admin/:id).

export const updateAdminStatus = async (
    id,
    isActive
) => {
    if (!id) {
        throw new Error("Admin ID is required");
    }

    if (typeof isActive !== "boolean") {
        throw new Error(
            "Admin status must be true or false"
        );
    }

    try {
        const response = await api(
            `/admin/${id}`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    isActive,
                }),
            }
        );

        return response;
    } catch (error) {
        throw new Error(
            error.message ||
            "Failed to update admin status"
        );
    }
};


// DELETE /api/admin/:id

export const deleteAdmin = async (id) => {
    if (!id) {
        throw new Error("Admin ID is required");
    }

    try {
        const response = await api(`/admin/${id}`, {
            method: "DELETE",
        });

        return response;
    } catch (error) {
        throw new Error(
            error.message || "Failed to delete admin"
        );
    }
};