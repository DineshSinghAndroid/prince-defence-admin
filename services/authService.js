import {api} from "./api";

export const login = async (email, password) => {
    return api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email,
            password,
        }),
    });
};


export const getMe = async () => {
    const response = await api("/auth/me", {
        method: "GET",
    });

    return response;
};


export const logout = async () => {
    return api("/auth/logout", {
        method: "POST",
    });
};