"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

const createRichText = () => [
    {
        type: "text",
        text: "",
        bold: false,
        italic: false,
        underline: false,
        color: "",
    },
];

const createBlock = (type) => {
    switch (type) {
        case "heading":
            return {
                type: "heading",
                level: 2,
                content: createRichText(),
            };

        case "paragraph":
            return {
                type: "paragraph",
                content: createRichText(),
            };

        case "image":
            return {
                type: "image",
                url: "",
                publicId: "",
                alt: "",
                caption: "",
                link: "",
                file: null,
            };

        case "link":
            return {
                type: "link",
                text: "",
                url: "",
                target: "_blank",
            };

        case "list":
            return {
                type: "list",
                listType: "unordered",
                items: [
                    createRichText(),
                ],
            };

        case "table":
            return {
                type: "table",
                headers: [""],
                rows: [[""]],
            };

        case "quote":
            return {
                type: "quote",
                content: createRichText(),
            };

        case "faq":
            return {
                type: "faq",
                items: [
                    {
                        question:
                            createRichText(),
                        answer:
                            createRichText(),
                    },
                ],
            };

        default:
            return null;
    }
};

const blockOptions = [
    {
        value: "heading",
        label: "Heading",
    },
    {
        value: "paragraph",
        label: "Paragraph",
    },
    {
        value: "image",
        label: "Image",
    },
    {
        value: "link",
        label: "Link",
    },
    {
        value: "list",
        label: "List",
    },
    {
        value: "table",
        label: "Table",
    },
    {
        value: "quote",
        label: "Quote",
    },
    {
        value: "faq",
        label: "FAQ",
    },
];

const BlogContentEditor = ({
    value = [],
    onChange,
}) => {
    const [selectedBlock, setSelectedBlock] =
        useState("paragraph");

    const addBlock = () => {
        const newBlock =
            createBlock(selectedBlock);

        if (!newBlock) {
            return;
        }

        onChange?.([
            ...value,
            newBlock,
        ]);
    };

    const updateBlock = (
        index,
        updatedBlock
    ) => {
        const updatedContent = [
            ...value,
        ];

        updatedContent[index] =
            updatedBlock;

        onChange?.(updatedContent);
    };

    const deleteBlock = (index) => {
        const updatedContent =
            value.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            );

        onChange?.(updatedContent);
    };

    return (
        <div className="space-y-5">
            {/* Add Block */}
            <div className="rounded-xl border border-[#C8D5EA] bg-[#F8FAFF] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                        value={selectedBlock}
                        onChange={(event) =>
                            setSelectedBlock(
                                event.target.value
                            )
                        }
                        className="flex-1 rounded-xl border border-[#C8D5EA] bg-white px-4 py-3 text-sm text-[var(--navy)] outline-none focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10"
                    >
                        {blockOptions.map(
                            (option) => (
                                <option
                                    key={
                                        option.value
                                    }
                                    value={
                                        option.value
                                    }
                                >
                                    {
                                        option.label
                                    }
                                </option>
                            )
                        )}
                    </select>

                    <button
                        type="button"
                        onClick={addBlock}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                        <Plus size={17} />

                        Add Block
                    </button>
                </div>
            </div>

            {/* Content Blocks */}
            <div className="space-y-5">
                {value.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#C8D5EA] bg-[#F8FAFF] p-8 text-center text-sm text-[#8A99AD]">
                        No content blocks added yet.
                    </div>
                ) : (
                    value.map(
                        (block, index) => (
                            <ContentBlockEditor
                                key={index}
                                block={block}
                                index={index}
                                onChange={
                                    updateBlock
                                }
                                onDelete={
                                    deleteBlock
                                }
                            />
                        )
                    )
                )}
            </div>
        </div>
    );
};

