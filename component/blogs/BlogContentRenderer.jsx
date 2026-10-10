import { getSafeBlogUrl } from "./safeBlogUrl";

const renderRichText = (content = []) => {
    return content.map((item, index) => {
        const text = item.text || "";

        const lines = text.split("\n");

        const renderText = (
            line,
            lineIndex
        ) => {
            let element = line;

            if (item.bold) {
                element = (
                    <strong>
                        {element}
                    </strong>
                );
            }

            if (item.italic) {
                element = (
                    <em>
                        {element}
                    </em>
                );
            }

            if (item.underline) {
                element = (
                    <u>
                        {element}
                    </u>
                );
            }

            return (
                <span
                    key={lineIndex}
                    style={
                        item.color
                            ? {
                                  color: item.color,
                              }
                            : undefined
                    }
                >
                    {lineIndex > 0 && (
                        <br />
                    )}

                    {element}
                </span>
            );
        };

        if (item.type === "link") {
            const safeUrl = getSafeBlogUrl(item.url);

            if (!safeUrl) {
                return (
                    <span key={index}>
                        {lines.map(renderText)}
                    </span>
                );
            }

            return (
                <a
                    key={index}
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {lines.map(
                        renderText
                    )}
                </a>
            );
        }

        return (
            <span key={index}>
                {lines.map(
                    renderText
                )}
            </span>
        );
    });
};

const BlogContentRenderer = ({
    content = [],
}) => {
    return (
        <div>
            {content.map(
                (block, index) => {
                    if (
                        block.type ===
                        "heading"
                    ) {
                        const HeadingTag =
                            block.level ===
                                3
                                ? "h3"
                                : "h2";

                        return (
                            <HeadingTag
                                key={
                                    index
                                }
                            >
                                {renderRichText(
                                    block.content
                                )}
                            </HeadingTag>
                        );
                    }

                    if (
                        block.type ===
                        "paragraph"
                    ) {
                        return (
                            <p
                                key={
                                    index
                                }
                            >
                                {renderRichText(
                                    block.content
                                )}
                            </p>
                        );
                    }

                    return null;
                }
            )}
        </div>
    );
};

export default BlogContentRenderer;