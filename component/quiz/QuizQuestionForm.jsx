"use client";

import { useEffect, useState } from "react";

const getTodayDateKey = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());
    const values = Object.fromEntries(
        parts
            .filter((part) => part.type !== "literal")
            .map((part) => [part.type, part.value])
    );
    return `${values.year}-${values.month}-${values.day}`;
};

const createEmptyQuestion = () => ({
    text: {
        en: "",
        hi: "",
    },
    subject: "",
    category: "",
    options: ["", "", "", ""],
    correctIndex: null,
    explanation: "",
    difficulty: 1,
    scheduledDate: getTodayDateKey(),
    active: true,
});

const formatDateInput = (value) => {
    if (!value) return "";

    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return value;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getInitialForm = (data) => {
    if (!data) {
        return createEmptyQuestion();
    }

    return {
        text: {
            en: data.text?.en || "",
            hi: data.text?.hi || "",
        },

        subject: data.subject || "",

        category: data.category || "",

        options: [
            data.options?.[0] || "",
            data.options?.[1] || "",
            data.options?.[2] || "",
            data.options?.[3] || "",
        ],

        correctIndex:
            data.correctIndex === undefined ||
            data.correctIndex === null
                ? null
                : Number(data.correctIndex),

        explanation:
            data.explanation || "",

        difficulty: Number(
            data.difficulty || 1
        ),

        scheduledDate:
            formatDateInput(
                data.scheduledDate
            ),

        active: data.active !== false,
    };
};

export default function QuizQuestionForm({
    categories = [],
    initialData = null,
    loading = false,
    submitLabel = "Create Question",
    onSubmit,
    onCancel,
}) {
    const [form, setForm] = useState(() =>
        getInitialForm(initialData)
    );

    const [error, setError] = useState("");

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setForm(
                getInitialForm(initialData)
            );
            setError("");
        }, 0);

        return () => window.clearTimeout(timer);
    }, [initialData]);

    const update = (
        field,
        value
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const updateText = (
        language,
        value
    ) => {
        setForm((previous) => ({
            ...previous,
            text: {
                ...previous.text,
                [language]: value,
            },
        }));
    };

    const updateOption = (
        index,
        value
    ) => {
        setForm((previous) => ({
            ...previous,
            options: previous.options.map(
                (option, optionIndex) =>
                    optionIndex === index
                        ? value
                        : option
            ),
        }));
    };

    const validate = () => {
        const englishQuestion =
            form.text.en.trim();

        const hindiQuestion =
            form.text.hi.trim();

        const subject =
            form.subject.trim();

        const category =
            form.category.trim();

        const explanation =
            form.explanation.trim();

        if (
            englishQuestion.length < 5 ||
            englishQuestion.length > 1000
        ) {
            return "English question must be between 5 and 1000 characters.";
        }

        if (
            hindiQuestion.length > 1000
        ) {
            return "Hindi question cannot exceed 1000 characters.";
        }

        if (
            subject.length < 2 ||
            subject.length > 80
        ) {
            return "Subject must be between 2 and 80 characters.";
        }

        if (
            category.length < 2 ||
            category.length > 80
        ) {
            return "Category must be between 2 and 80 characters.";
        }

        if (
            form.options.some(
                (option) => {
                    const value =
                        option.trim();

                    return (
                        !value ||
                        value.length > 300
                    );
                }
            )
        ) {
            return "All four options are required and must not exceed 300 characters.";
        }

        const correctIndex =
            Number(form.correctIndex);

        if (
            form.correctIndex === null ||
            form.correctIndex === undefined ||
            !Number.isInteger(
                correctIndex
            ) ||
            correctIndex < 0 ||
            correctIndex > 3
        ) {
            return "Please select the correct option.";
        }

        if (
            explanation.length < 5 ||
            explanation.length > 1200
        ) {
            return "Explanation must be between 5 and 1200 characters.";
        }

        const difficulty =
            Number(form.difficulty);

        if (
            !Number.isInteger(
                difficulty
            ) ||
            difficulty < 1 ||
            difficulty > 5
        ) {
            return "Difficulty must be between 1 and 5.";
        }

        if (
            form.scheduledDate &&
            !/^\d{4}-\d{2}-\d{2}$/.test(
                form.scheduledDate
            )
        ) {
            return "Please select a valid scheduled date.";
        }

        return "";
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        if (loading) return;

        const validationError =
            validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");

        const payload = {
            text: {
                en: form.text.en.trim(),
                ...(form.text.hi.trim()
                    ? {
                          hi: form.text.hi.trim(),
                      }
                    : {}),
            },

            subject:
                form.subject.trim(),

            category:
                form.category.trim(),

            options:
                form.options.map(
                    (option) =>
                        option.trim()
                ),

            correctIndex:
                Number(
                    form.correctIndex
                ),

            explanation:
                form.explanation.trim(),

            difficulty:
                Number(form.difficulty),

            scheduledDate:
                form.scheduledDate || null,

            active: Boolean(
                form.active
            ),
        };

        try {
            await onSubmit(payload);
        } catch {
            // Parent handles API errors.
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600">
                    {error}
                </div>
            )}

            {/* Question */}

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label
                        htmlFor="quiz-question-en"
                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                        Question (English) *
                    </label>

                    <textarea
                        id="quiz-question-en"
                        value={
                            form.text.en
                        }
                        onChange={(event) =>
                            updateText(
                                "en",
                                event.target
                                    .value
                            )
                        }
                        rows={3}
                        maxLength={1000}
                        placeholder="Enter question in English..."
                        disabled={loading}
                        className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                    />

                    <p className="mt-1 text-right text-[10px] text-slate-400">
                        {
                            form.text.en
                                .length
                        }
                        /1000
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="quiz-question-hi"
                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                        Question (Hindi)
                    </label>

                    <textarea
                        id="quiz-question-hi"
                        value={
                            form.text.hi
                        }
                        onChange={(event) =>
                            updateText(
                                "hi",
                                event.target
                                    .value
                            )
                        }
                        rows={3}
                        maxLength={1000}
                        placeholder="प्रश्न हिंदी में लिखें..."
                        disabled={loading}
                        className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                    />

                    <p className="mt-1 text-right text-[10px] text-slate-400">
                        {
                            form.text.hi
                                .length
                        }
                        /1000
                    </p>
                </div>
            </div>

            {/* Subject + Category */}

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label
                        htmlFor="quiz-subject"
                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                        Subject *
                    </label>

                    <input
                        id="quiz-subject"
                        type="text"
                        value={
                            form.subject
                        }
                        onChange={(event) =>
                            update(
                                "subject",
                                event.target
                                    .value
                            )
                        }
                        maxLength={80}
                        placeholder="e.g. General Knowledge"
                        disabled={loading}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="quiz-category"
                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                        Category *
                    </label>

                    <select
                        id="quiz-category"
                        value={
                            form.category
                        }
                        onChange={(event) =>
                            update(
                                "category",
                                event.target
                                    .value
                            )
                        }
                        disabled={
                            loading ||
                            categories.length ===
                                0
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                    >
                        <option value="">
                            Select category
                        </option>

                        {categories.map(
                            (category) => (
                                <option
                                    key={
                                        category._id
                                    }
                                    value={
                                        category.name
                                    }
                                >
                                    {
                                        category.name
                                    }
                                </option>
                            )
                        )}
                    </select>

                    {!categories.length && (
                        <p className="mt-1 text-[10px] text-red-500">
                            Create an active quiz
                            category first.
                        </p>
                    )}
                </div>
            </div>

            {/* Options */}

            <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-slate-700">
                        Options *
                    </label>

                    <span className="text-[10px] text-slate-400">
                        Click A/B/C/D to select
                        correct answer
                    </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    {form.options.map(
                        (
                            option,
                            index
                        ) => {
                            const letter =
                                String.fromCharCode(
                                    65 + index
                                );

                            const isCorrect =
                                Number(
                                    form.correctIndex
                                ) === index;

                            return (
                                <div
                                    key={letter}
                                    className={`rounded-xl border p-2.5 transition ${
                                        isCorrect
                                            ? "border-green-300 bg-green-50"
                                            : "border-slate-200 bg-slate-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                update(
                                                    "correctIndex",
                                                    index
                                                )
                                            }
                                            disabled={
                                                loading
                                            }
                                            aria-label={`Set option ${letter} as correct`}
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition ${
                                                isCorrect
                                                    ? "bg-green-600 text-white"
                                                    : "bg-slate-200 text-slate-600 hover:bg-blue-100 hover:text-blue-600"
                                            }`}
                                        >
                                            {
                                                letter
                                            }
                                        </button>

                                        <input
                                            type="text"
                                            value={
                                                option
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateOption(
                                                    index,
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            maxLength={
                                                300
                                            }
                                            placeholder={`Option ${letter}`}
                                            disabled={
                                                loading
                                            }
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                        />
                                    </div>

                                    {isCorrect && (
                                        <p className="mt-1.5 pl-10 text-[10px] font-semibold text-green-600">
                                            ✓ Correct
                                            answer
                                        </p>
                                    )}
                                </div>
                            );
                        }
                    )}
                </div>
            </div>

            {/* Explanation */}

            <div>
                <label
                    htmlFor="quiz-explanation"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                    Explanation *
                </label>

                <textarea
                    id="quiz-explanation"
                    value={
                        form.explanation
                    }
                    onChange={(event) =>
                        update(
                            "explanation",
                            event.target
                                .value
                        )
                    }
                    rows={3}
                    maxLength={1200}
                    placeholder="Explain why the selected answer is correct..."
                    disabled={loading}
                    className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                />

                <p className="mt-1 text-right text-[10px] text-slate-400">
                    {
                        form.explanation
                            .length
                    }
                    /1200
                </p>
            </div>

            {/* Settings */}

            <div className="grid gap-4 md:grid-cols-3">
                <div>
                    <label
                        htmlFor="quiz-difficulty"
                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                        Difficulty
                    </label>

                    <select
                        id="quiz-difficulty"
                        value={
                            form.difficulty
                        }
                        onChange={(event) =>
                            update(
                                "difficulty",
                                Number(
                                    event.target
                                        .value
                                )
                            )
                        }
                        disabled={loading}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                    >
                        <option value={1}>
                            1 - Easy
                        </option>
                        <option value={2}>
                            2 - Basic
                        </option>
                        <option value={3}>
                            3 - Medium
                        </option>
                        <option value={4}>
                            4 - Hard
                        </option>
                        <option value={5}>
                            5 - Very Hard
                        </option>
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="quiz-scheduled-date"
                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                        Scheduled Date
                    </label>

                    <input
                        id="quiz-scheduled-date"
                        type="date"
                        value={
                            form.scheduledDate
                        }
                        onChange={(event) =>
                            update(
                                "scheduledDate",
                                event.target
                                    .value
                            )
                        }
                        disabled={loading}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                    />
                </div>

                <div className="flex items-end">
                    <div className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                        <div>
                            <p className="text-xs font-semibold text-slate-700">
                                Active
                            </p>

                            <p className="text-[10px] text-slate-400">
                                Available for quiz
                            </p>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={
                                form.active
                            }
                            onClick={() =>
                                update(
                                    "active",
                                    !form.active
                                )
                            }
                            disabled={loading}
                            className={`relative h-6 w-10 rounded-full transition ${
                                form.active
                                    ? "bg-blue-600"
                                    : "bg-slate-300"
                            }`}
                        >
                            <span
                                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                                    form.active
                                        ? "left-5"
                                        : "left-1"
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Actions */}

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={
                        loading ||
                        categories.length === 0
                    }
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Saving..."
                        : submitLabel}
                </button>
            </div>
        </form>
    );
}