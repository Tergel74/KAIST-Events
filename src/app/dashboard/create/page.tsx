"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EventForm from "@/components/EventForm";

export default function CreateEventPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        setError(null);

        try {
            // Upload images first if any
            let imageUrl: string | null = null;

            if (data.images && data.images.length > 0) {
                for (let i = 0; i < Math.min(data.images.length, 3); i++) {
                    const file = data.images[i];

                    // Get upload URL
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

                    const { uploadUrl, publicUrl } =
                        await uploadResponse.json();

                    // Upload file
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
            }

            // Create event
            const eventResponse = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: data.title,
                    description: data.description,
                    location: data.location,
                    event_date: data.event_date,
                    image_url: imageUrl,
                }),
            });

            const eventResult = await eventResponse.json();

            if (!eventResponse.ok) {
                throw new Error(eventResult.error || "Failed to create event");
            }

            // Redirect to event details
            router.push(`/events/${eventResult.event.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        Create New Event
                    </h1>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <EventForm
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
