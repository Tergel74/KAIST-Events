"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import EventForm from "@/components/EventForm";
import { Event } from "@/types/event";

interface EditEventPageProps {
    params: Promise<{ id: string }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchEvent = async () => {
        try {
            const response = await fetch(`/api/events?event_id=${id}`, {
                cache: "no-store",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Event not found");
            }

            const data = await response.json();
            const eventDetail = data.events?.[0];

            if (!eventDetail) {
                throw new Error("Event not found");
            }

            if (eventDetail.creator_id !== user?.id) {
                throw new Error("You don't have permission to edit this event");
            }

            if (eventDetail.status !== "upcoming") {
                throw new Error("You can only edit upcoming events");
            }

            setEvent(eventDetail);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load event"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Don't redirect while auth is still loading
        if (authLoading) return;

        if (!user) {
            router.push("/auth/login");
            return;
        }
        fetchEvent();
    }, [user, authLoading, id, router]);

    const handleSubmit = async (data: any) => {
        if (!event) return;

        setIsLoading(true);
        setError(null);

        try {
            let imageUrl: string | null = event.image_url?.[0] || null;

            // Handle image upload if new image is provided
            if (data.image && data.image.length > 0) {
                const file = data.image[0];

                const uploadResponse = await fetch("/api/upload-url", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        file_name: file.name,
                        file_type: file.type,
                        file_size: file.size,
                        context: "event",
                    }),
                });

                if (!uploadResponse.ok) {
                    throw new Error("Failed to get upload URL");
                }

                const { uploadUrl, publicUrl } = await uploadResponse.json();

                const fileUploadResponse = await fetch(uploadUrl, {
                    method: "PUT",
                    body: file,
                    headers: {
                        "Content-Type": file.type,
                    },
                });

                if (!fileUploadResponse.ok) {
                    throw new Error("Failed to upload image");
                }

                imageUrl = publicUrl;
            }

            // Update event
            const eventResponse = await fetch(`/api/events/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: data.title,
                    description: data.description,
                    location: data.location,
                    event_date: data.event_date,
                    image_url: imageUrl ? [imageUrl] : [],
                }),
            });

            const eventResult = await eventResponse.json();

            if (!eventResponse.ok) {
                throw new Error(eventResult.error || "Failed to update event");
            }

            // Redirect to my events page
            router.push("/dashboard/my-events");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen-navbar bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen-navbar bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        {error?.includes("permission")
                            ? "Access Denied"
                            : "Event Not Found"}
                    </h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="space-x-4">
                        <button
                            onClick={() => router.back()}
                            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => router.push("/dashboard/my-events")}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                        >
                            My Events
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen-navbar bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
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
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Back
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Edit Event
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Update your event details
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <EventForm
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                            initialData={{
                                title: event.title,
                                description: event.description || "",
                                location: event.location || "",
                                event_date: new Date(event.event_date)
                                    .toISOString()
                                    .slice(0, 16),
                            }}
                            existingImageUrl={event.image_url?.[0]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
