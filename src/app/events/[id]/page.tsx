"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import JoinButton from "@/components/JoinButton";
import ReviewForm from "@/components/ReviewForm";
import EventStatusButton from "@/components/EventStatusButton";
import MapComponent from "@/components/MapComponent";
import { Event } from "@/types/event";
import { Participant } from "@/types/participant";
import { Review } from "@/types/review";
import { useAuth } from "@/lib/auth/AuthContext";
import { format } from "date-fns";
import Image from "next/image";

interface ReviewFormData {
    content: string;
    photos: FileList;
}

interface EventDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
    const { id } = use(params);
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isJoined, setIsJoined] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchEventDetails = async () => {
        try {
            const eventResponse = await fetch(`/api/events?event_id=${id}`, {
                cache: "no-store",
                credentials: "include",
            });
            const eventData = await eventResponse.json();

            if (!eventResponse.ok) {
                throw new Error(eventData.error || "Event not found");
            }

            const eventDetail = eventData.events?.[0];
            if (!eventDetail) {
                throw new Error("Event not found");
            }

            setEvent(eventDetail);
            setIsCreator(eventDetail.creator_id === user?.id);

            const participantsResponse = await fetch(
                `/api/events/${id}/participants`,
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );
            if (participantsResponse.ok) {
                const participantsData = await participantsResponse.json();
                setParticipants(participantsData.participants || []);

                const currentUser = participantsData.participants?.find(
                    (p: any) => p.user_id
                );
                setIsJoined(!!currentUser);
            }
            if (eventDetail.status === "finished") {
                const reviewsResponse = await fetch(
                    `/api/events/${id}/reviews`,
                    {
                        cache: "no-store",
                        credentials: "include",
                    }
                );
                if (reviewsResponse.ok) {
                    const reviewsData = await reviewsResponse.json();
                    setReviews(reviewsData.reviews || []);
                }
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load event"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const handleJoinToggle = async (eventId: string, isJoining: boolean) => {
        try {
            const method = isJoining ? "POST" : "DELETE";
            const response = await fetch(`/api/events/${eventId}/join`, {
                method,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update participation");
            }

            setIsJoined(isJoining);
            // Refresh participants list
            const participantsResponse = await fetch(
                `/api/events/${eventId}/participants`,
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );
            if (participantsResponse.ok) {
                const participantsData = await participantsResponse.json();
                setParticipants(participantsData.participants || []);
            }
        } catch (err) {
            throw err;
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

            // Refresh event details
            await fetchEventDetails();
        } catch (err) {
            console.error("Error updating event status:", err);
            throw err;
        }
    };

    const handleReviewSubmit = async (data: ReviewFormData) => {
        try {
            // Upload photos if any
            const photoUrls: string[] = [];

            if (data.photos && data.photos.length > 0) {
                for (let i = 0; i < data.photos.length; i++) {
                    const file = data.photos[i];

                    const uploadResponse = await fetch("/api/upload-url", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            file_name: file.name,
                            file_type: file.type,
                            file_size: file.size,
                            context: "review",
                        }),
                    });

                    if (uploadResponse.ok) {
                        const { uploadUrl, publicUrl } =
                            await uploadResponse.json();

                        const fileUploadResponse = await fetch(uploadUrl, {
                            method: "PUT",
                            body: file,
                            headers: { "Content-Type": file.type },
                        });

                        if (fileUploadResponse.ok) {
                            photoUrls.push(publicUrl);
                        }
                    }
                }
            }

            // Submit review
            const response = await fetch(`/api/events/${id}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: data.content,
                    photo_urls: photoUrls,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to submit review");
            }

            // Refresh reviews
            const reviewsResponse = await fetch(`/api/events/${id}/reviews`, {
                cache: "no-store",
                credentials: "include",
            });
            if (reviewsResponse.ok) {
                const reviewsData = await reviewsResponse.json();
                setReviews(reviewsData.reviews || []);
            }
        } catch (err) {
            console.error("Error submitting review:", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen-navbar bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen-navbar bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                            className="w-10 h-10 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Event Not Found
                    </h1>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {error}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center justify-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Go Back
                        </button>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen-navbar bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Back Button */}
            <div className="container mx-auto px-4 pt-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back
                </button>
            </div>

            <div className="container mx-auto px-4 pb-8">
                <div className="max-w-6xl mx-auto">
                    {/* Event Header */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                        {event.image_url && event.image_url[0] && (
                            <div className="relative h-80 md:h-96 w-full overflow-hidden">
                                <Image
                                    src={event.image_url[0]}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                                {/* <img
                                    src={event.image_url[0]}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                /> */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                <div className="absolute bottom-4 left-6">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            event.status === "upcoming"
                                                ? "bg-green-100 text-green-800"
                                                : event.status === "started"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                        {event.status === "upcoming"
                                            ? "Upcoming"
                                            : event.status === "started"
                                            ? "Started"
                                            : "Finished"}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                                <div className="flex-1">
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                        {event.title}
                                    </h1>
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <svg
                                            className="w-5 h-5 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                        Created by{" "}
                                        {event.users?.name || "Unknown"}
                                    </div>
                                </div>
                                {!event.image_url?.[0] && (
                                    <span
                                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                                            event.status === "upcoming"
                                                ? "bg-green-100 text-green-800"
                                                : event.status === "started"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                        {event.status === "upcoming"
                                            ? "Upcoming"
                                            : event.status === "started"
                                            ? "Started"
                                            : "Finished"}
                                    </span>
                                )}
                            </div>
                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg
                                                className="w-5 h-5 text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                Date & Time
                                            </h3>
                                            <p className="text-gray-600">
                                                {format(
                                                    new Date(event.event_date),
                                                    "EEEE, MMMM d, yyyy"
                                                )}
                                            </p>
                                            <p className="text-gray-600">
                                                {format(
                                                    new Date(event.event_date),
                                                    "h:mm a"
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <svg
                                            className="w-5 h-5 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-7.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                                            />
                                        </svg>
                                        <span className="font-medium">
                                            {participants.length} participant
                                            {participants.length !== 1
                                                ? "s"
                                                : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Location Map */}
                            {event.location && (
                                <div className="mb-8">
                                    <MapComponent
                                        location={event.location}
                                        height="400px"
                                        showLabel={true}
                                    />
                                </div>
                            )}{" "}
                            {event.description && (
                                <div className="mb-8">
                                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                                        About this event
                                    </h3>
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {event.description}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {/* Action Buttons */}
                            <div className="space-y-4">
                                {/* Participant Actions */}
                                {event.status === "upcoming" && !isCreator && (
                                    <div className="flex flex-wrap gap-3">
                                        <JoinButton
                                            eventId={event.id}
                                            isJoined={isJoined}
                                            isCreator={false}
                                            participantCount={
                                                participants.length
                                            }
                                            eventStatus={event.status}
                                            onJoinToggle={handleJoinToggle}
                                            onEdit={() => {}}
                                        />
                                    </div>
                                )}

                                {/* Creator Actions */}
                                {isCreator && (
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                        <div className="flex items-center mb-3">
                                            <svg
                                                className="w-5 h-5 text-blue-600 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                            <span className="font-semibold text-blue-900">
                                                Event Creator Controls
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {event.status === "upcoming" && (
                                                <button
                                                    onClick={() =>
                                                        router.push(
                                                            `/events/${id}/edit`
                                                        )
                                                    }
                                                    className="bg-white text-blue-700 px-4 py-2 rounded-lg border border-blue-300 hover:bg-blue-50 transition-colors flex items-center"
                                                >
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
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                    Edit Event
                                                </button>
                                            )}
                                            <EventStatusButton
                                                eventId={event.id}
                                                currentStatus={event.status}
                                                isCreator={isCreator}
                                                onStatusUpdate={
                                                    handleStatusUpdate
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                                <svg
                                    className="w-5 h-5 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Participants ({participants.length})
                            </h2>
                        </div>
                        {participants.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {participants.map((participant) => (
                                    <div
                                        key={participant.id}
                                        className="text-center group"
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200">
                                            <span className="text-blue-700 font-bold text-lg">
                                                {participant.users.name?.[0] ||
                                                    "?"}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">
                                            {participant.users.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-lg">
                                    No participants yet
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Be the first to join this event!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Reviews Section (for finished events) */}
                    {event.status === "finished" && (
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="flex items-center mb-8">
                                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center mr-3">
                                    <svg
                                        className="w-5 h-5 text-yellow-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Reviews & Photos
                                </h2>
                            </div>

                            {(isJoined || isCreator) && (
                                <div className="mb-8">
                                    <h3 className="font-semibold text-gray-900 mb-4">
                                        Share Your Experience
                                    </h3>
                                    <ReviewForm
                                        // eventId={event.id}
                                        onSubmit={handleReviewSubmit}
                                    />
                                </div>
                            )}

                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="border-b border-gray-200 pb-6"
                                        >
                                            <div className="flex items-center mb-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                    <span className="text-blue-600 font-semibold text-sm">
                                                        {review.users
                                                            .name?.[0] || "?"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {review.users.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(
                                                            review.created_at
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 mb-3">
                                                {review.content}
                                            </p>
                                            {review.photo_url &&
                                                review.photo_url.length > 0 && (
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                        {review.photo_url.map(
                                                            (
                                                                photo,
                                                                photoIndex
                                                            ) => (
                                                                <Image
                                                                    key={
                                                                        photoIndex
                                                                    }
                                                                    src={photo}
                                                                    alt={`Review photo ${
                                                                        photoIndex +
                                                                        1
                                                                    }`}
                                                                    className="w-full h-24 object-cover rounded"
                                                                />
                                                                // <img
                                                                //     key={
                                                                //         photoIndex
                                                                //     }
                                                                //     src={photo}
                                                                //     alt={`Review photo ${
                                                                //         photoIndex +
                                                                //         1
                                                                //     }`}
                                                                //     className="w-full h-24 object-cover rounded"
                                                                // />
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No reviews yet</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
