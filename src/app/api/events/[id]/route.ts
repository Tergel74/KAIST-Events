import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { sanitizeEventDescription } from "@/lib/sanitize";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
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

        // Check if event exists and user is the creator
        const { data: existingEvent, error: eventError } = await supabase
            .from("events")
            .select("id, creator_id, status")
            .eq("id", id)
            .single();

        if (eventError || !existingEvent) {
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            );
        }

        if (existingEvent.creator_id !== user.id) {
            return NextResponse.json(
                { error: "You don't have permission to edit this event" },
                { status: 403 }
            );
        }

        if (existingEvent.status !== "upcoming") {
            return NextResponse.json(
                { error: "You can only edit upcoming events" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { title, description, location, event_date, image_url } = body;

        // Validate required fields
        if (!title || !event_date) {
            return NextResponse.json(
                { error: "Title and event date are required" },
                { status: 400 }
            );
        }

        // Validate future date
        const eventDate = new Date(event_date);
        const now = new Date();
        if (eventDate <= now) {
            return NextResponse.json(
                { error: "Event date must be in the future" },
                { status: 400 }
            );
        }

        // Sanitize description
        const sanitizedDescription = description
            ? sanitizeEventDescription(description)
            : null;

        // Update event
        const { data: updatedEvent, error: updateError } = await supabase
            .from("events")
            .update({
                title,
                description: sanitizedDescription,
                location,
                event_date: eventDate.toISOString(),
                image_url: image_url || [],
            })
            .eq("id", id)
            .select(
                `
                *,
                users!creator_id (name)
            `
            )
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
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

        // Check if event exists and user is the creator
        const { data: existingEvent, error: eventError } = await supabase
            .from("events")
            .select("id, creator_id, status")
            .eq("id", id)
            .single();

        if (eventError || !existingEvent) {
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            );
        }

        if (existingEvent.creator_id !== user.id) {
            return NextResponse.json(
                { error: "You don't have permission to delete this event" },
                { status: 403 }
            );
        }

        if (existingEvent.status !== "upcoming") {
            return NextResponse.json(
                { error: "You can only delete upcoming events" },
                { status: 400 }
            );
        }

        // Delete event (this will cascade delete participants and reviews)
        const { error: deleteError } = await supabase
            .from("events")
            .delete()
            .eq("id", id);

        if (deleteError) {
            return NextResponse.json(
                { error: deleteError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Event deleted successfully" });
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
