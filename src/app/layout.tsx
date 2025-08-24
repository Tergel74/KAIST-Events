import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import Navigation from "../components/Navigation";

export const metadata: Metadata = {
    title: "KAIST Micro-Event Board",
    description: "Discover and join events happening around KAIST campus",
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
