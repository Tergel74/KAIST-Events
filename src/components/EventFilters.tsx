"use client";
import { useState, useEffect, useRef } from "react";
import { FiCalendar, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface EventFiltersProps {
    onFilterChange: (filters: {
        dateRange: "today" | "week" | "all";
        category?: string;
    }) => void;
}

const dateRanges = [
    { id: "today", name: "Today" },
    { id: "week", name: "This Week" },
    { id: "all", name: "All Events" },
];

export default function EventFilters({ onFilterChange }: EventFiltersProps) {
    const [dateRange, setDateRange] = useState<"today" | "week" | "all">("all");
    const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleDateRangeChange = (range: "today" | "week" | "all") => {
        setDateRange(range);
        setIsDateRangeOpen(false);
        onFilterChange({
            dateRange: range,
        });
    };

    const clearFilters = () => {
        setDateRange("all");
        onFilterChange({ dateRange: "all" });
    };

    const selectedDateRangeName =
        dateRanges.find((r) => r.id === dateRange)?.name || "All Events";

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDateRangeOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <motion.div
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-3 mb-3 sm:mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between gap-2">
                {/* Date Range Filter */}
                <div className="relative flex-1" ref={dropdownRef}>
                    <div
                        className={`flex items-center justify-between space-x-2 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 transition-all duration-200 cursor-pointer ${
                            isDateRangeOpen
                                ? "bg-blue-50 border border-blue-200 shadow-sm"
                                : "bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                        }`}
                        onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
                    >
                        <div className="flex items-center space-x-2">
                            <FiCalendar
                                className={`flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 transition-colors ${
                                    isDateRangeOpen
                                        ? "text-blue-500"
                                        : "text-gray-500"
                                }`}
                            />
                            <span
                                className={`text-xs sm:text-sm font-medium flex-1 transition-colors ${
                                    isDateRangeOpen
                                        ? "text-blue-700"
                                        : "text-gray-700"
                                }`}
                            >
                                {selectedDateRangeName}
                            </span>
                        </div>
                        <motion.svg
                            className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${
                                isDateRangeOpen
                                    ? "text-blue-500"
                                    : "text-gray-500"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            animate={{ rotate: isDateRangeOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </motion.svg>
                    </div>

                    {/* Custom Dropdown */}
                    <AnimatePresence>
                        {isDateRangeOpen && (
                            <>
                                {/* Backdrop */}
                                <motion.div
                                    className="fixed inset-0 z-10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsDateRangeOpen(false)}
                                />

                                {/* Dropdown */}
                                <motion.div
                                    className="absolute left-0 right-0 sm:right-auto sm:w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-20 py-1 overflow-hidden"
                                    initial={{
                                        opacity: 0,
                                        scale: 0.95,
                                        y: -10,
                                    }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{
                                        duration: 0.15,
                                        ease: "easeOut",
                                    }}
                                    style={{
                                        minWidth: "160px",
                                        maxWidth: "280px",
                                    }}
                                >
                                    {dateRanges.map((range, index) => (
                                        <motion.button
                                            key={range.id}
                                            onClick={() =>
                                                handleDateRangeChange(
                                                    range.id as
                                                        | "today"
                                                        | "week"
                                                        | "all"
                                                )
                                            }
                                            className={`w-full text-left px-3 py-2.5 text-xs sm:text-sm transition-all duration-150 flex items-center justify-between group ${
                                                dateRange === range.id
                                                    ? "bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-500"
                                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{
                                                backgroundColor:
                                                    dateRange === range.id
                                                        ? undefined
                                                        : "rgb(249 250 251)",
                                                paddingLeft:
                                                    dateRange === range.id
                                                        ? undefined
                                                        : "16px",
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span>{range.name}</span>
                                            {dateRange === range.id && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-2 h-2 bg-blue-500 rounded-full"
                                                />
                                            )}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Clear Filters Button */}
                {dateRange !== "all" && (
                    <motion.button
                        onClick={clearFilters}
                        className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors px-2 py-1"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Clear</span>
                    </motion.button>
                )}
            </div>

            {/* Active Filters */}
            <AnimatePresence>
                {dateRange !== "all" && (
                    <motion.div
                        className="flex items-center mt-2 sm:mt-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            {dateRanges.find((r) => r.id === dateRange)?.name}
                            <button
                                onClick={() => handleDateRangeChange("all")}
                                className="ml-1 inline-flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-200 text-blue-800 hover:bg-blue-300 transition-colors"
                            >
                                <FiX className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                            </button>
                        </motion.span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
