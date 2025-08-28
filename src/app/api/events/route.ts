import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createEventSchema, eventFiltersSchema } from "@/lib/zod-schemas";
import { sanitizeEventDescription } from "@/lib/sanitize";
// import { checkEventCreationLimit } from "@/lib/rate-limit"; // Removed for MVP

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    try {
        const supabase = createRouteHandlerClient({
            cookies: () => cookieStore as any,
        });
        const { searchParams } = new URL(request.url);

        // Check if requesting a specific event
        const eventId = searchParams.get("event_id");

        if (eventId) {
            // Fetch specific event
            const { data: event, error } = await supabase
                .from("events")
                .select(
                    `
                    *,
                    users!creator_id (name),
                    participants (count)
                `
                )
                .eq("id", eventId)
                .single();

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                );
            }

            if (!event) {
                return NextResponse.json(
                    { error: "Event not found" },
                    { status: 404 }
                );
            }

            const eventWithParticipantCount = {
                ...event,
                participant_count: event.participants?.length || 0,
            };

            return NextResponse.json({ events: [eventWithParticipantCount] });
        }

        const filters = eventFiltersSchema.parse({
            date_range: searchParams.get("date_range") || "all",
            category: searchParams.get("category") || undefined,
            limit: parseInt(searchParams.get("limit") || "20"),
            offset: parseInt(searchParams.get("offset") || "0"),
        });

        let query = supabase
            .from("events")
            .select(
                `
                *,
                users!creator_id (name),
                participants (count)
            `
            )
            .order("event_date", { ascending: true })
            .range(filters.offset, filters.offset + filters.limit - 1);

        // Apply date filters
        const now = new Date();
        if (filters.date_range === "today") {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            query = query
                .eq("status", "upcoming")
                .gte("event_date", now.toISOString())
                .lt("event_date", tomorrow.toISOString());
        } else if (filters.date_range === "week") {
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            query = query
                .eq("status", "upcoming")
                .gte("event_date", now.toISOString())
                .lt("event_date", nextWeek.toISOString());
        } else if (filters.date_range === "past") {
            query = query
                .in("status", ["started", "finished"])
                .lt("event_date", now.toISOString());
        } else {
            // For "all", show upcoming and started events
            query = query
                .in("status", ["upcoming", "started"])
                .gte("event_date", now.toISOString());
        }

        const { data: events, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Add participant count to each event
        const eventsWithParticipantCount =
            events?.map((event) => ({
                ...event,
                participant_count: event.participants?.length || 0,
            })) || [];

        return NextResponse.json({ events: eventsWithParticipantCount });
    } catch (error) {
        return NextResponse.json(
            { error: `Invalid request parameters: ${error}` },
            { status: 400 }
        );
    }
}

export async function POST(request: NextRequest) {
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

        // Skip rate limiting for MVP

        const body = await request.json();
        const eventData = createEventSchema.parse(body);

        // Sanitize description
        const sanitizedDescription = eventData.description
            ? sanitizeEventDescription(eventData.description)
            : null;

        // Ensure user exists in users table
        const { error: upsertError } = await supabase.from("users").upsert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || user.email!.split("@")[0],
        });

        if (upsertError) {
            console.error("Error creating user record:", upsertError);
        }

        const { data: event, error } = await supabase
            .from("events")
            .insert({
                title: eventData.title,
                description: sanitizedDescription,
                location: eventData.location,
                event_date: eventData.event_date,
                creator_id: user.id,
                image_url: eventData.image_url || [],
            })
            .select(
                `
                *,
                users!creator_id (name)
            `
            )
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Trigger Discord announcement
        try {
            await fetch(`${process.env.DISCORD_BOT_URL}/announce`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventData: {
                        ...event,
                        creator_name: event.users?.name || "KAIST Student",
                    },
                }),
            });
        } catch (discordError) {
            console.error("Discord announcement failed:", discordError);
            // Don't fail the event creation if Discord fails
        }

        return NextResponse.json({ event }, { status: 201 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json(
            { error: "Invalid request data" },
            { status: 400 }
        );
    }
}
