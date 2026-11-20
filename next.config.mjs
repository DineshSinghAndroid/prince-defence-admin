/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    trailingSlash: true,
    compress: true,
    poweredByHeader: false,
    experimental: {
        optimizePackageImports: ["lucide-react"],
        agentUpgrade: "security",
    },
    images: {
        unoptimized: true,
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
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: "frame-ancestors 'none'",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "DENY",
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=()",
                    },
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=31536000; includeSubDomains",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;