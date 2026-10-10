"use client";

import {
    useEffect,
    useId,
    useRef,
    useState,
} from "react";

import {
    Bold,
    Italic,
    Link as LinkIcon,
    Underline,
    Palette,
    X,
} from "lucide-react";

const RichTextEditor = ({
    value = [],
    onChange,
    placeholder = "Write here...",
}) => {
    const editorRef = useRef(null);

    const [showLinkPopup, setShowLinkPopup] =
        useState(false);

    const [linkUrl, setLinkUrl] =
        useState("");

    const [textColor, setTextColor] =
        useState("#000000");

    const savedRangeRef = useRef(null);

    const isEditorFocusedRef =
        useRef(false);

    // Unique color input id
    const colorInputId = useId();

    // Escape HTML
    const escapeHtml = (text = "") => {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // Escape HTML attribute
    const escapeAttribute = (text = "") => {
        return escapeHtml(text);
    };

    // Convert rgb(...) to #RRGGBB
    const normalizeColor = (color = "") => {
        if (!color) {
            return "";
        }

        const value = color.trim();

        if (
            /^#[0-9A-Fa-f]{6}$/.test(
                value
            )
        ) {
            return value.toLowerCase();
        }

        const rgbMatch = value.match(
            /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i
        );

        if (!rgbMatch) {
            return "";
        }

        const [, r, g, b] = rgbMatch;

        const toHex = (number) => {
            return Number(number)
                .toString(16)
                .padStart(2, "0");
        };

        return `#${toHex(r)}${toHex(g)}${toHex(
            b
        )}`.toLowerCase();
    };

    // Convert JSON content to HTML
    const contentToHtml = (content = []) => {
        return content
            .map((item) => {
                if (!item?.text) {
                    return "";
                }

                let text = escapeHtml(
                    item.text
                );

                text = text.replace(
                    /\n/g,
                    "<br />"
                );

                // Link
                if (item.type === "link") {
                    text = `<a href="${escapeAttribute(
                        item.url || ""
                    )}" target="_blank" rel="noopener noreferrer">${text}</a>`;
                }

                // Color
                if (item.color) {
                    text = `<span style="color:${escapeAttribute(
                        item.color
                    )}">${text}</span>`;
                }

                // Bold
                if (item.bold) {
                    text = `<strong>${text}</strong>`;
                }

                // Italic
                if (item.italic) {
                    text = `<em>${text}</em>`;
                }

                // Underline
                if (item.underline) {
                    text = `<u>${text}</u>`;
                }

                return text;
            })
            .join("");
    };

    // Convert HTML back to JSON
    const serializeEditor = (editor) => {
        const result = [];

        const walk = (
            node,
            marks = {
                bold: false,
                italic: false,
                underline: false,
                color: "",
            },
            linkUrl = null
        ) => {
            // Text node
            if (
                node.nodeType ===
                Node.TEXT_NODE
            ) {
                if (!node.nodeValue) {
                    return;
                }

                const item = {
                    type: linkUrl
                        ? "link"
                        : "text",
                    text: node.nodeValue,
                    bold: marks.bold,
                    italic: marks.italic,
                    underline:
                        marks.underline,
                    color:
                        marks.color || "",
                };

                if (linkUrl) {
                    item.url = linkUrl;
                }

                const previous =
                    result[
                        result.length - 1
                    ];

                const sameFormatting =
                    previous &&
                    previous.type ===
                        item.type &&
                    previous.bold ===
                        item.bold &&
                    previous.italic ===
                        item.italic &&
                    previous.underline ===
                        item.underline &&
                    previous.color ===
                        item.color &&
                    previous.url ===
                        item.url;

                if (sameFormatting) {
                    previous.text +=
                        item.text;
                } else {
                    result.push(item);
                }

                return;
            }

            // Ignore non-element nodes
            if (
                node.nodeType !==
                Node.ELEMENT_NODE
            ) {
                return;
            }

            const tagName =
                node.tagName.toLowerCase();

            // Line break
            if (tagName === "br") {
                const previous =
                    result[
                        result.length - 1
                    ];

                if (previous) {
                    previous.text += "\n";
                } else {
                    result.push({
                        type: "text",
                        text: "\n",
                        bold: marks.bold,
                        italic: marks.italic,
                        underline:
                            marks.underline,
                        color:
                            marks.color || "",
                    });
                }

                return;
            }

            const nextMarks = {
                bold:
                    marks.bold ||
                    tagName === "strong" ||
                    tagName === "b",

                italic:
                    marks.italic ||
                    tagName === "em" ||
                    tagName === "i",

                underline:
                    marks.underline ||
                    tagName === "u",

                color:
                    marks.color || "",
            };

            // Read color from style
            const styleColor =
                node.style?.color;

            // Read color from font
            const fontColor =
                node.getAttribute(
                    "color"
                );

            const elementColor =
                normalizeColor(
                    styleColor ||
                        fontColor ||
                        ""
                );

            if (elementColor) {
                nextMarks.color =
                    elementColor;
            }

            let nextLinkUrl =
                linkUrl;

            // Link
            if (tagName === "a") {
                nextLinkUrl =
                    node.getAttribute(
                        "href"
                    ) || "";
            }

            node.childNodes.forEach(
                (child) => {
                    walk(
                        child,
                        nextMarks,
                        nextLinkUrl
                    );
                }
            );
        };

        editor.childNodes.forEach(
            (node) => {
                walk(node);
            }
        );

        return result;
    };

    // Load value into editor
    useEffect(() => {
        const editor =
            editorRef.current;

        if (!editor) {
            return;
        }

        // Do not replace DOM while typing
        if (isEditorFocusedRef.current) {
            return;
        }

        const html =
            contentToHtml(value);

        if (
            editor.innerHTML !== html
        ) {
            editor.innerHTML = html;
        }
    }, [value]);

    // Sync editor with React state
    const syncContent = () => {
        const editor =
            editorRef.current;

        if (!editor) {
            return;
        }

        const content =
            serializeEditor(editor);

        onChange?.(content);
    };

    // Apply Bold / Italic / Underline
    const applyFormat = (
        command
    ) => {
        const editor =
            editorRef.current;

        if (!editor) {
            return;
        }

        editor.focus();

        document.execCommand(
            command,
            false,
            null
        );

        syncContent();
    };

    // Save selected text
    const saveSelection = () => {
        const selection =
            window.getSelection();

        if (
            !selection ||
            selection.rangeCount === 0
        ) {
            return false;
        }

        const range =
            selection.getRangeAt(0);

        if (
            !editorRef.current?.contains(
                range.commonAncestorContainer
            )
        ) {
            return false;
        }

        if (range.collapsed) {
            return false;
        }

        savedRangeRef.current =
            range.cloneRange();

        return true;
    };

    // Restore selected text
    const restoreSelection = () => {
        const selection =
            window.getSelection();

        const range =
            savedRangeRef.current;

        if (!selection || !range) {
            return;
        }

        selection.removeAllRanges();
        selection.addRange(range);
    };

    // Apply selected text color
    const applyTextColor = (
        color
    ) => {
        if (!color) {
            return;
        }

        restoreSelection();

        const editor =
            editorRef.current;

        if (!editor) {
            return;
        }

        editor.focus();

        document.execCommand(
            "foreColor",
            false,
            color
        );

        setTextColor(color);

        syncContent();

        savedRangeRef.current =
            null;
    };

    // Save selection before opening color picker
    const handleColorMouseDown = () => {
        saveSelection();
    };

    // Open link popup
    const openLinkPopup = () => {
        const hasSelection =
            saveSelection();

        if (!hasSelection) {
            return;
        }

        setLinkUrl("");
        setShowLinkPopup(true);
    };

    // Add link
    const addLink = () => {
        if (!linkUrl.trim()) {
            return;
        }

        restoreSelection();

        const editor =
            editorRef.current;

        if (!editor) {
            return;
        }

        editor.focus();

        document.execCommand(
            "createLink",
            false,
            linkUrl.trim()
        );

        setShowLinkPopup(false);
        setLinkUrl("");

        savedRangeRef.current =
            null;

        syncContent();
    };

    // Close link popup
    const closeLinkPopup = () => {
        setShowLinkPopup(false);
        setLinkUrl("");

        savedRangeRef.current =
            null;
    };

    // Keep Enter behavior
    const handleKeyDown = (
        event
    ) => {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    };

    // Plain text paste
    const handlePaste = (
        event
    ) => {
        event.preventDefault();

        const text =
            event.clipboardData.getData(
                "text/plain"
            );

        document.execCommand(
            "insertText",
            false,
            text
        );

        syncContent();
    };

    return (
        <div className="relative overflow-visible rounded-xl border border-[#C8D5EA] focus-within:border-[#3869D0] focus-within:ring-4 focus-within:ring-[#3869D0]/10">
            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b border-[#C8D5EA] bg-[#F8FAFF] p-2">
                {/* Bold */}
                <button
                    type="button"
                    onMouseDown={(event) => {
                        event.preventDefault();

                        applyFormat(
                            "bold"
                        );
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--navy)] transition hover:bg-white hover:text-[#3869D0]"
                    title="Bold"
                    aria-label="Bold"
                >
                    <Bold size={17} />
                </button>

                {/* Italic */}
                <button
                    type="button"
                    onMouseDown={(event) => {
                        event.preventDefault();

                        applyFormat(
                            "italic"
                        );
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--navy)] transition hover:bg-white hover:text-[#3869D0]"
                    title="Italic"
                    aria-label="Italic"
                >
                    <Italic size={17} />
                </button>

                {/* Underline */}
                <button
                    type="button"
                    onMouseDown={(event) => {
                        event.preventDefault();

                        applyFormat(
                            "underline"
                        );
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--navy)] transition hover:bg-white hover:text-[#3869D0]"
                    title="Underline"
                    aria-label="Underline"
                >
                    <Underline size={17} />
                </button>

                {/* Link */}
                <button
                    type="button"
                    onMouseDown={(event) => {
                        event.preventDefault();

                        openLinkPopup();
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--navy)] transition hover:bg-white hover:text-[#3869D0]"
                    title="Add Link"
                    aria-label="Add Link"
                >
                    <LinkIcon size={17} />
                </button>

                {/* Color */}
                <div className="relative flex h-9 w-9 items-center justify-center">
                    <label
                        htmlFor={
                            colorInputId
                        }
                        onMouseDown={
                            handleColorMouseDown
                        }
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[var(--navy)] transition hover:bg-white hover:text-[#3869D0]"
                        title="Text Color"
                    >
                        <Palette size={17} />

                        <span
                            className="absolute bottom-1.5 h-1 w-4 rounded-full"
                            style={{
                                backgroundColor:
                                    textColor,
                            }}
                        />
                    </label>

                    <input
                        id={colorInputId}
                        type="color"
                        value={textColor}
                        onChange={(event) => {
                            applyTextColor(
                                event.target
                                    .value
                            );
                        }}
                        className="absolute h-0 w-0 opacity-0"
                        tabIndex={-1}
                    />
                </div>
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncContent}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onFocus={() => {
                    isEditorFocusedRef.current =
                        true;
                }}
                onBlur={() => {
                    isEditorFocusedRef.current =
                        false;
                }}
                data-placeholder={
                    placeholder
                }
                className="
                    min-h-[150px]
                    w-full
                    px-4
                    py-3
                    text-sm
                    leading-7
                    text-[var(--navy)]
                    outline-none
                    empty:before:pointer-events-none
                    empty:before:text-[#8A99AD]
                    empty:before:content-[attr(data-placeholder)]
                "
            />

            {/* Link Popup */}
            {showLinkPopup && (
                <div className="absolute left-1/2 top-16 z-[1000] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-[#C8D5EA] bg-white p-4 shadow-[0_15px_50px_rgba(16,42,67,0.18)]">
                    <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[var(--navy)]">
                            Add Link
                        </h4>

                        <button
                            type="button"
                            onClick={
                                closeLinkPopup
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[#F2F6FF]"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <label className="mb-2 block text-xs font-semibold text-[var(--navy)]">
                        Link URL
                    </label>

                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(event) =>
                            setLinkUrl(
                                event.target
                                    .value
                            )
                        }
                        onKeyDown={(event) => {
                            if (
                                event.key ===
                                "Enter"
                            ) {
                                event.preventDefault();
                                addLink();
                            }

                            if (
                                event.key ===
                                "Escape"
                            ) {
                                closeLinkPopup();
                            }
                        }}
                        autoFocus
                        placeholder="https://example.com"
                        className="w-full rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10"
                    />

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={
                                closeLinkPopup
                            }
                            className="rounded-xl border border-[#C8D5EA] px-4 py-2.5 text-sm font-semibold text-[var(--navy)] hover:bg-[#F8FAFF]"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={addLink}
                            disabled={
                                !linkUrl.trim()
                            }
                            className="rounded-xl bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Add Link
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RichTextEditor;