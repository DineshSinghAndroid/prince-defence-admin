export function generateStaticParams() {
    return [{ id: "none" }];
}

export default function EditBlogPage() {
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
// import {
//     useParams,
//     useRouter,
// } from "next/navigation";
// 
// import {
//     ArrowLeft,
//     FileText,
// } from "lucide-react";
// 
// import toast from "react-hot-toast";
// 
// import { AuthContext } from "@/context/AuthContext";
// 
// import {
//     getBlogById,
//     getBlogCategories,
// } from "@/services/blogService";
// 
// import BlogForm from "@/component/blogs/BlogForm";
// 
// const EditBlogPage = () => {
//     const router = useRouter();
//     const params = useParams();
// 
//     const {
//         user,
//         loading: authLoading,
//     } = useContext(AuthContext);
// 
//     const [blog, setBlog] = useState(null);
//     const [categories, setCategories] =
//         useState([]);
// 
//     const [loading, setLoading] =
//         useState(true);
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
//             router.replace("/admin/dashboard");
//             return;
//         }
// 
//         if (!blogId) {
//             window.setTimeout(() => {
//                 toast.error("Blog ID is missing");
//                 setLoading(false);
//             }, 0);
//             return;
//         }
// 
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
// 
//                 const [
//                     blogResponse,
//                     categoryResponse,
//                 ] = await Promise.all([
//                     getBlogById(blogId),
//                     getBlogCategories(),
//                 ]);
// 
//                 setBlog(
//                     blogResponse?.data || null
//                 );
// 
//                 setCategories(
//                     categoryResponse?.data || []
//                 );
//             } catch (error) {
//                 toast.error(
//                     error?.message ||
//                         "Failed to load blog"
//                 );
//             } finally {
//                 setLoading(false);
//             }
//         };
// 
//         fetchData();
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
//                     Loading...
//                 </p>
//             </main>
//         );
//     }
// 
//     if (
//         !user ||
//         !["superAdmin", "admin"].includes(user.role)
//     ) {
//         return null;
//     }
// 
//     if (!blog) {
//         return (
//             <main className="min-h-screen bg-[#F2F6FF] px-4 pb-10 pt-20 md:px-6 lg:pt-8">
//                 <div className="mx-auto max-w-5xl">
//                     <button
//                         type="button"
//                         onClick={() =>
//                             router.push(
//                                 "/admin/blogs"
//                             )
//                         }
//                         className="inline-flex items-center gap-2 rounded-xl border border-[#C8D5EA] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--navy)] transition hover:border-[#3869D0]/40 hover:bg-[#F8FAFF]"
//                     >
//                         <ArrowLeft size={17} />
//                         Back to Blogs
//                     </button>
//                 </div>
//             </main>
//         );
//     }
// 
//     return (
//         <main className="min-h-screen bg-[#F2F6FF] px-4 pb-10 pt-20 md:px-6 lg:pt-8">
//             <div className="mx-auto max-w-5xl">
//                 <div className="mb-6">
//                     <button
//                         type="button"
//                         onClick={() =>
//                             router.push(
//                                 `/admin/blogs/${blogId}`
//                             )
//                         }
//                         className="inline-flex items-center gap-2 rounded-xl border border-[#C8D5EA] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--navy)] transition hover:border-[#3869D0]/40 hover:bg-[#F8FAFF]"
//                     >
//                         <ArrowLeft size={17} />
//                         Back to Blog
//                     </button>
//                 </div>
// 
//                 <section className="mb-6 rounded-3xl bg-[var(--navy)] p-6 shadow-[0_15px_50px_rgba(16,42,67,0.15)]">
//                     <div className="flex items-center gap-3">
//                         <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
//                             <FileText size={21} />
//                         </div>
// 
//                         <div>
//                             <h1 className="text-2xl font-bold text-white md:text-3xl">
//                                 Edit Blog
//                             </h1>
// 
//                             <p className="mt-1 text-sm text-white/70">
//                                 Update your academy blog article.
//                             </p>
//                         </div>
//                     </div>
//                 </section>
// 
//                 <BlogForm
//                     mode="edit"
//                     initialData={blog}
//                     categories={categories}
//                 />
//             </div>
//         </main>
//     );
// };
// 
// export default EditBlogPage;