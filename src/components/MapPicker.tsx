"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Create a wrapper component for the map that handles cleanup properly
const MapWrapper = dynamic(() => import("./MapWrapper"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    ),
}) as React.ComponentType<{
    center: [number, number];
    zoom: number;
    markerPosition?: [number, number];
    onMapClick?: (latlng: { lat: number; lng: number }) => void;
    className?: string;
    popupText?: string;
}>;

interface LocationData {
    text: string;
    coordinates?: { lat: number; lng: number };
}

interface MapPickerProps {
    value: string;
    onChange: (location: string, coordinates?: { lat: number; lng: number }) => void;
    placeholder?: string;
    className?: string;
}

export default function MapPicker({
    value,
    onChange,
    placeholder = "Enter location or click on map",
    className = "",
}: MapPickerProps) {
    const [inputValue, setInputValue] = useState(value);
    const [showMap, setShowMap] = useState(false);
    const [mapMode, setMapMode] = useState<"text" | "map">("text");
    const [mapCoordinates, setMapCoordinates] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [selectedLocation, setSelectedLocation] =
        useState<LocationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Default coordinates (KAIST campus as fallback)
    const defaultCoordinates = { lat: 36.3741, lng: 127.365 };

    // Function to geocode a location and set coordinates
    const geocodeLocation = async (location: string) => {
        if (!location) return;

        try {
            const response = await fetch(
                `/api/geocode?location=${encodeURIComponent(location)}`
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.coordinates) {
                    const coordinates = {
                        lat: data.coordinates.lat,
                        lng: data.coordinates.lng,
                    };
                    setMapCoordinates(coordinates);
                    setSelectedLocation({
                        text: location,
                        coordinates,
                    });
                }
            }
        } catch (err) {
            console.error("Geocoding failed:", err);
            // Fall back to default coordinates
            setMapCoordinates(defaultCoordinates);
        }
    };

    // Update inputValue when value prop changes (for edit mode)
    useEffect(() => {
        if (value !== inputValue) {
            setInputValue(value);
            if (value && value !== selectedLocation?.text) {
                // Only geocode if the value is actually different from what we have
                geocodeLocation(value);
            }
        }
    }, [value, inputValue, selectedLocation?.text]);

    useEffect(() => {
        setIsMounted(true);

        // Get user's current location when component mounts
        if (navigator.geolocation && !value) {
            setIsLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userCoords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setMapCoordinates(userCoords);

                    // Reverse geocode to get address
                    reverseGeocode(userCoords);
                },
                (error) => {
                    // Fall back to default coordinates
                    setMapCoordinates(defaultCoordinates);
                    setIsLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000, // 5 minutes
                }
            );
        } else {
            setMapCoordinates(defaultCoordinates);
        }
    }, []);

    const reverseGeocode = async (coords: { lat: number; lng: number }) => {
        try {
            // Add timeout to the client-side request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

            const response = await fetch(
                `/api/reverse-geocode?lat=${coords.lat}&lng=${coords.lng}`,
                { signal: controller.signal }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error("Failed to reverse geocode location");
            }

            const data = await response.json();

            if (data.success && data.address) {
                const address = data.address;
                setInputValue(address);
                setSelectedLocation({ text: address, coordinates: coords });
                onChange(address, coords);

                // Log the source for debugging
                if (data.source === "error_fallback") {
                    console.warn(
                        "Using fallback address for coordinates:",
                        coords
                    );
                }
            } else {
                // If all else fails, use a basic address format
                const fallbackAddress = `${coords.lat.toFixed(
                    4
                )}, ${coords.lng.toFixed(4)}`;
                setInputValue(fallbackAddress);
                setSelectedLocation({
                    text: fallbackAddress,
                    coordinates: coords,
                });
                onChange(fallbackAddress, coords);
            }
        } catch (err) {
            console.error("Reverse geocoding failed:", err);
            // Use coordinates as fallback
            const fallbackAddress = `${coords.lat.toFixed(
                4
            )}, ${coords.lng.toFixed(4)}`;
            setInputValue(fallbackAddress);
            setSelectedLocation({ text: fallbackAddress, coordinates: coords });
            onChange(fallbackAddress, coords);
        } finally {
            setIsLoading(false);
        }
    };

    // Update input when value prop changes
    useEffect(() => {
        setInputValue(value);
        if (value) {
            // Try to parse if it contains coordinates
            try {
                const parsed = JSON.parse(value);
                if (parsed.text && parsed.coordinates) {
                    setSelectedLocation(parsed);
                    setMapCoordinates(parsed.coordinates);
                } else if (parsed.text) {
                    setSelectedLocation(parsed);
                }
            } catch {
                // If not JSON, treat as plain text
                setSelectedLocation({ text: value });
            }
        } else {
            setSelectedLocation(null);
        }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setSelectedLocation({ text: newValue });

        // For manual text input, pass just the text without coordinates
        onChange(newValue);
    };

    const handleMapClick = async (e: any) => {
        const { lat, lng } = e.latlng;
        setMapCoordinates({ lat, lng });

        // Reverse geocode to get address
        setIsLoading(true);
        try {
            // Add timeout to the client-side request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

            const response = await fetch(
                `/api/reverse-geocode?lat=${lat}&lng=${lng}`,
                { signal: controller.signal }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error("Failed to reverse geocode location");
            }

            const data = await response.json();

            const address =
                data.success && data.address
                    ? data.address
                    : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

            const locationData: LocationData = {
                text: address,
                coordinates: { lat, lng },
            };

            setSelectedLocation(locationData);
            setInputValue(address);
            onChange(address, { lat, lng });
        } catch (err) {
            // Fallback to coordinates
            const locationData: LocationData = {
                text: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                coordinates: { lat, lng },
            };
            setSelectedLocation(locationData);
            setInputValue(locationData.text);
            onChange(locationData.text, { lat, lng });
        } finally {
            setIsLoading(false);
        }
    };

    const geocodeAndShowOnMap = async () => {
        if (!inputValue) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/geocode?location=${encodeURIComponent(inputValue)}`
            );

            if (!response.ok) {
                throw new Error("Failed to geocode location");
            }

            const data = await response.json();

            if (data.success && data.coordinates) {
                const coordinates = {
                    lat: data.coordinates.lat,
                    lng: data.coordinates.lng,
                };
                setMapCoordinates(coordinates);

                const locationData: LocationData = {
                    text: inputValue,
                    coordinates,
                };
                setSelectedLocation(locationData);

                // Always pass just the text to maintain clean input
                onChange(inputValue, coordinates);
            }
        } catch (err) {
            console.error("Geocoding failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isMounted) {
        return (
            <div className={className}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="space-y-3">
                {/* Mode Toggle */}
                <div className="flex rounded-lg bg-gray-100 p-1">
                    <button
                        type="button"
                        onClick={() => {
                            setMapMode("text");
                            // When switching to text mode, ensure we pass plain text (no coordinates for manual input)
                            if (selectedLocation?.text) {
                                onChange(selectedLocation.text);
                            }
                        }}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            mapMode === "text"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        📝 Text Input
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setMapMode("map");
                            setShowMap(true);
                            if (inputValue && !mapCoordinates) {
                                geocodeAndShowOnMap();
                            }
                        }}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            mapMode === "map"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        🗺️ Pick on Map
                    </button>
                </div>

                {/* Text Input Mode */}
                {mapMode === "text" && (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder={placeholder}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setShowMap(!showMap);
                                    if (!showMap && inputValue) {
                                        geocodeAndShowOnMap();
                                    }
                                }}
                                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                title={showMap ? "Hide map" : "Show on map"}
                            >
                                <svg
                                    className="w-5 h-5"
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
                            </button>
                        </div>

                        {/* Use My Location Button */}
                        <button
                            type="button"
                            onClick={() => {
                                if (navigator.geolocation) {
                                    setIsLoading(true);
                                    navigator.geolocation.getCurrentPosition(
                                        (position) => {
                                            const userCoords = {
                                                lat: position.coords.latitude,
                                                lng: position.coords.longitude,
                                            };
                                            setMapCoordinates(userCoords);
                                            reverseGeocode(userCoords);
                                        },
                                        (error) => {
                                            console.error(
                                                "Geolocation error:",
                                                error
                                            );
                                            setIsLoading(false);
                                            alert(
                                                "Unable to get your location. Please check your browser permissions."
                                            );
                                        },
                                        {
                                            enableHighAccuracy: true,
                                            timeout: 10000,
                                            maximumAge: 60000,
                                        }
                                    );
                                } else {
                                    alert(
                                        "Geolocation is not supported by this browser."
                                    );
                                }
                            }}
                            disabled={isLoading}
                            className="w-full px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    Getting location...
                                </>
                            ) : (
                                <>
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
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    📍 Use My Current Location
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Map Mode */}
                {mapMode === "map" && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Click on the map to select a location
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        setIsLoading(true);
                                        navigator.geolocation.getCurrentPosition(
                                            (position) => {
                                                const userCoords = {
                                                    lat: position.coords
                                                        .latitude,
                                                    lng: position.coords
                                                        .longitude,
                                                };
                                                setMapCoordinates(userCoords);
                                                reverseGeocode(userCoords);
                                            },
                                            (error) => {
                                                console.error(
                                                    "Geolocation error:",
                                                    error
                                                );
                                                setIsLoading(false);
                                                alert(
                                                    "Unable to get your location. Please check your browser permissions."
                                                );
                                            },
                                            {
                                                enableHighAccuracy: true,
                                                timeout: 10000,
                                                maximumAge: 60000,
                                            }
                                        );
                                    } else {
                                        alert(
                                            "Geolocation is not supported by this browser."
                                        );
                                    }
                                }}
                                disabled={isLoading}
                                className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                            >
                                <svg
                                    className="w-3 h-3"
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
                                My Location
                            </button>
                        </div>
                        <div className="relative rounded-lg overflow-hidden border border-gray-200 h-[400px]">
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[1000]">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            )}

                            {isMounted && (
                                <MapWrapper
                                    center={
                                        mapCoordinates
                                            ? [
                                                  mapCoordinates.lat,
                                                  mapCoordinates.lng,
                                              ]
                                            : [
                                                  defaultCoordinates.lat,
                                                  defaultCoordinates.lng,
                                              ]
                                    }
                                    zoom={mapCoordinates ? 15 : 12}
                                    markerPosition={
                                        mapCoordinates
                                            ? [
                                                  mapCoordinates.lat,
                                                  mapCoordinates.lng,
                                              ]
                                            : undefined
                                    }
                                    onMapClick={handleMapClick}
                                    className="w-full h-[400px] rounded-lg"
                                    popupText={
                                        selectedLocation?.text ||
                                        "Selected location"
                                    }
                                />
                            )}
                        </div>

                        {selectedLocation && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm font-medium text-gray-900">
                                    Selected Location:
                                </p>
                                <p className="text-sm text-gray-600">
                                    {selectedLocation.text}
                                </p>
                                {selectedLocation.coordinates && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Coordinates:{" "}
                                        {selectedLocation.coordinates.lat.toFixed(
                                            6
                                        )}
                                        ,{" "}
                                        {selectedLocation.coordinates.lng.toFixed(
                                            6
                                        )}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Preview Map for Text Mode */}
                {mapMode === "text" && showMap && mapCoordinates && (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                        {isLoading && (
                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10 h-[250px]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        )}

                        {isMounted && (
                            <MapWrapper
                                center={[
                                    mapCoordinates.lat,
                                    mapCoordinates.lng,
                                ]}
                                zoom={15}
                                markerPosition={[
                                    mapCoordinates.lat,
                                    mapCoordinates.lng,
                                ]}
                                className="w-full h-[250px] rounded-lg"
                                popupText={inputValue}
                            />
                        )}

                        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-600">
                            Preview: {inputValue}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
