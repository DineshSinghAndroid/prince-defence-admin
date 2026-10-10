"use client";

import {
    AlertTriangle,
    Loader2,
} from "lucide-react";

const DeleteConfirmModal = ({
    open,
    title = "Delete this item?",
    description = "This item will be permanently deleted. This action cannot be undone.",
    itemName = "",
    confirmText = "Delete",
    loading = false,
    onCancel,
    onConfirm,
}) => {
    if (!open) {
        return null;
    }

    return (
        <div
            className="
                fixed inset-0 z-[110]
                flex items-center justify-center
                bg-[var(--navy)]/65
                p-4
                backdrop-blur-md
            "
            onMouseDown={(event) => {
                if (
                    event.target ===
                        event.currentTarget &&
                    !loading
                ) {
                    onCancel?.();
                }
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
                className="
                    w-full max-w-sm
                    rounded-3xl
                    border border-[#C8D5EA]
                    bg-[#F2F6FF]/95
                    p-6
                    text-center
                    shadow-2xl
                    backdrop-blur-2xl
                "
            >
                <div
                    className="
                        mx-auto mb-4
                        flex h-14 w-14
                        items-center justify-center
                        rounded-2xl
                        bg-red-50
                        text-red-600
                    "
                >
                    <AlertTriangle
                        size={26}
                    />
                </div>

                <h3
                    id="delete-modal-title"
                    className="
                        text-lg
                        font-extrabold
                        text-[var(--navy)]
                    "
                >
                    {title}
                </h3>

                <p
                    className="
                        mt-2
                        text-sm
                        leading-6
                        text-[var(--muted)]
                    "
                >
                    {itemName && (
                        <>
                            <span className="font-bold text-[var(--navy)]">
                                {itemName}
                            </span>{" "}
                        </>
                    )}

                    {description}
                </p>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="
                            flex-1
                            rounded-xl
                            border border-[#C8D5EA]
                            bg-[#F2F6FF]
                            px-4 py-3
                            text-sm
                            font-bold
                            text-[var(--navy)]
                            transition
                            hover:bg-white
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="
                            flex flex-1
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-red-600
                            px-4 py-3
                            text-sm
                            font-bold
                            text-white
                            shadow-lg
                            shadow-red-600/20
                            transition
                            hover:bg-red-700
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        {loading && (
                            <Loader2
                                size={16}
                                className="animate-spin"
                            />
                        )}

                        {loading
                            ? "Deleting..."
                            : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;