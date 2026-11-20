import { notFound } from "next/navigation";

export default function BlogsPage() {
    notFound();
}

// "use client";
// 
// import {
//     useCallback,
//     useContext,
//     useEffect,
//     useState,
// } from "react";
// 
// import { useRouter } from "next/navigation";
// 
// import {
//     FileText,
//     Plus,
//     Sparkles,
// } from "lucide-react";
// 
// import toast from "react-hot-toast";
// 
// import { AuthContext } from "@/context/AuthContext";
// 
// import {
//     getAdminBlogs,
//     getBlogCategories,
//     deleteBlog,
// } from "@/services/blogService";
// 
// import BlogFilters from "@/component/blogs/BlogFilters";
// import BlogGrid from "@/component/blogs/BlogGrid";
// import BlogPagination from "@/component/blogs/BlogPagination";
// import DeleteConfirmModal from "@/component/common/DeleteConfirmModal";
// import BlogCategoriesManager from "@/component/blogs/BlogCategoriesManager";
// 
// const BlogsPage = () => {
//     const router = useRouter();
// 
//     const {
//         user,
//         loading: authLoading,
//     } = useContext(AuthContext);
// 
//     const [blogs, setBlogs] = useState([]);
//     const [categories, setCategories] =
//         useState([]);
// 
//     const [loading, setLoading] =
//         useState(true);
// 
//     const [categoryLoading, setCategoryLoading] =
//         useState(true);

