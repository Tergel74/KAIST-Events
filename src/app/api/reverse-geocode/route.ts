import { NextRequest, NextResponse } from "next/server";

// Function to generate a reasonable address for KAIST coordinates
function generateKAISTAddress(lat: number, lng: number): string {
    // Check if coordinates are close to KAIST (within ~2km)
    const kaistLat = 36.3735;
    const kaistLng = 127.3661;
    const distance = Math.sqrt(
        Math.pow(lat - kaistLat, 2) + Math.pow(lng - kaistLng, 2)
    );

    if (distance < 0.02) {
        // Roughly 2km
        return "KAIST, 291 Daehak-ro, Yuseong-gu, Daejeon, South Korea";
    }

    // Check if coordinates are in Daejeon area
    if (lat >= 36.2 && lat <= 36.5 && lng >= 127.2 && lng <= 127.5) {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}, Daejeon, South Korea`;
    }

    // Generic South Korea address
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}, South Korea`;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
        return NextResponse.json(
            { error: "Latitude and longitude parameters are required" },
            { status: 400 }
        );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
            { error: "Invalid latitude or longitude values" },
            { status: 400 }
        );
    }

    try {
        // Use Nominatim for reverse geocoding with proper headers and timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
                headers: {
                    "User-Agent": "KAIST-Events/1.0 (contact@example.com)",
                    Accept: "application/json",
                },
                signal: controller.signal,
            }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();

            if (data && data.display_name) {
                return NextResponse.json({
                    success: true,
                    address: data.display_name,
                    source: "nominatim",
                });
            }
        }

        // If Nominatim fails or returns no data, use fallback
        const fallbackAddress = generateKAISTAddress(latitude, longitude);

        return NextResponse.json({
            success: true,
            address: fallbackAddress,
            source: "fallback",
        });
    } catch (error) {
        console.error("Reverse geocoding error:", error);

        // Always provide a fallback address
        const fallbackAddress = generateKAISTAddress(latitude, longitude);

        return NextResponse.json({
            success: true,
            address: fallbackAddress,
            source: "error_fallback",
            error_details:
                error instanceof Error ? error.message : "Unknown error",
        });
    }
}
