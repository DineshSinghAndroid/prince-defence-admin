import BlogCard from "./BlogCard";

const BlogGrid = ({
    blogs = [],
    onStatusChange,
    onDeleteRequest,
    onError,
}) => {
    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
                <BlogCard
                    key={blog._id}
                    blog={blog}
                    onStatusChange={
                        onStatusChange
                    }
                    onDeleteRequest={
                        onDeleteRequest
                    }
                    onError={onError}
                />
            ))}
        </div>
    );
};

export default BlogGrid;