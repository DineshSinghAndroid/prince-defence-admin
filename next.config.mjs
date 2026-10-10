/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: [
            "image/avif",
            "image/webp",
        ],

        qualities: [
            30,
            40,
            55,
            75,
            85,
            100,
        ],

        deviceSizes: [
            640,
            750,
            828,
            1080,
            1200,
        ],

        imageSizes: [
            16,
            32,
            48,
            64,
            96,
            128,
            256,
            384,
        ],

        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
        ],
    },
};

export default nextConfig;