import { Event } from "@/types/event";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface EventCardProps {
    event: Event;
    index?: number;
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
    const imageUrl = Array.isArray(event.image_url)
        ? event.image_url[0]
        : event.image_url;
    const eventDate = new Date(event.event_date);

    // Extract place name from location string
    const getPlaceName = (location: string): string => {
        if (!location) return "";

        // Try to parse JSON format first (from MapPicker)
        try {
            const parsed = JSON.parse(location);
            if (parsed.text) {
                location = parsed.text;
            }
        } catch {
            // Not JSON, use as is
        }

        // Extract meaningful place name from address
        // Split by comma and take the first meaningful part
        const parts = location.split(",").map((part) => part.trim());

        // If it starts with a number (street address), take the second part
        if (parts.length > 1 && /^\d/.test(parts[0])) {
            return parts[1] || parts[0];
        }

        // Otherwise take the first part
        return parts[0] || location;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-100"
        >
            <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-gray-50 overflow-hidden">
                {imageUrl ? (
                    <motion.img
                        src={imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                event.title
                            )}&background=random`;
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                        <span className="text-2xl sm:text-4xl text-gray-300">
                            {event.title.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Status Badge - Responsive positioning */}
                <motion.div
                    className="absolute top-2 left-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                >
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                </motion.div>

                {/* Participant Count - Responsive positioning */}
                <motion.div
                    className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                >
                    <span className="text-xs font-medium text-gray-700">
                        {event.participants[0]?.count || 0}{" "}
                        <span className="hidden sm:inline">
                            {event.status === "upcoming"
                                ? "going"
                                : event.status === "started"
                                ? "attending"
                                : "attended"}
                        </span>
                        <span className="sm:hidden">👥</span>
                    </span>
                </motion.div>
            </div>

            <div className="p-2 sm:p-3 lg:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base">
                            {event.title}
                        </h3>
                        {event.location && (
                            <p className="text-xs sm:text-sm text-gray-500 flex items-center mt-1">
                                <svg
                                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                <span
                                    className="line-clamp-1 truncate"
                                    title={event.location}
                                >
                                    {getPlaceName(event.location)}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Date/Time - Responsive layout */}
                    <div className="text-left sm:text-right flex-shrink-0">
                        <div className="text-xs sm:text-sm font-medium text-blue-600">
                            {format(eventDate, "MMM d")}
                        </div>
                        <div className="text-xs text-gray-500">
                            {format(eventDate, "h:mm a")}
                        </div>
                    </div>
                </div>

                {event.description && (
                    <motion.p
                        className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                    >
                        {event.description}
                    </motion.p>
                )}
            </div>
        </motion.div>
    );
}
