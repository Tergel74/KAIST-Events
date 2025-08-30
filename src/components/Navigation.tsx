"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
    const { user, loading, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        }

        return () => {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isMenuOpen]);

    const handleSignOut = async () => {
        await signOut();
        setIsMenuOpen(false);
    };

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav
            ref={menuRef}
            className="bg-white shadow-sm border-b z-50 relative"
        >
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
                                    <Link
                                        href="/profile"
                                        className="text-gray-600 hover:text-gray-900 transition-colors text-xs truncate"
                                    >
                                        {user.email}
                                    </Link>
                                    {/* <span className="text-xs text-gray-600 max-w-[120px] truncate"> */}

                                    {/* </span> */}
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

                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            aria-label="Toggle menu"
                            aria-expanded={isMenuOpen}
                            type="button"
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
            <AnimatePresence mode="wait">
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="md:hidden fixed inset-0 bg-black/20 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                        {/* Menu */}
                        <motion.div
                            className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg z-50"
                            initial={{
                                opacity: 0,
                                scaleY: 0,
                                transformOrigin: "top",
                            }}
                            animate={{ opacity: 1, scaleY: 1 }}
                            exit={{ opacity: 0, scaleY: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
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
                                            href="/profile"
                                            className="block py-1.5 sm:py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                            onClick={closeMenu}
                                        >
                                            Profile
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
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
