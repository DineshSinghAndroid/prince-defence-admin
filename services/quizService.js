
import { api } from "@/services/api";

const serializeQuizPayload = (payload) => {
  if (
    payload !== null &&
    typeof payload === "object" &&
    ((typeof Node !== "undefined" && payload instanceof Node) ||
      (typeof Event !== "undefined" && payload instanceof Event))
  ) {
    throw new TypeError(
      "Invalid quiz data: a button or form event was passed instead of quiz values."
    );
  }

  try {
    return JSON.stringify(payload);
  } catch (error) {
    if (
      error instanceof TypeError &&
      /circular|cyclic/i.test(error.message)
    ) {
      throw new TypeError(
        "Invalid quiz data: the request contains a circular object. Pass quiz form values, not a React event or DOM element."
      );
    }

    throw error;
  }
};

const getQuizSetting = async (date) => {
  const params = new URLSearchParams();

  if (date) params.set("date", date);

  const query = params.toString();

  return api(`/quiz/settings${query ? `?${query}` : ""}`, {
    method: "GET",
  });
};

const updateQuizSetting = async ({
  dateKey,
  durationMinutes,
  isActive,
}) => {
  return api("/quiz/settings", {
    method: "PUT",
    body: serializeQuizPayload({
      dateKey,
      durationMinutes,
      isActive,
    }),
  });
};

const getQuizCategories = async () => {
  return api("/quiz/categories", {
    method: "GET",
  });
};

const createQuizCategory = async (name) => {
  return api("/quiz/categories", {
    method: "POST",
    body: serializeQuizPayload({ name }),
  });
};

const updateQuizCategory = async (categoryId, categoryData) => {
  return api(`/quiz/categories/${encodeURIComponent(categoryId)}`, {
    method: "PATCH",
    body: serializeQuizPayload(categoryData),
  });
};

const getQuizCategoryById = async (categoryId) => {
  return api(`/quiz/categories/${encodeURIComponent(categoryId)}`);
};

const deleteQuizCategory = async (categoryId) => {
  return api(
    `/quiz/categories/${encodeURIComponent(categoryId)}`,
    {
      method: "DELETE",
    }
  );
};

const reorderQuizCategories = async (orderedIds) => {
  return api("/quiz/categories/reorder", {
    method: "PUT",
    body: serializeQuizPayload({ orderedIds }),
  });
};

const getQuizQuestions = async ({
  category = "",
  subject = "",
  date = "",
  search = "",
  page = 1,
  limit = 20,
}) => {
  const params = new URLSearchParams();

  if (category.trim()) {
    params.set("category", category.trim());
  }

  if (subject.trim()) {
    params.set("subject", subject.trim());
  }

  if (date) {
    params.set("date", date);
  }

  if (search.trim()) {
    params.set("search", search.trim());
  }

  params.set("page", String(page));
  params.set("limit", String(limit));

  return api(`/quiz/questions?${params.toString()}`, {
    method: "GET",
  });
};

const createQuizQuestion = async (question) => {
  return api("/quiz/questions", {
    method: "POST",
    body: serializeQuizPayload(question),
  });
};

const updateQuizQuestion = async (
  questionId,
  question
) => {
  return api(
    `/quiz/questions/${encodeURIComponent(questionId)}`,
    {
      method: "PUT",
      body: serializeQuizPayload(question),
    }
  );
};

const importQuizQuestions = async (file, durationMinutes) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("durationMinutes", String(durationMinutes));

  return api("/quiz/questions/import-word", {
    method: "POST",
    body: formData,
  });
};

const updateQuizQuestionStatus = async (
  questionId,
  active
) => {
  return api(
    `/quiz/questions/${encodeURIComponent(questionId)}`,
    {
      method: "PATCH",
      body: serializeQuizPayload({ active }),
    }
  );
};

const deleteQuizQuestion = async (questionId) => {
  return api(
    `/quiz/questions/${encodeURIComponent(questionId)}`,
    {
      method: "DELETE",
    }
  );
};

const deleteQuizQuestions = async (questionIds) => {
  return api("/quiz/questions/bulk-delete", {
    method: "POST",
    body: serializeQuizPayload({ questionIds }),
  });
};

export {
  getQuizSetting,
  updateQuizSetting,
  getQuizCategories,
  getQuizCategoryById,
  createQuizCategory,
  updateQuizCategory,
  reorderQuizCategories,
  deleteQuizCategory,
  getQuizQuestions,
  createQuizQuestion,
  updateQuizQuestion,
  importQuizQuestions,
  updateQuizQuestionStatus,
  deleteQuizQuestion,
  deleteQuizQuestions,
};