//     const [error, setError] =
//         useState("");
// 
//     const [search, setSearch] =
//         useState("");
// 
//     const [category, setCategory] =
//         useState("");
// 
//     const [status, setStatus] =
//         useState("");
// 
//     const [page, setPage] =
//         useState(1);
// 
//     const [limit] =
//         useState(9);
// 
//     const [pagination, setPagination] =
//         useState({
//             page: 1,
//             limit: 9,
//             totalBlogs: 0,
//             totalPages: 0,
//         });
// 
//     // Delete state
//     const [deleteTarget, setDeleteTarget] =
//         useState(null);
// 
//     const [deletingId, setDeletingId] =
//         useState(null);
// 
//     const fetchCategories = useCallback(async () => {
//         try {
//             setCategoryLoading(true);
// 
//             const response =
//                 await getBlogCategories();
// 
//             setCategories(
//                 response?.data || []
//             );
//         } catch (error) {
//             setCategories([]);
// 
//             setError(
//                 error?.message ||
//                     "Failed to load categories"
//             );
//         } finally {
//             setCategoryLoading(false);
//         }
//     }, []);
// 
//     const fetchBlogs = useCallback(async () => {
//         try {
//             setLoading(true);
//             setError("");
// 
//             const response =
//                 await getAdminBlogs({
//                     page,
//                     limit,
//                     search,
//                     category,
//                     status,
//                 });
// 
//             setBlogs(
//                 response?.data || []
//             );
// 
//             setPagination(
//                 response?.pagination || {
//                     page,
//                     limit,
//                     totalBlogs: 0,
//                     totalPages: 0,
//                 }
//             );
//         } catch (error) {
//             setError(
//                 error?.message ||
//                     "Failed to load blogs"
//             );
//         } finally {
//             setLoading(false);
//         }
//     }, [page, limit, search, category, status]);
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
//         const categoriesTimer = window.setTimeout(() => {
//             void fetchCategories();
//         }, 0);
// 
//         return () => window.clearTimeout(categoriesTimer);
//     }, [
//         user,
//         authLoading,
//         router,
//         fetchCategories,
//     ]);
// 
//     useEffect(() => {
//         if (authLoading) {
//             return;
//         }
// 
//         if (!user) {
//             return;
//         }
// 
//         if (!["superAdmin", "admin"].includes(user.role)) {
//             return;
//         }
// 
//         const blogsTimer = window.setTimeout(() => {
//             void fetchBlogs();
//         }, 0);
// 
//         return () => window.clearTimeout(blogsTimer);
//     }, [user, authLoading, fetchBlogs]);
// 
//     // Close delete modal with Escape
//     useEffect(() => {
//         const handleEscape = (
//             event
//         ) => {
//             if (
//                 event.key === "Escape" &&
//                 deleteTarget &&
//                 !deletingId
//             ) {
//                 setDeleteTarget(null);
//             }
//         };
// 
//         window.addEventListener(
//             "keydown",
//             handleEscape
//         );
// 
//         return () => {
//             window.removeEventListener(
//                 "keydown",
//                 handleEscape
//             );
//         };
//     }, [
//         deleteTarget,
//         deletingId,
//     ]);
// 
//     const handleSearchChange = (
//         value
//     ) => {
//         setSearch(value);
//         setPage(1);
//     };
// 
//     const handleCategoryChange = (
//         value
//     ) => {
//         setCategory(value);
//         setPage(1);
//     };
// 
//     const handleStatusChange = (
//         value
//     ) => {
//         setStatus(value);
//         setPage(1);
//     };
// 
//     const handlePageChange = (
//         newPage
//     ) => {
//         setPage(newPage);
//     };
// 
//     // Handle blog status change
//     const handleBlogStatusChange = (
//         blogId,
//         newStatus
//     ) => {
//         setBlogs((currentBlogs) =>
//             currentBlogs.map(
//                 (blog) =>
//                     blog._id === blogId
//                         ? {
//                               ...blog,
//                               status: newStatus,
//                               publishedAt:
//                                   newStatus ===
//                                   "published"
//                                       ? blog.publishedAt ||
//                                         new Date().toISOString()
//                                       : null,
//                           }
//                         : blog
//             )
//         );
// 
//         // Success toast
//         toast.success(
//             newStatus === "published"
//                 ? "Blog published successfully."
//                 : "Blog moved to draft successfully."
//         );
//     };
// 
//     const handleBlogError = (
//         message
//     ) => {
//         setError(message);
//     };
// 
//     const handleCreateBlog = () => {
//         router.push(
//             "/admin/blogs/create"
//         );
//     };
// 
//     // Open delete confirmation
//     const requestDelete = (
//         blog
//     ) => {
//         if (
//             !blog?._id ||
//             deletingId
//         ) {
//             return;
//         }
// 
//         setDeleteTarget(blog);
//     };
// 
//     // Delete blog
//     const handleBlogDelete = async () => {
//         const id =
//             deleteTarget?._id;
// 
//         if (!id || deletingId) {
//             return;
//         }
// 
//         try {
//             setDeletingId(id);
// 
//             await deleteBlog(id);
// 
//             setBlogs((previous) =>
//                 previous.filter(
//                     (blog) =>
//                         blog._id !== id
//                 )
//             );
// 
//             setPagination((current) => ({
//                 ...current,
//                 totalBlogs: Math.max(
//                     0,
//                     current.totalBlogs - 1
//                 ),
//             }));
// 
//             toast.success(
//                 "Blog deleted successfully."
//             );
// 
//             setDeleteTarget(null);
//         } catch (error) {
//             console.error(
//                 "Failed to delete blog:",
//                 error
//             );
// 
//             toast.error(
//                 error?.message ||
//                     "Failed to delete blog."
//             );
// 
//             setDeleteTarget(null);
//         } finally {
//             setDeletingId(null);
//         }
//     };
// 
//     if (
//         authLoading ||
//         !user ||
//         !["superAdmin", "admin"].includes(user.role)
//     ) {
//         return (
//             <div className="flex min-h-screen items-center justify-center bg-[#F2F6FF]">
//                 <p className="text-sm text-[var(--navy)]">
//                     Loading...
//                 </p>
//             </div>
//         );
//     }
// 
//     return (
//         <main className="relative min-h-screen w-full overflow-hidden bg-[#F2F6FF] px-4 pb-10 pt-20 md:px-6 lg:pt-8">
// 
//             {/* Background */}
// 
//             <div className="pointer-events-none absolute inset-0 overflow-hidden">
// 
//                 <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#3869D0]/10 blur-3xl" />
// 
//                 <div className="absolute -right-32 top-40 h-80 w-80 rounded-full bg-[#B8C9F5]/20 blur-3xl" />
// 
//                 <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--gold)]/5 blur-3xl" />
// 
//             </div>
// 
//             <div className="relative mx-auto max-w-7xl">
// 
//                 {/* Header */}
// 
//                 <section className="mb-6 overflow-hidden rounded-3xl border border-white/70 bg-[var(--navy)] p-5 shadow-[0_15px_50px_rgba(16,42,67,0.15)] backdrop-blur-xl md:p-7">
// 
//                     <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
// 
//                         <div>
// 
//                             <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
// 
//                                 <Sparkles
//                                     size={15}
//                                 />
// 
//                                 Blog Management
// 
//                             </div>
// 
//                             <h1 className="font-[Montserrat] text-3xl font-bold italic text-white md:text-4xl">
//                                 Blogs
//                             </h1>
// 
//                             <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
//                                 Create, manage and
//                                 publish your academy
//                                 blog articles.
//                             </p>
// 
//                         </div>
// 
//                         <button
//                             type="button"
//                             onClick={
//                                 handleCreateBlog
//                             }
//                             className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[var(--navy)] shadow-lg transition hover:scale-[1.02] hover:shadow-xl"
//                         >
//                             <Plus
//                                 size={18}
//                             />
// 
//                             Create Blog
//                         </button>
// 
//                     </div>
// 
//                 </section>
// 
//                 <details
//                     id="blog-categories"
//                     className="mb-6 rounded-2xl border border-[#C8D5EA]/70 bg-white/70 p-5 shadow-[0_8px_32px_rgba(16,42,67,0.10)] backdrop-blur-xl sm:p-6"
//                 >
//                     <summary className="cursor-pointer text-lg font-bold text-[var(--navy)] marker:text-[#3869D0]">
//                         Manage blog categories
//                     </summary>
//                     <BlogCategoriesManager embedded />
//                 </details>
// 
//                 {/* Filters */}
// 
//                 <div className="mb-6">
// 
//                     <BlogFilters
//                         search={search}
//                         category={category}
//                         status={status}
//                         categories={
//                             categories
//                         }
//                         onSearchChange={
//                             handleSearchChange
//                         }
//                         onCategoryChange={
//                             handleCategoryChange
//                         }
//                         onStatusChange={
//                             handleStatusChange
//                         }
//                     />
// 
//                 </div>
// 
//                 {/* Blog Content */}
// 
//                 <section className="rounded-2xl border border-[#C8D5EA]/70 bg-white/70 p-5 shadow-[0_8px_32px_rgba(16,42,67,0.10)] backdrop-blur-xl">
// 
//                     <div className="mb-5 flex items-center gap-2">
// 
//                         <FileText
//                             size={20}
//                             className="text-[#3869D0]"
//                         />
// 
//                         <h2 className="text-lg font-bold text-[var(--navy)]">
//                             Blog Articles
//                         </h2>
// 
//                         <span className="ml-auto text-sm text-[var(--muted)]">
//                             {
//                                 pagination.totalBlogs
//                             }{" "}
//                             blogs
//                         </span>
// 
//                     </div>
// 
//                     {categoryLoading && (
//                         <div className="mb-4 rounded-xl border border-[#C8D5EA]/60 bg-white/50 px-4 py-3">
// 
//                             <p className="text-xs text-[var(--muted)]">
//                                 Loading categories...
//                             </p>
// 
//                         </div>
//                     )}
// 
//                     {loading && (
//                         <div className="flex min-h-40 items-center justify-center">
// 
//                             <p className="text-sm text-[var(--muted)]">
//                                 Loading blogs...
//                             </p>
// 
//                         </div>
//                     )}
// 
//                     {!loading &&
//                         error && (
//                             <div className="rounded-xl border border-red-200 bg-red-50 p-4">
// 
//                                 <p className="text-sm text-red-600">
//                                     {error}
//                                 </p>
// 
//                             </div>
//                         )}
// 
//                     {!loading &&
//                         !error &&
//                         blogs.length ===
//                             0 && (
//                             <div className="flex min-h-40 flex-col items-center justify-center text-center">
// 
//                                 <FileText
//                                     size={32}
//                                     className="mb-3 text-[#3869D0]/50"
//                                 />
// 
//                                 <p className="font-semibold text-[var(--navy)]">
//                                     No blogs found
//                                 </p>
// 
//                                 <p className="mt-1 text-sm text-[var(--muted)]">
//                                     Try changing your
//                                     search or filters.
//                                 </p>
// 
//                             </div>
//                         )}
// 
//                     {!loading &&
//                         !error &&
//                         blogs.length >
//                             0 && (
//                             <>
// 
//                                 <BlogGrid
//                                     blogs={blogs}
//                                     onStatusChange={
//                                         handleBlogStatusChange
//                                     }
//                                     onDeleteRequest={
//                                         requestDelete
//                                     }
//                                     onError={
//                                         handleBlogError
//                                     }
//                                 />
// 
//                                 <BlogPagination
//                                     page={
//                                         pagination.page
//                                     }
//                                     totalPages={
//                                         pagination.totalPages
//                                     }
//                                     onPageChange={
//                                         handlePageChange
//                                     }
//                                 />
// 
//                             </>
//                         )}
// 
//                 </section>
// 
//             </div>
// 
//             {/* Delete Confirmation */}
// 
//             <DeleteConfirmModal
//                 open={!!deleteTarget}
//                 title="Delete this blog?"
//                 description="will be permanently deleted. This action cannot be undone."
//                 itemName={
//                     deleteTarget?.title ||
//                     "This blog"
//                 }
//                 confirmText="Delete Blog"
//                 loading={!!deletingId}
//                 onCancel={() =>
//                     setDeleteTarget(null)
//                 }
//                 onConfirm={
//                     handleBlogDelete
//                 }
//             />
// 
//         </main>
//     );
// };
// 
// export default BlogsPage;