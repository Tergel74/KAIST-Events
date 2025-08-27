"use client";

import { useState } from "react";

interface JoinButtonProps {
    eventId: string;
    isJoined: boolean;
    isCreator: boolean;
    participantCount: number;
    eventStatus: "upcoming" | "started" | "finished";
    onJoinToggle: (eventId: string, isJoining: boolean) => Promise<void>;
    onEdit: () => void;
    disabled?: boolean;
}

export default function JoinButton({
    eventId,
    isJoined,
    isCreator,
    participantCount,
    eventStatus,
    onJoinToggle,
    onEdit,
    disabled,
}: JoinButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (isCreator) {
            onEdit();
            return;
        }

        // Don't allow joining/leaving finished events
        if (eventStatus === "finished") {
            return;
        }

        setIsLoading(true);
        try {
            await onJoinToggle(eventId, !isJoined);
        } finally {
            setIsLoading(false);
        }
    };

    const getButtonText = () => {
        if (isLoading) return "Loading...";
        if (isCreator) return "Edit Event";
        if (eventStatus === "finished") return "Event Finished";
        return isJoined ? "Leave Event" : "Join Event";
    };

    const getButtonStyle = () => {
        if (eventStatus === "finished") {
            return "bg-gray-400 text-white cursor-not-allowed";
        }
        if (isCreator) {
            return "bg-blue-600 text-white hover:bg-blue-700";
        }
        return isJoined
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-blue-600 text-white hover:bg-blue-700";
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handleClick}
                disabled={
                    disabled ||
                    isLoading ||
                    (eventStatus === "finished" && !isCreator)
                }
                className={`px-4 py-2 rounded-md font-medium transition-colors ${getButtonStyle()} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {getButtonText()}
            </button>
            <span className="text-sm text-gray-600">
                {participantCount} participant
                {participantCount !== 1 ? "s" : ""}
            </span>
        </div>
    );
}
