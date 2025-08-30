import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { updateEventStatusSchema } from "@/lib/zod-schemas";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

        // Check if user is the event creator
        const { data: event, error: eventError } = await supabase
            .from("events")
            .select("id, creator_id")
            .eq("id", id)
            .single();

        if (eventError || !event) {
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            );
        }

        if (event.creator_id !== user.id) {
            return NextResponse.json(
                { error: "Only event creator can update status" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { status, started_date } = updateEventStatusSchema.parse(body);

        // Prepare update data
        const updateData: any = { status };

        // If marking as started and no started_date provided, use current time
        if (status === "started" && !started_date) {
            updateData.started_date = new Date().toISOString();
        } else if (started_date) {
            updateData.started_date = started_date.toISOString();
        }

        // Update event status
        const { data: updatedEvent, error: updateError } = await supabase
            .from("events")
            .update(updateData)
            .eq("id", id)
            .select("*")
            .single();

        if (updateError) {
            return NextResponse.json(
                { error: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ event: updatedEvent });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