const ContentBlockEditor = ({
    block,
    index,
    onChange,
    onDelete,
}) => {
    const updateField = (
        field,
        value
    ) => {
        onChange(index, {
            ...block,
            [field]: value,
        });
    };

    return (
        <div className="rounded-2xl border border-[#C8D5EA] bg-white p-5 shadow-sm">
            {/* Block Header */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#3869D0]">
                        {block.type}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        onDelete(index)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                    title="Delete block"
                    aria-label="Delete block"
                >
                    <Trash2 size={17} />
                </button>
            </div>

            {/* Heading */}
            {block.type ===
                "heading" && (
                <div className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            Heading Level
                        </label>

                        <select
                            value={
                                block.level ||
                                2
                            }
                            onChange={(
                                event
                            ) =>
                                updateField(
                                    "level",
                                    Number(
                                        event
                                            .target
                                            .value
                                    )
                                )
                            }
                            className="w-full rounded-xl border border-[#C8D5EA] bg-white px-4 py-3 text-sm text-[var(--navy)] outline-none focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10"
                        >
                            <option value={2}>
                                H2
                            </option>

                            <option value={3}>
                                H3
                            </option>
                        </select>
                    </div>

                    <RichTextEditor
                        value={
                            block.content ||
                            createRichText()
                        }
                        onChange={(
                            content
                        ) =>
                            updateField(
                                "content",
                                content
                            )
                        }
                        placeholder="Enter heading..."
                    />
                </div>
            )}

            {/* Paragraph */}
            {block.type ===
                "paragraph" && (
                <RichTextEditor
                    value={
                        block.content ||
                        createRichText()
                    }
                    onChange={(
                        content
                    ) =>
                        updateField(
                            "content",
                            content
                        )
                    }
                    placeholder="Enter paragraph..."
                />
            )}

            {/* Image */}
            {block.type ===
                "image" && (
                <div className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            Image
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(
                                event
                            ) =>
                                updateField(
                                    "file",
                                    event
                                        .target
                                        .files?.[0] ||
                                        null
                                )
                            }
                            className="w-full rounded-xl border border-[#C8D5EA] bg-white px-4 py-3 text-sm"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            Alt Text
                        </label>

                        <input
                            type="text"
                            value={
                                block.alt ||
                                ""
                            }
                            onChange={(
                                event
                            ) =>
                                updateField(
                                    "alt",
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Enter image alt text"
                            className="w-full rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            Caption
                        </label>

                        <input
                            type="text"
                            value={
                                block.caption ||
                                ""
                            }
                            onChange={(
                                event
                            ) =>
                                updateField(
                                    "caption",
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Enter image caption"
                            className="w-full rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            Image Link
                        </label>

                        <input
                            type="url"
                            value={
                                block.link ||
                                ""
                            }
                            onChange={(
                                event
                            ) =>
                                updateField(
                                    "link",
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="https://example.com"
                            className="w-full rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10"
                        />
                    </div>
                </div>
            )}

            {/* Link Block */}
            {block.type ===
                "link" && (
                <div className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            Link Text
                        </label>

                        <input
                            type="text"
                            value={
                                block.text ||
                                ""
                            }
                            onChange={(
                                event
                            ) =>
                                updateField(
                                    "text",
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Enter link text"
                            className="w-full rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            URL
                        </label>

                        <input
                            type="url"
                            value={
                                block.url ||
                                ""
                            }
                            onChange={(
                                event
                            ) =>
                                updateField(
                                    "url",
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="https://example.com"
                            className="w-full rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10"
                        />
                    </div>
                </div>
            )}

            {/* List */}
            {block.type ===
                "list" && (
                <div className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            List Type
                        </label>

                        <select
                            value={
                                block.listType ||
                                "unordered"
                            }
                            onChange={(
                                event
                            ) =>
                                updateField(
                                    "listType",
                                    event
                                        .target
                                        .value
                                )
                            }
                            className="w-full rounded-xl border border-[#C8D5EA] bg-white px-4 py-3 text-sm text-[var(--navy)] outline-none focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10"
                        >
                            <option value="unordered">
                                Unordered List
                            </option>

                            <option value="ordered">
                                Ordered List
                            </option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        {(block.items ||
                            []).map(
                            (
                                item,
                                itemIndex
                            ) => (
                                <div
                                    key={
                                        itemIndex
                                    }
                                    className="flex gap-3"
                                >
                                    <div className="flex-1">
                                        <RichTextEditor
                                            value={
                                                item ||
                                                createRichText()
                                            }
                                            onChange={(
                                                content
                                            ) => {
                                                const items =
                                                    [
                                                        ...(block.items ||
                                                            []),
                                                    ];

                                                items[
                                                    itemIndex
                                                ] =
                                                    content;

                                                updateField(
                                                    "items",
                                                    items
                                                );
                                            }}
                                            placeholder="Enter list item..."
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const items =
                                                (
                                                    block.items ||
                                                    []
                                                ).filter(
                                                    (
                                                        _,
                                                        itemIndexToDelete
                                                    ) =>
                                                        itemIndexToDelete !==
                                                        itemIndex
                                                );

                                            updateField(
                                                "items",
                                                items
                                            );
                                        }}
                                        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                                        title="Delete item"
                                        aria-label="Delete item"
                                    >
                                        <Trash2
                                            size={
                                                17
                                            }
                                        />
                                    </button>
                                </div>
                            )
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            updateField(
                                "items",
                                [
                                    ...(block.items ||
                                        []),
                                    createRichText(),
                                ]
                            );
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#C8D5EA] px-4 py-2.5 text-sm font-semibold text-[var(--navy)] hover:bg-[#F8FAFF]"
                    >
                        <Plus size={16} />

                        Add List Item
                    </button>
                </div>
            )}

            {/* Table */}
            {block.type ===
                "table" && (
                <div className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            Headers
                        </label>

                        <div className="space-y-2">
                            {(
                                block.headers ||
                                []
                            ).map(
                                (
                                    header,
                                    headerIndex
                                ) => (
                                    <div
                                        key={
                                            headerIndex
                                        }
                                        className="flex gap-2"
                                    >
                                        <input
                                            type="text"
                                            value={
                                                header
                                            }
                                            onChange={(
                                                event
                                            ) => {
                                                const headers =
                                                    [
                                                        ...(block.headers ||
                                                            []),
                                                    ];

                                                headers[
                                                    headerIndex
                                                ] =
                                                    event
                                                        .target
                                                        .value;

                                                updateField(
                                                    "headers",
                                                    headers
                                                );
                                            }}
                                            className="flex-1 rounded-xl border border-[#C8D5EA] px-4 py-3 text-sm outline-none focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10"
                                            placeholder={`Header ${
                                                headerIndex +
                                                1
                                            }`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const headers =
                                                    (
                                                        block.headers ||
                                                        []
                                                    ).filter(
                                                        (
                                                            _,
                                                            deleteIndex
                                                        ) =>
                                                            deleteIndex !==
                                                            headerIndex
                                                    );

                                                updateField(
                                                    "headers",
                                                    headers
                                                );
                                            }}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2
                                                size={
                                                    16
                                                }
                                            />
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            updateField(
                                "headers",
                                [
                                    ...(block.headers ||
                                        []),
                                    "",
                                ]
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-[#C8D5EA] px-4 py-2.5 text-sm font-semibold text-[var(--navy)] hover:bg-[#F8FAFF]"
                    >
                        <Plus size={16} />

                        Add Column
                    </button>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                            Rows
                        </label>

                        <div className="space-y-3">
                            {(
                                block.rows ||
                                []
                            ).map(
                                (
                                    row,
                                    rowIndex
                                ) => (
                                    <div
                                        key={
                                            rowIndex
                                        }
                                        className="flex gap-2"
                                    >
                                        <div className="flex flex-1 gap-2">
                                            {row.map(
                                                (
                                                    cell,
                                                    cellIndex
                                                ) => (
                                                    <input
                                                        key={
                                                            cellIndex
                                                        }
                                                        type="text"
                                                        value={
                                                            cell
                                                        }
                                                        onChange={(
                                                            event
                                                        ) => {
                                                            const rows =
                                                                (
                                                                    block.rows ||
                                                                    []
                                                                ).map(
                                                                    (
                                                                        currentRow,
                                                                        currentRowIndex
                                                                    ) =>
                                                                        currentRowIndex ===
                                                                        rowIndex
                                                                            ? currentRow.map(
                                                                                  (
                                                                                      currentCell,
                                                                                      currentCellIndex
                                                                                  ) =>
                                                                                      currentCellIndex ===
                                                                                      cellIndex
                                                                                          ? event
                                                                                                .target
                                                                                                .value
                                                                                          : currentCell
                                                                              )
                                                                            : currentRow
                                                                );

                                                            updateField(
                                                                "rows",
                                                                rows
                                                            );
                                                        }}
                                                        placeholder={`Cell ${
                                                            cellIndex +
                                                            1
                                                        }`}
                                                        className="min-w-0 flex-1 rounded-xl border border-[#C8D5EA] px-3 py-2.5 text-sm outline-none focus:border-[#3869D0] focus:ring-4 focus:ring-[#3869D0]/10"
                                                    />
                                                )
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const rows =
                                                    (
                                                        block.rows ||
                                                        []
                                                    ).filter(
                                                        (
                                                            _,
                                                            deleteIndex
                                                        ) =>
                                                            deleteIndex !==
                                                            rowIndex
                                                    );

                                                updateField(
                                                    "rows",
                                                    rows
                                                );
                                            }}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2
                                                size={
                                                    16
                                                }
                                            />
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            const columnCount =
                                (
                                    block.headers ||
                                    []
                                ).length ||
                                1;

                            updateField(
                                "rows",
                                [
                                    ...(block.rows ||
                                        []),
                                    Array(
                                        columnCount
                                    ).fill(""),
                                ]
                            );
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#C8D5EA] px-4 py-2.5 text-sm font-semibold text-[var(--navy)] hover:bg-[#F8FAFF]"
                    >
                        <Plus size={16} />

                        Add Row
                    </button>
                </div>
            )}

            {/* Quote */}
            {block.type ===
                "quote" && (
                <RichTextEditor
                    value={
                        block.content ||
                        createRichText()
                    }
                    onChange={(
                        content
                    ) =>
                        updateField(
                            "content",
                            content
                        )
                    }
                    placeholder="Enter quote..."
                />
            )}

            {/* FAQ */}
            {block.type ===
                "faq" && (
                <div className="space-y-5">
                    {(block.items ||
                        []).map(
                        (
                            faq,
                            faqIndex
                        ) => (
                            <div
                                key={
                                    faqIndex
                                }
                                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFF] p-4"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-[var(--navy)]">
                                        FAQ{" "}
                                        {faqIndex +
                                            1}
                                    </h4>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const items =
                                                (
                                                    block.items ||
                                                    []
                                                ).filter(
                                                    (
                                                        _,
                                                        deleteIndex
                                                    ) =>
                                                        deleteIndex !==
                                                        faqIndex
                                                );

                                            updateField(
                                                "items",
                                                items
                                            );
                                        }}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2
                                            size={
                                                16
                                            }
                                        />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold text-[var(--navy)]">
                                            Question
                                        </label>

                                        <RichTextEditor
                                            value={
                                                faq.question ||
                                                createRichText()
                                            }
                                            onChange={(
                                                content
                                            ) => {
                                                const items =
                                                    (
                                                        block.items ||
                                                        []
                                                    ).map(
                                                        (
                                                            currentFaq,
                                                            currentIndex
                                                        ) =>
                                                            currentIndex ===
                                                            faqIndex
                                                                ? {
                                                                      ...currentFaq,
                                                                      question:
                                                                          content,
                                                                  }
                                                                : currentFaq
                                                    );

                                                updateField(
                                                    "items",
                                                    items
                                                );
                                            }}
                                            placeholder="Enter question..."
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs font-semibold text-[var(--navy)]">
                                            Answer
                                        </label>

                                        <RichTextEditor
                                            value={
                                                faq.answer ||
                                                createRichText()
                                            }
                                            onChange={(
                                                content
                                            ) => {
                                                const items =
                                                    (
                                                        block.items ||
                                                        []
                                                    ).map(
                                                        (
                                                            currentFaq,
                                                            currentIndex
                                                        ) =>
                                                            currentIndex ===
                                                            faqIndex
                                                                ? {
                                                                      ...currentFaq,
                                                                      answer:
                                                                          content,
                                                                  }
                                                                : currentFaq
                                                    );

                                                updateField(
                                                    "items",
                                                    items
                                                );
                                            }}
                                            placeholder="Enter answer..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    <button
                        type="button"
                        onClick={() => {
                            updateField(
                                "items",
                                [
                                    ...(block.items ||
                                        []),
                                    {
                                        question:
                                            createRichText(),
                                        answer:
                                            createRichText(),
                                    },
                                ]
                            );
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#C8D5EA] px-4 py-2.5 text-sm font-semibold text-[var(--navy)] hover:bg-[#F8FAFF]"
                    >
                        <Plus size={16} />

                        Add FAQ
                    </button>
                </div>
            )}
        </div>
    );
};

export default BlogContentEditor;