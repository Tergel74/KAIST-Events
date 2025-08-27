import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createReviewSchema } from "@/lib/zod-schemas";
import { sanitizeReviewContent } from "@/lib/sanitize";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const cookieStore = await cookies();
    try {
        const supabase = createRouteHandlerClient({
            cookies: () => cookieStore as any,
        });

        const { data: reviews, error } = await supabase
            .from("reviews")
            .select(
                `
        *,
        users!user_id (name)
      `
            )
            .eq("event_id", id)
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ reviews });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

        // Check if event exists and is finished
        const { data: event, error: eventError } = await supabase
            .from("events")
            .select("id, status, creator_id")
            .eq("id", id)
            .single();

        if (eventError || !event) {
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            );
        }

        if (event.status !== "finished") {
            return NextResponse.json(
                { error: "Can only review finished events" },
                { status: 400 }
            );
        }

        // Check if user participated in the event OR is the creator
        const isCreator = event.creator_id === user.id;
        let canReview = isCreator;

        if (!isCreator) {
            const { data: participant, error: participantError } =
                await supabase
                    .from("participants")
                    .select("id")
                    .eq("event_id", id)
                    .eq("user_id", user.id)
                    .single();

            canReview = !participantError && !!participant;
        }

        if (!canReview) {
            return NextResponse.json(
                { error: "Only participants and creators can review events" },
                { status: 403 }
            );
        }

        // Check if user already reviewed this event
        const { data: existingReview } = await supabase
            .from("reviews")
            .select("id")
            .eq("event_id", id)
            .eq("user_id", user.id)
            .single();

        if (existingReview) {
            return NextResponse.json(
                { error: "You have already reviewed this event" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const reviewData = createReviewSchema.parse({
            ...body,
            event_id: id,
        });

        // Sanitize content
        const sanitizedContent = sanitizeReviewContent(reviewData.content);

        const { data: review, error: createError } = await supabase
            .from("reviews")
            .insert({
                event_id: id,
                user_id: user.id,
                content: sanitizedContent,
                photo_url: reviewData.photo_urls,
            })
            .select(
                `
        *,
        users!user_id (name)
      `
            )
            .single();

        if (createError) {
            return NextResponse.json(
                { error: createError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ review }, { status: 201 });
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
