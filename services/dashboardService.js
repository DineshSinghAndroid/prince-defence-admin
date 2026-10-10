import { api } from "./api";

export const getDashboardStats = async () => {
    return api("/dashboard/stats", {
        method: "GET",
    });
};

export const getQuizAnalytics = async ({ from, to, subject = "", category = "", page = 1, limit = 10 }) => {
    const params = new URLSearchParams({ from, to, page: String(page), limit: String(limit) });
    if (subject) params.set("subject", subject);
    if (category) params.set("category", category);

    return api(`/quiz/analytics?${params.toString()}`, {
        method: "GET",
    });
};

export const getQuizPageViewAnalytics = async ({ from, to, page = 1, limit = 20, search = "", routePath = "" }) => {
    const params = new URLSearchParams({
        from,
        to,
        page: String(page),
        limit: String(limit),
        search,
    });
    if (routePath) params.set("routePath", routePath);
    return api(`/quiz/analytics/page-views?${params.toString()}`, { method: "GET" });
};

export const getVisitorAnalytics = async ({ from, to, page = 1, limit = 20, search = "", routePath = "" }) => {
    const params = new URLSearchParams({
        from,
        to,
        page: String(page),
        limit: String(limit),
        search,
    });
    if (routePath) params.set("routePath", routePath);
    return api(`/quiz/analytics/visitors?${params.toString()}`, { method: "GET" });
};

export const clearAnalyticsHistory = async () =>
    api("/quiz/analytics/history", { method: "DELETE" });

export const deleteQuizVisitor = async (visitorId) => {
    return api(`/quiz/visitors/${encodeURIComponent(visitorId)}`, {
        method: "DELETE",
    });
};

export const getQuizAttemptDetails = async (attemptId) =>
    api(`/quiz/attempts/${encodeURIComponent(attemptId)}`, { method: "GET" });

export const getQuizQuestions = async ({ page = 1, limit = 40, category = "", date = "" } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category) params.set("category", category);
    if (date) params.set("date", date);
    return api(`/quiz/questions?${params.toString()}`, { method: "GET" });
};

export const createQuizQuestion = async (question) => {
    return api("/quiz/questions", {
        method: "POST",
        body: JSON.stringify(question),
    });
};

export const importQuizQuestionsFromWord = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api("/quiz/questions/import-word", {
        method: "POST",
        body: formData,
    });
};

export const setQuizQuestionActive = async (questionId, active) => api(`/quiz/questions/${encodeURIComponent(questionId)}`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
});

export const deleteQuizQuestion = async (questionId) => api(`/quiz/questions/${encodeURIComponent(questionId)}`, {
    method: "DELETE",
});

export const getQuizCategories = async () => api("/quiz/categories", { method: "GET" });

export const createQuizCategory = async (name) => api("/quiz/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
});
