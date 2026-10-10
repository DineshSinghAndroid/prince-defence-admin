import "./globals.css";

import localFont from "next/font/local";

import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

// Fonts
const cinzel = localFont({
    src: "./fonts/Cinzel-Variable.woff2",
    variable: "--cinzel-fonts",
    weight: "400 900",
    display: "swap",
    preload: false,
    fallback: ["serif"],
});

const inter = localFont({
    src: "./fonts/Inter-Variable.woff2",
    variable: "--inter-fonts",
    weight: "400 900",
    display: "swap",
    preload: true,
    fallback: ["sans-serif"],
});

const montserrat = localFont({
    src: "./fonts/Montserrat-Variable.woff2",
    variable: "--montserrat-fonts",
    weight: "400 900",
    display: "swap",
    preload: false,
    fallback: ["sans-serif"],
});

// SEO Metadata
export const metadata = {
    title: "Prince Defence Academy | NDA, CDS & AFCAT Preparation",
    description:
        "Prepare for NDA, CDS and AFCAT with structured defence exam preparation, expert guidance and focused training.",
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            data-scroll-behavior="smooth"
            className={`${inter.variable} ${cinzel.variable} ${montserrat.variable} antialiased`}
        >
            <body className="min-h-screen overflow-x-hidden">
                <AuthProvider>
                    {children}
                </AuthProvider>
                <Toaster position="top-right" />
            </body>
        </html>
    );
}