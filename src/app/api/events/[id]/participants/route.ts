import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const { id } = await params;
        const supabase = createRouteHandlerClient({
            cookies: () => cookieStore as any,
        });

        const { data: participants, error } = await supabase
            .from("participants")
            .select(
                `
        id,
        user_id,
        joined_at,
        users (
          id,
          name,
          profile_image_url
        )
      `
            )
            .eq("event_id", id);

        if (error) {
            console.error("Error fetching participants:", error);
            return NextResponse.json(
                { error: "Failed to fetch participants" },
                { status: 500 }
            );
        }

        return NextResponse.json({ participants: participants || [] });
    } catch (error) {
        console.error("Error in participants API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
