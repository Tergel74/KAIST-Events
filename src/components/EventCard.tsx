import { Event } from "@/types/event";
import { format } from 'date-fns';

interface EventCardProps {
    event: Event;
}

export default function EventCard({ event }: EventCardProps) {
    const imageUrl = Array.isArray(event.image_url) ? event.image_url[0] : event.image_url;
    const eventDate = new Date(event.event_date);
    
    return (
        <div className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-100">
            <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(event.title)}&background=random`;
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                        <span className="text-4xl text-gray-300">
                            {event.title.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                    <span className="text-xs font-medium text-gray-700">
                        {event.participant_count || 0} going
                    </span>
                </div>
            </div>
            
            <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {event.title}
                        </h3>
                        {event.location && (
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="line-clamp-1">{event.location}</span>
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-blue-600">
                            {format(eventDate, 'MMM d')}
                        </div>
                        <div className="text-xs text-gray-500">
                            {format(eventDate, 'h:mm a')}
                        </div>
                    </div>
                </div>
                
                {event.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {event.description}
                    </p>
                )}
            </div>
        </div>
    );
}
