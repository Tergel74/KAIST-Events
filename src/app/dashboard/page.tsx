"use client";

import { useState, useEffect } from "react";
import EventCard from "@/components/EventCard";
import EventFilters from "@/components/EventFilters";
import Link from "next/link";

import { Event } from "@/types/event";

export default function DashboardPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        dateRange: "all" as "today" | "week" | "all",
        category: "",
    });

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                date_range: filters.dateRange,
                ...(filters.category && { category: filters.category }),
            });

            const response = await fetch(`/api/events?${params}`);
            const data = await response.json();

            if (response.ok) {
                setEvents(data.events || []);
            } else {
                console.error("Failed to fetch events:", data.error);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
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
        <div className="h-full bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                KAIST Events
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Discover and join upcoming events in our
                                community
                            </p>
                        </div>
                        {/* <Link
                            href="/dashboard/create"
                            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap shadow-sm hover:shadow-md"
                        >
                            <svg
                                className="w-5 h-5 mr-2 -ml-1"
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
                        </Link> */}
                    </div>

                    <EventFilters onFilterChange={handleFilterChange} />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                        <p className="text-gray-600">Loading events...</p>
                    </div>
                ) : events.length === 0 ? (
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
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            There are no events matching your filters. Try
                            adjusting your search or be the first to create an
                            event!
                        </p>
                        <Link
                            href="/dashboard/create"
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                        >
                            <svg
                                className="w-5 h-5 mr-2 -ml-1"
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
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {filters.dateRange === "today"
                                    ? "Today's Events"
                                    : filters.dateRange === "week"
                                    ? "This Week's Events"
                                    : "All Events"}
                                {filters.category && `: ${filters.category}`}
                            </h2>
                            <span className="text-sm text-gray-500">
                                {events.length}{" "}
                                {events.length === 1 ? "event" : "events"} found
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {events.map((event) => (
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
