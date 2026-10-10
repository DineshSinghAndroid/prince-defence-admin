import { api } from "./api";


// Fetch paginated contacts with optional filters.
export const getContacts = async ({
    page = 1,
    limit = 10,
    search = "",
    course = "",
    status = "",
} = {}) => {

    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);


    if (search.trim()) {
        params.append(
            "search",
            search.trim()
        );
    }


    if (course.trim()) {
        params.append(
            "course",
            course.trim()
        );
    }


    if (status) {
        params.append(
            "status",
            status
        );
    }


    return api(
        `/contact?${params.toString()}`,
        {
            method: "GET",
        }
    );
};


/**
 * Get single contact
 */
export const getContactById = async (
    id
) => {

    if (!id) {
        throw new Error(
            "Contact ID is required"
        );
    }


    return api(
        `/contact/${id}`,
        {
            method: "GET",
        }
    );
};


/**
 * Update contact status
 */
export const updateContactStatus = async (
    id,
    status
) => {

    if (!id) {
        throw new Error(
            "Contact ID is required"
        );
    }


    if (!status) {
        throw new Error(
            "Contact status is required"
        );
    }


    return api(
        `/contact/${id}`,
        {
            method: "PUT",

            body: JSON.stringify({
                status,
            }),
        }
    );
};


/**
 * Delete contact
 */
export const deleteContact = async (
    id
) => {

    if (!id) {
        throw new Error(
            "Contact ID is required"
        );
    }


    return api(
        `/contact/${id}`,
        {
            method: "DELETE",
        }
    );
};