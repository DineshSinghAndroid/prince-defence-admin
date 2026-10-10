const API_URL =
    process.env.NEXT_PUBLIC_API_URL;

let csrfToken = null;

const getCsrfToken = async () => {
    const response = await fetch(`${API_URL}/auth/csrf`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data?.data?.csrfToken) {
        throw new Error(
            data?.message || "Unable to verify the security token"
        );
    }

    csrfToken = data.data.csrfToken;
    return csrfToken;
};

export const api = async (
    endpoint,
    options = {}
) => {
    const method = (options.method || "GET").toUpperCase();
    const isProtectedMutation =
        /^\/(?:blogs|gallery|quiz)(?:\/|\?|$)/.test(endpoint) &&
        !["GET", "HEAD", "OPTIONS"].includes(method);

    if (isProtectedMutation) {
        await getCsrfToken();
    }

    const isFormData =
        typeof FormData !== "undefined" &&
        options.body instanceof FormData;

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,

            credentials: "include",

            headers: {
                ...(isFormData
                    ? {}
                    : {
                        "Content-Type":
                            "application/json",
                    }),

                ...(isProtectedMutation
                    ? {
                        "X-CSRF-Token": csrfToken,
                    }
                    : {}),

                ...options.headers,
            },

            cache: "no-store",
        }
    );

    let data = null;

    const contentType =
        response.headers.get("content-type");

    if (
        contentType?.includes(
            "application/json"
        )
    ) {
        data = await response.json();
    } else {
        const text =
            await response.text();

        data = {
            success: response.ok,
            message:
                text ||
                "Unexpected server response",
        };
    }

    if (!response.ok) {
        if (isProtectedMutation && response.status === 403) {
            csrfToken = null;
        }

        throw new Error(
            data?.message ||
            `Request failed with status ${response.status}`
        );
    }

    if (endpoint === "/auth/logout") {
        csrfToken = null;
    }

    return data;
};