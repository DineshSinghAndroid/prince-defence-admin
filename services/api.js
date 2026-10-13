
const API_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

const API_BASE_URL = API_URL
    ? `${API_URL.replace(/\/api$/i, "")}/api`
    : "";

const getApiUrl = (endpoint) => {
    if (!API_BASE_URL) {
        throw new Error(
            "API URL is not configured. Set NEXT_PUBLIC_API_URL."
        );
    }

    return `${API_BASE_URL}${endpoint}`;
};

let csrfToken = null;

const getCsrfToken = async () => {
    const response = await fetch(getApiUrl("/auth/csrf"), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        throw new Error("Unable to read the security token response.");
    }

    if (!response.ok || !data?.data?.csrfToken) {
        throw new Error(
            data?.message || "Unable to verify the security token."
        );
    }

    csrfToken = data.data.csrfToken;

    return csrfToken;
};

export const api = async (endpoint, options = {}) => {
    const method = (options.method || "GET").toUpperCase();

    const isProtectedMutation =
        /^\/(?:blogs|gallery|quiz|achievers|achiever-categories)(?:\/|\?|$)/.test(
            endpoint
        ) &&
        !["GET", "HEAD", "OPTIONS"].includes(method);

    if (isProtectedMutation) {
        await getCsrfToken();
    }

    const isFormData =
        typeof FormData !== "undefined" &&
        options.body instanceof FormData;

    const response = await fetch(getApiUrl(endpoint), {
        ...options,
        credentials: "include",
        headers: {
            ...(isFormData
                ? {}
                : {
                      "Content-Type": "application/json",
                  }),
            ...(isProtectedMutation
                ? {
                      "X-CSRF-Token": csrfToken,
                  }
                : {}),
            ...options.headers,
        },
        cache: "no-store",
    });

    let data = null;

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
        data = await response.json();
    } else {
        const responseText = await response.text();

        data = {
            success: response.ok,
            message: responseText || "Unexpected server response.",
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
