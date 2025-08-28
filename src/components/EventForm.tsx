"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import MapPicker from "./MapPicker";
import Image from "next/image";
interface EventFormData {
    title: string;
    description: string;
    location: string;
    event_date: string;
    image?: FileList;
}

interface EventFormProps {
    onSubmit: (data: EventFormData) => void;
    isLoading?: boolean;
    initialData?: {
        title: string;
        description: string;
        location: string;
        event_date: string;
    };
    existingImageUrl?: string;
}

export default function EventForm({
    onSubmit,
    isLoading,
    initialData,
    existingImageUrl,
}: EventFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<EventFormData>({
        defaultValues: initialData,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(
        existingImageUrl || null
    );

    const validateEventDate = (dateString: string) => {
        const eventDate = new Date(dateString);
        const now = new Date();
        return eventDate > now;
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                </label>
                <input
                    {...register("title", { required: "Title is required" })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter event title"
                />
                {errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                        {errors.title.message}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time *
                </label>
                <input
                    {...register("event_date", {
                        required: "Date and time is required",
                        validate: (value) =>
                            validateEventDate(value) ||
                            "Event date must be in the future",
                    })}
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {errors.event_date && (
                    <p className="text-red-500 text-sm mt-1">
                        {errors.event_date.message}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                </label>
                <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                        <MapPicker
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Enter event location (e.g., KAIST Main Campus, Daejeon)"
                        />
                    )}
                />
                {errors.location && (
                    <p className="text-red-500 text-sm mt-1">
                        {errors.location.message}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                </label>
                <textarea
                    {...register("description")}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Describe your event"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Image (Optional)
                </label>
                <div className="space-y-2">
                    <input
                        {...register("image")}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
                    />
                    {imagePreview && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">
                                Image Preview:
                            </p>
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                                <Image
                                    src={imagePreview}
                                    alt="Event preview"
                                    className="w-full h-full object-cover"
                                />
                                {/* <img
                                    src={imagePreview}
                                    alt="Event preview"
                                    className="w-full h-full object-cover"
                                /> */}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
                {isLoading
                    ? initialData
                        ? "Updating Event..."
                        : "Creating Event..."
                    : initialData
                    ? "Update Event"
                    : "Create Event"}
            </button>
        </form>
    );
}
