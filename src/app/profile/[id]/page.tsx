"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import Image from "next/image";
import Link from "next/link";

interface UserProfile {
    id: string;
    name: string;
    bio?: string;
    pfp?: string;
    created_at: string;
    stats: {
        eventsCreated: number;
        eventsParticipated: number;
        upcomingEvents: number;
    };
}

interface UserProfilePageProps {
    params: Promise<{ id: string }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push("/auth/login");
            return;
        }

        // Redirect to own profile if viewing self
        if (user.id === id) {
            router.push("/profile");
            return;
        }

        fetchProfile();
    }, [user, authLoading, id, router]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`/api/profile/${id}`, {
                credentials: "include",
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("User not found");
                }
                throw new Error("Failed to fetch profile");
            }

            const data = await response.json();
            setProfile(data.profile);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load profile"
            );
        } finally {
            setLoading(false);
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

    if (error) {
        return (
            <div className="min-h-screen-navbar bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            ← Go Back
                        </button>
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

                                {/* Profile Info */}
                                <div className="text-white">
                                    <h1 className="text-2xl sm:text-3xl font-bold">
                                        {profile.name}
                                    </h1>
                                    <p className="text-blue-100 mt-1 text-sm">
                                        KAIST Student
                                    </p>
                                    <p className="text-blue-100 mt-1 text-sm">
                                        Member since{" "}
                                        {new Date(
                                            profile.created_at
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Statistics */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <div className="bg-blue-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {profile.stats.eventsCreated}
                                    </div>
                                    <div className="text-sm text-blue-800">
                                        Events Created
                                    </div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {profile.stats.eventsParticipated}
                                    </div>
                                    <div className="text-sm text-green-800">
                                        Events Joined
                                    </div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {profile.stats.upcomingEvents}
                                    </div>
                                    <div className="text-sm text-purple-800">
                                        Upcoming Events
                                    </div>
                                </div>
                            </div>

                            {/* Bio Section */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    About
                                </h2>
                                <div className="text-gray-700">
                                    {profile.bio ? (
                                        <p className="whitespace-pre-wrap">
                                            {profile.bio}
                                        </p>
                                    ) : (
                                        <p className="text-gray-500 italic">
                                            This user hasn't added a bio yet.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                    Browse Events
                                </Link>
                                <button
                                    onClick={() => router.back()}
                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    ← Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
