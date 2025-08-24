"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import JoinButton from "@/components/JoinButton";
import ReviewForm from "@/components/ReviewForm";
import { Event } from "@/types/event";
import { Participant } from "@/types/participant";
import { Review } from "@/types/review";

interface ReviewFormData {
    content: string;
    photos: FileList;
}

interface EventDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
    const { id } = use(params);
    const [event, setEvent] = useState<Event | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isJoined, setIsJoined] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchEventDetails = async () => {
        try {
            // Fetch event details
            const eventResponse = await fetch(
                `/api/events?event_id=${id}`,
                {
                    cache: 'no-store',
                    credentials: 'include'
                }
            );
            const eventData = await eventResponse.json();

            if (!eventResponse.ok) {
                throw new Error(eventData.error || "Event not found");
            }

            const eventDetail = eventData.events?.[0];
            if (!eventDetail) {
                throw new Error("Event not found");
            }

            setEvent(eventDetail);

            // Fetch participants
            const participantsResponse = await fetch(
                `/api/events/${id}/participants`,
                {
                    cache: 'no-store',
                    credentials: 'include'
                }
            );
            if (participantsResponse.ok) {
                const participantsData = await participantsResponse.json();
                setParticipants(participantsData.participants || []);
                
                // Check if current user is joined
                const currentUser = participantsData.participants?.find((p: any) => p.user_id);
                setIsJoined(!!currentUser);
            }

            // Fetch reviews if event is completed
            if (eventDetail.status === "completed") {
                const reviewsResponse = await fetch(
                    `/api/events/${id}/reviews`,
                    {
                        cache: 'no-store',
                        credentials: 'include'
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
                    cache: 'no-store',
                    credentials: 'include'
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
            const reviewsResponse = await fetch(
                `/api/events/${id}/reviews`,
                {
                    cache: 'no-store',
                    credentials: 'include'
                }
            );
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Event Not Found
                    </h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Event Header */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                        {event.image_url && event.image_url[0] && (
                            <img
                                src={event.image_url[0]}
                                alt={event.title}
                                className="w-full h-64 object-cover"
                            />
                        )}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {event.title}
                                </h1>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm ${
                                        event.status === "upcoming"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {event.status}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        📅 Date & Time
                                    </h3>
                                    <p className="text-gray-600">
                                        {new Date(
                                            event.event_date
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        📍 Location
                                    </h3>
                                    <p className="text-gray-600">
                                        {event.location || "TBD"}
                                    </p>
                                </div>
                            </div>

                            {event.description && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        Description
                                    </h3>
                                    <p className="text-gray-600 whitespace-pre-wrap">
                                        {event.description}
                                    </p>
                                </div>
                            )}

                            {event.status === "upcoming" && (
                                <JoinButton
                                    eventId={event.id}
                                    isJoined={isJoined}
                                    participantCount={participants.length}
                                    onJoinToggle={handleJoinToggle}
                                />
                            )}
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Participants ({participants.length})
                        </h2>
                        {participants.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {participants.map((participant) => (
                                    <div
                                        key={participant.id}
                                        className="text-center"
                                    >
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <span className="text-blue-600 font-semibold">
                                                {participant.users.name?.[0] ||
                                                    "?"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {participant.users.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No participants yet</p>
                        )}
                    </div>

                    {/* Reviews Section (for completed events) */}
                    {event.status === "completed" && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Reviews & Photos
                            </h2>

                            {isJoined && (
                                <div className="mb-8">
                                    <h3 className="font-semibold text-gray-900 mb-4">
                                        Share Your Experience
                                    </h3>
                                    <ReviewForm
                                        eventId={event.id}
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
                                            {review.image_url && (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    <img
                                                        src={review.image_url}
                                                        alt="Review photo"
                                                        className="w-full h-24 object-cover rounded"
                                                    />
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
