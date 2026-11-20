export function generateStaticParams() {
    return [{ id: "none" }];
}

export default function BlogDetailPage() {
    return null;
}

// "use client";
// 
// import {
//     useContext,
//     useEffect,
//     useState,
// } from "react";
// 
// import Image from "next/image";
// import { useParams, useRouter } from "next/navigation";
// import { getSafeBlogUrl } from "@/component/blogs/safeBlogUrl";
// 
// import {
//     ArrowLeft,
//     CalendarDays,
//     Edit3,
//     Tag,
// } from "lucide-react";
// 
// import { AuthContext } from "@/context/AuthContext";
// 
// import { getBlogById } from "@/services/blogService";
// 
// const BlogDetailPage = () => {
//     const router = useRouter();
//     const params = useParams();
// 
//     const {
//         user,
//         loading: authLoading,
//     } = useContext(AuthContext);
// 
//     const [blog, setBlog] = useState(null);
//     const [loading, setLoading] =
//         useState(true);
//     const [error, setError] = useState("");
// 
//     const blogId = params?.id;
// 
//     useEffect(() => {
//         if (authLoading) {
//             return;
//         }
// 
//         if (!user) {
//             router.replace("/login");
//             return;
//         }
// 
//         if (!["superAdmin", "admin"].includes(user.role)) {
//             router.replace(
//                 "/admin/dashboard"
//             );
//             return;
//         }
// 
//         if (!blogId) {
//             window.setTimeout(() => {
//                 setError("Blog ID is missing");
//                 setLoading(false);
//             }, 0);
//             return;
//         }
// 
//         const fetchBlog = async () => {
//             try {
//                 setLoading(true);
//                 setError("");
// 
//                 const response =
//                     await getBlogById(
//                         blogId
//                     );
// 
//                 setBlog(
//                     response?.data || null
//                 );
//             } catch (error) {
//                 setError(
//                     error?.message ||
//                         "Failed to load blog"
//                 );
//             } finally {
//                 setLoading(false);
//             }
//         };
// 
//         fetchBlog();
//     }, [
//         user,
//         authLoading,
//         blogId,
//         router,
//     ]);
// 
//     if (
//         authLoading ||
//         loading
//     ) {
//         return (
//             <main className="flex min-h-screen items-center justify-center bg-[#F2F6FF]">
//                 <p className="text-sm text-[var(--navy)]">
//                     Loading blog...
//                 </p>
//             </main>
//         );
//     }
// 
//     if (error) {
//         return (
//             <main className="flex min-h-screen items-center justify-center bg-[#F2F6FF] px-4">
//                 <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
//                     <p className="text-sm text-red-600">
//                         {error}
//                     </p>
// 
//                     <button
//                         type="button"
//                         onClick={() =>
//                             router.push(
//                                 "/admin/blogs"
//                             )
//                         }
//                         className="mt-4 rounded-xl bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white"
//                     >
//                         Back to Blogs
//                     </button>
//                 </div>
//             </main>
//         );
//     }
// 
//     if (!blog) {
//         return (
//             <main className="flex min-h-screen items-center justify-center bg-[#F2F6FF]">
//                 <p className="text-sm text-[var(--muted)]">
//                     Blog not found.
//                 </p>
//             </main>
//         );
//     }
// 
//     const categoryName =
//         blog.category?.name ||
//         "Uncategorized";
// 
//     const authorName =
//         blog.author?.name ||
//         "Admin";
// 
//     const publishedDate =
//         blog.publishedAt
//             ? new Date(
//                   blog.publishedAt
//               ).toLocaleDateString(
//                   "en-IN",
//                   {
//                       day: "2-digit",
//                       month: "long",
//                       year: "numeric",
//                   }
//               )
//             : null;
// 
//     return (
//         <main className="min-h-screen bg-[#F2F6FF] px-4 pb-10 pt-20 md:px-6 lg:pt-8">
//             <div className="mx-auto max-w-5xl">
// 
//                 {/* Header */}
// 
//                 <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
// 
//                     <button
//                         type="button"
//                         onClick={() =>
//                             router.push(
//                                 "/admin/blogs"
//                             )
//                         }
//                         className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#C8D5EA] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--navy)] transition hover:border-[#3869D0]/40 hover:bg-[#F8FAFF]"
//                     >
//                         <ArrowLeft
//                             size={17}
//                         />
// 
//                         Back to Blogs
//                     </button>
// 
//                     <button
//                         type="button"
//                         onClick={() =>
//                             router.push(
//                                 `/admin/blogs/${blog._id}/edit`
//                             )
//                         }
//                         className="inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
//                     >
//                         <Edit3 size={17} />
// 
//                         Edit Blog
//                     </button>
// 
//                 </div>
// 
//                 <article className="overflow-hidden rounded-3xl border border-[#C8D5EA]/70 bg-white shadow-[0_12px_45px_rgba(16,42,67,0.10)]">
// 
//                     {/* Featured Image */}
// 
//                     {blog.featuredImage
//                         ?.url && (
//                         <div className="relative h-64 w-full overflow-hidden bg-[#F2F6FF] md:h-96">
// 
//                             <Image
//                                 src={
//                                     blog
//                                         .featuredImage
//                                         .url
//                                 }
//                                 alt={
//                                     blog.title
//                                 }
//                                 fill
//                                 sizes="(max-width: 768px) 100vw, 1024px"
//                                 className="object-cover"
//                             />
// 
//                         </div>
//                     )}
// 
//                     <div className="p-6 md:p-10">
// 
//                         {/* Meta */}
// 
//                         <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
// 
//                             <div className="flex items-center gap-1.5 text-[#3869D0]">
// 
//                                 <Tag
//                                     size={15}
//                                 />
// 
//                                 <span className="font-semibold">
//                                     {
//                                         categoryName
//                                     }
//                                 </span>
// 
//                             </div>
// 
//                             <span
//                                 className={`rounded-full px-3 py-1 text-xs font-semibold ${
//                                     blog.status ===
//                                     "published"
//                                         ? "bg-emerald-50 text-emerald-700"
//                                         : "bg-amber-50 text-amber-700"
//                                 }`}
//                             >
//                                 {blog.status ===
//                                 "published"
//                                     ? "Published"
//                                     : "Draft"}
//                             </span>
// 
//                             {publishedDate && (
//                                 <div className="flex items-center gap-1.5">
// 
//                                     <CalendarDays
//                                         size={
//                                             15
//                                         }
//                                     />
// 
//                                     <span>
//                                         {
//                                             publishedDate
//                                         }
//                                     </span>
// 
//                                 </div>
//                             )}
// 
//                             <span>
//                                 By{" "}
//                                 {
//                                     authorName
//                                 }
//                             </span>
// 
//                         </div>
// 
//                         {/* Title */}
// 
//                         <h1 className="text-3xl font-bold leading-tight text-[var(--navy)] md:text-4xl">
//                             {blog.title}
//                         </h1>
// 
//                         {/* Excerpt */}
// 
//                         {blog.excerpt && (
//                             <p className="mt-5 max-w-4xl text-base leading-7 text-[var(--muted)] md:text-lg">
//                                 {
//                                     blog.excerpt
//                                 }
//                             </p>
//                         )}
// 
//                         {/* Content */}
// 
//                         <div className="mt-8 border-t border-[#C8D5EA]/60 pt-8">
// 
//                             {blog.content?.map(
//                                 (
//                                     block,
//                                     index
//                                 ) => (
//                                     <ContentBlock
//                                         key={`${block.type}-${index}`}
//                                         block={
//                                             block
//                                         }
//                                     />
//                                 )
//                             )}
// 
//                         </div>
// 
//                     </div>
// 
//                 </article>
// 
//             </div>
//         </main>
//     );
// };
// 
// const renderRichText = (
//     items = []
// ) => {
//     if (!Array.isArray(items)) {
//         return null;
//     }
// 
//     return items.map(
//         (item, index) => {
//             if (
//                 !item ||
//                 typeof item.text !==
//                     "string"
//             ) {
//                 return null;
//             }
// 
//             const style = {};
// 
//             if (item.color) {
//                 style.color =
//                     item.color;
//             }
// 
//             let content =
//                 item.text;
// 
//             if (item.bold) {
//                 content = (
//                     <strong>
//                         {content}
//                     </strong>
//                 );
//             }
// 
//             if (item.italic) {
//                 content = (
//                     <em>
//                         {content}
//                     </em>
//                 );
//             }
// 
//             if (item.underline) {
//                 content = (
//                     <u>
//                         {content}
//                     </u>
//                 );
//             }
// 
//             const safeUrl = getSafeBlogUrl(item.url);
// 
//             if (safeUrl) {
//                 content = (
//                     <a
//                         href={
//                             safeUrl
//                         }
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="underline underline-offset-2"
//                     >
//                         {content}
//                     </a>
//                 );
//             }
// 
//             return (
//                 <span
//                     key={index}
//                     style={style}
//                 >
//                     {content}
//                 </span>
//             );
//         }
//     );
// };
// 
// const ContentBlock = ({
//     block,
// }) => {
//     switch (block.type) {
//         case "heading":
//             return (
//                 <HeadingBlock
//                     block={block}
//                 />
//             );
// 
//         case "paragraph":
//             return (
//                 <ParagraphBlock
//                     block={block}
//                 />
//             );
// 
//         case "image":
//             return (
//                 <ImageBlock
//                     block={block}
//                 />
//             );
// 
//         case "list":
//             return (
//                 <ListBlock
//                     block={block}
//                 />
//             );
// 
//         case "table":
//             return (
//                 <TableBlock
//                     block={block}
//                 />
//             );
// 
//         case "quote":
//             return (
//                 <QuoteBlock
//                     block={block}
//                 />
//             );
// 
//         case "faq":
//             return (
//                 <FaqBlock
//                     block={block}
//                 />
//             );
// 
//         case "link":
//             return (
//                 <LinkBlock
//                     block={block}
//                 />
//             );
// 
//         default:
//             return null;
//     }
// };
// 
// const HeadingBlock = ({
//     block,
// }) => {
//     const Heading =
//         block.level === 3
//             ? "h3"
//             : "h2";
// 
//     return (
//         <Heading
//             className={`font-bold text-[var(--navy)] ${
//                 block.level === 3
//                     ? "mb-4 mt-8 text-xl"
//                     : "mb-5 mt-10 text-2xl"
//             }`}
//         >
//             {renderRichText(
//                 block.content
//             )}
//         </Heading>
//     );
// };
// 
// const ParagraphBlock = ({
//     block,
// }) => {
//     return (
//         <p className="mb-5 text-base leading-8 text-[var(--muted)]">
//             {renderRichText(
//                 block.content
//             )}
//         </p>
//     );
// };
// 
// const ImageBlock = ({
//     block,
// }) => {
//     const image = (
//         <figure className="my-8">
// 
//             <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#F2F6FF]">
// 
//                 <Image
//                     src={block.url}
//                     alt={
//                         block.alt ||
//                         ""
//                     }
//                     fill
//                     sizes="(max-width: 768px) 100vw, 900px"
//                     className="object-cover"
//                 />
// 
//             </div>
// 
//             {block.caption && (
//                 <figcaption className="mt-2 text-center text-sm text-[var(--muted)]">
//                     {
//                         block.caption
//                     }
//                 </figcaption>
//             )}
// 
//         </figure>
//     );
// 
//     const safeImageLink = getSafeBlogUrl(block.link);
// 
//     if (!safeImageLink) {
//         return image;
//     }
// 
//     return (
//         <a
//             href={safeImageLink}
//             target="_blank"
//             rel="noopener noreferrer"
//         >
//             {image}
//         </a>
//     );
// };
// 
// const ListBlock = ({
//     block,
// }) => {
//     const ListTag =
//         block.listType ===
//         "ordered"
//             ? "ol"
//             : "ul";
// 
//     return (
//         <ListTag
//             className={`mb-6 space-y-2 pl-6 text-base leading-7 text-[var(--muted)] ${
//                 block.listType ===
//                 "ordered"
//                     ? "list-decimal"
//                     : "list-disc"
//             }`}
//         >
//             {block.items?.map(
//                 (
//                     item,
//                     index
//                 ) => (
//                     <li
//                         key={
//                             index
//                         }
//                     >
//                         {renderRichText(
//                             item
//                         )}
//                     </li>
//                 )
//             )}
//         </ListTag>
//     );
// };
// 
// const TableBlock = ({
//     block,
// }) => {
//     return (
//         <div className="my-8 overflow-x-auto rounded-2xl border border-[#C8D5EA]">
// 
//             <table className="w-full min-w-[600px] border-collapse text-sm">
// 
//                 <thead>
//                     <tr className="bg-[var(--navy)] text-white">
// 
//                         {block.headers?.map(
//                             (
//                                 header,
//                                 index
//                             ) => (
//                                 <th
//                                     key={
//                                         index
//                                     }
//                                     className="border border-white/10 px-4 py-3 text-left font-semibold"
//                                 >
//                                     {
//                                         header
//                                     }
//                                 </th>
//                             )
//                         )}
// 
//                     </tr>
//                 </thead>
// 
//                 <tbody>
// 
//                     {block.rows?.map(
//                         (
//                             row,
//                             rowIndex
//                         ) => (
//                             <tr
//                                 key={
//                                     rowIndex
//                                 }
//                                 className="odd:bg-white even:bg-[#F8FAFF]"
//                             >
// 
//                                 {row.map(
//                                     (
//                                         cell,
//                                         cellIndex
//                                     ) => (
//                                         <td
//                                             key={
//                                                 cellIndex
//                                             }
//                                             className="border border-[#C8D5EA] px-4 py-3 text-[var(--muted)]"
//                                         >
//                                             {
//                                                 cell
//                                             }
//                                         </td>
//                                     )
//                                 )}
// 
//                             </tr>
//                         )
//                     )}
// 
//                 </tbody>
// 
//             </table>
// 
//         </div>
//     );
// };
// 
// const QuoteBlock = ({
//     block,
// }) => {
//     return (
//         <blockquote className="my-8 rounded-r-2xl border-l-4 border-[var(--gold)] bg-[#F8FAFF] px-6 py-5 text-lg font-medium italic leading-8 text-[var(--navy)]">
// 
//             “
//             {renderRichText(
//                 block.content
//             )}
//             ”
// 
//         </blockquote>
//     );
// };
// 
// const LinkBlock = ({
//     block,
// }) => {
//     const safeLinkUrl = getSafeBlogUrl(block.url);
// 
//     if (!safeLinkUrl) {
//         return null;
//     }
// 
//     return (
//         <div className="mb-6">
//             <a
//                 href={safeLinkUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="font-semibold text-[#3869D0] underline underline-offset-2"
//             >
//                 {
//                     block.text
//                 }
//             </a>
//         </div>
//     );
// };
// 
// const FaqBlock = ({
//     block,
// }) => {
//     return (
//         <section className="my-10">
// 
//             <h2 className="mb-5 text-2xl font-bold text-[var(--navy)]">
//                 Frequently Asked
//                 Questions
//             </h2>
// 
//             <div className="space-y-4">
// 
//                 {block.items?.map(
//                     (
//                         item,
//                         index
//                     ) => (
//                         <details
//                             key={
//                                 index
//                             }
//                             className="group rounded-2xl border border-[#C8D5EA] bg-[#F8FAFF] p-5"
//                         >
// 
//                             <summary className="cursor-pointer list-none font-semibold text-[var(--navy)]">
// 
//                                 <div className="flex items-center justify-between gap-4">
// 
//                                     <span>
//                                         {renderRichText(
//                                             item.question
//                                         )}
//                                     </span>
// 
//                                     <span className="text-[#3869D0] transition group-open:rotate-45">
//                                         +
//                                     </span>
// 
//                                 </div>
// 
//                             </summary>
// 
//                             <div className="mt-4 border-t border-[#C8D5EA] pt-4 text-sm leading-7 text-[var(--muted)]">
// 
//                                 {renderRichText(
//                                     item.answer
//                                 )}
// 
//                             </div>
// 
//                         </details>
//                     )
//                 )}
// 
//             </div>
// 
//         </section>
//     );
// };
// 
// export default BlogDetailPage;