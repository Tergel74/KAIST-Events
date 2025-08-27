"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";

// Fix Leaflet default markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
    ssr: false,
});

interface MapComponentProps {
    location: string;
    coordinates?: { lat: number; lng: number };
    className?: string;
    height?: string;
    showLabel?: boolean;
}

export default function MapComponent({
    location,
    coordinates,
    className = "",
    height = "200px",
    showLabel = true,
}: MapComponentProps) {
    const [mapCoordinates, setMapCoordinates] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!location && !coordinates) {
            setError("No location provided");
            setIsLoading(false);
            return;
        }

        if (coordinates) {
            setMapCoordinates(coordinates);
            setIsLoading(false);
            return;
        }

        // Try to parse location as JSON first (from MapPicker)
        try {
            const parsedLocation = JSON.parse(location);
            if (parsedLocation.coordinates) {
                setMapCoordinates(parsedLocation.coordinates);
                setIsLoading(false);
                return;
            }
            // If JSON but no coordinates, use the text for geocoding
            if (parsedLocation.text) {
                geocodeLocation(parsedLocation.text);
                return;
            }
        } catch {
            // Not JSON, treat as plain text
        }

        // Geocode the location using Nominatim (free)
        geocodeLocation(location);
    }, [location, coordinates]);

    const geocodeLocation = async (locationText: string) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    locationText
                )}&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                setMapCoordinates({
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                });
            } else {
                setError("Location not found on map");
            }
        } catch (err) {
            setError("Failed to load map");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isMounted) {
        return (
            <div
                className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
                style={{ height }}
            >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!location && !coordinates) {
        return (
            <div
                className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
                style={{ height }}
            >
                <p className="text-gray-500">No location specified</p>
            </div>
        );
    }

    const getDisplayText = (location: string) => {
        try {
            const parsed = JSON.parse(location);
            return parsed.text || location;
        } catch {
            return location;
        }
    };

    return (
        <div className={`relative ${className}`}>
            {showLabel && (
                <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
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
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        📍 Location
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                        {getDisplayText(location)}
                    </p>
                </div>
            )}

            <div className="relative rounded-lg overflow-hidden border border-gray-200">
                {isLoading && (
                    <div
                        className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10"
                        style={{ height }}
                    >
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {error && (
                    <div
                        className="bg-gray-100 flex flex-col items-center justify-center"
                        style={{ height }}
                    >
                        <svg
                            className="w-8 h-8 text-gray-400 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
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
                        <p className="text-gray-500 text-sm text-center">
                            {error}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                            {getDisplayText(location)}
                        </p>
                    </div>
                )}

                {mapCoordinates && !isLoading && (
                    <MapContainer
                        center={[mapCoordinates.lat, mapCoordinates.lng]}
                        zoom={15}
                        style={{ height, width: "100%" }}
                        className="rounded-lg"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker
                            position={[mapCoordinates.lat, mapCoordinates.lng]}
                        >
                            <Popup>{getDisplayText(location)}</Popup>
                        </Marker>
                    </MapContainer>
                )}
            </div>
        </div>
    );
}
