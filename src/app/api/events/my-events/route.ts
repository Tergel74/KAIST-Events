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
        const { data: events, error } = await supabase
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
            { error: `Internal server error: ${error}` },
            { status: 500 }
        );
    }
}
