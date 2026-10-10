import { useSyncExternalStore } from "react";

export const PASSWORD_RESET_EMAIL_KEY =
    "admin-password-reset-email";
export const PASSWORD_RESET_TOKEN_KEY =
    "admin-password-reset-token";

const PASSWORD_RESET_SESSION_EVENT =
    "admin-password-reset-session-change";

const subscribe = (callback) => {
    window.addEventListener(
        PASSWORD_RESET_SESSION_EVENT,
        callback
    );
    window.addEventListener("storage", callback);

    return () => {
        window.removeEventListener(
            PASSWORD_RESET_SESSION_EVENT,
            callback
        );
        window.removeEventListener("storage", callback);
    };
};

const getSnapshot = () =>
    JSON.stringify([
        sessionStorage.getItem(PASSWORD_RESET_EMAIL_KEY),
        sessionStorage.getItem(PASSWORD_RESET_TOKEN_KEY),
    ]);

const getServerSnapshot = () => null;

const notifySessionChanged = () => {
    window.dispatchEvent(
        new Event(PASSWORD_RESET_SESSION_EVENT)
    );
};

export const savePasswordResetEmail = (email) => {
    sessionStorage.setItem(
        PASSWORD_RESET_EMAIL_KEY,
        email
    );
    sessionStorage.removeItem(PASSWORD_RESET_TOKEN_KEY);
    notifySessionChanged();
};

export const savePasswordResetToken = (token) => {
    sessionStorage.setItem(
        PASSWORD_RESET_TOKEN_KEY,
        token
    );
    notifySessionChanged();
};

export const clearPasswordResetSession = () => {
    sessionStorage.removeItem(PASSWORD_RESET_EMAIL_KEY);
    sessionStorage.removeItem(PASSWORD_RESET_TOKEN_KEY);
    notifySessionChanged();
};

export const usePasswordResetSession = () => {
    const snapshot = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    );

    if (snapshot === null) {
        return {
            hydrated: false,
            email: "",
            resetToken: "",
        };
    }

    const [email, resetToken] = JSON.parse(snapshot);

    return {
        hydrated: true,
        email: email || "",
        resetToken: resetToken || "",
    };
};
