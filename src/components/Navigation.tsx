"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
    const { user, loading, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        setIsMenuOpen(false);
    };

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="bg-white shadow-sm border-b relative z-50">
            <div className="container mx-auto px-3 sm:px-4">
                <div className="flex justify-between items-center h-12 sm:h-14 lg:h-16">
                    <div className="flex items-center">
                        <Link
                            href="/"
                            className="text-base sm:text-lg lg:text-xl font-bold text-blue-600"
                            onClick={closeMenu}
                        >
                            KAIST Events
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                                >
                                    All Events
                                </Link>
                                <Link
                                    href="/dashboard/my-events"
                                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                                >
                                    My Events
                                </Link>
                                <Link
                                    href="/dashboard/create"
                                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Create Event
                                </Link>
                                <div className="flex items-center space-x-3">
                                    <span className="text-xs text-gray-600 max-w-[120px] truncate">
                                        {user.user_metadata?.name || user.email}
                                    </span>
                                    <button
                                        onClick={handleSignOut}
                                        className="text-gray-600 hover:text-gray-900 text-xs"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/auth/signup"
                                    className="text-gray-600 hover:text-gray-900 text-sm"
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    href="/auth/login"
                                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            <motion.svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </motion.svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg z-40"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-3">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : user ? (
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="pb-2 sm:pb-3 border-b border-gray-200">
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                            {user.user_metadata?.name ||
                                                user.email}
                                        </p>
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        className="block py-1.5 sm:py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                        onClick={closeMenu}
                                    >
                                        All Events
                                    </Link>
                                    <Link
                                        href="/dashboard/my-events"
                                        className="block py-1.5 sm:py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                        onClick={closeMenu}
                                    >
                                        My Events
                                    </Link>
                                    <Link
                                        href="/dashboard/create"
                                        className="block w-full text-center bg-blue-600 text-white py-2 sm:py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
                                        onClick={closeMenu}
                                    >
                                        Create Event
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="block w-full text-left py-1.5 sm:py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2 sm:space-y-3">
                                    <Link
                                        href="/auth/signup"
                                        className="block py-1.5 sm:py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                        onClick={closeMenu}
                                    >
                                        Sign Up
                                    </Link>
                                    <Link
                                        href="/auth/login"
                                        className="block w-full text-center bg-blue-600 text-white py-2 sm:py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
                                        onClick={closeMenu}
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
