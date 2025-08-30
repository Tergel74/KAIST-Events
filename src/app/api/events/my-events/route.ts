import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { eventFiltersSchema } from "@/lib/zod-schemas";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    try {
        const supabase = createRouteHandlerClient({
            cookies: () => cookieStore as any,
        });

        const { searchParams } = new URL(request.url);
        const filters = eventFiltersSchema.parse({
            date_range: searchParams.get("date_range") || "all",
            category: searchParams.get("category") || undefined,
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

        const now = new Date();

        // Fetch events created by the user
        let createdQuery = supabase
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

        // Apply date filters to created events
        if (filters.date_range === "ongoing") {
            createdQuery = createdQuery.eq("status", "started");
        } else if (filters.date_range === "past") {
            createdQuery = createdQuery.lt("event_date", now.toISOString());
        } else if (filters.date_range === "today") {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            createdQuery = createdQuery
                .gte("event_date", now.toISOString())
                .lt("event_date", tomorrow.toISOString());
        } else if (filters.date_range === "week") {
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            createdQuery = createdQuery
                .gte("event_date", now.toISOString())
                .lt("event_date", nextWeek.toISOString());
        } else {
            // "all" - show upcoming and started events
            createdQuery = createdQuery
                .in("status", ["upcoming", "started"])
                .gte("event_date", now.toISOString());
        }

        const { data: createdEvents, error: createdError } = await createdQuery;

        if (createdError) {
            return NextResponse.json(
                { error: createdError.message },
                { status: 500 }
            );
        }

        // Fetch events the user has joined
        let joinedQuery = supabase
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

        // Apply same date filters to joined events
        if (filters.date_range === "ongoing") {
            joinedQuery = joinedQuery.eq("status", "started");
        } else if (filters.date_range === "past") {
            joinedQuery = joinedQuery.lt("event_date", now.toISOString());
        } else if (filters.date_range === "today") {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            joinedQuery = joinedQuery
                .gte("event_date", now.toISOString())
                .lt("event_date", tomorrow.toISOString());
        } else if (filters.date_range === "week") {
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            joinedQuery = joinedQuery
                .gte("event_date", now.toISOString())
                .lt("event_date", nextWeek.toISOString());
        } else {
            // "all" - show upcoming and started events
            joinedQuery = joinedQuery
                .in("status", ["upcoming", "started"])
                .gte("event_date", now.toISOString());
        }

        const { data: joinedEvents, error: joinedError } = await joinedQuery;

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
