import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import Navigation from "../components/Navigation";

export const metadata: Metadata = {
    title: "KAIST Micro-Event Board",
    description: "Discover and join events happening around KAIST campus",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    // Prevent bouncing on iOS
    viewportFit: "cover",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased bg-gray-50">
                <AuthProvider>
                    <Navigation />
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
