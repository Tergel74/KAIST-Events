"use client";

import { useState, useEffect } from "react";
import EventCard from "@/components/EventCard";
import EventFilters from "@/components/EventFilters";
import Link from "next/link";
import { motion } from "framer-motion";

import { Event } from "@/types/event";

export default function DashboardPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [ongoingEvents, setOngoingEvents] = useState<Event[]>([]);
    const [pastEvents, setPastEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [ongoingLoading, setOngoingLoading] = useState(true);
    const [pastLoading, setPastLoading] = useState(true);
    const [filters, setFilters] = useState({
        dateRange: "all" as "today" | "week" | "all",
        category: "",
    });

    const fetchEvents = async () => {
        setLoading(true);
        setOngoingLoading(true);
        setPastLoading(true);
        try {
            const params = new URLSearchParams({
                date_range: filters.dateRange,
                ...(filters.category && { category: filters.category }),
            });

            // Fetch upcoming events
            const response = await fetch(`/api/events?${params}`);
            const data = await response.json();

            // Fetch ongoing events
            const ongoingResponse = await fetch(
                `/api/events?date_range=ongoing`
            );
            const ongoingData = await ongoingResponse.json();
            const ongoingEvents = ongoingData.events || [];

            // Fetch past events
            const pastEventsResponse = await fetch(
                `/api/events?date_range=past`
            );
            const pastEventsData = await pastEventsResponse.json();
            const pastEvents = pastEventsData.events || [];

            if (response.ok) {
                setEvents(data.events || []);
                setOngoingEvents(ongoingEvents);
                setPastEvents(pastEvents);
            } else {
                console.error("Failed to fetch events:", data.error);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
            setOngoingLoading(false);
            setPastLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [filters]);

    const handleFilterChange = (newFilters: {
        dateRange: "today" | "week" | "all";
        category?: string;
    }) => {
        setFilters((prev) => ({
            ...prev,
            dateRange: newFilters.dateRange,
            category: newFilters.category || "",
        }));
    };

    return (
        <div className="min-h-screen-navbar bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-6">
                <motion.div
                    className="mb-3 sm:mb-6"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                                KAIST Events
                            </h1>
                            <p className="text-gray-500 mt-1 text-xs sm:text-sm lg:text-base">
                                Discover and join upcoming events in our
                                community
                            </p>
                        </div>
                    </div>

                    <EventFilters onFilterChange={handleFilterChange} />
                </motion.div>

                {loading ? (
                    <motion.div
                        className="flex flex-col items-center justify-center py-8 sm:py-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-3 border-blue-600 border-t-transparent mb-3"></div>
                        <p className="text-gray-600 text-xs sm:text-sm">
                            Loading events...
                        </p>
                    </motion.div>
                ) : events.length === 0 ? (
                    <motion.div
                        className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm border border-gray-200 mx-1 sm:mx-0"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <svg
                                className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                            No events found
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-4 sm:mb-6 text-xs sm:text-sm px-4">
                            There are no events matching your filters. Try
                            adjusting your search or be the first to create an
                            event!
                        </p>
                        <Link
                            href="/dashboard/create"
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md text-xs sm:text-sm"
                        >
                            <svg
                                className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 -ml-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            Create Event
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        className="space-y-4 sm:space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                {filters.dateRange === "today"
                                    ? "Today's Events"
                                    : filters.dateRange === "week"
                                    ? "This Week's Events"
                                    : "Upcoming Events"}
                                {filters.category && `: ${filters.category}`}
                            </h2>
                            <span className="text-xs sm:text-sm text-gray-500 self-start sm:self-auto">
                                {events.length}{" "}
                                {events.length === 1 ? "event" : "events"} found
                            </span>
                        </div>
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
                            variants={{
                                visible: {
                                    transition: {
                                        staggerChildren: 0.05,
                                    },
                                },
                            }}
                            initial="hidden"
                            animate="visible"
                        >
                            {events.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <Link
                                        href={`/events/${event.id}`}
                                        className="group block h-full hover:-translate-y-1 transition-transform duration-200"
                                    >
                                        <EventCard event={event} />
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </div>

            {/* Ongoing Events Section */}
            <div className="container mx-auto px-2 sm:px-4 py-4">
                {ongoingLoading ? (
                    <motion.div
                        className="flex flex-col items-center justify-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-3 border-orange-600 border-t-transparent mb-3"></div>
                        <p className="text-gray-600 text-xs sm:text-sm">
                            Loading ongoing events...
                        </p>
                    </motion.div>
                ) : ongoingEvents.length === 0 ? (
                    <motion.div
                        className="text-center py-8 bg-orange-50 rounded-xl shadow-sm border border-orange-200 mx-1 sm:mx-0"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <svg
                                className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                            No ongoing events
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto text-xs sm:text-sm px-4">
                            There are no events currently happening.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="space-y-4 sm:space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                            <h2 className="text-lg sm:text-xl font-semibold text-orange-800">
                                🟡 Ongoing Events
                            </h2>
                            <span className="text-xs sm:text-sm text-gray-500 self-start sm:self-auto">
                                {ongoingEvents.length}{" "}
                                {ongoingEvents.length === 1
                                    ? "event"
                                    : "events"}{" "}
                                happening now
                            </span>
                        </div>
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
                            variants={{
                                visible: {
                                    transition: {
                                        staggerChildren: 0.05,
                                    },
                                },
                            }}
                            initial="hidden"
                            animate="visible"
                        >
                            {ongoingEvents.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <Link
                                        href={`/events/${event.id}`}
                                        className="group block h-full hover:-translate-y-1 transition-transform duration-200"
                                    >
                                        <EventCard event={event} />
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </div>

            {/* Past Events Section */}
            <div className="container mx-auto px-4 sm:px-6 py-8">
                {pastLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-3 border-blue-600 border-t-transparent mb-4"></div>
                        <p className="text-gray-600 text-xs">
                            Loading events...
                        </p>
                    </div>
                ) : pastEvents.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                        <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <svg
                                className="w-12 h-12 text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No events found
                        </h3>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Past Events
                            </h2>
                            <span className="text-sm text-gray-500">
                                {pastEvents.length}{" "}
                                {pastEvents.length === 1 ? "event" : "events"}{" "}
                                found
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {pastEvents.map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.id}`}
                                    className="group block h-full hover:-translate-y-1 transition-transform duration-200"
                                >
                                    <EventCard event={event} />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
