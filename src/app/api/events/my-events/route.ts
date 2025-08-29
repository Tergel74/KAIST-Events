import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    try {
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

        // Fetch events created by the user
        const { data: createdEvents, error: createdError } = await supabase
            .from("events")
            .select(
                `
                *,
                users!creator_id (name),
                participants (count)
            `
            )
            .eq("creator_id", user.id)
            .order("created_at", { ascending: false });

        if (createdError) {
            return NextResponse.json(
                { error: createdError.message },
                { status: 500 }
            );
        }

        // Fetch events the user has joined
        const { data: joinedEvents, error: joinedError } = await supabase
            .from("events")
            .select(
                `
                *,
                users!creator_id (name),
                participants!inner (
                    user_id,
                    events (*)
                )
            `
            )
            .eq("participants.user_id", user.id)
            .neq("creator_id", user.id) // Exclude events created by the user
            .order("created_at", { ascending: false });

        if (joinedError) {
            return NextResponse.json(
                { error: joinedError.message },
                { status: 500 }
            );
        }

        // Add participant count to created events
        const createdEventsWithCount =
            createdEvents?.map((event) => ({
                ...event,
                participant_count: event.participants?.length || 0,
            })) || [];

        // Process joined events - need to get participant count for each
        const joinedEventIds = joinedEvents?.map((event) => event.id) || [];
        let joinedEventsWithCount = [];

        if (joinedEventIds.length > 0) {
            const { data: participantCounts } = await supabase
                .from("events")
                .select(
                    `
                    id,
                    *,
                    users!creator_id (name),
                    participants (count)
                `
                )
                .in("id", joinedEventIds);

            joinedEventsWithCount =
                participantCounts?.map((event) => ({
                    ...event,
                    participant_count: event.participants?.length || 0,
                })) || [];
        }

        return NextResponse.json({
            createdEvents: createdEventsWithCount,
            joinedEvents: joinedEventsWithCount,
        });
    } catch (error) {
        return NextResponse.json(
            { error: `Internal server error: ${error}` },
            { status: 500 }
        );
    }
}
