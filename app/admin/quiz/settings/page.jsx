"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    Clock3,
    CalendarDays,
    Power,
    Save,
    Sparkles,
} from "lucide-react";

import {
    getQuizSetting,
    updateQuizSetting,
} from "@/services/quizService";

const glass =
    "rounded-2xl border border-[#C8D5EA]/70 bg-white/70 shadow-[0_8px_32px_rgba(16,42,67,0.10)] backdrop-blur-xl";

const inputClass =
    "w-full rounded-xl border border-[#C8D5EA] bg-white/70 px-3.5 py-2.5 text-sm text-[var(--navy)] outline-none backdrop-blur-md transition placeholder:text-[var(--muted)] focus:border-[#3869D0]/50 focus:bg-white focus:ring-4 focus:ring-[#3869D0]/10 disabled:cursor-not-allowed disabled:opacity-60";

const getToday = () => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}-${String(
        now.getDate()
    ).padStart(2, "0")}`;
};

export default function QuizSettingsPage() {
    const [dateKey, setDateKey] =
        useState(getToday);

    const [durationMinutes, setDurationMinutes] =
        useState(15);

    const [isActive, setIsActive] =
        useState(true);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const loadSetting = async (
        selectedDate = dateKey
    ) => {
        try {
            setLoading(true);
            setError("");

            const response =
                await getQuizSetting(
                    selectedDate
                );

            const setting =
                response?.setting;

            if (setting) {
                setDurationMinutes(
                    Number(
                        setting.durationMinutes ||
                            15
                    )
                );

                setIsActive(
                    setting.isActive !== false
                );
            } else {
                setDurationMinutes(15);
                setIsActive(true);
            }
        } catch (error) {
            setError(
                error.message ||
                    "Failed to load quiz settings."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSetting(dateKey);
    }, []);

    const handleDateChange = async (
        event
    ) => {
        const value =
            event.target.value;

        setDateKey(value);

        if (!value) return;

        await loadSetting(value);
    };

    const handleDurationChange = (
        event
    ) => {
        const value =
            Number(event.target.value);

        setDurationMinutes(
            Number.isFinite(value)
                ? value
                : 1
        );
    };

    const handleSave = async (
        event
    ) => {
        event.preventDefault();

        if (saving) return;

        if (!dateKey) {
            toast.error(
                "Please select a quiz date."
            );
            return;
        }

        const duration =
            Number(durationMinutes);

        if (
            !Number.isInteger(duration) ||
            duration < 1 ||
            duration > 180
        ) {
            toast.error(
                "Duration must be between 1 and 180 minutes."
            );
            return;
        }

        try {
            setSaving(true);

            const response =
                await updateQuizSetting({
                    dateKey,
                    durationMinutes:
                        duration,
                    isActive,
                });

            toast.success(
                response?.message ||
                    "Quiz setting updated successfully."
            );
        } catch (error) {
            toast.error(
                error.message ||
                    "Failed to update quiz setting."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#F2F6FF] px-4 pb-10 pt-20 md:px-6 lg:pt-8">
            <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#3869D0]/10 blur-3xl" />

            <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[#B8C9F5]/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-[var(--gold)]/5 blur-3xl" />

            <div className="relative mx-auto max-w-5xl">
                {/* Header */}

                <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/70 bg-[var(--navy)] px-6 py-8 text-white shadow-[0_18px_50px_rgba(16,42,67,0.16)] md:px-10 md:py-10">
                    <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#3869D0]/15 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[var(--gold)]/10 blur-3xl" />

                    <div className="relative">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-white/90">
                            <Sparkles size={12} />
                            QUIZ SETTINGS
                        </span>

                        <h1 className="montserrat mt-4 text-3xl font-extrabold italic leading-tight md:text-4xl">
                            Daily Quiz Settings
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                            Control the daily quiz duration and
                            availability for each quiz date.
                        </p>
                    </div>
                </div>

                {/* Error */}

                {error && (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Settings */}

                <form
                    onSubmit={handleSave}
                    className={`${glass} p-5 md:p-7`}
                >
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Date */}

                        <div>
                            <label
                                htmlFor="quiz-setting-date"
                                className="mb-2 block text-sm font-semibold text-[#40556B]"
                            >
                                Quiz Date
                            </label>

                            <div className="relative">
                                <CalendarDays
                                    size={17}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#3869D0]"
                                />

                                <input
                                    id="quiz-setting-date"
                                    type="date"
                                    value={dateKey}
                                    onChange={
                                        handleDateChange
                                    }
                                    disabled={
                                        loading ||
                                        saving
                                    }
                                    className={`${inputClass} pl-10`}
                                />
                            </div>

                            <p className="mt-1.5 text-xs text-[var(--muted)]">
                                Settings are stored separately for
                                each date.
                            </p>
                        </div>

                        {/* Duration */}

                        <div>
                            <label
                                htmlFor="quiz-duration"
                                className="mb-2 block text-sm font-semibold text-[#40556B]"
                            >
                                Quiz Duration
                            </label>

                            <div className="relative">
                                <Clock3
                                    size={17}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#3869D0]"
                                />

                                <input
                                    id="quiz-duration"
                                    type="number"
                                    min={1}
                                    max={180}
                                    step={1}
                                    value={
                                        durationMinutes
                                    }
                                    onChange={
                                        handleDurationChange
                                    }
                                    disabled={
                                        loading ||
                                        saving
                                    }
                                    className={`${inputClass} pr-20 pl-10`}
                                />

                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--muted)]">
                                    minutes
                                </span>
                            </div>

                            <p className="mt-1.5 text-xs text-[var(--muted)]">
                                Allowed duration: 1–180 minutes.
                            </p>
                        </div>
                    </div>

                    {/* Active Toggle */}

                    <div className="mt-6 rounded-2xl border border-[#C8D5EA]/70 bg-white/60 p-4 md:p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                        isActive
                                            ? "bg-green-100 text-green-600"
                                            : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    <Power size={20} />
                                </div>

                                <div>
                                    <h2 className="text-sm font-bold text-[var(--navy)]">
                                        Daily Quiz Status
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                                        {isActive
                                            ? "Today's quiz is available for new participants."
                                            : "New participants cannot start today's quiz."}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={
                                    isActive
                                }
                                onClick={() =>
                                    setIsActive(
                                        (previous) =>
                                            !previous
                                    )
                                }
                                disabled={
                                    loading ||
                                    saving
                                }
                                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                                    isActive
                                        ? "bg-green-600"
                                        : "bg-slate-300"
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                                <span
                                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                                        isActive
                                            ? "left-6"
                                            : "left-1"
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Preview */}

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-[#C8D5EA]/70 bg-white/60 p-4">
                            <p className="text-xs font-semibold text-[var(--muted)]">
                                Selected Date
                            </p>

                            <p className="mt-1.5 text-lg font-bold text-[var(--navy)]">
                                {dateKey ||
                                    "Not selected"}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#C8D5EA]/70 bg-white/60 p-4">
                            <p className="text-xs font-semibold text-[var(--muted)]">
                                Duration
                            </p>

                            <p className="mt-1.5 text-lg font-bold text-[var(--navy)]">
                                {durationMinutes}{" "}
                                min
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#C8D5EA]/70 bg-white/60 p-4">
                            <p className="text-xs font-semibold text-[var(--muted)]">
                                Status
                            </p>

                            <p
                                className={`mt-1.5 text-lg font-bold ${
                                    isActive
                                        ? "text-green-600"
                                        : "text-slate-500"
                                }`}
                            >
                                {isActive
                                    ? "Active"
                                    : "Inactive"}
                            </p>
                        </div>
                    </div>

                    {/* Save */}

                    <div className="mt-6 flex justify-end border-t border-[#C8D5EA]/60 pt-5">
                        <button
                            type="submit"
                            disabled={
                                loading ||
                                saving
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-[#3869D0] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#3869D0]/20 transition hover:-translate-y-0.5 hover:bg-[#2f5dbd] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save size={16} />

                            {saving
                                ? "Saving..."
                                : "Save Settings"}
                        </button>
                    </div>
                </form>

                {/* Info */}

                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-5 text-blue-800">
                    <strong>Important:</strong> The timer is
                    enforced by the backend. Changing this setting
                    affects new quiz sessions for the selected
                    date; an already-started session keeps its
                    own stored expiry time.
                </div>
            </div>
        </div>
    );
}