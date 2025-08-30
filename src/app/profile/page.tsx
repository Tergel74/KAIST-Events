"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import Image from "next/image";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    bio?: string;
    pfp?: string;
    created_at: string;
}

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [editedBio, setEditedBio] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push("/auth/login");
            return;
        }

        fetchProfile();
    }, [user, authLoading, router]);

    const fetchProfile = async () => {
        try {
            const response = await fetch("/api/profile", {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch profile");
            }

            const data = await response.json();
            setProfile(data.profile);
            setEditedBio(data.profile.bio || "");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load profile"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB");
            return;
        }

        // Upload image directly
        await updateProfileImage(file);
    };

    const handleBioSubmit = async () => {
        // Update bio directly
        await updateProfile({ bio: editedBio });
    };

    const updateProfileImage = async (file: File) => {
        setUploading(true);
        setError(null);

        try {
            const uploadResponse = await fetch("/api/upload-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    file_name: file.name,
                    file_type: file.type,
                    file_size: file.size,
                    context: "profile",
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

            // Update profile with new image
            await updateProfile({ pfp: publicUrl });
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setUploading(false);
        }
    };

    const updateProfile = async (updateData: {
        bio?: string;
        pfp?: string;
    }) => {
        setUploading(true);
        setError(null);

        try {
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update profile");
            }

            // Refresh profile data
            await fetchProfile();
            if (updateData.bio !== undefined) {
                setEditing(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setUploading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen-navbar bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="min-h-screen-navbar bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen-navbar bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                {/* Profile Image */}
                                <div className="relative">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-white shadow-lg">
                                        {profile.pfp ? (
                                            <Image
                                                src={profile.pfp}
                                                alt={profile.name}
                                                width={128}
                                                height={128}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <span className="text-4xl text-gray-400 font-semibold">
                                                    {profile.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload button */}
                                    <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg cursor-pointer transition-colors">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>

                                {/* Profile Info */}
                                <div className="text-white">
                                    <h1 className="text-2xl sm:text-3xl font-bold">
                                        {profile.name}
                                    </h1>
                                    <p className="text-blue-100 mt-1">
                                        {profile.email}
                                    </p>
                                    <p className="text-blue-100 mt-1 text-sm">
                                        Joined{" "}
                                        {new Date(
                                            profile.created_at
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                                    {error}
                                </div>
                            )}

                            {/* Bio Section */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Bio
                                    </h2>
                                    {!editing && (
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {editing ? (
                                    <div className="space-y-4">
                                        <textarea
                                            value={editedBio}
                                            onChange={(e) =>
                                                setEditedBio(e.target.value)
                                            }
                                            placeholder="Tell others about yourself..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            rows={4}
                                            maxLength={500}
                                        />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">
                                                {editedBio.length}/500
                                                characters
                                            </span>
                                            <div className="space-x-3">
                                                <button
                                                    onClick={() => {
                                                        setEditing(false);
                                                        setEditedBio(
                                                            profile.bio || ""
                                                        );
                                                        setError(null);
                                                    }}
                                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleBioSubmit}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                                                    disabled={uploading}
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-700">
                                        {profile.bio ? (
                                            <p className="whitespace-pre-wrap">
                                                {profile.bio}
                                            </p>
                                        ) : (
                                            <p className="text-gray-500 italic">
                                                No bio yet. Click Edit to add
                                                one!
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
