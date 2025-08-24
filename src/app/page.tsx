'use client';

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            // If user is authenticated, redirect to dashboard
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If authenticated, don't show landing page (will redirect)
    if (user) {
        return null;
    }

    // Show landing page for unauthenticated users
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        KAIST Micro-Event Board
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Discover and join events happening around KAIST campus. 
                        Connect with fellow students and build lasting memories.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link
                            href="/auth/signup"
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="/auth/login"
                            className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors text-lg font-medium"
                        >
                            Sign In
                        </Link>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8 mt-16">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-3xl mb-4">🎉</div>
                            <h3 className="text-lg font-semibold mb-2">Create Events</h3>
                            <p className="text-gray-600">
                                Organize study groups, social gatherings, or campus activities with ease.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-3xl mb-4">👥</div>
                            <h3 className="text-lg font-semibold mb-2">Join Community</h3>
                            <p className="text-gray-600">
                                Connect with fellow KAIST students and participate in exciting events.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-3xl mb-4">📱</div>
                            <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
                            <p className="text-gray-600">
                                Get notified about new events through our Discord integration.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
