"use client";

import { useEffect, useRef } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvents,
} from "react-leaflet";
import L from "leaflet";

// Fix leaflet default markers
if (typeof window !== "undefined") {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
}

interface MapWrapperProps {
    center: [number, number];
    zoom: number;
    markerPosition?: [number, number];
    onMapClick?: (latlng: { lat: number; lng: number }) => void;
    className?: string;
    popupText?: string;
}

function MapClickHandler({
    onMapClick,
}: {
    onMapClick?: (latlng: { lat: number; lng: number }) => void;
}) {
    useMapEvents({
        click: (e) => {
            if (onMapClick) {
                onMapClick(e.latlng);
            }
        },
    });
    return null;
}

export default function MapWrapper({
    center,
    zoom,
    markerPosition,
    onMapClick,
    className = "w-full h-64 rounded-lg",
    popupText,
}: MapWrapperProps) {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Cleanup function to remove map instance
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return (
        <div ref={containerRef} className={className}>
            <MapContainer
                center={center}
                zoom={zoom}
                className="w-full h-full rounded-lg"
                ref={mapRef}
                key={`${center[0]}-${center[1]}-${Date.now()}`} // Force remount with unique key
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markerPosition && (
                    <Marker position={markerPosition}>
                        {popupText && <Popup>{popupText}</Popup>}
                    </Marker>
                )}
                <MapClickHandler onMapClick={onMapClick} />
            </MapContainer>
        </div>
    );
}
