"use client";

import { useState } from "react";

interface EventStatusButtonProps {
    eventId: string;
    currentStatus: "upcoming" | "started" | "finished";
    isCreator: boolean;
    onStatusUpdate: (
        eventId: string,
        newStatus: "upcoming" | "started" | "finished"
    ) => Promise<void>;
}

export default function EventStatusButton({
    eventId,
    currentStatus,
    isCreator,
    onStatusUpdate,
}: EventStatusButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!isCreator) {
        return null;
    }

    const handleStatusUpdate = async (
        newStatus: "upcoming" | "started" | "finished"
    ) => {
        setIsLoading(true);
        try {
            await onStatusUpdate(eventId, newStatus);
        } finally {
            setIsLoading(false);
        }
    };

    const getNextStatus = () => {
        if (currentStatus === "upcoming") return "started";
        if (currentStatus === "started") return "finished";
        return null;
    };

    const getButtonText = () => {
        if (currentStatus === "upcoming") return "Start Event";
        if (currentStatus === "started") return "Finish Event";
        return "Event Finished";
    };

    const getButtonColor = () => {
        if (currentStatus === "upcoming")
            return "bg-green-600 hover:bg-green-700";
        if (currentStatus === "started") return "bg-red-600 hover:bg-red-700";
        return "bg-gray-400 cursor-not-allowed";
    };

    const nextStatus = getNextStatus();

    return (
        <button
            onClick={() => nextStatus && handleStatusUpdate(nextStatus)}
            disabled={isLoading || !nextStatus}
            className={`px-4 py-2 rounded-md font-medium text-white transition-colors ${getButtonColor()} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {isLoading ? "Updating..." : getButtonText()}
        </button>
    );
}
