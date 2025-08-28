import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { checkEventJoinLimit } from "@/lib/rate-limit";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    try {
        const supabase = createRouteHandlerClient({ cookies });
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

        // Check if event exists and is upcoming
        const { data: event, error: eventError } = await supabase
            .from("events")
            .select("id, status, event_date")
            .eq("id", id)
            .single();

        if (eventError || !event) {
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            );
        }

        if (event.status === "finished") {
            return NextResponse.json(
                { error: "Cannot join finished events" },
                { status: 400 }
            );
        }

        if (event.status === "started") {
            return NextResponse.json(
                { error: "Cannot join events that have already started" },
                { status: 400 }
            );
        }

        if (new Date(event.event_date) < new Date()) {
            return NextResponse.json(
                { error: "Cannot join past events" },
                { status: 400 }
            );
        }

        // Check rate limit
        if (!checkEventJoinLimit(user.id)) {
            return NextResponse.json(
                {
                    error: "Daily event join limit reached (3 events per day)",
                },
                { status: 429 }
            );
        }

        // Check if already joined
        const { data: existingParticipant } = await supabase
            .from("participants")
            .select("id")
            .eq("event_id", id)
            .eq("user_id", user.id)
            .single();

        if (existingParticipant) {
            return NextResponse.json(
                { error: "Already joined this event" },
                { status: 400 }
            );
        }

        // Join the event
        const { error: joinError } = await supabase
            .from("participants")
            .insert({
                event_id: id,
                user_id: user.id,
            });

        if (joinError) {
            return NextResponse.json(
                { error: joinError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: `Internal server error: ${error}` },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    try {
        const supabase = createRouteHandlerClient({ cookies });
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

        // Check if user is a participant
        const { data: participant, error: participantError } = await supabase
            .from("participants")
            .select("id")
            .eq("event_id", id)
            .eq("user_id", user.id)
            .single();

        if (participantError || !participant) {
            return NextResponse.json(
                { error: "Not a participant of this event" },
                { status: 404 }
            );
        }

        // Leave the event
        const { error: leaveError } = await supabase
            .from("participants")
            .delete()
            .eq("event_id", id)
            .eq("user_id", user.id);

        if (leaveError) {
            return NextResponse.json(
                { error: leaveError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: `Internal server error: ${error}` },
            { status: 500 }
        );
    }
}
