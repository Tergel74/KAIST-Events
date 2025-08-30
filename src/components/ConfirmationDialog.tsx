"use client";

import { useEffect } from "react";

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    type?: "danger" | "warning" | "info";
}

export default function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
    type = "info",
}: ConfirmationDialogProps) {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isLoading) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            return () => document.removeEventListener("keydown", handleEscape);
        }
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    const getTypeClasses = () => {
        switch (type) {
            case "danger":
                return {
                    button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
                    icon: "text-red-600",
                    iconBg: "bg-red-50",
                    accent: "border-red-200",
                };
            case "warning":
                return {
                    button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
                    icon: "text-yellow-600",
                    iconBg: "bg-yellow-50",
                    accent: "border-yellow-200",
                };
            default:
                return {
                    button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
                    icon: "text-blue-600",
                    iconBg: "bg-blue-50",
                    accent: "border-blue-200",
                };
        }
    };

    const typeClasses = getTypeClasses();

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop with very subtle blur */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Dialog */}
            <div
                className={`
                    relative bg-white rounded-xl shadow-2xl border ${
                        typeClasses.accent
                    }
                    max-w-md w-full mx-4 
                    transform transition-all duration-300 ease-out
                    ${
                        isOpen
                            ? "scale-100 opacity-100 translate-y-0"
                            : "scale-95 opacity-0 translate-y-4"
                    }
                `}
                style={{
                    animation: isOpen
                        ? "slideIn 0.3s ease-out"
                        : "slideOut 0.3s ease-in",
                }}
            >
                {/* Content */}
                <div className="p-6">
                    {/* Header with icon */}
                    <div className="flex items-start space-x-4 mb-4">
                        <div
                            className={`flex-shrink-0 w-10 h-10 ${typeClasses.iconBg} rounded-full flex items-center justify-center`}
                        >
                            {type === "danger" && (
                                <svg
                                    className={`w-5 h-5 ${typeClasses.icon}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                    />
                                </svg>
                            )}
                            {type === "warning" && (
                                <svg
                                    className={`w-5 h-5 ${typeClasses.icon}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                    />
                                </svg>
                            )}
                            {type === "info" && (
                                <svg
                                    className={`w-5 h-5 ${typeClasses.icon}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                                    />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {title}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            className={`w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${typeClasses.button}`}
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom animations */}
            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                @keyframes slideOut {
                    from {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: scale(0.95) translateY(-8px);
                    }
                }
            `}</style>
        </div>
    );
}
