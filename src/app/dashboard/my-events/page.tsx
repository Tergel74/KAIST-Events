"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Event } from "@/types/event";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";

export default function MyEventsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
    const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"created" | "joined">("created");

    useEffect(() => {
        // Don't redirect while auth is still loading
        if (authLoading) return;

        if (!user) {
            router.push("/auth/login");
            return;
        }
        fetchMyEvents();
    }, [user, authLoading, router]);

    const fetchMyEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/events/my-events", {
                cache: "no-store",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch events");
            }

            const data = await response.json();
            setCreatedEvents(data.createdEvents || []);
            setJoinedEvents(data.joinedEvents || []);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load events"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (
        eventId: string,
        newStatus: "upcoming" | "started" | "finished"
    ) => {
        try {
            const response = await fetch(`/api/events/${eventId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update event status");
            }

            // Refresh events list
            await fetchMyEvents();
        } catch (err) {
            console.error("Error updating event status:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update event status"
            );
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "upcoming":
                return "bg-green-100 text-green-800";
            case "started":
                return "bg-blue-100 text-blue-800";
            case "finished":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "upcoming":
                return "Upcoming";
            case "started":
                return "Started";
            case "finished":
                return "Finished";
            default:
                return status;
        }
    };

    const getNextStatus = (currentStatus: string) => {
        if (currentStatus === "upcoming") return "started";
        if (currentStatus === "started") return "finished";
        return null;
    };

    const getStatusButtonText = (currentStatus: string) => {
        if (currentStatus === "upcoming") return "Start Event";
        if (currentStatus === "started") return "Finish Event";
        return "Event Finished";
    };

    const renderEventCard = (event: Event, isCreator: boolean = false) => (
        <div
            key={event.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/events/${event.id}`)}
        >
            <div className="md:flex">
                {/* Event Image */}
                <div className="md:w-48 lg:w-64">
                    <div className="aspect-[4/3] md:aspect-square bg-gray-100 relative">
                        {event.image_url && event.image_url[0] ? (
                            <Image
                                src={event.image_url[0]}
                                alt={event.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                                <span className="text-4xl text-gray-300">
                                    {event.title.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Event Details */}
                <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {event.title}
                                </h3>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                        event.status
                                    )}`}
                                >
                                    {getStatusText(event.status)}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center text-gray-600">
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                                        />
                                    </svg>
                                    {format(
                                        new Date(event.event_date),
                                        "MMM d, yyyy 'at' h:mm a"
                                    )}
                                </div>
                                {event.location && (
                                    <div className="flex items-center text-gray-600">
                                        <svg
                                            className="w-4 h-4 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        {event.location}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center text-gray-600 mb-4">
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                                    />
                                </svg>
                                {event.participant_count || 0} participant
                                {(event.participant_count || 0) !== 1
                                    ? "s"
                                    : ""}
                            </div>

                            {event.description && (
                                <p className="text-gray-600 line-clamp-2 mb-4">
                                    {event.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                        className="flex flex-wrap gap-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Link
                            href={`/events/${event.id}`}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            View Details
                        </Link>

                        {isCreator && event.status === "upcoming" && (
                            <Link
                                href={`/events/${event.id}/edit`}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Edit Event
                            </Link>
                        )}

                        {/* Status Update Button - Only for creators */}
                        {isCreator && getNextStatus(event.status) && (
                            <button
                                onClick={() =>
                                    handleStatusUpdate(
                                        event.id,
                                        getNextStatus(event.status) as
                                            | "started"
                                            | "finished"
                                    )
                                }
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    event.status === "upcoming"
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-red-600 hover:bg-red-700 text-white"
                                }`}
                            >
                                {getStatusButtonText(event.status)}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (authLoading || loading) {
        return (
            <div className="min-h-screen-navbar bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
                    <div className="flex items-center justify-center py-12 sm:py-16">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-3 border-blue-600 border-t-transparent"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen-navbar bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                My Events
                            </h1>
                            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                                Manage events you've created and view events
                                you've joined
                            </p>
                        </div>
                        <Link
                            href="/dashboard/create"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                        >
                            <svg
                                className="w-4 h-4 sm:w-5 sm:h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            <span className="hidden sm:inline">
                                Create New Event
                            </span>
                            <span className="sm:hidden">Create</span>
                        </Link>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg mb-6">
                        <button
                            onClick={() => setActiveTab("created")}
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                                activeTab === "created"
                                    ? "bg-white text-blue-700 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Created Events ({createdEvents.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("joined")}
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                                activeTab === "joined"
                                    ? "bg-white text-blue-700 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Joined Events ({joinedEvents.length})
                        </button>
                    </div>
                </div>

                {/* Created Events Section */}
                {activeTab === "created" && (
                    <div>
                        {createdEvents.length === 0 ? (
                            <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
                                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                                    <svg
                                        className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                                    No events created yet
                                </h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-4 sm:mb-6 text-sm sm:text-base px-4">
                                    You haven't created any events yet. Start by
                                    creating your first event!
                                </p>
                                <Link
                                    href="/dashboard/create"
                                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md text-sm sm:text-base"
                                >
                                    <svg
                                        className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 -ml-0.5 sm:-ml-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                    Create Your First Event
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {createdEvents.map((event) =>
                                    renderEventCard(event, true)
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Joined Events Section */}
                {activeTab === "joined" && (
                    <div>
                        {joinedEvents.length === 0 ? (
                            <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
                                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-green-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                                    <svg
                                        className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                                    No events joined yet
                                </h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-4 sm:mb-6 text-sm sm:text-base px-4">
                                    You haven't joined any events yet. Browse
                                    available events to get started!
                                </p>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md text-sm sm:text-base"
                                >
                                    <svg
                                        className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 -ml-0.5 sm:-ml-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                    Browse Events
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {joinedEvents.map((event) =>
                                    renderEventCard(event, false)
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
