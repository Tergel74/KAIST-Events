"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen-navbar bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <motion.div
                    className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        );
    }

    if (user) {
        return null;
    }

    return (
        <div className="min-h-screen-navbar bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-16">
                <motion.div
                    className="text-center max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.h1
                        className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6 px-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        KAIST Micro-Event Board
                    </motion.h1>
                    <motion.p
                        className="text-sm sm:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 lg:mb-8 px-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Discover and join events happening around KAIST campus.
                        Connect with fellow students and build lasting memories.
                    </motion.p>
                    <motion.div
                        className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 justify-center mb-6 sm:mb-8 lg:mb-12 px-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Link
                            href="/auth/signup"
                            className="bg-blue-600 text-white px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base lg:text-lg font-medium text-center"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="/auth/login"
                            className="bg-white text-blue-600 border-2 border-blue-600 px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-blue-50 transition-colors text-sm sm:text-base lg:text-lg font-medium text-center"
                        >
                            Sign In
                        </Link>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8 lg:mt-16 px-2"
                        variants={{
                            visible: {
                                transition: {
                                    staggerChildren: 0.1,
                                },
                            },
                        }}
                        initial="hidden"
                        animate="visible"
                    >
                        {[
                            {
                                icon: "🎉",
                                title: "Create Events",
                                description:
                                    "Organize study groups, social gatherings, or campus activities with ease.",
                            },
                            {
                                icon: "👥",
                                title: "Join Community",
                                description:
                                    "Connect with fellow KAIST students and participate in exciting events.",
                            },
                            {
                                icon: "📱",
                                title: "Stay Updated",
                                description:
                                    "Get notified about new events through our Discord integration.",
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                }}
                                whileHover={{
                                    y: -5,
                                    transition: { duration: 0.2 },
                                }}
                            >
                                <div className="text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3 lg:mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
