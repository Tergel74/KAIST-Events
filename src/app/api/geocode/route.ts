import { NextRequest, NextResponse } from "next/server";

// Common KAIST and Daejeon locations with their coordinates
const KAIST_LOCATIONS = {
    kaist: { lat: 36.3735, lng: 127.3661 },
    "kaist campus": { lat: 36.3735, lng: 127.3661 },
    "kaist university": { lat: 36.3735, lng: 127.3661 },
    daejeon: { lat: 36.3504, lng: 127.3845 },
    yuseong: { lat: 36.3621, lng: 127.3567 },
    "yuseong-gu": { lat: 36.3621, lng: 127.3567 },
    seoul: { lat: 37.5665, lng: 126.978 },
    "seoul station": { lat: 37.5547, lng: 126.9706 },
    gangnam: { lat: 37.4979, lng: 127.0276 },
    hongdae: { lat: 37.5506, lng: 126.922 },
    myeongdong: { lat: 37.5636, lng: 126.9824 },
};

function findLocationInMap(
    location: string
): { lat: number; lng: number } | null {
    const cleanLocation = location.toLowerCase().trim();

    // Direct match
    if (KAIST_LOCATIONS[cleanLocation as keyof typeof KAIST_LOCATIONS]) {
        return KAIST_LOCATIONS[cleanLocation as keyof typeof KAIST_LOCATIONS];
    }

    // Partial match
    for (const [key, coords] of Object.entries(KAIST_LOCATIONS)) {
        if (cleanLocation.includes(key) || key.includes(cleanLocation)) {
            return coords;
        }
    }

    return null;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");

    if (!location) {
        return NextResponse.json(
            { error: "Location parameter is required" },
            { status: 400 }
        );
    }

    try {
        // First, try to find the location in our predefined map
        const knownLocation = findLocationInMap(location);
        if (knownLocation) {
            return NextResponse.json({
                success: true,
                coordinates: knownLocation,
                display_name: location,
                source: "local_database",
            });
        }

        // Use Nominatim for geocoding with a proper User-Agent and timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                location
            )}&limit=1&addressdetails=1`,
            {
                headers: {
                    "User-Agent": "KAIST-Events/1.0 (contact@example.com)",
                    Accept: "application/json",
                },
                signal: controller.signal,
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(
                `Geocoding service error: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        if (data && data.length > 0) {
            return NextResponse.json({
                success: true,
                coordinates: {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                },
                display_name: data[0].display_name,
                source: "nominatim",
            });
        } else {
            // Fallback to KAIST coordinates if nothing found
            return NextResponse.json({
                success: true,
                coordinates: KAIST_LOCATIONS.kaist,
                display_name: location,
                source: "fallback",
            });
        }
    } catch (error) {
        console.error("Geocoding error:", error);
        // Even if external geocoding fails, provide fallback to KAIST
        return NextResponse.json({
            success: true,
            coordinates: KAIST_LOCATIONS.kaist,
            display_name: location,
            source: "error_fallback",
            error_details:
                error instanceof Error ? error.message : "Unknown error",
        });
    }
}
