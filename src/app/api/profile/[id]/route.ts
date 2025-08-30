import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    try {
        const { id } = await params;

        const supabase = createRouteHandlerClient({
            cookies: () => cookieStore as any,
        });

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Fetch user profile (public information only)
        const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("id, name, bio, pfp, created_at")
            .eq("id", id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Get user's event statistics
        const { data: createdEvents } = await supabase
            .from("events")
            .select("id, status")
            .eq("creator_id", id);

        const { data: participatedEvents } = await supabase
            .from("participants")
            .select("event_id")
            .eq("user_id", id);

        const stats = {
            eventsCreated: createdEvents?.length || 0,
            eventsParticipated: participatedEvents?.length || 0,
            upcomingEvents:
                createdEvents?.filter((e) => e.status === "upcoming").length ||
                0,
        };

        return NextResponse.json({
            profile: {
                ...profile,
                stats,
            },
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
