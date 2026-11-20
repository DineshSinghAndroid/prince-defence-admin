import { api } from "./api";

export const forgotPassword = async (email) => {
    return api("/forgot-password", {
        method: "POST",
        body: JSON.stringify({
            email: email.trim().toLowerCase(),
        }),
    });
};

export const verifyOtp = async (
    email,
    otp
) => {
    return api("/forgot-password/verify-otp", {
        method: "POST",
        body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp,
        }),
    });
};

export const resendOtp = async (email) => {
    return api("/forgot-password/resend-otp", {
        method: "POST",
        body: JSON.stringify({
            email: email.trim().toLowerCase(),
        }),
    });
};

export const resetPassword = async (
    email,
    resetToken,
    newPassword
) => {
    return api("/forgot-password/reset-password", {
        method: "POST",
        body: JSON.stringify({
            email: email.trim().toLowerCase(),
            resetToken,
            newPassword,
        }),
    });
};