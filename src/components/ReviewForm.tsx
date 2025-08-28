"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
interface ReviewFormData {
    content: string;
    photos: FileList;
}

interface ReviewFormProps {
    // eventId: string;
    onSubmit: (data: ReviewFormData) => Promise<void>;
    isLoading?: boolean;
}

export default function ReviewForm({ onSubmit, isLoading }: ReviewFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ReviewFormData>();
    const [photoPreview, setPhotoPreview] = useState<string[]>([]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const previews = Array.from(files).map((file) =>
                URL.createObjectURL(file)
            );
            setPhotoPreview(previews);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Review
                </label>
                <textarea
                    {...register("content", {
                        required: "Review content is required",
                    })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Share your experience at this event..."
                />
                {errors.content && (
                    <p className="text-red-500 text-sm mt-1">
                        {errors.content.message}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photos (optional)
                </label>
                <input
                    {...register("photos")}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {photoPreview.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                        {photoPreview.map((preview, index) => (
                            <Image
                                key={index}
                                src={preview}
                                alt={`Photo ${index + 1}`}
                                className="w-20 h-20 object-cover rounded"
                            />
                        ))}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
                {isLoading ? "Submitting..." : "Submit Review"}
            </button>
        </form>
    );
}
